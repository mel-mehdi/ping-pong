from django.utils.timezone import timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, F
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Tournament, TournamentParticipant, Invitation, Match
from user_management.models import User, Notification
from .serializers import (
	TournamentSerializer, TournamentListSerializer, InvitationSerializer, MatchSerializer
)
from user_management.serializers import UserSerializer


class LeaderboardViewSet(viewsets.ViewSet):
	"""
	ViewSet for retrieving tournament leaderboards
	"""
	swagger_tags = ['Leaderboard']
	permission_classes = [IsAuthenticated]

	@action(detail=False, methods=['get'])
	def all_time(self, request):
		"""
		Get all-time leaderboard
		GET /leaderboard/all_time/
		"""
		leaderboard = User.objects.annotate(
			wins=Count('matches_won'),
			losses=Count('matches_as_player1', filter=~Q(matches_as_player1__winner=F('id'))) + Count('matches_as_player2', filter=~Q(matches_as_player2__winner=F('id')))
		).filter(wins__gt=0).order_by('-wins')[:50]

		serializer = UserSerializer(leaderboard, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['get'])
	def this_month(self, request):
		"""
		Get leaderboard for current month
		GET /leaderboard/this_month/
		"""
		start_of_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
		
		leaderboard = User.objects.annotate(
			wins=Count('matches_won', filter=Q(matches_won__completed_at__gte=start_of_month))
		).filter(wins__gt=0).order_by('-wins')[:50]
		
		serializer = UserSerializer(leaderboard, many=True)
		return Response(serializer.data)
	
	@action(detail=False, methods=['get'])
	def this_week(self, request):
		"""
		Get leaderboard for current week
		GET /leaderboard/this_week/
		"""
		start_of_week = timezone.now() - timedelta(days=timezone.now().weekday())
		start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
		
		leaderboard = User.objects.annotate(
			wins=Count('matches_won', filter=Q(matches_won__completed_at__gte=start_of_week))
		).filter(wins__gt=0).order_by('-wins')[:50]
		
		serializer = UserSerializer(leaderboard, many=True)
		return Response(serializer.data)


