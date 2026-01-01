from rest_framework import serializers
from .models import Tournament, TournamentParticipant, Invitation, Match
from user_management.serializers import UserSerializer


class TournamentParticipantSerializer(serializers.ModelSerializer):
	user = UserSerializer(read_only=True)

	class Meta:
		model = TournamentParticipant
		fields = ['id', 'user', 'joined_at', 'placement']


class TournamentSerializer(serializers.ModelSerializer):
	creator = UserSerializer(read_only=True)
	participants = TournamentParticipantSerializer(many=True, read_only=True)
	participant_count = serializers.SerializerMethodField()

	class Meta:
		model = Tournament
		fields = [
			'id', 'name', 'max_players', 'prize_pool', 'creator', 'status',
			'start_date', 'end_date', 'created_at', 'updated_at',
			'participants', 'participant_count'
		]
		read_only_fields = ['creator', 'created_at', 'updated_at']

	def get_participant_count(self, obj):
		return obj.participants.count()


class TournamentListSerializer(serializers.ModelSerializer):
	creator = UserSerializer(read_only=True)
	participant_count = serializers.SerializerMethodField()

	class Meta:
		model = Tournament
		fields = [
			'id', 'name', 'max_players', 'prize_pool', 'creator', 'status',
			'start_date', 'end_date', 'created_at',
			'participant_count'
		]

	def get_participant_count(self, obj):
		return obj.participants.count()


class InvitationSerializer(serializers.ModelSerializer):
	sender = UserSerializer(read_only=True)
	receiver = UserSerializer(read_only=True)
	receiver_id = serializers.IntegerField(write_only=True)
	tournament_name = serializers.CharField(source='tournament.name', read_only=True)

	class Meta:
		model = Invitation
		fields = [
			'id', 'sender', 'receiver', 'receiver_id', 'invitation_type', 'tournament', 'tournament_name', 'status', 'message', 'created_at', 'responded_at'
		]
		read_only_fields = ['sender', 'status', 'created_at', 'responded_at']


class MatchSerializer(serializers.ModelSerializer):
	player1 = UserSerializer(read_only=True)
	player2 = UserSerializer(read_only=True)
	winner = UserSerializer(read_only=True)
	tournament_name = serializers.CharField(source='tournament.name', read_only=True)

	class Meta:
		model = Match
		fields = [
			'id', 'tournament', 'tournament_name', 'player1', 'player2', 'winner',
			'player1_score', 'player2_score', 'status',
				'started_at', 'completed_at', 'created_at'
		]
		read_only_fields = ['created_at']
