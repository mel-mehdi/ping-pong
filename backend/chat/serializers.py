from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from user_management.serializers import UserSerializer

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
	sender = UserSerializer(read_only=True)

	class Meta:
		model = Message
		fields = [
			'id', 'conversation', 'sender', 'content',
			'message_type', 'is_read', 'created_at'
		]


class ConversationSerializer(serializers.ModelSerializer):
	participants = UserSerializer(many=True, read_only=True)
	last_message = serializers.SerializerMethodField()
	unread_count = serializers.SerializerMethodField()

	class Meta:
		model = Conversation
		fields = [
			'id', 'name', 'conversation_type', 'participants',
			'last_message', 'unread_count', 'created_at', 'updated_at'
		]

	def get_last_message(self, obj):
		last_msg = obj.messages.order_by('-created_at').first()
		if last_msg:
			return MessageSerializer(last_msg).data
		return None

	def get_unread_count(self, obj):
		request = self.context.get('request')
		if request and request.user.is_authenticated:
			return obj.messages.filter(
				is_read=False
			).exclude(
				sender=request.user
			).count()
		return 0
