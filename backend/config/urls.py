from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg.inspectors import SwaggerAutoSchema
from drf_yasg.views import get_schema_view
from drf_yasg import openapi


class CustomAutoSchema(SwaggerAutoSchema):
    """
    Custom schema inspector that reads swagger_tags from ViewSet
    """
    def get_tags(self, operation_keys=None):
        tags = getattr(self.view, 'swagger_tags', None)
        if tags:
            return tags
        return super().get_tags(operation_keys)


class CustomSchemaGenerator(OpenAPISchemaGenerator):
    """
    Custom generator to define tag order and descriptions
    """
    def get_schema(self, request=None, public=False):
        schema = super().get_schema(request, public)
        schema.tags = [
            {'name': 'Authentication', 'description': 'User authentication endpoints'},
            {'name': 'Users', 'description': 'User management endpoints'},
            {'name': 'User Profiles', 'description': 'User profile management'},
            {'name': 'Friendships', 'description': 'Friend management endpoints'},
            {'name': 'Tournaments', 'description': 'Tournament management'},
            {'name': 'Invitations', 'description': 'Invitation system'},
            {'name': 'Matches', 'description': 'Match tracking'},
            {'name': 'Chat', 'description': 'Real-time chat'},
            {'name': 'Public API', 'description': 'Public endpoints'},
        ]
        return schema
    

# API Documentation
schema_view = get_schema_view(
    openapi.Info(
        title="ft_transcendence API",
        default_version='v1',
        description="API for ft_transcendence",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
    generator_class=CustomSchemaGenerator,
)


urlpatterns = [
    path('', include('user_management.urls')),
    path('admin/', admin.site.urls),
	path('game/', include('game.urls')),
    path('chat/', include('chat.urls')),
	# Public API
    path('api/', include('public_api.urls')),
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='api-docs'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='api-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)