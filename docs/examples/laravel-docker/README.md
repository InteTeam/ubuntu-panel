# Laravel Docker Example for UPanel

This is a reference Docker setup for deploying Laravel applications with UPanel.

## Files Structure

Your Laravel repository should include these Docker files:

```
your-laravel-app/
├── docker-compose.yml      # Main compose file
├── Dockerfile              # PHP/Laravel container
├── docker/
│   └── nginx.conf          # Nginx configuration
├── app/
├── resources/
├── ...                     # Rest of Laravel files
```

---

## docker-compose.yml

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${APP_NAME:-laravel}_app
    restart: unless-stopped
    volumes:
      - .:/var/www/html
      - ./storage:/var/www/html/storage
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - laravel

  nginx:
    image: nginx:alpine
    container_name: ${APP_NAME:-laravel}_nginx
    restart: unless-stopped
    ports:
      - "${APP_PORT:-8080}:80"
    volumes:
      - .:/var/www/html:ro
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
    networks:
      - laravel

  db:
    image: postgres:16-alpine
    container_name: ${APP_NAME:-laravel}_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE:-laravel}
      POSTGRES_USER: ${DB_USERNAME:-laravel}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret}
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-laravel}"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - laravel

  redis:
    image: redis:7-alpine
    container_name: ${APP_NAME:-laravel}_redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - laravel

  # Optional: Queue worker
  queue:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${APP_NAME:-laravel}_queue
    restart: unless-stopped
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
    volumes:
      - .:/var/www/html
    depends_on:
      - app
      - redis
    networks:
      - laravel

  # Optional: Scheduler
  scheduler:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${APP_NAME:-laravel}_scheduler
    restart: unless-stopped
    command: sh -c "while true; do php artisan schedule:run --verbose --no-interaction & sleep 60; done"
    volumes:
      - .:/var/www/html
    depends_on:
      - app
    networks:
      - laravel

volumes:
  db_data:

networks:
  laravel:
    driver: bridge
```

---

## Dockerfile

```dockerfile
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        opcache

# Install Redis extension
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del .build-deps

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY --chown=www-data:www-data . .

# Install dependencies (production)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Optimize for production
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
```

---

## docker/nginx.conf

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html/public;

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass app:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml;
}
```

---

## Environment Variables for UPanel

When creating your app in UPanel, add these environment variables:

### Production

```
APP_NAME=YourAppName
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_KEY=base64:generate-this-with-php-artisan-key-generate

APP_PORT=8080

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=your-secure-password-here

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
REDIS_PORT=6379

LOG_CHANNEL=stack
LOG_LEVEL=error

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-smtp-user
MAIL_PASSWORD=your-smtp-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

### Staging (overrides)

```
APP_ENV=staging
APP_DEBUG=true
APP_URL=https://staging.your-domain.com
LOG_LEVEL=debug
```

---

## Health Check Endpoint (Optional)

Add a health check route to your Laravel app for UPanel to verify deployments:

**routes/web.php** or **routes/api.php**:

```php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
    ]);
});
```

---

## First Deployment Checklist

Before deploying via UPanel:

1. **Generate APP_KEY locally**:
   ```bash
   php artisan key:generate --show
   ```
   Copy the output to your UPanel environment variables.

2. **Ensure storage directories exist** in your repo:
   ```
   storage/app/
   storage/framework/cache/
   storage/framework/sessions/
   storage/framework/views/
   storage/logs/
   ```
   Add `.gitignore` files to keep these directories in Git.

3. **Test locally first**:
   ```bash
   docker compose up -d
   docker compose exec app php artisan migrate
   ```

4. **After first UPanel deployment**, run migrations:
   SSH to your VPS and run:
   ```bash
   cd /home/upanel/apps/your-app
   docker compose exec app php artisan migrate --force
   ```

---

## Useful Commands on Your VPS

```bash
# Navigate to your app
cd /home/upanel/apps/your-app

# Run artisan commands
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear

# View logs
docker compose logs -f app
docker compose logs -f nginx
docker compose logs -f queue

# Access container shell
docker compose exec app sh

# Restart services
docker compose restart app
docker compose restart queue
```

---

## MySQL Alternative

If you prefer MySQL over PostgreSQL, replace the `db` service:

```yaml
  db:
    image: mysql:8.0
    container_name: ${APP_NAME:-laravel}_db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${DB_DATABASE:-laravel}
      MYSQL_USER: ${DB_USERNAME:-laravel}
      MYSQL_PASSWORD: ${DB_PASSWORD:-secret}
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-rootsecret}
    volumes:
      - db_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - laravel
```

And update your environment variables:
```
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
```

Also update the Dockerfile to use `pdo_mysql` instead of `pdo_pgsql`.
