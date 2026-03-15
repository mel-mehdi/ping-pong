#!/bin/sh
set -e

require_value() {
  var_name="$1"
  var_value="$2"

  if [ -z "$var_value" ]; then
    echo "❌ Missing required environment variable: $var_name"
    echo "   Create/update the root .env file from .env.example"
    exit 1
  fi
}

ensure_not_placeholder() {
  var_name="$1"
  var_value="$2"

  case "$var_value" in
    your_database_name|your_database_user|your_database_password|your_django_secret_key|your_superuser_username|your_superuser_email|your_superuser_password)
      echo "❌ Invalid value for $var_name: placeholder detected ($var_value)"
      echo "   Update the root .env file before starting containers"
      exit 1
      ;;
  esac
}

validate_env() {
  require_value "POSTGRES_DB" "$POSTGRES_DB"
  require_value "POSTGRES_USER" "$POSTGRES_USER"
  require_value "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"
  require_value "SECRET_KEY" "$SECRET_KEY"
  require_value "DJANGO_SUPERUSER_USERNAME" "$DJANGO_SUPERUSER_USERNAME"
  require_value "DJANGO_SUPERUSER_EMAIL" "$DJANGO_SUPERUSER_EMAIL"
  require_value "DJANGO_SUPERUSER_PASSWORD" "$DJANGO_SUPERUSER_PASSWORD"

  ensure_not_placeholder "POSTGRES_DB" "$POSTGRES_DB"
  ensure_not_placeholder "POSTGRES_USER" "$POSTGRES_USER"
  ensure_not_placeholder "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD"
  ensure_not_placeholder "SECRET_KEY" "$SECRET_KEY"
  ensure_not_placeholder "DJANGO_SUPERUSER_USERNAME" "$DJANGO_SUPERUSER_USERNAME"
  ensure_not_placeholder "DJANGO_SUPERUSER_EMAIL" "$DJANGO_SUPERUSER_EMAIL"
  ensure_not_placeholder "DJANGO_SUPERUSER_PASSWORD" "$DJANGO_SUPERUSER_PASSWORD"
}

validate_ssl() {
  if [ ! -f /app/ssl/nginx.crt ] || [ ! -f /app/ssl/nginx.key ]; then
    echo "❌ SSL certificates are missing"
    echo "   Expected files: nginx/ssl/nginx.crt and nginx/ssl/nginx.key"
    echo "   Run from project root: ./generate-ssl.sh"
    exit 1
  fi
}

echo "Running backend preflight checks..."
validate_env
validate_ssl

echo "Waiting for PostgreSQL..."

while ! nc -z database 5432; do
  sleep 0.5
done

echo "PostgreSQL started."

echo "Making database migrations..."
python manage.py makemigrations

echo "Applying database migrations..."
if ! python manage.py migrate; then
  echo "❌ Database migration failed"
  echo "   Check POSTGRES_DB/POSTGRES_USER/POSTGRES_PASSWORD in .env"
  echo "   If credentials changed after first startup, reset DB volume or align roles in Postgres"
  exit 1
fi

echo "Populating achievements..."
python manage.py populate_achievements

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting ASGI server with Daphne (HTTPS)..."
exec daphne -e ssl:8001:privateKey=/app/ssl/nginx.key:certKey=/app/ssl/nginx.crt \
  config.asgi:application