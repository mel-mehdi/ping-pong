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

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting ASGI server with Daphne..."
exec daphne -b 0.0.0.0 -p 8001 config.asgi:application