# Installation Flow

## Panel Install (One-time, on your infrastructure)

Standard Laravel deployment - Docker Compose or bare metal.

```yaml
# docker-compose.yml for panel itself
services:
  app:
    build: .
    environment:
      - DB_CONNECTION=pgsql
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:16
    volumes:
      - pg_data:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
  
  horizon:
    build: .
    command: php artisan horizon
```

## Server Registration (Each managed VM)

### Step 1: Generate Token in Panel
- User clicks "Add Server" in UI
- Panel generates one-time registration token
- Shows install command with embedded token

### Step 2: Run One-Liner on Target Server
```bash
curl -fsSL https://upanel.yourdomain.com/install.sh?token=abc123 | bash
```

### Step 3: Install Script Actions
1. Verify Ubuntu version (22.04 or 24.04)
2. Install dependencies: `curl, docker, docker-compose, caddy`
3. Run security hardening (see 02-security-baseline.md)
4. Create `upanel` user with SSH key from panel
5. Install UPanel agent (Docker container)
6. Register with panel API using token
7. Output success message with next steps

### Step 4: Panel Receives Registration
- Agent calls panel API with server info
- Panel stores server: IP, hostname, OS version, resources
- Server appears in dashboard as "Connected"

## Agent Communication

```
Panel                          Agent (on managed VM)
  │                                  │
  ├──── SSH (deployments) ──────────►│
  │                                  │
  │◄─── HTTPS (metrics, status) ─────┤
  │                                  │
```

- **Panel → Agent**: SSH for Docker commands, file operations
- **Agent → Panel**: HTTPS POST for metrics, health checks (every 60s)
