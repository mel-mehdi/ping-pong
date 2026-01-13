import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Notification


class NotificationConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		# Log scope headers for debugging WS auth issues
		try:
			headers = {k.decode('latin1'): v.decode('latin1') for k, v in self.scope.get('headers', [])}
			print('WS connect scope headers:', headers)
		except Exception:
			pass

		self.user = self.scope['user']
		
		if self.user.is_authenticated:
			self.notification_group_name = f'notifications_{self.user.id}'
			
			await self.channel_layer.group_add(
				self.notification_group_name,
				self.channel_name
			)
			
			await self.accept()
			
			unread_notifications = await self.get_unread_notifications()
			await self.send(text_data=json.dumps({
				'type': 'unread_notifications',
				'notifications': unread_notifications
			}))
		else:
			await self.close()

	async def disconnect(self, close_code):
		if self.user.is_authenticated:
			await self.channel_layer.group_discard(
				self.notification_group_name,
				self.channel_name
			)

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			action = data.get('action')
			
			if action == 'mark_as_read':
				notification_id = data.get('notification_id')
				await self.mark_notification_as_read(notification_id)
				await self.send(text_data=json.dumps({
					'type': 'notification_marked_read',
					'notification_id': notification_id
				}))
			
			elif action == 'mark_all_as_read':
				await self.mark_all_notifications_as_read()
				await self.send(text_data=json.dumps({
					'type': 'all_notifications_marked_read'
				}))
			
			elif action == 'get_notifications':
				notifications = await self.get_all_notifications()
				await self.send(text_data=json.dumps({
					'type': 'all_notifications',
					'notifications': notifications
				}))
		
		except json.JSONDecodeError:
			await self.send(text_data=json.dumps({
				'type': 'error',
				'message': 'Invalid JSON'
			}))

	async def send_notification(self, event):
		notification = event['notification']
		
		await self.send(text_data=json.dumps({
			'type': 'new_notification',
			'notification': notification
		}))

	async def game_invite_accepted(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_invite_accepted',
			'invitation_id': event['invitation_id'],
			'receiver_id': event['receiver_id'],
			'receiver_name': event['receiver_name']
		}))

	@database_sync_to_async
	def get_unread_notifications(self):
		notifications = Notification.objects.filter(
			user=self.user,
			is_read=False
		).select_related('related_user', 'friend_request', 'achievement')
		
		return [self._serialize_notification(notif) for notif in notifications]

	@database_sync_to_async
	def get_all_notifications(self):
		notifications = Notification.objects.filter(
			user=self.user
		).select_related('related_user', 'friend_request', 'achievement')[:50]
		
		return [self._serialize_notification(notif) for notif in notifications]

	@database_sync_to_async
	def mark_notification_as_read(self, notification_id):
		try:
			notification = Notification.objects.get(
				id=notification_id,
				user=self.user
			)
			notification.mark_as_read()
		except Notification.DoesNotExist:
			pass

	@database_sync_to_async
	def mark_all_notifications_as_read(self):
		Notification.objects.filter(
			user=self.user,
			is_read=False
		).update(is_read=True)

	def _serialize_notification(self, notification):
		result = {
			'id': notification.id,
			'type': notification.notification_type,
			'message': notification.message,
			'is_read': notification.is_read,
			'created_at': notification.created_at.isoformat()
		}
		
		if notification.related_user:
			result['related_user'] = {
				'id': notification.related_user.id,
				'username': notification.related_user.username,
				'avatar': notification.related_user.avatar.url if notification.related_user.avatar else None
			}
		
		if notification.friend_request:
			result['friend_request_id'] = notification.friend_request.id
		
		if notification.achievement:
			result['achievement'] = {
				'id': notification.achievement.id,
				'name': notification.achievement.name,
				'description': notification.achievement.description,
				'icon': notification.achievement.icon,
				'xp_reward': notification.achievement.xp_reward
			}
		
		if notification.game_invitation:
			result['game_invitation'] = {
				'id': notification.game_invitation.id,
				'sender': {
					'id': notification.game_invitation.sender.id,
					'username': notification.game_invitation.sender.username,
					'avatar': notification.game_invitation.sender.avatar.url if notification.game_invitation.sender.avatar else None
				},
				'status': notification.game_invitation.status
			}
		
		return result
