from django.db import models
from django.conf import settings


class Tournament(models.Model):
	MAX_PLAYERS_CHOICES = [
		(4, '4 Players'),
		(8, '8 Players'),
		(16, '16 Players'),
		(32, '32 Players'),
	]
	STATUS_CHOICES = [
		('pending', 'Pending'),
		('ongoing', 'Ongoing'),
		('completed', 'Completed'),
		('canceled', 'Canceled'),
	]

	name = models.CharField(max_length=100)
	prize_pool = models.CharField(max_length=200, blank=True)

	creator = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='created_tournaments'
	)
	max_players = models.PositiveSmallIntegerField(
		choices=MAX_PLAYERS_CHOICES,
		default=4
	)
	
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

	start_date = models.DateTimeField(null=True, blank=True)
	end_date = models.DateTimeField(null=True, blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name = 'Tournament'
		verbose_name_plural = 'Tournaments'
		ordering = ['-created_at']

	def __str__(self):
		return self.name


class TournamentParticipant(models.Model):
	tournament = models.ForeignKey(
		Tournament,
		on_delete=models.CASCADE,
		related_name='participants'
	)
	user = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='tournament_participations'
	)

	joined_at = models.DateTimeField(auto_now_add=True)
	placement = models.PositiveIntegerField(null=True, blank=True)

	class Meta:
		verbose_name = 'Tournament Participant'
		verbose_name_plural = 'Tournament Participants'
		ordering = ['joined_at']
		unique_together = ('tournament', 'user')

	def __str__(self):
		return f"{self.user.username} in {self.tournament.name}"


class Invitation(models.Model):
	STATUS_CHOICES = [
		('pending', 'Pending'),
		('accepted', 'Accepted'),
		('declined', 'Declined'),
		('canceled', 'Canceled')
	]

	TYPE_CHOICES = [
		('tournament', 'Tournament'),
		('match', 'Match')
	]

	sender = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='sent_invitations'
	)
	receiver = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='received_invitations'
	)

	message = models.TextField(blank=True)
	status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
	
	invitation_type = models.CharField(
		max_length=15,
		choices=TYPE_CHOICES,
		default='tournament'
	)
	tournament = models.ForeignKey(
		Tournament,
		on_delete=models.CASCADE,
		related_name='invitations',
		null=True,
		blank=True
	)

	created_at = models.DateTimeField(auto_now_add=True)
	responded_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		verbose_name = 'Invitation'
		verbose_name_plural = 'Invitations'
		ordering = ['-created_at']
		unique_together = ('sender', 'receiver', 'tournament')

	def __str__(self):
		return f"Invitation from {self.sender.username} to {self.receiver.username} for {self.invitation_type}"


class Match(models.Model):
	STATUS_CHOICES = [
		('ongoing', 'Ongoing'),
		('completed', 'Completed'),
		('canceled', 'Canceled'),
	]

	tournament = models.ForeignKey(
		Tournament,
		on_delete=models.CASCADE,
		related_name='matches',
		null=True,
		blank=True
	)
	status = models.CharField(
		max_length=15,
		choices=STATUS_CHOICES,
		default='in_progress'
	)
	player1 = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='matches_as_player1'
	)
	player2 = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='matches_as_player2'
	)
	winner = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='matches_won',
		null=True,
		blank=True
	)

	player1_score = models.PositiveIntegerField(default=0)
	player2_score = models.PositiveIntegerField(default=0)

	created_at = models.DateTimeField(auto_now_add=True)
	started_at = models.DateTimeField(null=True, blank=True)
	completed_at = models.DateTimeField(null=True, blank=True)

	class Meta:
		verbose_name = 'Match'
		verbose_name_plural = 'Matches'
		ordering = ['-created_at']

	def __str__(self):
		return f"Quick Match: {self.player1.username} vs {self.player2.username}"
