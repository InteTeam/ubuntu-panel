# UPanel Production Deployment Guide

## Prerequisites

- Ubuntu 22.04+ server
- Docker & Docker Compose installed
- Domain name with DNS pointing to server (A record)
- Ports 80 and 443 open

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/upanel.git
cd upanel
```

### 2. Configure Environment

```bash
cp .env.production.example .env

# Generate app key
docker compose -f docker-compose.prod.yml run --rm app php artisan key:generate

# Generate secure passwords
DB_PASS=$(openssl rand -base64 32)
REDIS_PASS=$(openssl rand -base64 32)

# Update .env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env

# Set your domain
sed -i "s/^DOMAIN_NAME=.*/DOMAIN_NAME=upanel.yourdomain.com/" .env
sed -i "s|^APP_URL=.*|APP_URL=https://upanel.yourdomain.com|" .env

# Configure mail settings
nano .env
```

### 3. Build & Start

```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start services
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Create storage link
docker compose -f docker-compose.prod.yml exec app php artisan storage:link
```

### 4. Create Admin User

Visit `https://your-domain.com/setup` to create your admin account.

**SSL is automatic** - Caddy will provision a Let's Encrypt certificate on first request.

## Services

| Service | Container | Port |
|---------|-----------|------|
| App | upanel-app-prod | 9000 (internal) |
| Caddy | upanel-caddy | 80, 443 |
| PostgreSQL | upanel-postgres-prod | 5432 (internal) |
| Redis | upanel-redis-prod | 6379 (internal) |
| Queue Worker | upanel-queue-prod | - |
| Scheduler | upanel-scheduler-prod | - |

## Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# View Caddy/SSL logs
docker compose -f docker-compose.prod.yml logs caddy

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml down

# Run artisan commands
docker compose -f docker-compose.prod.yml exec app php artisan <command>

# Database backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U upanel upanel > backup.sql
```

## Updating

```bash
# Pull latest code
git pull origin main

# Rebuild
docker compose -f docker-compose.prod.yml build

# Restart with new images
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec app php artisan migrate --force

# Clear caches
docker compose -f docker-compose.prod.yml exec app php artisan optimize:clear
```

## SSL Certificate

Caddy automatically:
- Provisions SSL certificates from Let's Encrypt
- Renews certificates before expiry
- Redirects HTTP to HTTPS

No manual SSL configuration needed!

### Troubleshooting SSL

```bash
# Check Caddy logs
docker compose -f docker-compose.prod.yml logs caddy

# Verify domain resolves
dig your-domain.com

# Test certificate
curl -vI https://your-domain.com
```

## Backups

### Database Backup

```bash
# Manual backup
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U upanel upanel | gzip > upanel_$(date +%Y%m%d).sql.gz

# Restore
gunzip -c upanel_20240101.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres psql -U upanel upanel
```

### File Backup

```bash
# Backup storage directory
tar -czf storage_$(date +%Y%m%d).tar.gz storage/
```

## Disable Direct IP Access

After confirming domain works, optionally block direct IP access at firewall level:

```bash
# Only allow 80/443 from Cloudflare IPs (if using Cloudflare)
# Or configure your firewall to reject direct IP requests
```

## Troubleshooting

### Check service status
```bash
docker compose -f docker-compose.prod.yml ps
```

### View application logs
```bash
docker compose -f docker-compose.prod.yml logs app
docker compose -f docker-compose.prod.yml exec app tail -f storage/logs/laravel.log
```

### Check queue worker
```bash
docker compose -f docker-compose.prod.yml logs queue
```

### Database connection issues
```bash
docker compose -f docker-compose.prod.yml exec app php artisan db:monitor
```

### Clear all caches
```bash
docker compose -f docker-compose.prod.yml exec app php artisan optimize:clear
```

## Security Checklist

- [ ] Strong passwords for DB and Redis
- [ ] DOMAIN_NAME configured (auto SSL)
- [ ] APP_DEBUG=false
- [ ] Firewall configured (only 80/443 open)
- [ ] Regular backups configured
- [ ] 2FA enabled for all users
- [ ] Direct IP access blocked (optional)
