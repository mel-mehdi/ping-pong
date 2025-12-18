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

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8001