from django.core.management.base import BaseCommand
from user_management.models import Achievement


class Command(BaseCommand):
    help = 'Populate the Achievement table with all available achievements'

    def handle(self, *args, **options):
        achievements = [
            {
                'achievement_type': 'first_win',
                'name': 'First Victory',
                'description': 'Win your first match',
                'icon': '🎯',
                'xp_reward': 100
            },
            {
                'achievement_type': '10_win_streak',
                'name': 'Winning Streak',
                'description': 'Win 10 matches in a row',
                'icon': '🔥',
                'xp_reward': 500
            },
            {
                'achievement_type': '100_games',
                'name': 'Century Club',
                'description': 'Play 100 matches',
                'icon': '💯',
                'xp_reward': 300
            },
            {
                'achievement_type': 'perfect_game',
                'name': 'Perfect Game',
                'description': 'Win without opponent scoring',
                'icon': '⭐',
                'xp_reward': 150
            },
            {
                'achievement_type': 'master_player',
                'name': 'Master Player',
                'description': 'Achieve 70% win rate with 50+ games',
                'icon': '👑',
                'xp_reward': 600
            },
            {
                'achievement_type': 'tournament_winner',
                'name': 'Tournament Champion',
                'description': 'Win a tournament',
                'icon': '🏆',
                'xp_reward': 1000
            },
            {
                'achievement_type': 'speed_demon',
                'name': 'Speed Demon',
                'description': 'Win in under 2 minutes',
                'icon': '⚡',
                'xp_reward': 200
            },
            {
                'achievement_type': 'comeback_king',
                'name': 'Comeback King',
                'description': 'Win after being down 0-4',
                'icon': '🎪',
                'xp_reward': 400
            },
            {
                'achievement_type': 'veteran',
                'name': 'Veteran',
                'description': 'Play 500 matches',
                'icon': '🎖️',
                'xp_reward': 800
            },
            {
                'achievement_type': 'unbeatable',
                'name': 'Unbeatable',
                'description': 'Win 20 matches in a row',
                'icon': '🛡️',
                'xp_reward': 1000
            },
            {
                'achievement_type': 'first_blood',
                'name': 'First Blood',
                'description': 'Play your first match',
                'icon': '🩸',
                'xp_reward': 50
            },
            {
                'achievement_type': 'hat_trick',
                'name': 'Hat Trick',
                'description': 'Win 3 matches in a row',
                'icon': '🎩',
                'xp_reward': 200
            },
            {
                'achievement_type': 'marathon',
                'name': 'Marathon',
                'description': 'Play 10 matches in one day',
                'icon': '🏃',
                'xp_reward': 250
            },
            {
                'achievement_type': 'night_owl',
                'name': 'Night Owl',
                'description': 'Play between midnight and 4 AM',
                'icon': '🦉',
                'xp_reward': 100
            },
            {
                'achievement_type': 'sharp_shooter',
                'name': 'Sharp Shooter',
                'description': 'Win 5-0',
                'icon': '🎯',
                'xp_reward': 150
            },
            {
                'achievement_type': 'social_butterfly',
                'name': 'Social Butterfly',
                'description': 'Play against 10 different opponents',
                'icon': '🦋',
                'xp_reward': 300
            },
        ]

        created_count = 0
        updated_count = 0

        for ach_data in achievements:
            achievement, created = Achievement.objects.update_or_create(
                achievement_type=ach_data['achievement_type'],
                defaults={
                    'name': ach_data['name'],
                    'description': ach_data['description'],
                    'icon': ach_data['icon'],
                    'xp_reward': ach_data['xp_reward']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created: {achievement.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'Updated: {achievement.name}'))

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created: {created_count}, Updated: {updated_count}'
        ))
