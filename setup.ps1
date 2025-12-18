# UPanel Development Setup Script (Windows PowerShell)
# Run this from the project root directory

Write-Host "🚀 Setting up UPanel development environment..." -ForegroundColor Cyan

# Create necessary directories
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow
$dirs = @(
    "app/Http/Controllers/Auth",
    "app/Http/Middleware",
    "app/Http/Requests",
    "app/Models",
    "app/Policies",
    "app/Services",
    "app/Jobs",
    "app/Providers",
    "bootstrap/cache",
    "config",
    "database/factories",
    "database/migrations",
    "database/seeders",
    "public",
    "resources/css",
    "resources/js/components/ui",
    "resources/js/Pages",
    "resources/js/layouts",
    "resources/views",
    "routes",
    "storage/app/public",
    "storage/framework/cache",
    "storage/framework/sessions",
    "storage/framework/views",
    "storage/logs",
    "tests/Feature",
    "tests/Unit"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Copy .env if not exists
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Created .env file" -ForegroundColor Green
}

# Build and start containers
Write-Host "🐳 Building Docker containers..." -ForegroundColor Yellow
docker compose build

Write-Host "🐳 Starting containers..." -ForegroundColor Yellow
docker compose up -d

# Wait for containers
Write-Host "⏳ Waiting for containers..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Install PHP dependencies
Write-Host "📦 Installing PHP dependencies..." -ForegroundColor Yellow
docker compose exec -T app composer install

# Generate app key
Write-Host "🔑 Generating application key..." -ForegroundColor Yellow
docker compose exec -T app php artisan key:generate

# Install Node dependencies
Write-Host "📦 Installing Node dependencies..." -ForegroundColor Yellow
docker compose run --rm node npm install

# Build frontend
Write-Host "🎨 Building frontend assets..." -ForegroundColor Yellow
docker compose run --rm node npm run build

# Run migrations
Write-Host "🗃️ Running migrations..." -ForegroundColor Yellow
docker compose exec -T app php artisan migrate

# Install Horizon
Write-Host "🌅 Publishing Horizon assets..." -ForegroundColor Yellow
docker compose exec -T app php artisan horizon:install

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  docker compose exec app php artisan test     # Run tests"
Write-Host "  docker compose exec app ./vendor/bin/pint   # Format code"
Write-Host "  docker compose run --rm node npm run dev    # Watch frontend"
