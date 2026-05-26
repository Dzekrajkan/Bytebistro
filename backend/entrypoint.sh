#!/bin/sh

echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 1
done

python manage.py migrate

echo "=== Management commands ==="
python manage.py check
python manage.py makemigrations
python manage.py migrate

python manage.py seed

exec "$@"