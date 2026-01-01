from django.core.management.base import BaseCommand
from django.db.models import Q
from game.models import Match
from user_management.models import UserProfile


class Command(BaseCommand):
    help = 'Recalculate user stats from existing matches'

    def handle(self, *args, **options):
        # Get all users who have matches
        from user_management.models import User
        users = User.objects.filter(
            Q(matches_as_player1__isnull=False) | 
            Q(matches_as_player2__isnull=False)
        ).distinct()
        
        self.stdout.write(f'Found {users.count()} users with matches')
        
        profiles_data = []
        
        for user in users:
            # Get all completed matches for this user
            matches = Match.objects.filter(
                Q(player1=user) | Q(player2=user),
                status='completed'
            )
            
            wins = matches.filter(winner=user).count()
            losses = matches.exclude(winner=user).filter(winner__isnull=False).count()
            total = wins + losses
            win_rate = (wins / total * 100) if total > 0 else 0
            
            # Calculate XP: 100 per win, 25 per loss
            xp = (wins * 100) + (losses * 25)
            
            # Update or create profile
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.wins = wins
            profile.losses = losses
            profile.xp = xp
            profile.level = (xp // 1000) + 1
            profile.save()
            
            profiles_data.append({
                'profile': profile,
                'wins': wins,
                'win_rate': win_rate,
                'total': total
            })
        
        # Sort by wins (descending), then win_rate, then total games
        profiles_data.sort(key=lambda x: (-x['wins'], -x['win_rate'], -x['total']))
        
        # Assign ranks
        for rank, data in enumerate(profiles_data, start=1):
            profile = data['profile']
            profile.rank = rank
            profile.save()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'#{rank} {profile.user.username}: {data["wins"]} wins, {profile.losses} losses, {profile.xp} XP, Level {profile.level}'
                )
            )
        
        self.stdout.write(self.style.SUCCESS('\nDone!'))
