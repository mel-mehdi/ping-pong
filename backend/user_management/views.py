from django.contrib.auth import login as django_login, logout as django_logout
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .google_auth import verify_google_token
from .models import User, UserProfile, Friendship, Notification, Achievement, UserAchievement
from .serializers import (
	UserSerializer, UserProfileSerializer, FriendshipSerializer,
	NotificationSerializer, AchievementSerializer, UserAchievementSerializer
)


class AuthViewSet(viewsets.ViewSet):
	swagger_tags = ['Authentication']
	permission_classes = [AllowAny]

	def get_permissions(self):
		return [AllowAny()] if self.action in ['register', 'login', 'google_login'] else [IsAuthenticated()]

	@action(detail=False, methods=['post'])
	def register(self, request):
		serializer = UserSerializer(data=request.data)
		if not serializer.is_valid():
			# Log the validation errors for debugging
			print("Registration validation errors:", serializer.errors)
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		user = serializer.save(online_status=True)
		return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

	@action(detail=False, methods=['post'])
	def login(self, request):
		username, password = request.data.get('username'), request.data.get('password')
		if not (username and password):
			return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
		
		try:
			user = User.objects.get(username=username)
			if not user.check_password(password):
				raise User.DoesNotExist
		except User.DoesNotExist:
			return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
		
		django_login(request, user)
		user.online_status = True
		user.save(update_fields=['online_status'])
		return Response(UserSerializer(user).data)

	@action(detail=False, methods=['post'])
	def logout(self, request):
		request.user.online_status = False
		request.user.save(update_fields=['online_status'])
		django_logout(request)
		return Response({'message': 'Logged out successfully'})
	
	@action(detail=False, methods=['post'])
	def google_login(self, request):
		token = request.data.get('token')
		if not token:
			return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
		
		user_info = verify_google_token(token)
		if not user_info:
			return Response({'error': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

		user = self._get_or_create_google_user(user_info)
		user.online_status = True
		user.save(update_fields=['online_status'])
		django_login(request, user)
		return Response(UserSerializer(user).data)
	
	def _get_or_create_google_user(self, user_info):
		try:
			return User.objects.get(google_id=user_info['google_id'])
		except User.DoesNotExist:
			try:
				user = User.objects.get(email=user_info['email'])
				user.google_id = user_info['google_id']
				user.save(update_fields=['google_id'])
				return user
			except User.DoesNotExist:
				base_username = user_info['email'].split('@')[0]
				username, counter = base_username, 1
				while User.objects.filter(username=username).exists():
					username = f"{base_username}{counter}"
					counter += 1
				
				user = User.objects.create_user(
					username=username, email=user_info['email'],
					fullname=user_info['full_name'], google_id=user_info['google_id']
				)
				user.set_unusable_password()
				user.save()
				return user


class UserViewSet(viewsets.ModelViewSet):
	swagger_tags = ['Users']
	queryset = User.objects.all()
	serializer_class = UserSerializer
	permission_classes = [IsAuthenticated]

	def get_permissions(self):
		"""Allow public access to list and retrieve users"""
		if self.action in ['list', 'retrieve', 'profile']:
			return []
		return [IsAuthenticated()]

	@action(detail=False, methods=['get'])
	def me(self, request):
		return Response(self.get_serializer(request.user).data)

	@action(detail=True, methods=['get'], permission_classes=[])
	def profile(self, request, pk=None):
		"""Public endpoint to view any user's profile"""
		return Response(UserProfileSerializer(get_object_or_404(UserProfile, user=self.get_object())).data)


class UserProfileViewSet(viewsets.ModelViewSet):
	swagger_tags = ['User Profiles']
	queryset = UserProfile.objects.select_related('user')
	serializer_class = UserProfileSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return UserProfile.objects.filter(user=self.request.user).select_related('user')
	
	@action(detail=False, methods=['get'], permission_classes=[])
	def leaderboard(self, request):
		"""Public leaderboard endpoint - no authentication required"""
		profiles = UserProfile.objects.select_related('user').order_by('-level', '-xp', '-wins')
		return Response(self.get_serializer(profiles, many=True).data)

	@action(detail=True, methods=['post'])
	def update_stats(self, request, pk=None):
		profile = self.get_object()
		if request.data.get('win'):
			profile.wins += 1
		else:
			profile.losses += 1
		profile.save(update_fields=['wins', 'losses'])
		return Response(self.get_serializer(profile).data)


class FriendshipViewSet(viewsets.ModelViewSet):
	swagger_tags = ['Friendships']
	queryset = Friendship.objects.select_related('from_user', 'to_user')
	serializer_class = FriendshipSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return Friendship.objects.filter(
			Q(from_user=self.request.user) | Q(to_user=self.request.user)
		).select_related('from_user', 'to_user')

	@action(detail=False, methods=['get'])
	def my_friends(self, request):
		friendships = self.get_queryset().filter(status='accepted')
		return Response(self.get_serializer(friendships, many=True).data)

	@action(detail=False, methods=['get'])
	def pending_requests(self, request):
		friendships = Friendship.objects.filter(to_user=request.user, status='pending').select_related('from_user', 'to_user')
		return Response(self.get_serializer(friendships, many=True).data)

	@action(detail=False, methods=['post'])
	def send_request(self, request):
		to_user_id = request.data.get('to_user_id')
		if not to_user_id:
			return Response({'error': 'to_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
		if int(to_user_id) == request.user.id:
			return Response({'error': 'You cannot send a friend request to yourself'}, status=status.HTTP_400_BAD_REQUEST)
		
		to_user = get_object_or_404(User, id=to_user_id)
		
		# Check for existing friendship (pending or accepted)
		existing = Friendship.objects.filter(
			Q(from_user=request.user, to_user=to_user) | 
			Q(from_user=to_user, to_user=request.user)
		).first()
		
		if existing:
			# If rejected, allow resending by updating to pending
			if existing.status == 'rejected':
				existing.status = 'pending'
				existing.from_user = request.user
				existing.to_user = to_user
				existing.save(update_fields=['status', 'from_user', 'to_user'])
				return Response(self.get_serializer(existing).data, status=status.HTTP_200_OK)
			# Otherwise block (pending or accepted)
			return Response({'error': 'Friend request already exists or you are already friends'}, status=status.HTTP_400_BAD_REQUEST)
		
		friendship = Friendship.objects.create(from_user=request.user, to_user=to_user, status='pending')
		return Response(self.get_serializer(friendship).data, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=['post'])
	def accept(self, request, pk=None):
		friendship = self.get_object()
		if friendship.to_user != request.user:
			return Response({'error': 'You cannot accept this request'}, status=status.HTTP_403_FORBIDDEN)
		friendship.status = 'accepted'
		friendship.save(update_fields=['status'])
		return Response(self.get_serializer(friendship).data)

	@action(detail=True, methods=['post'])
	def reject(self, request, pk=None):
		friendship = self.get_object()
		if friendship.to_user != request.user:
			return Response({'error': 'You cannot reject this request'}, status=status.HTTP_403_FORBIDDEN)
		friendship.status = 'rejected'
		friendship.save(update_fields=['status'])
		return Response(self.get_serializer(friendship).data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
	swagger_tags = ['Notifications']
	serializer_class = NotificationSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		return Notification.objects.filter(user=self.request.user).select_related('related_user', 'friend_request', 'achievement')

	@action(detail=False, methods=['get'])
	def unread(self, request):
		return Response(self.get_serializer(self.get_queryset().filter(is_read=False), many=True).data)

	@action(detail=False, methods=['get'])
	def count_unread(self, request):
		return Response({'count': self.get_queryset().filter(is_read=False).count()})

	@action(detail=True, methods=['post'])
	def mark_as_read(self, request, pk=None):
		notification = get_object_or_404(Notification, id=pk, user=request.user)
		notification.mark_as_read()
		return Response(self.get_serializer(notification).data)

	@action(detail=False, methods=['post'])
	def mark_all_as_read(self, request):
		self.get_queryset().filter(is_read=False).update(is_read=True)
		return Response({'message': 'All notifications marked as read'})

	@action(detail=True, methods=['delete'])
	def delete_notification(self, request, pk=None):
		get_object_or_404(Notification, id=pk, user=request.user).delete()
		return Response(status=status.HTTP_204_NO_CONTENT)


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
	swagger_tags = ['Achievements']
	serializer_class = AchievementSerializer
	permission_classes = [IsAuthenticated]
	queryset = Achievement.objects.all()

	@action(detail=False, methods=['get'])
	def user_achievements(self, request):
		user_achievements = UserAchievement.objects.filter(user=request.user).select_related('achievement')
		return Response(UserAchievementSerializer(user_achievements, many=True).data)

	@action(detail=False, methods=['get'])
	def available(self, request):
		unlocked_ids = UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True)
		available = Achievement.objects.exclude(id__in=unlocked_ids)
		return Response(self.get_serializer(available, many=True).data)
