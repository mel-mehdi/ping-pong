from django.conf import settings
from django.db.models.signals import post_migrate
from django.db.models.signals import post_save
from .models import UserProfile, Achievement, UserAchievement, Notification, Friendship
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

User = get_user_model()

@receiver(post_migrate)
def create_default_admin(sender, **kwargs):
	if not User.objects.filter(username=settings.SUPERUSER_USERNAME).exists():
		User.objects.create_superuser(
			username=settings.SUPERUSER_USERNAME,
			email=settings.SUPERUSER_EMAIL,
			password=settings.SUPERUSER_PASSWORD
		)
		print(f"Superuser '{settings.SUPERUSER_USERNAME}' created successfully.")
	else:
		print(f"Superuser '{settings.SUPERUSER_USERNAME}' already exists.")

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
	"""
	Automatically create a UserProfile when a new User is created
	"""
	if created:
		UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
	"""
	Save the UserProfile when User is saved
	"""
	if hasattr(instance, 'profile'):
		instance.profile.save()

@receiver(post_save, sender=Friendship)
def create_friend_request_notifications(sender, instance, created, **kwargs):
	"""Create notifications for friend requests"""
	channel_layer = get_channel_layer()

	if created and instance.status == 'pending':
		# Notify receiver
		notification = Notification.objects.create(
			user=instance.to_user,
			notification_type='friend_request_received',
			message=f"{instance.from_user.username} sent you a friend request.",
			related_user=instance.from_user,
			friend_request=instance
		)
		
		async_to_sync(channel_layer.group_send)(
			f"notifications_{instance.to_user.id}",
			{
				'type': 'send_notification',
				'notification': {
					'id': notification.id,
					'type': 'friend_request_received',
					'message': notification.message,
					'from_user': instance.from_user.username
				}
			}
		)

	elif instance.status == 'accepted':
		# Notify sender
		notification = Notification.objects.create(
			user=instance.from_user,
			notification_type='friend_request_accepted',
			message=f"{instance.to_user.username} accepted your friend request.",
			related_user=instance.to_user,
			friend_request=instance
		)
		
		async_to_sync(channel_layer.group_send)(
			f"notifications_{instance.from_user.id}",
			{
				'type': 'send_notification',
				'notification': {
					'id': notification.id,
					'type': 'friend_request_accepted',
					'message': notification.message,
					'from_user': instance.to_user.username
				}
			}
		)
		
		# Check for friend achievements
		for user in [instance.from_user, instance.to_user]:
			friend_count = user.get_friends_count()
			
			if friend_count == 10:
				check_and_unlock_achievement(user, 'social_butterfly')


@receiver(post_save, sender=UserAchievement)
def notify_achievement_unlocked(sender, instance, created, **kwargs):
	"""Notify user when they unlock an achievement"""
	if created:
		channel_layer = get_channel_layer()
		
		notification = Notification.objects.create(
			user=instance.user,
			notification_type='achievement_unlocked',
			message=f"Achievement unlocked: {instance.achievement.name}!",
			achievement=instance.achievement
		)
		
		async_to_sync(channel_layer.group_send)(
			f"notifications_{instance.user.id}",
			{
				'type': 'send_notification',
				'notification': {
					'id': notification.id,
					'type': 'achievement_unlocked',
					'message': notification.message,
					'achievement': {
						'name': instance.achievement.name,
						'icon': instance.achievement.icon,
						'xp_reward': instance.achievement.xp_reward
					}
				}
			}
		)


def check_and_unlock_achievement(user, achievement_type):
	"""Check and unlock achievement for user"""
	try:
		achievement = Achievement.objects.get(achievement_type=achievement_type)
		user_achievement, created = UserAchievement.objects.get_or_create(
			user=user,
			achievement=achievement
		)
		
		if created:
			if hasattr(user, 'profile'):
				user.profile.add_xp(achievement.xp_reward)

	except Achievement.DoesNotExist:
		pass
