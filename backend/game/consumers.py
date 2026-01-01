import json
import asyncio
import uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone
from .game_engine import PongEngine
from .models import Match

User = get_user_model()

# Global state
matchmaking_queue = [] # List of (channel_name, user_id)
active_games = {} # room_id -> { engine, p1, p2, task }

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.room_name = self.scope['url_route']['kwargs'].get('room_name')
        
        if self.room_name == 'matchmaking':
            await self.accept()
            # Add to queue
            matchmaking_queue.append((self.channel_name, self.user.id))
            await self.check_matchmaking()
        else:
            # Game Room
            self.room_group_name = f'game_{self.room_name}'
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
            await self.join_game()

    async def check_matchmaking(self):
        if len(matchmaking_queue) >= 2:
            p1 = matchmaking_queue.pop(0)
            p2 = matchmaking_queue.pop(0)
            
            room_id = str(uuid.uuid4())[:8]
            
            # Fetch usernames
            user1 = await database_sync_to_async(User.objects.get)(id=p1[1])
            user2 = await database_sync_to_async(User.objects.get)(id=p2[1])

            # Pre-create game session with user IDs
            active_games[room_id] = {
                'engine': PongEngine(),
                'p1': None,
                'p2': None,
                'p1_uid': p1[1],
                'p2_uid': p2[1],
                'p1_username': user1.username,
                'p2_username': user2.username,
                'task': None
            }
            
            # Notify P1
            await self.channel_layer.send(p1[0], {
                'type': 'match_found',
                'room_id': room_id,
                'player_role': 1,
                'opponent_name': user2.username,
                'my_name': user1.username
            })
            # Notify P2
            await self.channel_layer.send(p2[0], {
                'type': 'match_found',
                'room_id': room_id,
                'player_role': 2,
                'opponent_name': user1.username,
                'my_name': user2.username
            })

    async def match_found(self, event):
        await self.send(text_data=json.dumps({
            'type': 'match_found',
            'room_id': event['room_id'],
            'player_role': event['player_role'],
            'opponent_name': event['opponent_name'],
            'my_name': event['my_name']
        }))

    async def join_game(self):
        room_id = self.room_name
        
        # Check if this is a tournament match (room_name format: tournament_<match_id>)
        if room_id.startswith('tournament_'):
            match_id = room_id.replace('tournament_', '')
            try:
                match = await database_sync_to_async(Match.objects.select_related('player1', 'player2').get)(id=match_id, status='ongoing')
                
                # Initialize game with tournament match data
                if room_id not in active_games:
                    active_games[room_id] = {
                        'engine': PongEngine(),
                        'p1': None,
                        'p2': None,
                        'p1_uid': match.player1.id,
                        'p2_uid': match.player2.id,
                        'p1_username': match.player1.username,
                        'p2_username': match.player2.username,
                        'task': None
                    }
            except Match.DoesNotExist:
                await self.close()
                return
        
        # Regular game or already initialized tournament game
        if room_id not in active_games:
            active_games[room_id] = {
                'engine': PongEngine(),
                'p1': None,
                'p2': None,
                'p1_uid': None,
                'p2_uid': None,
                'task': None
            }
        
        game = active_games[room_id]
        
        # Assign player based on User ID (Reconnection support)
        if game['p1_uid'] == self.user.id:
            game['p1'] = self.channel_name
            player_role = 1
        elif game['p2_uid'] == self.user.id:
            game['p2'] = self.channel_name
            player_role = 2
        # First time connection (if not set by matchmaking)
        elif game['p1_uid'] is None:
            game['p1'] = self.channel_name
            game['p1_uid'] = self.user.id
            player_role = 1
        elif game['p2_uid'] is None:
            game['p2'] = self.channel_name
            game['p2_uid'] = self.user.id
            player_role = 2
        else:
            player_role = None

        # Send player info for tournament matches
        if room_id.startswith('tournament_') and player_role and 'p1_username' in game:
            my_name = game['p1_username'] if player_role == 1 else game['p2_username']
            opponent_name = game['p2_username'] if player_role == 1 else game['p1_username']
            await self.send(text_data=json.dumps({
                'type': 'match_found',
                'room_id': room_id,
                'player_role': player_role,
                'opponent_name': opponent_name,
                'my_name': my_name
            }))

        # Start game loop if both players are present (or at least slots filled)
        if game['p1'] and game['p2'] and not game['task']:
            game['task'] = asyncio.create_task(self.game_loop(room_id))

    async def game_loop(self, room_id):
        print(f"Starting game loop for room {room_id}")
        try:
            game = active_games[room_id]
            engine = game['engine']
            
            while not engine.game_over:
                engine.update()
                state = engine.get_state()
                
                await self.channel_layer.group_send(
                    f'game_{room_id}',
                    {
                        'type': 'game_update',
                        'state': state
                    }
                )
                await asyncio.sleep(1/60)
                
            # Game Over
            print(f"Game loop ended for room {room_id}. Winner: {engine.winner}")
            if game['p1_uid'] and game['p2_uid']:
                await self.save_match_result(
                    room_id,
                    game['p1_uid'], 
                    game['p2_uid'], 
                    engine.score1, 
                    engine.score2, 
                    engine.winner
                )

            winner_name = game.get('p1_username', 'Player 1') if engine.winner == 1 else game.get('p2_username', 'Player 2')

            await self.channel_layer.group_send(
                f'game_{room_id}',
                {
                    'type': 'game_over',
                    'winner': engine.winner,
                    'winner_name': winner_name,
                    'p1_name': game.get('p1_username', 'Player 1'),
                    'p2_name': game.get('p2_username', 'Player 2')
                }
            )
        except Exception as e:
            print(f"Game loop error: {e}")
        finally:
            if room_id in active_games:
                del active_games[room_id]

    @database_sync_to_async
    def save_match_result(self, room_id, p1_id, p2_id, s1, s2, winner_num):
        try:
            p1 = User.objects.get(id=p1_id)
            p2 = User.objects.get(id=p2_id)
            
            winner = p1 if winner_num == 1 else p2
            
            # Check if this is a tournament match
            if room_id.startswith('tournament_'):
                match_id = room_id.replace('tournament_', '')
                try:
                    match = Match.objects.get(id=match_id)
                    match.player1_score = s1
                    match.player2_score = s2
                    match.winner = winner
                    match.status = 'completed'
                    match.completed_at = timezone.now()
                    match.save()
                    print(f"Tournament match {match_id} updated: {p1.username} vs {p2.username}, Winner: {winner.username}")
                    return
                except Match.DoesNotExist:
                    print(f"Tournament match {match_id} not found, creating new match")
            
            # Regular online match - create new
            Match.objects.create(
                player1=p1,
                player2=p2,
                player1_score=s1,
                player2_score=s2,
                winner=winner,
                status='completed',
                completed_at=timezone.now()
            )
            print(f"Match saved: {p1.username} vs {p2.username}, Winner: {winner.username}")
        except Exception as e:
            print(f"Error saving match: {e}")

    async def game_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'update',
            'state': event['state']
        }))

    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': event['winner'],
            'winner_name': event['winner_name'],
            'p1_name': event['p1_name'],
            'p2_name': event['p2_name']
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        if self.room_name == 'matchmaking':
            return
            
        game = active_games.get(self.room_name)
        if not game: return
        
        if data.get('action') == 'input':
            # Determine player ID based on channel name
            player_id = None
            if self.channel_name == game['p1']:
                player_id = 1
            elif self.channel_name == game['p2']:
                player_id = 2
            
            if player_id:
                game['engine'].set_input(player_id, data.get('up', False), data.get('down', False))

    async def disconnect(self, close_code):
        if self.room_name == 'matchmaking':
            # Remove from queue if present
            for i, (channel, uid) in enumerate(matchmaking_queue):
                if channel == self.channel_name:
                    matchmaking_queue.pop(i)
                    break
        else:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            # In a real app, handle player disconnection (pause game, forfeit, etc.)
