from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, UserProfile, Friendship
from .serializers import UserSerializer, UserProfileSerializer, FriendshipSerializer


class UserViewSet(viewsets.ModelViewSet):
	"""
	ViewSet for User CRUD operations
	"""
	queryset = User.objects.all()
	serializer_class = UserSerializer

	def get_permissions(self):
		"""
		Allow anyone to create users (register), but require auth for other actions
		"""
		if self.action == 'create':
			return [AllowAny()]
		return [IsAuthenticated()]

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
		Get user profile
		GET /users/{id}/profile/
		"""
		user = self.get_object()
		profile = user.profile
		serializer = UserProfileSerializer(profile)
		return Response(serializer.data)

	@action(detail=False, methods=['get'])
	def online(self, request):
		"""
		Get all online users
		GET /users/online/
		"""
		online_users = User.objects.filter(online_status=True)
		serializer = self.get_serializer(online_users, many=True)
		return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
	"""
	ViewSet for UserProfile operations
	"""
	queryset = UserProfile.objects.all()
	serializer_class = UserProfileSerializer
	permission_classes = [IsAuthenticated]

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