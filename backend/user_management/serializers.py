from rest_framework import serializers
from .models import User, UserProfile, Friendship, Achievement, UserAchievement, Notification


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
	achievements = serializers.SerializerMethodField()

	class Meta:
		model = UserProfile
		fields = [
			'user', 
			'bio', 
			'wins', 
			'losses', 
			'rank', 
			'level',
			'xp',
			'total_games',
			'win_rate',
			'achievements',
			'created_at'
		]
		read_only_fields = ['created_at']
	
	def get_achievements(self, obj):
		"""Get user's unlocked achievements"""
		user_achievements = UserAchievement.objects.filter(user=obj.user).select_related('achievement')
		return UserAchievementSerializer(user_achievements, many=True).data


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


class AchievementSerializer(serializers.ModelSerializer):
	class Meta:
		model = Achievement
		fields = ['id', 'name', 'description', 'achievement_type', 'icon', 'xp_reward']
		read_only_fields = ['id']


class UserAchievementSerializer(serializers.ModelSerializer):
	achievement = AchievementSerializer(read_only=True)

	class Meta:
		model = UserAchievement
		fields = ['id', 'achievement', 'unlocked_at']
		read_only_fields = ['id', 'unlocked_at']


class NotificationSerializer(serializers.ModelSerializer):
	related_user = UserSerializer(read_only=True)
	achievement = AchievementSerializer(read_only=True)
	friend_request_id = serializers.PrimaryKeyRelatedField(source='friend_request', read_only=True)

	class Meta:
		model = Notification
		fields = [
			'id', 
			'notification_type', 
			'message', 
			'related_user',
			'friend_request_id',
			'achievement',
			'is_read', 
			'created_at'
		]
		read_only_fields = ['id', 'created_at']
		