from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import APIKey

User = get_user_model()


class APIKeySerializer(serializers.ModelSerializer):
	class Meta:
		model = APIKey
		fields = [
			'id', 'name', 'prefix', 'is_active', 'rate_limit',
			'total_requests', 'last_used_at', 'created_at', 'expires_at'
		]
		read_only_fields = ['id', 'prefix', 'total_requests', 'last_used_at', 'created_at']


class UserPublicSerializer(serializers.ModelSerializer):
	wins = serializers.IntegerField(read_only=True)

	class Meta:
		model = User
		fields = ['id', 'username', 'fullname', 'avatar', 'wins']
		read_only_fields = ['id', 'username']
