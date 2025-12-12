from rest_framework import serializers
from .models import User, UserProfile, Friendship


class UserSerializer(serializers.ModelSerializer):
	"""
	Serializer for User model
	"""
	class Meta:
		model = User
		fields = [
			'id', 
			'username', 
			'email', 
			'fullname',
			'avatar', 
			'online_status', 
			'created_at'
		]
		read_only_fields = ['id', 'created_at']


class UserProfileSerializer(serializers.ModelSerializer):
	"""
	Serializer for UserProfile with nested User data
	"""
	user = UserSerializer(read_only=True)
	total_games = serializers.ReadOnlyField()
	win_rate = serializers.ReadOnlyField()

	class Meta:
		model = UserProfile
		fields = [
			'user', 
			'bio', 
			'wins', 
			'losses', 
			'rank', 
			'level',
			'total_games',
			'win_rate',
			'created_at'
		]
		read_only_fields = ['created_at']


class FriendshipSerializer(serializers.ModelSerializer):
	"""
	Serializer for Friendship
	"""
	from_user = UserSerializer(read_only=True)
	to_user = UserSerializer(read_only=True)

	class Meta:
		model = Friendship
		fields = ['id', 'from_user', 'to_user', 'status', 'created_at']
		read_only_fields = ['id', 'created_at']
		