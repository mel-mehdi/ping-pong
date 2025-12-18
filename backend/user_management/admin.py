from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, Friendship


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	"""
	Custom admin for User model
	"""
	list_display = ['username', 'email', 'online_status', 'is_staff', 'created_at']
	list_filter = ['online_status', 'is_staff', 'is_superuser', 'created_at']
	search_fields = ['username', 'email', 'fullname']
	ordering = ['-created_at']

	fieldsets = BaseUserAdmin.fieldsets + (
		('Additional Info', {
			'fields': ('avatar', 'online_status')
		}),
	)

	add_fieldsets = BaseUserAdmin.add_fieldsets + (
		('Additional Info', {
			'fields': ('avatar', 'online_status')
		}),
	)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
	"""
	Admin for UserProfile model
	"""
	list_display = ['user', 'wins', 'losses', 'win_rate', 'rank', 'level']
	list_filter = ['level', 'created_at']
	search_fields = ['user__username', 'user__email']
	readonly_fields = ['created_at', 'updated_at', 'total_games', 'win_rate']

	fieldsets = (
		('User', {
			'fields': ('user',)
		}),
		('Profile', {
			'fields': ('bio',)
		}),
		('Statistics', {
			'fields': ('wins', 'losses', 'rank', 'level', 'total_games', 'win_rate')
		}),
		('Timestamps', {
			'fields': ('created_at', 'updated_at')
		}),
	)


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
	"""
	Admin for Friendship model
	"""
	list_display = ['from_user', 'to_user', 'status', 'created_at']
	list_filter = ['status', 'created_at']
	search_fields = ['from_user__username', 'to_user__username']
	readonly_fields = ['created_at', 'updated_at']