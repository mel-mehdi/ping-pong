from django.contrib.auth.models import AbstractUser
from django.db import models
from django.dispatch import receiver


class User(AbstractUser):
	"""
	Custom user model extending Django's AbstractUser
	"""
	first_name = None
	last_name = None
	date_joined = None

	username = models.CharField(max_length=150, unique=True)
	fullname = models.CharField(max_length=255, blank=True)
	email = models.EmailField(unique=True)
	avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
	online_status = models.BooleanField(default=False)
	google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.username
	
	def get_friends_count(self):
		"""Get count of accepted friendships"""
		from django.db.models import Q
		return Friendship.objects.filter(
			Q(from_user=self, status='accepted') |
			Q(to_user=self, status='accepted')
		).count()

	class Meta:
		db_table = 'users'
		verbose_name = 'User'
		verbose_name_plural = 'Users'


class UserProfile(models.Model):
	"""
	User profile with game statistics
	"""
	user = models.OneToOneField(
		User, 
		on_delete=models.CASCADE, 
		related_name='profile'
	)
	bio = models.TextField(max_length=500, blank=True)

	wins = models.IntegerField(default=0)
	losses = models.IntegerField(default=0)
	rank = models.IntegerField(default=1000)  # ELO-like ranking
	level = models.IntegerField(default=1)
	xp = models.IntegerField(default=0)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.user.username}'s Profile"

	@property
	def total_games(self):
		return self.wins + self.losses

	@property
	def win_rate(self):
		if self.total_games == 0:
			return 0
		return round((self.wins / self.total_games) * 100, 2)
	
	def add_xp(self, amount):
		self.xp += amount
		new_level = (self.xp // 1000) + 1
		if new_level > self.level:
			self.level = new_level
		
		self.save()

	class Meta:
		db_table = 'user_profiles'
		verbose_name = 'User Profile'
		verbose_name_plural = 'User Profiles'


class Friendship(models.Model):
	"""
	Friend relationships between users
	"""
	STATUS_CHOICES = [
		('pending', 'Pending'),
		('accepted', 'Accepted'),
		('rejected', 'Rejected'),
	]

	from_user = models.ForeignKey(
		User, 
		on_delete=models.CASCADE, 
		related_name='friendships_sent'
	)
	to_user = models.ForeignKey(
		User, 
		on_delete=models.CASCADE, 
		related_name='friendships_received'
	)
	status = models.CharField(
		max_length=10, 
		choices=STATUS_CHOICES, 
		default='pending'
	)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.from_user.username} → {self.to_user.username} ({self.status})"

	class Meta:
		db_table = 'friendships'
		unique_together = ('from_user', 'to_user')
		verbose_name = 'Friendship'
		verbose_name_plural = 'Friendships'


class Notification(models.Model):
	"""
	Notifications for users
	"""
	NOTIFICATION_TYPES = [
		('friend_request_received', 'Friend Request Received'),
		('friend_request_accepted', 'Friend Request Accepted'),
		('achievement_unlocked', 'Achievement Unlocked'),
		('game_invite', 'Game Invitation Received'),
	]

	user = models.ForeignKey(
		User, 
		on_delete=models.CASCADE, 
		related_name='notifications'
	)
	notification_type = models.CharField(
		max_length=30, 
		choices=NOTIFICATION_TYPES
	)
	message = models.CharField(max_length=255)
	related_user = models.ForeignKey(
		User, 
		on_delete=models.CASCADE, 
		null=True, 
		blank=True, 
		related_name='related_notifications'
	)
	friend_request = models.ForeignKey(
		Friendship, 
		on_delete=models.CASCADE, 
		null=True, 
		blank=True, 
		related_name='notifications'
	)
	game_invitation = models.ForeignKey(
		'game.Invitation',
		on_delete=models.CASCADE,
		null=True,
		blank=True,
		related_name='notifications'
	)
	achievement = models.ForeignKey(
		'Achievement',
		on_delete=models.CASCADE,
		null=True,
		blank=True,
		related_name='notifications'
	)
	is_read = models.BooleanField(default=False)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'notifications'
		verbose_name = 'Notification'
		verbose_name_plural = 'Notifications'
		ordering = ['-created_at']

	def __str__(self):
		return f"Notification for {self.user.username}: {self.message}"
	
	def mark_as_read(self):
		self.is_read = True
		self.save()


class Achievement(models.Model):
	"""Achievement definitions"""
	ACHIEVEMENT_TYPES = [
		('first_win', 'First Win'),
		('10_win_streak', '10 Win Streak'),
		('tournament_winner', 'Tournament Winner'),
		('100_games', '100 Games Played'),
		('perfect_game', 'Perfect Game'),
		('speed_demon', 'Speed Demon'),
		('master_player', 'Master Player'),
		('comeback_king', 'Comeback King'),
		('veteran', 'Veteran'),
		('unbeatable', 'Unbeatable'),
		('first_blood', 'First Blood'),
		('hat_trick', 'Hat Trick'),
		('marathon', 'Marathon'),
		('sharp_shooter', 'Sharp Shooter'),
		('social_butterfly', 'Social Butterfly'),
		('night_owl', 'Night Owl'),
	]

	name = models.CharField(max_length=50, unique=True)
	description = models.TextField()
	achievement_type = models.CharField(max_length=30, choices=ACHIEVEMENT_TYPES)
	icon = models.CharField(max_length=50, default='🏆')
	xp_reward = models.IntegerField(default=100)

	class Meta:
		db_table = 'achievements'
		verbose_name = 'Achievement'
		verbose_name_plural = 'Achievements'

	def __str__(self):
		return self.name


class UserAchievement(models.Model):
	"""Track which achievements users have unlocked"""
	user = models.ForeignKey(
		User,
		on_delete=models.CASCADE,
		related_name='user_achievements'
	)
	achievement = models.ForeignKey(
		Achievement,
		on_delete=models.CASCADE,
		related_name='unlocked_by'
	)
	unlocked_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ['user', 'achievement']
		ordering = ['-unlocked_at']

	def __str__(self):
		return f"{self.user.username} - {self.achievement.name}"
