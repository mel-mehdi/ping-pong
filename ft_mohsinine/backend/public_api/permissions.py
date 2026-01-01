from rest_framework import permissions


class HasValidAPIKey(permissions.BasePermission):
	"""
    Permission class to check if request has valid API key
    """

	def has_permission(self, request, view):
		return hasattr(request, 'api_key') and request.api_key is not None
