# Symfony runtime using Apache
FROM php:8.2-apache

# System deps & PHP extensions
RUN apt-get update && apt-get install -y \
    git unzip libzip-dev libicu-dev libonig-dev libxml2-dev netcat-traditional \
    && docker-php-ext-install pdo pdo_mysql intl zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy source code
COPY . /var/www/html

# Placeholder; real code is mounted via volume
RUN mkdir -p public && echo "<?php echo 'Symfony placeholder';" > public/index.php

# Apache to serve /public
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Handler the command for symfony project dependencies
RUN chmod +x /var/www/html/entrypoint.sh

EXPOSE 8081

ENTRYPOINT ["/var/www/html/entrypoint.sh"]
