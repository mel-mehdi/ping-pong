from django.db import models
from django.contrib.auth import get_user_model
import secrets
import hashlib
from django.utils import timezone

User = get_user_model()


class APIKey(models.Model):
	"""
    API Keys for external access to public API
    """
	user = models.ForeignKey(
		User, 
		on_delete=models.CASCADE, 
		related_name='api_keys'
	)

	name = models.CharField(
		max_length=100,
		help_text="Public API Key"
	)

	key_hash = models.CharField(max_length=64, unique=True, db_index=True)
	prefix = models.CharField(max_length=8, db_index=True)

	is_active = models.BooleanField(default=True)
	rate_limit = models.IntegerField(
		default=2,
		help_text="Number of requests allowed per minute"
	)

	total_requests = models.IntegerField(default=0)
	last_used_at = models.DateTimeField(null=True, blank=True)

	created_at = models.DateTimeField(auto_now_add=True)
	expires_at = models.DateTimeField(
		null=True, 
		blank=True,
		help_text="Optional expiration date"
	)

	class Meta:
		db_table = 'api_keys'
		verbose_name = 'API Key'
		verbose_name_plural = 'API Keys'
		ordering = ['-created_at']

	def __str__(self):
		return f"API Key ({self.prefix}...) for {self.name}"
	
	@staticmethod
	def generate_key():
		"""
		Generate a secure random API key
		Returns: (key, prefix, key_hash)
		"""
		key = secrets.token_urlsafe(32)
		full_key = f"ft_{key}"
		prefix = full_key[:8]
		key_hash = hashlib.sha256(full_key.encode()).hexdigest()

		return full_key, prefix, key_hash
	
	@classmethod
	def create_key(cls, user, name, rate_limit=2, expires_at=None):
		"""
		Create a new API key for a user
		"""
		full_key, prefix, key_hash = cls.generate_key()

		api_key = cls.objects.create(
			user=user,
			name=name,
			key_hash=key_hash,
			prefix=prefix,
			rate_limit=rate_limit,
			expires_at=expires_at
		)
		return api_key, full_key
	
	@classmethod
	def validate_key(cls, key):
		"""
		Validate an API key and return the APIKey object
		Returns None if invalid
		"""
		key_hash = hashlib.sha256(key.encode()).hexdigest()

		try:
			api_key = cls.objects.get(key_hash=key_hash, is_active=True)

			if api_key.expires_at and api_key.expires_at < timezone.now():
				return None
			
			return api_key
		except cls.DoesNotExist:
			return None
		
	def record_usage(self):
		"""
        Increment request counter and update last used time
        """
		self.total_requests += 1
		self.last_used_at = timezone.now()
		self.save(update_fields=['total_requests', 'last_used_at'])


class APIRequestLog(models.Model):
	"""
	Log all API requests for monitoring and debugging
	"""

	api_key = models.ForeignKey(
		APIKey,
		on_delete=models.CASCADE,
		related_name='request_logs'
	)

	method = models.CharField(max_length=10)
	path = models.CharField(max_length=500)
	query_params = models.TextField(blank=True)

	status_code = models.IntegerField()
	response_time = models.FloatField(help_text="Response time in seconds")

	ip_address = models.GenericIPAddressField(null=True, blank=True)
	user_agent = models.CharField(max_length=500, blank=True)

	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		db_table = 'api_request_logs'
		verbose_name = 'API Request Log'
		verbose_name_plural = 'API Request Logs'
		ordering = ['-created_at']
		indexes = [
			models.Index(fields=['api_key', 'created_at']),
			models.Index(fields=['status_code']),
		]

	def __str__(self):
		return f"{self.method} {self.path} - {self.status_code}"
