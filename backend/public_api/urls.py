from django.urls import path
from . import views

user_view = views.PublicAPIViewSet.as_view({
    'get': 'me',
	'post': 'register',
    'put': 'me',
    'delete': 'me'
})

leaderboard_view = views.PublicAPIViewSet.as_view({
    'get': 'leaderboard'
})

urlpatterns = [
    path('me/', user_view, name='user-me'),
    path('leaderboard/', leaderboard_view, name='leaderboard'),
    path('csrf/', views.set_csrf_cookie, name='set-csrf'),
]