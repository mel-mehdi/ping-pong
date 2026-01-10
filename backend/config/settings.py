"""
Django settings for config project.
"""

from pathlib import Path
import os
import environ


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Initialize environment variables
env = environ.Env(
    DEBUG=(bool, False) 
)
environ.Env.read_env(os.path.join(BASE_DIR.parent, '.env')) # Looks for .env in the parent directory (project root)


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'nginx', 'django']


# Application definition

INSTALLED_APPS = [
	'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

	# Third-party apps
	'rest_framework',
	'corsheaders',
	'drf_yasg',
	'channels',
	# Local apps
	'user_management',
	'public_api',
	'game',
	'chat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
	'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
	'public_api.middleware.APILoggingMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'


# Database Configuration for PostgreSQL via Docker Compose
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('POSTGRES_DB'),
        'USER': env('POSTGRES_USER'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': 'database',
        'PORT': '5432',
    }
}

CHANNEL_LAYERS = {
	'default': {
		'BACKEND': 'channels_redis.core.RedisChannelLayer',
		'CONFIG': {
			"hosts": [("redis", 6379)],
		},
	},
}

CACHES = {
	'default': {
		'BACKEND': 'django.core.cache.backends.redis.RedisCache',
		'LOCATION': 'redis://redis:6379/1',
	}
}
PASSWORD_HASHERS = [
	'user_management.hashers.CustomPBKDF2PasswordHasher',
]
# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
		'OPTIONS': {
			'min_length': 8,
		}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files (for user avatars, etc.)
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# Custom User Model
AUTH_USER_MODEL = 'user_management.User'

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://localhost",
    "https://localhost:5173",
    "https://localhost:5173",
    "https://localhost:8001",
    "https://accounts.google.com",
    "https://oauth2.googleapis.com",
]
CORS_ALLOW_CREDENTIALS = True

# CSRF Configuration
CSRF_TRUSTED_ORIGINS = [
    "https://localhost",
    'https://localhost:5173',
    'https://localhost:8001',
    "https://accounts.google.com",
]

# Security Headers Configuration
# Allow window.postMessage for OAuth and cross-origin communication
SECURE_CROSS_ORIGIN_OPENER_POLICY = "unsafe-none"  # Allow postMessage for OAuth
SECURE_CROSS_ORIGIN_EMBEDDER_POLICY = "unsafe-none"  # Keep COEP permissive for dev tools and postMessage
SECURE_REFERRER_POLICY = 'same-origin'

# Additional security settings
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# Enforce HTTPS and secure cookies (enabled when DEBUG is False)
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS — nginx also sets this header, but enforce here as well for safety
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# When running behind a proxy (nginx), rely on X-Forwarded-Proto to detect HTTPS
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}


SUPERUSER_USERNAME = env('DJANGO_SUPERUSER_USERNAME')
SUPERUSER_EMAIL = env('DJANGO_SUPERUSER_EMAIL')
SUPERUSER_PASSWORD = env('DJANGO_SUPERUSER_PASSWORD')

# API Documentation settings
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'ApiKey': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'X-API-Key'
        }
    }
}

# Swagger settings
SWAGGER_SETTINGS = {
    'DEFAULT_AUTO_SCHEMA_CLASS': 'config.urls.CustomAutoSchema',
}

# Google OAuth Settings
GOOGLE_OAUTH_CLIENT_ID = env('GOOGLE_OAUTH2_CLIENT_ID')
GOOGLE_OAUTH_CLIENT_SECRET = env('GOOGLE_OAUTH2_CLIENT_SECRET')
