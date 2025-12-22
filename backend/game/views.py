from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Tournament, TournamentParticipant, Invitation, Match
from .serializers import (
	TournamentSerializer, TournamentListSerializer, InvitationSerializer, MatchSerializer
)


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
		"""
		serializer.save(creator=self.request.user)

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
		serializer.save(sender=request.user)
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
