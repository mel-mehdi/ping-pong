from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import login as django_login
from django.contrib.auth import logout as django_logout
from django.shortcuts import get_object_or_404
from .google_auth import verify_google_token
from .models import User, UserProfile, Friendship, Notification, Achievement, UserAchievement
from .serializers import (
	UserSerializer,
	UserProfileSerializer,
	FriendshipSerializer,
	NotificationSerializer,
	AchievementSerializer,
	UserAchievementSerializer
)


class AuthViewSet(viewsets.ViewSet):
	"""
	ViewSet for authentication actions
	"""
	swagger_tags = ['Authentication']
	permission_classes = [AllowAny]

	def get_permissions(self):
		"""
		Allow anyone to register or login, require auth for logout
		"""
		if self.action in ['register', 'login']:
			return [AllowAny()]
		return [IsAuthenticated()]

	@action(detail=False, methods=['post'])
	def register(self, request):
		"""
		Register a new user
		POST /auth/register/
		Body: {"username": "", "email": "", "password": ""}
		"""
		serializer = UserSerializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		serializer.save()
		return Response(serializer.data, status=status.HTTP_201_CREATED)

	@action(detail=False, methods=['post'])
	def login(self, request):
		"""
		Login user
		POST /auth/login/
		Body: {"username": "", "password": ""}
		"""
		username = request.data.get('username')
		password = request.data.get('password')
		
		try:
			user = User.objects.get(username=username)
			if user.check_password(password):
				django_login(request, user)
				user.online_status = True
				user.save()
				serializer = UserSerializer(user)
				return Response(serializer.data)
			else:
				return Response(
					{'error': 'Invalid credentials'},
					status=status.HTTP_401_UNAUTHORIZED
				)
		except User.DoesNotExist:
			return Response(
				{'error': 'User does not exist'},
				status=status.HTTP_404_NOT_FOUND
			)

	@action(detail=False, methods=['post'])
	def logout(self, request):
		"""
		Logout user
		POST /auth/logout/
		"""
		user = request.user
		user.online_status = False
		user.save()
		django_logout(request)
		return Response({'success': 'Logged out successfully'})
	
	@action(detail=False, methods=['post'])
	def google_login(self, request):
		"""
		Login/Register with Google OAuth
		POST /auth/google_login/
		Body: {"token": "google_oauth_token"}
		"""
		token = request.data.get('token')
		
		if not token:
			return Response(
				{'error': 'Token is required'}, 
				status=status.HTTP_400_BAD_REQUEST
			)
		
		user_info = verify_google_token(token)
		
		if not user_info:
			return Response(
				{'error': 'Invalid Google token'}, 
				status=status.HTTP_401_UNAUTHORIZED
			)

		try:
			user = User.objects.get(google_id=user_info['google_id'])
			user.online_status = True
			user.save()
		except User.DoesNotExist:
			try:
				user = User.objects.get(email=user_info['email'])
				user.google_id = user_info['google_id']
				user.online_status = True
				user.save()
				
			except User.DoesNotExist:
				username = user_info['email'].split('@')[0]
				base_username = username
				counter = 1
				while User.objects.filter(username=username).exists():
					username = f"{base_username}{counter}"
					counter += 1
				
				user = User.objects.create_user(
					username=username,
					email=user_info['email'],
					fullname=user_info['full_name'],
					google_id=user_info['google_id'],
					online_status=True
				)
				user.set_unusable_password()
				user.save()

		django_login(request, user)

		serializer = UserSerializer(user)
		return Response(serializer.data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
	"""
	ViewSet for User CRUD operations
	"""
	swagger_tags = ['Users']
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [IsAuthenticated]

	@action(detail=False, methods=['get'])
	def me(self, request):
		"""
		Get current authenticated user
		GET /users/me/
		"""
		serializer = self.get_serializer(request.user)
		return Response(serializer.data)

	@action(detail=True, methods=['get'])
	def profile(self, request, pk=None):
		"""
		Get user profile by user ID
		GET /users/{id}/profile/
		"""
		user = self.get_object()
		profile = UserProfile.objects.get(user=user)
		profile_serializer = UserProfileSerializer(profile)
		return Response(profile_serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
	"""
	ViewSet for UserProfile operations
	"""
	swagger_tags = ['User Profiles']
	queryset = UserProfile.objects.all()
	serializer_class = UserProfileSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""
		Filter profiles to only show current user's profile
		"""
		user = self.request.user
		return UserProfile.objects.filter(user=user)

	@action(detail=True, methods=['post'])
	def update_stats(self, request, pk=None):
		"""
		Update user game statistics
		POST /profiles/{id}/update_stats/
		Body: {"win": true/false}
		"""
		profile = self.get_object()
		
		if request.data.get('win'):
			profile.wins += 1
		else:
			profile.losses += 1
		
		profile.save()
		
		serializer = self.get_serializer(profile)
		return Response(serializer.data)


class FriendshipViewSet(viewsets.ModelViewSet):
	"""
	ViewSet for Friendship operations
	"""
	swagger_tags = ['Friendships']
	queryset = Friendship.objects.all()
	serializer_class = FriendshipSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""
		Filter friendships to only show current user's friendships
		"""
		user = self.request.user
		return Friendship.objects.filter(
			from_user=user
		) | Friendship.objects.filter(
			to_user=user
		)

	@action(detail=False, methods=['get'])
	def my_friends(self, request):
		"""
		Get current user's accepted friends
		GET /friendships/my_friends/
		"""
		user = request.user
		friendships = Friendship.objects.filter(
			from_user=user,
			status='accepted'
		) | Friendship.objects.filter(
			to_user=user,
			status='accepted'
		)
		
		serializer = self.get_serializer(friendships, many=True)
		return Response(serializer.data)

	@action(detail=True, methods=['post'])
	def accept(self, request, pk=None):
		"""
		Accept a friend request
		POST /friendships/{id}/accept/
		"""
		friendship = self.get_object()
		
		# Only the recipient can accept
		if friendship.to_user != request.user:
			return Response(
				{'error': 'You cannot accept this request'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		friendship.status = 'accepted'
		friendship.save()
		
		serializer = self.get_serializer(friendship)
		return Response(serializer.data)

	@action(detail=True, methods=['post'])
	def reject(self, request, pk=None):
		"""
		Reject a friend request
		POST /friendships/{id}/reject/
		"""
		friendship = self.get_object()
		
		if friendship.to_user != request.user:
			return Response(
				{'error': 'You cannot reject this request'},
				status=status.HTTP_403_FORBIDDEN
			)
		
		friendship.status = 'rejected'
		friendship.save()
		
		serializer = self.get_serializer(friendship)
		return Response(serializer.data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
	swagger_tags = ['Notifications']
	serializer_class = NotificationSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_queryset(self):
		return Notification.objects.filter(
			user=self.request.user
		).select_related('related_user', 'friend_request', 'achievement')

	@action(detail=False, methods=['get'])
	def unread(self, request):
		notifications = self.get_queryset().filter(is_read=False)
		serializer = self.get_serializer(notifications, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['get'])
	def count_unread(self, request):
		count = self.get_queryset().filter(is_read=False).count()
		return Response({'count': count})

	@action(detail=True, methods=['post'])
	def mark_as_read(self, request, pk=None):
		notification = get_object_or_404(
			Notification,
			id=pk,
			user=request.user
		)
		
		notification.mark_as_read()
		serializer = self.get_serializer(notification)
		return Response(serializer.data)

	@action(detail=False, methods=['post'])
	def mark_all_as_read(self, request):
		self.get_queryset().filter(is_read=False).update(is_read=True)
		return Response({'message': 'All notifications marked as read'})

	@action(detail=True, methods=['delete'])
	def delete_notification(self, request, pk=None):
		notification = get_object_or_404(
			Notification,
			id=pk,
			user=request.user
		)
		
		notification.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
	swagger_tags = ['Achievements']
	serializer_class = AchievementSerializer
	permission_classes = [permissions.IsAuthenticated]
	queryset = Achievement.objects.all()

	@action(detail=False, methods=['get'])
	def user_achievements(self, request):
		user_achievements = UserAchievement.objects.filter(
			user=request.user
		).select_related('achievement')
		
		serializer = UserAchievementSerializer(user_achievements, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['get'])
	def available(self, request):
		unlocked_ids = UserAchievement.objects.filter(
			user=request.user
		).values_list('achievement_id', flat=True)
		
		available = Achievement.objects.exclude(id__in=unlocked_ids)
		serializer = self.get_serializer(available, many=True)
		return Response(serializer.data)
