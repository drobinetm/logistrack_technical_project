#!/bin/sh
set -e

echo "Waiting MySQL..."
until nc -z mysql 3306; do
  sleep 1
done
echo "MySQL está listo."

echo "Installing dependencies with Composer..."
composer install --no-interaction --prefer-dist --no-scripts

# Skip migrations for now due to doctrine/orm issues
echo "Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction

echo "Starting Apache..."
exec apache2-foreground
