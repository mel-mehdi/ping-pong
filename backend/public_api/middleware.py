from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from .models import APIRequestLog
import time


class APILoggingMiddleware(MiddlewareMixin):
	"""
    Log all public API requests
    """

	def process_request(self, request):
		if request.path.startswith('/api/'):
			request.api_request_start_time = time.time()

	def process_response(self, request, response):
		if not request.path.startswith('/api/'):
			return response
		
		# Check if authenticated with API key
		api_key = getattr(request, 'api_key', None)
		if not api_key:
			return response
		
		start_time = getattr(request, 'api_request_start_time', time.time())
		response_time = time.time() - start_time

		try:
			APIRequestLog.objects.create(
				api_key=api_key,
				method=request.method,
				path=request.path,
				query_params=request.META.get('QUERY_STRING', ''),
				status_code=response.status_code,
				response_time=response_time,
				ip_address=self._get_client_ip(request),
				user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
			)
		except Exception as e:
			print(f"Failed to log API request: {e}")

		return response
	
	def _get_client_ip(self, request):
		"""Get client IP address"""
		# Check for X-Forwarded-For header first
		x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
		# Get the first IP in the list if behind a proxy
		if x_forwarded_for:
			ip = x_forwarded_for.split(',')[0]
		# Else get direct remote address
		else:
			ip = request.META.get('REMOTE_ADDR')
		return ip
