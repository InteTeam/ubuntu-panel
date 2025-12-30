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

# Generate secure passwords and app key
DB_PASS=$(openssl rand -base64 32)
REDIS_PASS=$(openssl rand -base64 32)
APP_KEY="base64:$(openssl rand -base64 32)"

# Update .env
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env
sed -i "s/^APP_KEY=.*/APP_KEY=$APP_KEY/" .env

# Set your domain
sed -i "s/^DOMAIN_NAME=.*/DOMAIN_NAME=upanel.yourdomain.com/" .env
sed -i "s|^APP_URL=.*|APP_URL=https://upanel.yourdomain.com|" .env

# Configure mail settings
nano .env
```

### 3. Prepare Storage

```bash
# Create required directories
mkdir -p storage/logs storage/framework/{cache,sessions,views} storage/app/public

# Fix permissions (container runs as uid 1000)
chmod -R 775 storage bootstrap/cache
chown -R 1000:1000 storage bootstrap/cache
```

### 4. Build & Start

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

### 5. Create Admin User

Visit `https://your-domain.com/setup` to create your admin account.

**SSL is automatic** - Caddy will provision a Let's Encrypt certificate on first request.

### 6. Add Managed Servers

1. Go to **Servers → Add Server** in UPanel
2. Enter server details (name, IP, SSH port)
3. Copy the one-liner install command:

```bash
curl -sSL https://your-panel.com/install/{TOKEN} | sudo bash
```

4. Run it on your target Ubuntu server (as root)
5. Server appears online in UPanel within seconds

The install script automatically:
- Creates `upanel` user with SSH key authentication
- Installs Docker & Docker Compose
- Sets up the UPanel agent
- Registers and connects to your panel

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

# View app logs
docker compose -f docker-compose.prod.yml exec app tail -f storage/logs/laravel-$(date +%Y-%m-%d).log

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

## Troubleshooting

### Permission Issues

If you see "Permission denied" errors:

```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
chown -R 1000:1000 storage bootstrap/cache
```

### Check service status

```bash
docker compose -f docker-compose.prod.yml ps
```

### View application logs

```bash
docker compose -f docker-compose.prod.yml logs app
docker compose -f docker-compose.prod.yml exec app tail -f storage/logs/laravel-$(date +%Y-%m-%d).log
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

### Regenerate APP_KEY (if needed)

```bash
# Generate manually and add to .env
echo "APP_KEY=base64:$(openssl rand -base64 32)"
# Copy output to .env
nano .env
```

---

## Running Behind Reverse Proxy

Use this method when you have an existing reverse proxy (Nginx Proxy Manager, Traefik, Caddy, HAProxy) handling SSL for multiple services.

### When to Use This Method

| Scenario | Recommended Setup |
|----------|------------------|
| UPanel is the only web service | Use `docker-compose.prod.yml` (Caddy with auto-SSL) |
| Multiple services behind one proxy | Use `docker-compose.proxy.yml` (this section) |
| Using Nginx Proxy Manager | Use `docker-compose.proxy.yml` (this section) |
| Need custom SSL certificates | Use `docker-compose.proxy.yml` (this section) |

### 1. Configure Environment

```bash
cp .env.example .env

# Generate secure passwords
DB_PASS=$(openssl rand -base64 32)
REDIS_PASS=$(openssl rand -base64 32)
APP_KEY="base64:$(openssl rand -base64 32)"

# Update .env with generated values
sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$DB_PASS/" .env
sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASS/" .env
sed -i "s/^APP_KEY=.*/APP_KEY=$APP_KEY/" .env

# Configure for reverse proxy
sed -i "s|^APP_URL=.*|APP_URL=https://panel.yourdomain.com|" .env
sed -i "s/^PROXY_PORT=.*/PROXY_PORT=8080/" .env
sed -i "s/^# TRUSTED_PROXIES=.*/TRUSTED_PROXIES=*/" .env

