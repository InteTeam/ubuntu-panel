# Docker Setup

Docker Compose configuration for the UPanel application itself.

---

## Directory Structure

```
upanel/
├── docker/
│   ├── php/
│   │   └── Dockerfile
│   ├── nginx/
│   │   └── default.conf
│   └── agent/
│       └── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env
└── ...
```

---

## Development Environment

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    container_name: upanel-app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - .:/var/www
      - ./docker/php/local.ini:/usr/local/etc/php/conf.d/local.ini
    networks:
      - upanel
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    container_name: upanel-nginx
    restart: unless-stopped
    ports:
      - "8000:80"
    volumes:
      - .:/var/www
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
    networks:
      - upanel
    depends_on:
      - app

  db:
    image: postgres:16-alpine
    container_name: upanel-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE:-upanel}
      POSTGRES_USER: ${DB_USERNAME:-upanel}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - upanel

  redis:
    image: redis:alpine
    container_name: upanel-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - upanel

  horizon:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    container_name: upanel-horizon
    restart: unless-stopped
    working_dir: /var/www
    command: php artisan horizon
    volumes:
      - .:/var/www
    networks:
      - upanel
    depends_on:
      - app
      - redis

  scheduler:
    build:
      context: .
      dockerfile: docker/php/Dockerfile
    container_name: upanel-scheduler
    restart: unless-stopped
    working_dir: /var/www
    command: sh -c "while true; do php artisan schedule:run --verbose; sleep 60; done"
    volumes:
      - .:/var/www
    networks:
      - upanel
    depends_on:
      - app

  npm:
    image: node:20-alpine
    container_name: upanel-npm
    working_dir: /var/www
    volumes:
      - .:/var/www
    profiles:
      - dev
    command: npm run dev

networks:
  upanel:
    driver: bridge

volumes:
  db_data:
  redis_data:
```

### docker/php/Dockerfile

```dockerfile
FROM php:8.3-fpm-alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    linux-headers \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql pgsql pcntl bcmath gd

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

USER www-data

EXPOSE 9000
CMD ["php-fpm"]
```

### docker/nginx/default.conf

```nginx
server {
    listen 80;
    server_name _;
    root /var/www/public;
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
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## Production Environment

### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/inte-team/upanel:latest
    container_name: upanel-app
    restart: unless-stopped
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
    env_file:
      - .env
    volumes:
      - app_storage:/var/www/storage
    networks:
      - upanel
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    container_name: upanel-nginx
    restart: unless-stopped
    ports:
      - "127.0.0.1:8080:80"  # Behind Caddy
    volumes:
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf
      - app_public:/var/www/public:ro
    networks:
      - upanel
    depends_on:
      - app

  db:
    image: postgres:16-alpine
    container_name: upanel-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - upanel
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:alpine
    container_name: upanel-redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    networks:
      - upanel
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  horizon:
    image: ghcr.io/inte-team/upanel:latest
    container_name: upanel-horizon
    restart: unless-stopped
    command: php artisan horizon
    env_file:
      - .env
    volumes:
      - app_storage:/var/www/storage
    networks:
      - upanel
    depends_on:
      - app
      - redis

  scheduler:
    image: ghcr.io/inte-team/upanel:latest
    container_name: upanel-scheduler
    restart: unless-stopped
    command: sh -c "while true; do php artisan schedule:run; sleep 60; done"
    env_file:
      - .env
    volumes:
      - app_storage:/var/www/storage
    networks:
      - upanel
    depends_on:
      - app

networks:
  upanel:
    driver: bridge

volumes:
  db_data:
  redis_data:
  app_storage:
  app_public:
```

### Caddy Configuration (Production)

On the host machine (not in Docker):

```
# /etc/caddy/Caddyfile
panel.example.com {
    reverse_proxy localhost:8080
}
```

---

## Environment Variables

### Development (.env)

```env
APP_NAME=UPanel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=upanel
DB_USERNAME=upanel
DB_PASSWORD=secret

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

QUEUE_CONNECTION=redis
SESSION_DRIVER=database

MAIL_MAILER=log
```

### Production (.env)

```env
APP_NAME=UPanel
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://panel.example.com

LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=upanel
DB_USERNAME=upanel
DB_PASSWORD=strong-random-password

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

QUEUE_CONNECTION=redis
SESSION_DRIVER=database
SESSION_LIFETIME=480

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@panel.example.com
MAIL_FROM_NAME="UPanel"
```

---

## Commands

### Development

```bash
# Start environment
docker compose up -d

# Watch frontend (separate terminal)
docker compose run --rm npm run dev

# Run tests
docker compose exec app php artisan test

# Run migrations
docker compose exec app php artisan migrate

# Generate key
docker compose exec app php artisan key:generate

# Access tinker
docker compose exec app php artisan tinker

# View logs
docker compose logs -f app
docker compose logs -f horizon
```

### Production

```bash
# Deploy/update
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Clear caches
docker compose -f docker-compose.prod.yml exec app php artisan optimize:clear

# View Horizon
docker compose -f docker-compose.prod.yml exec app php artisan horizon:status

# Restart queue workers
docker compose -f docker-compose.prod.yml exec app php artisan horizon:terminate
```

---

## Building and Publishing

### Build Image

```bash
# Build
docker build -t ghcr.io/inte-team/upanel:latest -f docker/php/Dockerfile .

# Push
docker push ghcr.io/inte-team/upanel:latest
```

### GitHub Actions (CI/CD)

```yaml
# .github/workflows/build.yml
name: Build and Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/php/Dockerfile
          push: true
          tags: ghcr.io/inte-team/upanel:latest
```

---

## Health Checks

### Container Health

```yaml
# In docker-compose
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

### Laravel Health Endpoint

```php
// routes/web.php
Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        Redis::ping();
        return response()->json(['status' => 'ok']);
    } catch (Exception $e) {
        return response()->json(['status' => 'error'], 500);
    }
});
```

---

## Resource Limits (Production)

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
          
  horizon:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

---

## Backup Panel Database

```bash
# Backup
docker compose exec db pg_dump -U upanel upanel > backup.sql

# Restore
docker compose exec -T db psql -U upanel upanel < backup.sql
```
