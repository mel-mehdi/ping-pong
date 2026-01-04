from django.core.management.base import BaseCommand
from django.db.models import Q
from game.models import Match
from user_management.models import User
from game.signals import check_user_achievements


class Command(BaseCommand):
    help = 'Check and award achievements for all users based on their match history'

    def handle(self, *args, **options):
        # Get all users who have matches
        users = User.objects.filter(
            Q(matches_as_player1__isnull=False) | 
            Q(matches_as_player2__isnull=False)
        ).distinct()
        
        self.stdout.write(f'Checking achievements for {users.count()} users...\n')
        
        for user in users:
            self.stdout.write(f'\nChecking {user.username}:')
            check_user_achievements(user)
        
        self.stdout.write(self.style.SUCCESS('\n\nDone!'))
