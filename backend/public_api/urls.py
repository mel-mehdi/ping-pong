from django.urls import path
from . import views

urlpatterns = [
	path('testing/', views.testing_view, name='testing_view'),
]