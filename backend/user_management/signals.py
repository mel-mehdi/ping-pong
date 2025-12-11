from django.conf import settings
from django.db.models.signals import post_migrate
from django.db.models.signals import post_save
from .models import UserProfile
from django.dispatch import receiver
from django.contrib.auth import get_user_model

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
