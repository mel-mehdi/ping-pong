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
			'password',
			'fullname',
			'avatar', 
			'online_status', 
			'created_at'
		]
		read_only_fields = ['id', 'created_at', 'online_status']
		extra_kwargs = {
			'email': { 'required': True },
			'password': {
				'write_only': True,
				'required': True,
				'min_length': 8,
				'style': {'input_type': 'password'}
			}
		}

	def create(self, validated_data):
		"""
		Create a new User with hashed password
		"""
		password = validated_data.pop('password')
		user = User.objects.create_user(
			password=password,
			**validated_data
		)
		return user
	
	def update(self, instance, validated_data):
		"""
		Update User instance, hashing password if provided
		"""
		password = validated_data.pop('password', None)
		for attr, value in validated_data.items():
			setattr(instance, attr, value)
		if password:
			instance.set_password(password)
		instance.save()
		return instance


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
		