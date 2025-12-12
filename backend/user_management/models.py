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

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return self.username

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
		max_length=20, 
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
