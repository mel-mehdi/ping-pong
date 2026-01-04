from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TournamentViewSet, InvitationViewSet, MatchViewSet
from .views import ai_decide

router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet, basename='tournament')
router.register(r'invitations', InvitationViewSet, basename='invitation')
router.register(r'matches', MatchViewSet, basename='match')

urlpatterns = [
	path('', include(router.urls)),
    path("ai/decide/", ai_decide, name="ai_decide"),
]
