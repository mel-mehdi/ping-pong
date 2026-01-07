from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class ConversationViewSet(viewsets.ModelViewSet):
	"""Conversation management"""
	serializer_class = ConversationSerializer
	permission_classes = [IsAuthenticated]
	swagger_tags = ['Chat']

	def get_queryset(self):
		return Conversation.objects.filter(
			participants=self.request.user
		).distinct()

	def create(self, request):
		"""Create conversation with user"""
		participant_ids = request.data.get('participant_ids', [])
		
		if not participant_ids:
			return Response(
				{'error': 'participant_ids required'},
				status=status.HTTP_400_BAD_REQUEST
			)
		
		if request.user.id not in participant_ids:
			participant_ids.append(request.user.id)
		
		if len(participant_ids) == 2:
			existing = Conversation.objects.filter(
				conversation_type='private',
				participants__id=participant_ids[0]
			).filter(
				participants__id=participant_ids[1]
			).first()
			
			if existing:
				return Response(ConversationSerializer(existing).data)
		
		conversation = Conversation.objects.create(
			conversation_type='private'
		)
		
		for user_id in participant_ids:
			try:
				user = User.objects.get(id=user_id)
				conversation.participants.add(user)
			except User.DoesNotExist:
				pass
		
		return Response(
			ConversationSerializer(conversation).data,
			status=status.HTTP_201_CREATED
		)

	@action(detail=True, methods=['get'])
	def messages(self, request, pk=None):
		"""Get conversation messages"""
		conversation = self.get_object()
		
		before_timestamp = request.query_params.get('before')
    
		queryset = conversation.messages.all().order_by('-created_at')
		
		if before_timestamp:
			queryset = queryset.filter(created_at__lt=before_timestamp)
		
		messages = queryset[:50]
		return Response(MessageSerializer(messages, many=True).data)
	
	@action(detail=True, methods=['post'])
	def mark_as_read(self, request, pk=None):
		conversation = self.get_object()
		conversation.messages.exclude(sender=request.user).update(is_read=True)
		return Response({'status': 'messages marked as read'})
    