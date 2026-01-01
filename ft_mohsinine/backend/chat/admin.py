from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
	list_display = ('id', 'name', 'conversation_type', 'created_at')
	list_filter = ('conversation_type', 'created_at')
	filter_horizontal = ('participants',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
	list_display = ('id', 'conversation', 'sender', 'content_preview', 'is_read', 'created_at')
	list_filter = ('message_type', 'is_read', 'created_at')

	def content_preview(self, obj):
		return obj.content[:50]
