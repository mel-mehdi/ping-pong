from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
	AuthViewSet,
	UserViewSet,
	UserProfileViewSet,
	FriendshipViewSet,
	NotificationViewSet,
	AchievementViewSet
)

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='profile')
router.register(r'friendships', FriendshipViewSet, basename='friendship')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'achievements', AchievementViewSet, basename='achievement')

urlpatterns = [
	path('', include(router.urls)),
]