from rest_framework import authentication, exceptions
from .models import APIKey
import time

class APIKeyAuthentication(authentication.BaseAuthentication):
	"""
    Custom authentication class for API key authentication
    
    Usage:
        Add header: X-API-Key: ft_your_api_key_here
    """

	def authenticate(self, request):
		api_key = request.headers.get('X-API-Key') or request.headers.get('X_API_KEY') or request.GET.get('api_key')
		if not api_key:
			return None
		
		api_key_obj = APIKey.validate_key(api_key)
		if not api_key_obj:
			raise exceptions.AuthenticationFailed('Invalid or expired API key')
		
		if not self._check_rate_limit(api_key_obj):
			raise exceptions.AuthenticationFailed('Rate limit exceeded')
		
		# Store start time for logging
		request.api_request_start_time = time.time()
		request.api_key = api_key_obj
		api_key_obj.record_usage()

		return (api_key_obj.user, api_key_obj)
	
	def _check_rate_limit(self, api_key_obj):
		"""
        Basic rate limit check
        Returns True if request is allowed
        """
		from datetime import timedelta
		from django.utils import timezone

		# Count requests in the last minute
		one_minute_ago = timezone.now() - timedelta(minutes=1)
		recent_requests = api_key_obj.request_logs.filter(
			created_at__gte=one_minute_ago
		).count()

		return recent_requests < api_key_obj.rate_limit
		