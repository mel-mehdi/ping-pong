#!/bin/sh

echo "Waiting for PostgreSQL..."

while ! nc -z database 5432; do
  sleep 0.5
done

echo "PostgreSQL started."

echo "Making database migrations..."
python manage.py makemigrations

echo "Applying database migrations..."
python manage.py migrate

echo "Populating achievements..."
python manage.py populate_achievements

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting ASGI server with Daphne (HTTPS)..."
exec daphne -b 0.0.0.0 -p 8001 \
	-e ssl:8001:privateKey=/app/ssl/django.key:certKey=/app/ssl/django.crt \
	config.asgi:application