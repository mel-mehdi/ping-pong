from django.core.management.base import BaseCommand
from user_management.models import Achievement


class Command(BaseCommand):
	help = 'Create default achievements'

	def handle(self, *args, **kwargs):
		achievements = [
			{
				'name': 'First Win',
				'description': 'Win your first match',
				'achievement_type': 'first_win',
				'icon': '🎯',
				'xp_reward': 100
			},
			{
				'name': '10 Win Streak',
				'description': 'Win 10 matches in a row',
				'achievement_type': '10_win_streak',
				'icon': '🔥',
				'xp_reward': 500
			},
			{
				'name': 'Tournament Winner',
				'description': 'Win a tournament',
				'achievement_type': 'tournament_winner',
				'icon': '🏆',
				'xp_reward': 1000
			},
			{
				'name': '100 Games',
				'description': 'Play 100 games',
				'achievement_type': '100_games',
				'icon': '💯',
				'xp_reward': 500
			},
			{
				'name': 'Perfect Game',
				'description': 'Win a match without your opponent scoring',
				'achievement_type': 'perfect_game',
				'icon': '⭐',
				'xp_reward': 300
			},
			{
				'name': 'Speed Demon',
				'description': 'Win a match in under 2 minutes',
				'achievement_type': 'speed_demon',
				'icon': '⚡',
				'xp_reward': 200
			},
			{
				'name': 'Master Player',
				'description': 'Reach level 10',
				'achievement_type': 'master_player',
				'icon': '👑',
				'xp_reward': 1000
			},
			{
				'name': 'Comeback King',
				'description': 'Win after being down 0-4',
				'achievement_type': 'comeback_king',
				'icon': '🎪',
				'xp_reward': 400
			},
			{
				'name': 'Veteran',
				'description': 'Play for 30 days',
				'achievement_type': 'veteran',
				'icon': '🎖️',
				'xp_reward': 600
			},
			{
				'name': 'Unbeatable',
				'description': 'Win 50 matches',
				'achievement_type': 'unbeatable',
				'icon': '🛡️',
				'xp_reward': 800
			},
			{
				'name': 'First Blood',
				'description': 'Score the first point in a match',
				'achievement_type': 'first_blood',
				'icon': '🩸',
				'xp_reward': 50
			},
			{
				'name': 'Hat Trick',
				'description': 'Win 3 matches in a row',
				'achievement_type': 'hat_trick',
				'icon': '🎩',
				'xp_reward': 200
			},
			{
				'name': 'Marathon',
				'description': 'Play 10 matches in one day',
				'achievement_type': 'marathon',
				'icon': '🏃',
				'xp_reward': 300
			},
			{
				'name': 'Sharp Shooter',
				'description': 'Win with a score of 5-0',
				'achievement_type': 'sharp_shooter',
				'icon': '🎯',
				'xp_reward': 250
			},
			{
				'name': 'Social Butterfly',
				'description': 'Add 10 friends',
				'achievement_type': 'social_butterfly',
				'icon': '🦋',
				'xp_reward': 150
			},
			{
				'name': 'Night Owl',
				'description': 'Play between midnight and 4am',
				'achievement_type': 'night_owl',
				'icon': '🦉',
				'xp_reward': 100
			},
		]

		created_count = 0
		for achievement_data in achievements:
			achievement, created = Achievement.objects.get_or_create(
				achievement_type=achievement_data['achievement_type'],
				defaults=achievement_data
			)
			if created:
				created_count += 1
				self.stdout.write(self.style.SUCCESS(f'Created achievement: {achievement.name}'))
			else:
				self.stdout.write(self.style.WARNING(f'Achievement already exists: {achievement.name}'))

		self.stdout.write(self.style.SUCCESS(f'\n✅ Created {created_count} new achievements'))
