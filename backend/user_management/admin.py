from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, Friendship, Notification, Achievement, UserAchievement


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	"""
	Custom admin for User model
	"""
	list_display = ['username', 'email', 'online_status', 'is_staff', 'created_at']
	list_filter = ['online_status', 'is_staff', 'is_superuser', 'created_at']
	search_fields = ['username', 'email', 'fullname']
	ordering = ['-created_at']

	fieldsets = (
		(None, {'fields': ('username', 'password')}),
		('Personal info', {'fields': ('email', 'fullname', 'avatar')}),
		('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
		('Status', {'fields': ('online_status',)}),
	)

	add_fieldsets = (
		(None, {
			'classes': ('wide',),
			'fields': ('username', 'email', 'password1', 'password2'),
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


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
	list_display = ['user', 'notification_type', 'message', 'is_read', 'created_at']
	list_filter = ['notification_type', 'is_read', 'created_at']
	search_fields = ['user__username', 'message']
	readonly_fields = ['created_at']

	def get_queryset(self, request):
		return super().get_queryset(request).select_related('user', 'related_user', 'achievement')


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
	list_display = ['name', 'achievement_type', 'icon', 'xp_reward']
	list_filter = ['achievement_type']
	search_fields = ['name', 'description']


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
	list_display = ['user', 'achievement', 'unlocked_at']
	list_filter = ['unlocked_at', 'achievement']
	search_fields = ['user__username', 'achievement__name']
	readonly_fields = ['unlocked_at']

	def get_queryset(self, request):
		return super().get_queryset(request).select_related('user', 'achievement')