# Edit remaining settings
nano .env
```

**Key settings for reverse proxy mode:**

```env
# Your public URL (with https if proxy handles SSL)
APP_URL=https://panel.yourdomain.com

# Port UPanel listens on (your proxy forwards to this)
PROXY_PORT=8080

# Trust proxy headers (required for correct HTTPS detection)
TRUSTED_PROXIES=*
```

### 2. Prepare Storage & Build

```bash
# Create required directories
mkdir -p storage/logs storage/framework/{cache,sessions,views} storage/app/public
chmod -R 775 storage bootstrap/cache
chown -R 1000:1000 storage bootstrap/cache

# Build and start
docker compose -f docker-compose.proxy.yml build
docker compose -f docker-compose.proxy.yml up -d

# Run migrations
docker compose -f docker-compose.proxy.yml exec app php artisan migrate --force
docker compose -f docker-compose.proxy.yml exec app php artisan storage:link
```

### 3. Configure Nginx Proxy Manager

1. Add a new **Proxy Host** in NPM:
   - **Domain Names**: `panel.yourdomain.com`
   - **Scheme**: `http`
   - **Forward Hostname/IP**: Your server's IP or `localhost` (if on same machine)
   - **Forward Port**: `8080` (or your `PROXY_PORT` value)

2. **SSL Tab**:
   - Request a new SSL Certificate (Let's Encrypt)
   - Enable **Force SSL**
   - Enable **HTTP/2 Support**

3. **Advanced Tab** (optional but recommended):
   ```nginx
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_set_header X-Forwarded-Host $host;
   proxy_set_header X-Forwarded-Port $server_port;
   ```

### 4. Configure Traefik (Alternative)

If using Traefik instead of NPM, add labels to `docker-compose.proxy.yml`:

```yaml
services:
  nginx:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.upanel.rule=Host(`panel.yourdomain.com`)"
      - "traefik.http.routers.upanel.entrypoints=websecure"
      - "traefik.http.routers.upanel.tls.certresolver=letsencrypt"
      - "traefik.http.services.upanel.loadbalancer.server.port=80"
    networks:
      - upanel
      - traefik  # Add Traefik's network
```

### 5. Verify Configuration

```bash
# Check that HTTPS is detected correctly
docker compose -f docker-compose.proxy.yml exec app php artisan tinker --execute="echo request()->secure() ? 'HTTPS: OK' : 'HTTPS: FAILED';"

# Check generated URLs use HTTPS
docker compose -f docker-compose.proxy.yml exec app php artisan tinker --execute="echo url('/');"
```

### Reverse Proxy Commands

```bash
# View logs
docker compose -f docker-compose.proxy.yml logs -f

# Restart services
docker compose -f docker-compose.proxy.yml restart

# Stop services
docker compose -f docker-compose.proxy.yml down

# Run artisan commands
docker compose -f docker-compose.proxy.yml exec app php artisan <command>
```

### Troubleshooting Reverse Proxy

**URLs show HTTP instead of HTTPS:**
```bash
# Verify TRUSTED_PROXIES is set
grep TRUSTED_PROXIES .env

# Should output: TRUSTED_PROXIES=* (or specific IPs)
```

**Login/Session issues:**
- Ensure your proxy forwards `X-Forwarded-Proto` header
- Check that cookies are set with `Secure` flag when using HTTPS

**Mixed content warnings:**
- Verify `APP_URL` starts with `https://`
- Clear browser cache and Laravel cache:
  ```bash
  docker compose -f docker-compose.proxy.yml exec app php artisan optimize:clear
  ```

---

## Security Checklist

- [ ] Strong passwords for DB and Redis (auto-generated above)
- [ ] DOMAIN_NAME configured (auto SSL) OR reverse proxy with SSL
- [ ] APP_DEBUG=false
- [ ] Firewall configured (only 80/443 open, or proxy port)
- [ ] TRUSTED_PROXIES limited to actual proxy IPs (production)
- [ ] Regular backups configured
- [ ] 2FA enabled for all users
- [ ] Direct IP access blocked (optional)
