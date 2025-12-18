#!/bin/bash
# UPanel Development Setup Script
# Run this from the project root directory

set -e

echo "🚀 Setting up UPanel development environment..."

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p app/Http/Controllers/Auth
mkdir -p app/Http/Middleware
mkdir -p app/Http/Requests
mkdir -p app/Models
mkdir -p app/Policies
mkdir -p app/Services
mkdir -p app/Jobs
mkdir -p app/Providers
mkdir -p bootstrap/cache
mkdir -p config
mkdir -p database/factories
mkdir -p database/migrations
mkdir -p database/seeders
mkdir -p public
mkdir -p resources/css
mkdir -p resources/js/components/ui
mkdir -p resources/js/Pages
mkdir -p resources/js/layouts
mkdir -p resources/views
mkdir -p routes
mkdir -p storage/app/public
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p tests/Feature
mkdir -p tests/Unit

# Set permissions
chmod -R 775 storage bootstrap/cache

# Copy .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file"
fi

# Build and start containers
echo "🐳 Building Docker containers..."
docker compose build

echo "🐳 Starting containers..."
docker compose up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers..."
sleep 5

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
docker compose exec -T app composer install

# Generate app key
echo "🔑 Generating application key..."
docker compose exec -T app php artisan key:generate

# Install Node dependencies
echo "📦 Installing Node dependencies..."
docker compose run --rm node npm install

# Build frontend assets
echo "🎨 Building frontend assets..."
docker compose run --rm node npm run build

# Run migrations
echo "🗃️ Running migrations..."
docker compose exec -T app php artisan migrate

# Install Horizon
echo "🌅 Publishing Horizon assets..."
docker compose exec -T app php artisan horizon:install

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Access the application at: http://localhost:8000"
echo ""
echo "Useful commands:"
echo "  docker compose exec app php artisan test     # Run tests"
echo "  docker compose exec app ./vendor/bin/pint   # Format code"
echo "  docker compose run --rm node npm run dev    # Watch frontend"
echo ""
