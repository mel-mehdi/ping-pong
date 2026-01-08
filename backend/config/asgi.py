"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from chat.routing import websocket_urlpatterns as chat_ws
from user_management.routing import websocket_urlpatterns as notif_ws
from game.routing import websocket_urlpatterns as game_ws

application = ProtocolTypeRouter({
	"http": django_asgi_app,
	"websocket": AllowedHostsOriginValidator(
		AuthMiddlewareStack(
			URLRouter(chat_ws + notif_ws + game_ws)
		)
	),
})
