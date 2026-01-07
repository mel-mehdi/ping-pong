from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from .authentication import APIKeyAuthentication
from .permissions import HasValidAPIKey
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from .models import APIKey
from game.models import Tournament
from .serializers import APIKeySerializer, UserPublicSerializer
from game.serializers import TournamentSerializer, TournamentListSerializer

User = get_user_model()


class APIKeyViewSet(viewsets.ViewSet):
	"""
	API Key Management (requires regular user authentication)
	"""
	swagger_tags = ['API Key Management']
	permission_classes = [IsAuthenticated]

	def list(self, request):
		"""
		GET /api/keys/
		List all API keys for current user
		"""
		keys = APIKey.objects.filter(user=request.user)
		serializer = APIKeySerializer(keys, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['post'])
	def create_key(self, request):
		"""
		POST /api/keys/create_key/
		Body: {"name": "My App", "rate_limit": 60}
		"""
		name = request.data.get('name', 'API Key')
		rate_limit = request.data.get('rate_limit', 60)
		expires_at = request.data.get('expires_at', None)
		
		api_key_obj, full_key = APIKey.create_key(
			user=request.user,
			name=name,
			rate_limit=rate_limit,
			expires_at=expires_at
		)
		
		return Response({
			'message': 'API key created. Save it now - you won\'t see it again!',
			'key': full_key,
			'details': APIKeySerializer(api_key_obj).data
		}, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=['delete'])
	def revoke(self, request, pk=None):
		"""
		DELETE /api/keys/{id}/revoke/
		"""
		try:
			api_key = APIKey.objects.get(pk=pk, user=request.user)
			api_key.delete()
			return Response({'message': 'API key revoked successfully'})
		except APIKey.DoesNotExist:
			return Response(
				{'error': 'API key not found'},
				status=status.HTTP_404_NOT_FOUND
			)

	@action(detail=True, methods=['patch'])
	def toggle(self, request, pk=None):
		"""
		PATCH /api/keys/{id}/toggle/
		Enable/disable API key
		"""
		try:
			api_key = APIKey.objects.get(pk=pk, user=request.user)
			api_key.is_active = not api_key.is_active
			api_key.save()
			return Response({
				'message': f'API key {"activated" if api_key.is_active else "deactivated"}',
				'is_active': api_key.is_active
			})
		except APIKey.DoesNotExist:
			return Response(
				{'error': 'API key not found'},
				status=status.HTTP_404_NOT_FOUND
			)


class PublicAPIViewSet(viewsets.ViewSet):
	"""
	Public API endpoints with API key authentication
	"""
	swagger_tags = ['Public API']
	authentication_classes = [APIKeyAuthentication]
	permission_classes = [HasValidAPIKey]

	@action(detail=False, methods=['get'])
	def leaderboard(self, request):
		"""
		GET /api/leaderboard/
		Get all-time leaderboard
		"""
		leaderboard = User.objects.annotate(
			wins=Count('matches_won')
		).filter(wins__gt=0).order_by('-wins')[:50]
		
		serializer = UserPublicSerializer(leaderboard, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['get'])
	def tournaments(self, request):
		"""
		GET /api/tournaments/
		List tournaments created by this API key's owner
		"""
		tournaments = Tournament.objects.filter(creator=request.user)
		serializer = TournamentListSerializer(tournaments, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['post'])
	def create_tournament(self, request):
		"""
		POST /api/create_tournament/
		Body: {
			"name": "My Tournament",
			"max_players": 8,
			"prize_pool": "100 coins"
		}
		"""
		serializer = TournamentSerializer(data=request.data)
		
		if serializer.is_valid():
			serializer.save(creator=request.user)  # Set creator to API key owner
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	@action(detail=True, methods=['put'])
	def update_tournament(self, request, pk=None):
		"""
		PUT /api/update_tournament/{id}/
		Update tournament (only if you created it)
		"""
		try:
			tournament = Tournament.objects.get(pk=pk, creator=request.user)
		except Tournament.DoesNotExist:
			return Response(
				{'error': 'Tournament not found or you don\'t have permission'},
				status=status.HTTP_404_NOT_FOUND
			)
		
		serializer = TournamentSerializer(tournament, data=request.data, partial=True)
		
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

	@action(detail=True, methods=['delete'])
	def delete_tournament(self, request, pk=None):
		"""
		DELETE /api/delete_tournament/{id}/
		Delete tournament (only if you created it)
		"""
		try:
			tournament = Tournament.objects.get(pk=pk, creator=request.user)
			tournament.delete()
			return Response(
				{'message': 'Tournament deleted successfully'},
				status=status.HTTP_204_NO_CONTENT
			)
		except Tournament.DoesNotExist:
			return Response(
				{'error': 'Tournament not found or you don\'t have permission'},
				status=status.HTTP_404_NOT_FOUND
			)
