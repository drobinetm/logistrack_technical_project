#!/bin/sh
set -e

echo "Waiting MySQL..."
until nc -z mysql 3306; do
  sleep 1
done
echo "MySQL Done ✅"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Init Django with Gunicorn..."
exec gunicorn app.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3
