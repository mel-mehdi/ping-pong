from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Count, Q
from .models import Match
from user_management.models import User, Achievement, UserAchievement


@receiver(post_save, sender=Match)
def check_achievements(sender, instance, created, **kwargs):
    """Check and award achievements when a match is completed"""
    if not instance.winner or instance.status != 'completed':
        return
    
    winner = instance.winner
    loser = instance.player1 if instance.player2 == winner else instance.player2
    
    # Update profile stats
    from user_management.models import UserProfile
    
    winner_profile, _ = UserProfile.objects.get_or_create(user=winner)
    winner_profile.wins += 1
    winner_profile.add_xp(100)  # Award 100 XP for winning
    
    loser_profile, _ = UserProfile.objects.get_or_create(user=loser)
    loser_profile.losses += 1
    loser_profile.add_xp(25)  # Award 25 XP for participating
    
    # Check achievements for winner
    check_user_achievements(winner)
    
    # Check achievements for loser too (some achievements might apply)
    check_user_achievements(loser)
    
    # Recalculate ranks for all users
    recalculate_ranks()


def recalculate_ranks():
    """Recalculate ranks for all users based on wins, win rate, and total games"""
    from user_management.models import UserProfile
    
    profiles = UserProfile.objects.all()
    profiles_data = []
    
    for profile in profiles:
        total = profile.wins + profile.losses
        win_rate = (profile.wins / total * 100) if total > 0 else 0
        profiles_data.append({
            'profile': profile,
            'wins': profile.wins,
            'win_rate': win_rate,
            'total': total
        })
    
    # Sort by wins (descending), then win_rate, then total games
    profiles_data.sort(key=lambda x: (-x['wins'], -x['win_rate'], -x['total']))
    
    # Assign ranks
    for rank, data in enumerate(profiles_data, start=1):
        profile = data['profile']
        if profile.rank != rank:
            profile.rank = rank
            profile.save(update_fields=['rank'])


def check_user_achievements(user):
    """Check all possible achievements for a user"""
    # Count user's matches
    total_matches = Match.objects.filter(
        Q(player1=user) | Q(player2=user),
        status='completed'
    ).count()
    
    total_wins = Match.objects.filter(winner=user, status='completed').count()
    
    # 1. First Win
    if total_wins >= 1:
        award_achievement(user, 'first_win')
    
    # 2. 10 Win Streak - Check last 10 matches
    recent_matches = Match.objects.filter(
        Q(player1=user) | Q(player2=user),
        status='completed'
    ).order_by('-completed_at')[:10]
    
    if len(recent_matches) >= 10:
        all_wins = all(match.winner == user for match in recent_matches)
        if all_wins:
            award_achievement(user, '10_win_streak')
    
    # 3. Tournament Winner - needs tournament logic
    # TODO: Implement when tournaments are fully functional
    
    # 4. 100 Games
    if total_matches >= 100:
        award_achievement(user, '100_games')
    
    # 5. Perfect Game - Win with opponent scoring 0
    perfect_games = Match.objects.filter(
        Q(player1=user, player2_score=0, winner=user) |
        Q(player2=user, player1_score=0, winner=user),
        status='completed'
    ).exists()
    
    if perfect_games:
        award_achievement(user, 'perfect_game')
    
    # 6. Speed Demon - Win 5 games in a row quickly (within an hour)
    # TODO: Add timestamp tracking for this
    
    # 7. Master Player - Win rate > 70% with at least 50 games
    if total_matches >= 50:
        win_rate = (total_wins / total_matches) * 100
        if win_rate >= 70:
            award_achievement(user, 'master_player')
    
    # 8. Comeback King - Win after being down 4-0
    # This requires more detailed game state tracking
    # TODO: Implement when game state history is available
    
    # 9. Veteran - Play 500 games
    if total_matches >= 500:
        award_achievement(user, 'veteran')
    
    # 10. Unbeatable - 20 win streak
    recent_20 = Match.objects.filter(
        Q(player1=user) | Q(player2=user),
        status='completed'
    ).order_by('-completed_at')[:20]
    
    if len(recent_20) >= 20:
        all_wins_20 = all(match.winner == user for match in recent_20)
        if all_wins_20:
            award_achievement(user, 'unbeatable')
    
    # 11. First Blood - Play first game
    if total_matches >= 1:
        award_achievement(user, 'first_blood')
    
    # 12. Hat Trick - Win 3 games in a row
    recent_3 = Match.objects.filter(
        Q(player1=user) | Q(player2=user),
        status='completed'
    ).order_by('-completed_at')[:3]
    
    if len(recent_3) >= 3:
        all_wins_3 = all(match.winner == user for match in recent_3)
        if all_wins_3:
            award_achievement(user, 'hat_trick')
    
    # 13. Marathon - Play 10 games in one day
    from django.utils import timezone
    from datetime import timedelta
    
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_matches = Match.objects.filter(
        Q(player1=user) | Q(player2=user),
        status='completed',
        completed_at__gte=today_start
    ).count()
    
    if today_matches >= 10:
        award_achievement(user, 'marathon')
    
    # 14. Sharp Shooter - Win with a perfect 5-0 score
    sharp_shooter_games = Match.objects.filter(
        Q(player1=user, player1_score=5, player2_score=0, winner=user) |
        Q(player2=user, player2_score=5, player1_score=0, winner=user),
        status='completed'
    ).exists()
    
    if sharp_shooter_games:
        award_achievement(user, 'sharp_shooter')
    
    # 15. Social Butterfly - Play against 10 different opponents
    if total_matches > 0:
        opponents = set()
        for match in Match.objects.filter(Q(player1=user) | Q(player2=user), status='completed'):
            opponent = match.player2 if match.player1 == user else match.player1
            opponents.add(opponent.id)
        
        if len(opponents) >= 10:
            award_achievement(user, 'social_butterfly')
    
    # 16. Night Owl - Play a game between midnight and 6 AM
    # TODO: Check match time for this


def award_achievement(user, achievement_type):
    """Award an achievement to a user if they don't already have it"""
    try:
        achievement = Achievement.objects.get(achievement_type=achievement_type)
        user_achievement, created = UserAchievement.objects.get_or_create(
            user=user,
            achievement=achievement
        )
        
        if created:
            # Award XP to user profile
            if hasattr(user, 'profile'):
                user.profile.add_xp(achievement.xp_reward)
            
            # Create notification for achievement unlock
            from user_management.models import Notification
            notification = Notification.objects.create(
                user=user,
                notification_type='achievement_unlocked',
                message=f'🏆 Achievement Unlocked: {achievement.name}',
                achievement=achievement
            )
            
            # Send WebSocket notification
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'notifications_{user.id}',
                {
                    'type': 'send_notification',
                    'notification': {
                        'id': notification.id,
                        'type': notification.notification_type,
                        'message': notification.message,
                        'is_read': notification.is_read,
                        'created_at': notification.created_at.isoformat(),
                        'achievement': {
                            'id': achievement.id,
                            'name': achievement.name,
                            'description': achievement.description,
                            'icon': achievement.icon,
                            'xp_reward': achievement.xp_reward
                        }
                    }
                }
            )
        
        return created
    except Achievement.DoesNotExist:
        return False
    except Exception:
        return False