class TournamentViewSet(viewsets.ModelViewSet):
	swagger_tags = ['Tournaments']
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""
		Retrieve tournaments with optional filtering by status.
		"""
		queryset = Tournament.objects.all()
		status_filter = self.request.query_params.get('status')
		if status_filter:
			queryset = queryset.filter(status=status_filter)
		return queryset

	def get_serializer_class(self):
		"""
		Return the appropriate serializer class based on the action.
		"""
		if self.action == 'list':
			return TournamentListSerializer
		return TournamentSerializer

	def perform_create(self, serializer):
		"""
		Set the creator of the tournament to the current user upon creation.
		Automatically add the creator as a participant.
		"""
		tournament = serializer.save(creator=self.request.user)
		
		# Automatically add creator as participant
		TournamentParticipant.objects.get_or_create(
			tournament=tournament,
			user=self.request.user
		)

	@action(detail=False, methods=['get'])
	def active(self, request):
		"""
		Retrieve a list of active tournaments.
		GET /tournaments/active/
		"""
		active_tournaments = Tournament.objects.filter(status='ongoing')
		serializer = self.get_serializer(active_tournaments, many=True)
		return Response(serializer.data)
	
	@action(detail=False, methods=['get'])
	def my_tournaments(self, request):
		"""
		Retrieve tournaments created by or participated in by the current user.
		GET /tournaments/my_tournaments/
		"""
		created_tournaments = Tournament.objects.filter(creator=request.user)
		participated_tournaments = Tournament.objects.filter(participants__user=request.user)
		tournaments = (created_tournaments | participated_tournaments).distinct()
		serializer = self.get_serializer(tournaments, many=True)
		return Response(serializer.data)

	@action(detail=True, methods=['post'])
	def join(self, request, pk=None):
		"""
		Allow the current user to join a tournament.
		POST /tournaments/{id}/join/
		"""
		tournament = self.get_object()

		if tournament.status != 'pending':
			return Response({'detail': 'Tournament is not open for joining.'}, status=status.HTTP_400_BAD_REQUEST)

		if tournament.participants.count() >= tournament.max_players:
			return Response({'detail': 'Tournament is full.'}, status=status.HTTP_400_BAD_REQUEST)

		participant, created = TournamentParticipant.objects.get_or_create(
			tournament=tournament,
			user=request.user
		)

		if not created:
			return Response({'detail': 'You have already joined this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

		# Check if tournament is now full and start it
		if tournament.participants.count() >= tournament.max_players:
			tournament.status = 'ongoing'
			tournament.start_date = timezone.now()
			tournament.save()

			# Create first round matches
			participants = list(tournament.participants.all())
			import random
			random.shuffle(participants)
			
			# Create matches for pairs of participants
			matches_created = []
			for i in range(0, len(participants) - 1, 2):
				match = Match.objects.create(
					tournament=tournament,
					player1=participants[i].user,
					player2=participants[i + 1].user,
					status='ongoing'
				)
				matches_created.append({
					'player1': participants[i].user.username,
					'player2': participants[i + 1].user.username
				})

			return Response({
				'detail': 'Tournament is now full and has started!',
				'matches': matches_created
			}, status=status.HTTP_201_CREATED)

		return Response({'detail': 'Successfully joined the tournament.'}, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=['post'])
	def leave(self, request, pk=None):
		"""
		Allow the current user to leave a tournament.
		POST /tournaments/{id}/leave/
		"""
		tournament = self.get_object()

		try:
			participant = TournamentParticipant.objects.get(
				tournament=tournament,
				user=request.user
			)
			participant.delete()
			return Response({'detail': 'Successfully left the tournament.'}, status=status.HTTP_200_OK)
		except TournamentParticipant.DoesNotExist:
			return Response({'detail': 'You are not a participant of this tournament.'}, status=status.HTTP_400_BAD_REQUEST)

	@action(detail=True, methods=['post'])
	def start(self, request, pk=None):
		"""
		Start a tournament (only creator can start).
		POST /tournaments/{id}/start/
		"""
		tournament = self.get_object()

		if tournament.creator != request.user:
			return Response({'detail': 'Only the tournament creator can start it.'}, status=status.HTTP_403_FORBIDDEN)

		if tournament.status != 'pending':
			return Response({'detail': 'Tournament has already started or completed.'}, status=status.HTTP_400_BAD_REQUEST)

		if tournament.participants.count() < 2:
			return Response({'detail': 'Need at least 2 participants to start.'}, status=status.HTTP_400_BAD_REQUEST)

		# Start tournament
		tournament.status = 'ongoing'
		tournament.start_date = timezone.now()
		tournament.save()

		# Create first round matches
		participants = list(tournament.participants.all())
		import random
		random.shuffle(participants)
		
		# Create matches for pairs of participants
		matches_created = []
		for i in range(0, len(participants) - 1, 2):
			match = Match.objects.create(
				tournament=tournament,
				player1=participants[i].user,
				player2=participants[i + 1].user,
				status='ongoing'
			)
			matches_created.append({
				'player1': participants[i].user.username,
				'player2': participants[i + 1].user.username
			})

		return Response({
			'detail': 'Tournament started successfully!',
			'matches': matches_created
		}, status=status.HTTP_200_OK)


class InvitationViewSet(viewsets.ModelViewSet):
	swagger_tags = ['Invitations']
	serializer_class = InvitationSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""
		Retrieve invitations sent to or from the current user.
		"""
		return Invitation.objects.filter(
			Q(sender=self.request.user) | Q(receiver=self.request.user)
		)

	def create(self, request):
		"""
		Create a new invitation.
		"""
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		invitation = serializer.save(sender=request.user)

		# Create notification
		notification = Notification.objects.create(
			user=invitation.receiver,
			notification_type='game_invite',
			message=f"{request.user.username} invited you to a game",
			game_invitation=invitation,
			related_user=request.user
		)

		# Send WebSocket message
		channel_layer = get_channel_layer()
		async_to_sync(channel_layer.group_send)(
			f'notifications_{invitation.receiver.id}',
			{
				'type': 'send_notification',
				'notification': {
					'id': notification.id,
					'type': notification.notification_type,
					'message': notification.message,
					'is_read': notification.is_read,
					'created_at': notification.created_at.isoformat(),
					'game_invitation': {
						'id': invitation.id,
						'sender': {
							'id': request.user.id,
							'username': request.user.username,
							'avatar': request.user.avatar.url if request.user.avatar else None
						},
						'status': invitation.status
					},
					'related_user': {
						'id': request.user.id,
						'username': request.user.username,
						'avatar': request.user.avatar.url if request.user.avatar else None
					}
				}
			}
		)

		return Response(serializer.data, status=status.HTTP_201_CREATED)
	
	@action(detail=True, methods=['patch'])
	def respond(self, request, pk=None):
		"""
		Allow the receiver to respond to an invitation.
		PATCH /invitations/{id}/respond/
		"""
		invitation = self.get_object()

		if invitation.receiver != request.user:
			return Response({'detail': 'You are not authorized to respond to this invitation.'}, status=status.HTTP_403_FORBIDDEN)

		if invitation.status == 'canceled':
			return Response({'detail': 'This invitation has been canceled by the sender.'}, status=status.HTTP_400_BAD_REQUEST)

		if invitation.status != 'pending':
			return Response({'detail': 'This invitation has already been responded to.'}, status=status.HTTP_400_BAD_REQUEST)

		new_status = request.data.get('status')
		if new_status not in ['accepted', 'declined']:
			return Response({'detail': 'Invalid status. Must be "accepted" or "declined".'}, status=status.HTTP_400_BAD_REQUEST)

		invitation.status = new_status
		invitation.responded_at = timezone.now()
		invitation.save()

		if new_status == 'accepted':
			# Notify the sender that the invitation was accepted
			channel_layer = get_channel_layer()
			async_to_sync(channel_layer.group_send)(
				f'notifications_{invitation.sender.id}',
				{
					'type': 'game_invite_accepted',
					'invitation_id': invitation.id,
					'receiver_id': invitation.receiver.id,
					'receiver_name': invitation.receiver.username
				}
			)

			if invitation.invitation_type == 'tournament':
				tournament = invitation.tournament
				if not tournament:
					return Response({'detail': 'Tournament not found for this invitation.'}, status=status.HTTP_400_BAD_REQUEST)

				if tournament.participants.count() >= tournament.max_players:
					return Response({'detail': 'Tournament is full.'}, status=status.HTTP_400_BAD_REQUEST)

				TournamentParticipant.objects.get_or_create(
					tournament=tournament,
					user=request.user
				)

		serializer = self.get_serializer(invitation)
		return Response(serializer.data)


class MatchViewSet(viewsets.ModelViewSet):
	swagger_tags = ['Matches']
	serializer_class = MatchSerializer
	permission_classes = [IsAuthenticated]

	def get_queryset(self):
		"""
		Retrieve matches that involve the current user.
		"""
		return Match.objects.filter(
			Q(player1=self.request.user) | Q(player2=self.request.user)
		)
	
	@action(detail=False, methods=['get'])
	def my_matches(self, request):
		"""
		Retrieve matches for the current user.
		GET /matches/my_matches/
		"""
		matches = self.get_queryset()
		serializer = self.get_serializer(matches, many=True)
		return Response(serializer.data)
	
	@action(detail=False, methods=['get'])
	def tournament_matches(self, request):
		"""
		Retrieve pending tournament matches for the current user.
		GET /matches/tournament_matches/
		"""
		matches = Match.objects.filter(
			Q(player1=request.user) | Q(player2=request.user),
			tournament__isnull=False,
			status='ongoing'
		).select_related('tournament', 'player1', 'player2')
		serializer = self.get_serializer(matches, many=True)
		return Response(serializer.data)
