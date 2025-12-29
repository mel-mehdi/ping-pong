from rest_framework import authentication, exceptions
from django.core.cache import cache
from .models import APIKey


class APIKeyAuthentication(authentication.BaseAuthentication):
	"""
	Custom authentication class for API key authentication

	Usage:
		Add header: X-API-Key: ft_your_api_key_here
	"""

	def authenticate(self, request):
		"""
		Authenticate request using API key from header
		Returns: (user, auth) tuple or None
		"""
		api_key_value = request.META.get('HTTP_X_API_KEY')
		
		if not api_key_value:
			return None
		
		api_key = APIKey.validate_key(api_key_value)
		
		if not api_key:
			raise exceptions.AuthenticationFailed('Invalid or expired API key')
		
		if not api_key.is_active:
			raise exceptions.AuthenticationFailed('API key is disabled')
		
		if not self._check_rate_limit(api_key):
			raise exceptions.AuthenticationFailed({
				'detail': 'Rate limit exceeded. Please try again later.',
				'rate_limit': api_key.rate_limit,
				'window': '1 minute'
			})
		
		request.api_key = api_key
		
		return (api_key.user, api_key)

	def _check_rate_limit(self, api_key):
		"""
		Check if API key has exceeded rate limit
		"""
		cache_key = f'api_rate_limit_{api_key.id}'
		request_count = cache.get(cache_key, 0)
		
		if request_count >= api_key.rate_limit:
			return False
		
		if request_count == 0:
			cache.set(cache_key, 1, 60)
		else:
			cache.incr(cache_key)
		
		return True
