# UPanel

Lightweight, security-first control panel for Ubuntu VMs and Docker deployments.

## Features

- **Security by default** - 2FA, hardened servers, security headers
- **Docker deployments** - GUI for Docker Compose workflows
- **Backup flexibility** - Local, SFTP, Backblaze B2, Google Drive
- **Auto SSL** - Caddy with Let's Encrypt
- **One-liner server install** - Add servers in seconds
- **Free and self-hosted** - no per-server licensing fees

## Server Installation (One-Liner)

Once UPanel is running, add servers with a single command:

```bash
curl -sSL https://your-panel.com/install/{TOKEN} | sudo bash
```

The `{TOKEN}` is generated when you click "Add Server" in UPanel. The script:
- Creates `upanel` user with SSH key
- Installs Docker
- Sets up the UPanel agent
- Registers with your panel

## Quick Start (Development)

```bash
# Clone
git clone https://github.com/inte-team/upanel.git
cd upanel

# Configure environment
cp .env.example .env
# Edit .env - set DB_PASSWORD and REDIS_PASSWORD

# Start containers
docker compose up -d

# Install dependencies
docker compose exec app composer install
docker compose run --rm node npm install

# Setup database
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate

# Build frontend
docker compose run --rm node npm run build

# Access at http://localhost:8000
# First visit /setup to create admin account
```

### Port Conflict?

If port 8000 is taken, change `APP_PORT` in `.env`:

```bash
APP_PORT=8080
```

Then restart: `docker compose up -d`

## Development Commands

```bash
# Run tests
docker compose exec app php artisan test

# Frontend dev (hot reload)
docker compose run --rm node npm run dev

# Code formatting
docker compose exec app ./vendor/bin/pint

# View logs
docker compose logs -f app
```

## Production Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** for full production setup with:
- Caddy + auto SSL
- Domain configuration
- Security checklist
- Backup procedures

## Tech Stack

- Laravel 12 + Inertia + React
- PostgreSQL + Redis
- Docker Compose
- Caddy (reverse proxy, auto SSL)

## Documentation

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [IMPLEMENTATION_TASKS.md](docs/IMPLEMENTATION_TASKS.md) | Development task breakdown |
| [Architecture](docs/architecture/overview.md) | System design |

## License

Proprietary - Inte.Team
