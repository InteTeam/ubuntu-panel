FROM php:8.3-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user
RUN addgroup -g 1000 www && adduser -u 1000 -G www -s /bin/sh -D www

WORKDIR /var/www

# ============================================
# Development stage
# ============================================
FROM base AS development

COPY --chown=www:www . /var/www

USER www

EXPOSE 9000
CMD ["php-fpm"]

# ============================================
# Node build stage
# ============================================
FROM node:20-alpine AS node-builder

WORKDIR /var/www

COPY package.json package-lock.json ./
RUN npm ci

COPY resources ./resources
COPY vite.config.ts tsconfig.json tailwind.config.js postcss.config.js ./

RUN npm run build

# ============================================
# Production stage
# ============================================
FROM base AS production

# Copy composer files first for layer caching
COPY --chown=www:www composer.json composer.lock ./

# Install dependencies (no dev)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Copy application files
COPY --chown=www:www . /var/www

# Copy built frontend assets from node stage
COPY --from=node-builder --chown=www:www /var/www/public/build /var/www/public/build

# Run composer scripts
RUN composer dump-autoload --optimize

# Set permissions
RUN chown -R www:www /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

USER www

EXPOSE 9000
CMD ["php-fpm"]
