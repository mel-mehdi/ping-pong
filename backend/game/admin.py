from django.contrib import admin
from .models import Tournament, TournamentParticipant, Invitation, Match


@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
	list_display = ('name', 'creator', 'status', 'max_players', 'start_date', 'end_date', 'created_at')
	list_filter = ('status', 'start_date', 'end_date')
	search_fields = ('name', 'creator__username', 'status')


@admin.register(TournamentParticipant)
class TournamentParticipantAdmin(admin.ModelAdmin):
	list_display = ('tournament', 'user', 'joined_at', 'placement')
	list_filter = ('tournament', 'joined_at')
	search_fields = ('tournament__name', 'user__username')


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
	list_display = ('invitation_type', 'tournament', 'sender', 'receiver', 'status', 'created_at', 'responded_at')
	list_filter = ('invitation_type', 'status', 'created_at')
	search_fields = ('tournament__name', 'sender__username', 'receiver__username')


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
	list_display = ('tournament', 'player1', 'player2', 'winner', 'created_at')
	list_filter = ('tournament', 'created_at')
	search_fields = ('tournament__name', 'player1__username', 'player2__username', 'winner__username')
