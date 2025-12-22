from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from .authentication import APIKeyAuthentication
from .permissions import HasValidAPIKey
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from user_management.serializers import UserProfileSerializer, UserSerializer
from user_management.models import UserProfile


User = get_user_model()


class PublicAPIViewSet(viewsets.ViewSet):
	"""
    Public API endpoints with API key authentication
    
    All endpoints require X-API-Key header
    """
	swagger_tags = ['Public API']
	authentication_classes = [APIKeyAuthentication]
	permission_classes = [HasValidAPIKey]

	def get_permissions(self):
		"""
		Custom permission handling based on action
		"""
		if self.action == 'register':
			return [AllowAny()]
		return [HasValidAPIKey()]

	@action(detail=False, methods=['get', 'put', 'delete'])
	def me(self, request):
		"""
        GET/PUT/DELETE /api/me/
		Retrieve, update, or delete the authenticated user's profile
        """
		user = request.user
		detail = 'Authentication credentials were not provided.'

		if not user or not user.is_authenticated:
			return Response({'detail': detail}, status=status.HTTP_401_UNAUTHORIZED)
		
		if request.method == 'GET':
			serializer = UserProfileSerializer(user.userprofile)
			return Response(serializer.data)
		
		elif request.method == 'PUT':
			serializer = UserSerializer(user, data=request.data, partial=True)
			if serializer.is_valid():
				user = serializer.save()
				return Response(UserSerializer(user).data)
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		
		elif request.method == 'DELETE':
			user.delete()
			return Response({'detail': 'User deleted.'}, status=status.HTTP_204_NO_CONTENT)
		
	@action(detail=False, methods=['post'])
	def register(self, request):
		"""
		POST /api/register/
		Register a new user
		"""
		serializer = UserSerializer(data=request.data)
		if serializer.is_valid():
			user = serializer.save()
			return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
	
	@action(detail=False, methods=['get'])
	def leaderboard(self, request):
		"""
        GET /api/leaderboard/
        Get top players by rank
        """
		top_profiles = UserProfile.objects.select_related('user').order_by('-rank')[:10]
		serializer = UserProfileSerializer(top_profiles, many=True)

		return Response({'leaderboard': serializer.data})
