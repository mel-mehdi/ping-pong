from django.contrib import admin, messages
from .models import APIKey, APIRequestLog


@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = [
        'name', 
        'user', 
        'prefix', 
        'is_active', 
        'rate_limit',
        'total_requests',
        'last_used_at',
        'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'user__username', 'prefix']
    readonly_fields = ['key_hash', 'prefix', 'total_requests', 'last_used_at', 'created_at']
    
    fieldsets = (
        ('Key Information', {
            'fields': ('user', 'name', 'prefix', 'key_hash')
        }),
        ('Configuration', {
            'fields': ('is_active', 'rate_limit', 'expires_at')
        }),
        ('Usage Statistics', {
            'fields': ('total_requests', 'last_used_at', 'created_at')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:
            messages.error(request, 'API keys cannot be created through admin. Use the API endpoint.')
        super().save_model(request, obj, form, change)


@admin.register(APIRequestLog)
class APIRequestLogAdmin(admin.ModelAdmin):
    list_display = [
        'api_key',
        'method',
        'path',
        'status_code',
        'response_time',
        'ip_address',
        'created_at'
    ]
    list_filter = ['method', 'status_code', 'created_at']
    search_fields = ['path', 'ip_address']
    readonly_fields = ['api_key', 'method', 'path', 'query_params', 'status_code', 
                      'response_time', 'ip_address', 'user_agent', 'created_at']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return True
    
    def has_delete_permission(self, request, obj=None):
        return False
    
    def get_readonly_fields(self, request, obj=None):
        return [f.name for f in self.model._meta.fields]