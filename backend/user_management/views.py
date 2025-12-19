from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, UserProfile, Friendship
from .serializers import UserSerializer, UserProfileSerializer, FriendshipSerializer


class AuthViewSet(viewsets.ViewSet):
	"""
	ViewSet for authentication actions
	"""
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
		serializer = self.get_serializer(data=request.data)
		if not serializer.is_valid():
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		self.perform_create(serializer)
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
				user.online_status = True
				user.save()
				serializer = self.get_serializer(user)
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


class UserViewSet(viewsets.ModelViewSet):
	"""
	ViewSet for User CRUD operations
	"""
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
