from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Conversation(models.Model):
	CONVERSATION_TYPES = [
		('private', 'Private'),
		('group', 'Group'),
	]

	name = models.CharField(max_length=255, blank=True, null=True)
	conversation_type = models.CharField(
		max_length=10,
		choices=CONVERSATION_TYPES,
		default='private'
	)

	participants = models.ManyToManyField(User, related_name='conversations')

	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		db_table = 'conversations'
		ordering = ['-updated_at']

	def __str__(self):
		if self.conversation_type == 'private':
			participant_names = ', '.join([str(user) for user in self.participants.all()])
			return f'Private Conversation between {participant_names}'
		return self.name or 'Group Conversation'
	

class Message(models.Model):
	MESSAGE_TYPES = [
		('text', 'Text'),
	]

	conversation = models.ForeignKey(
		Conversation,
		on_delete=models.CASCADE,
		related_name='messages'
	)
	sender = models.ForeignKey(
		User,
		on_delete=models.CASCADE,
		related_name='messages_sent'
	)
	content = models.TextField()

	message_type = models.CharField(
		max_length=10,
		choices=MESSAGE_TYPES,
		default='text'
	)

	is_read = models.BooleanField(default=False)

	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'messages'
		ordering = ['created_at']

	def __str__(self):
		return f'Message from {self.sender} in {self.conversation}'
