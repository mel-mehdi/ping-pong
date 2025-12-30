from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings


def verify_google_token(token):
	"""
	Verify Google OAuth token and return user info

	Args:
		token: Google OAuth token from frontend
		
	Returns:
		dict: User info (email, name, picture) or None if invalid
	"""
	try:
		idinfo = id_token.verify_oauth2_token(
			token, 
			requests.Request(), 
			settings.GOOGLE_OAUTH_CLIENT_ID
		)
		
		return {
			'email': idinfo.get('email'),
			'first_name': idinfo.get('given_name', ''),
			'last_name': idinfo.get('family_name', ''),
			'full_name': idinfo.get('name', ''),
			'picture': idinfo.get('picture', ''),
			'google_id': idinfo.get('sub'),
		}
		
	except ValueError:
		return None
