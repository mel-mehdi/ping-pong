from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'keys', views.APIKeyViewSet, basename='api-keys')

tournaments_list = views.PublicAPIViewSet.as_view({
	'get': 'tournaments',
	'post': 'create_tournament'
})

tournament_detail = views.PublicAPIViewSet.as_view({
	'put': 'update_tournament',
	'delete': 'delete_tournament'
})

leaderboard_view = views.PublicAPIViewSet.as_view({
	'get': 'leaderboard'
})

urlpatterns = [
	path('', include(router.urls)),
	path('tournaments/', tournaments_list, name='api-tournaments'),
	path('tournaments/<int:pk>/', tournament_detail, name='api-tournament-detail'),
	path('leaderboard/', leaderboard_view, name='api-leaderboard'),
]
