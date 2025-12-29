from django.utils.deprecation import MiddlewareMixin
from .models import APIRequestLog
import time
import logging

logger = logging.getLogger(__name__)


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

		if response.status_code < 400:
			api_key.record_usage()
			
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
				logger.error(f"Failed to log API request: {e}", exc_info=True)

		return response

	def _get_client_ip(self, request):
		x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
		if x_forwarded_for:
			ip = x_forwarded_for.split(',')[0]
		else:
			ip = request.META.get('REMOTE_ADDR')
		return ip
