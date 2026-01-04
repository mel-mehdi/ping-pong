import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
	"""
	WebSocket consumer for real-time chat.
	"""

	async def connect(self):
		"""
		Handle WebSocket connection.
		"""
		self.user = self.scope['user']
		if not self.user.is_authenticated:
			await self.close()
			return
		
		self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
		self.room_group_name = f'chat_{self.conversation_id}'

		is_participant = await self.is_user_participant()
		if not is_participant:
			await self.close()
			return
		
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

		await self.accept()

		await self.set_user_online(True)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'user_status',
				'user_id': self.user.id,
				'username': self.user.username,
				'status': 'online'
			}
		)

	async def disconnect(self, close_code):
		"""Handle WebSocket disconnection"""
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

		await self.set_user_online(False)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'user_status',
				'user_id': self.user.id,
				'username': self.user.username,
				'status': 'offline'
			}
		)

	async def receive(self, text_data):
		"""Handle incoming messages"""
		try:
			data = json.loads(text_data)
			message_type = data.get('type')

			if message_type == 'chat_message':
				await self.handle_chat_message(data)
			elif message_type == 'typing':
				await self.handle_typing(data)
			elif message_type == 'read_receipt':
				await self.handle_read_receipt(data)
		except json.JSONDecodeError:
			await self.send(text_data=json.dumps({
				'error': 'Invalid JSON'
			}))

	async def handle_chat_message(self, data):
		"""Handle chat message"""
		content = data.get('message', '').strip()

		if not content:
			return

		message = await self.save_message(content)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'chat_message',
				'message': {
					'id': message.id,
					'sender': {
						'id': self.user.id,
						'username': self.user.username,
						'avatar': self.user.avatar.url if self.user.avatar else None
					},
					'content': message.content,
					'created_at': message.created_at.isoformat()
				}
			}
		)

	async def handle_typing(self, data):
		"""Handle typing indicator"""
		is_typing = data.get('is_typing', False)

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'typing_indicator',
				'user_id': self.user.id,
				'username': self.user.username,
				'is_typing': is_typing
			}
		)

	async def handle_read_receipt(self, data):
		"""Handle read receipts"""
		message_ids = data.get('message_ids', [])
		await self.mark_messages_read(message_ids)
		
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'read_receipt',
				'user_id': self.user.id,
				'message_ids': message_ids
			}
		)

	async def chat_message(self, event):
		"""Send chat message to WebSocket"""
		await self.send(text_data=json.dumps({
			'type': 'chat_message',
			'message': event['message']
		}))

	async def typing_indicator(self, event):
		"""Send typing indicator"""
		if event['user_id'] != self.user.id:
			await self.send(text_data=json.dumps({
				'type': 'typing',
				'user_id': event['user_id'],
				'username': event['username'],
				'is_typing': event['is_typing']
			}))


	async def user_status(self, event):
		"""Send user status update"""
		await self.send(text_data=json.dumps({
			'type': 'user_status',
			'user_id': event['user_id'],
			'username': event['username'],
			'status': event['status']
		}))

	async def read_receipt(self, event):
		"""Send read receipt"""
		await self.send(text_data=json.dumps({
			'type': 'read_receipt',
			'user_id': event['user_id'],
			'message_ids': event['message_ids']
		}))


	@database_sync_to_async
	def is_user_participant(self):
		"""Check if user is participant"""
		try:
			conversation = Conversation.objects.get(id=self.conversation_id)
			return conversation.participants.filter(id=self.user.id).exists()
		except Conversation.DoesNotExist:
			return False
		
	@database_sync_to_async
	def save_message(self, content):
		"""Save message to database"""
		message = Message.objects.create(
			conversation_id=self.conversation_id,
			sender=self.user,
			content=content,
			message_type='text'
		)
		
		Conversation.objects.filter(id=self.conversation_id).update(
			updated_at=message.created_at
		)
		
		return message
	
	@database_sync_to_async
	def mark_messages_read(self, message_ids):
		"""Mark messages as read"""
		Message.objects.filter(
			id__in=message_ids,
			conversation_id=self.conversation_id
		).exclude(
			sender=self.user
		).update(is_read=True)

	@database_sync_to_async
	def set_user_online(self, is_online):
		"""Update user online status"""
		User.objects.filter(id=self.user.id).update(online_status=is_online)
