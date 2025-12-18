# Architecture Overview

**Project:** UPanel  
**Type:** Security-first Ubuntu server control panel  
**Stack:** Laravel 12 + Inertia + React + PostgreSQL

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PANEL VM                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Laravel   │  │   React     │  │  PostgreSQL │             │
│  │   (API)     │  │   (UI)      │  │   (Data)    │             │
│  └──────┬──────┘  └─────────────┘  └─────────────┘             │
│         │                                                       │
│         │ Horizon (Queue)                                       │
│         ▼                                                       │
│  ┌─────────────┐                                               │
│  │    SSH      │ ◄─── Encrypted keys stored in DB              │
│  └──────┬──────┘                                               │
└─────────┼───────────────────────────────────────────────────────┘
          │
          │ SSH Commands + Agent API
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MANAGED SERVER 1                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Agent     │  │   Caddy     │  │   Docker    │             │
│  │  (metrics)  │  │  (proxy)    │  │ (containers)│             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  App 1: docker-compose.yml → web, db, redis                    │
│  App 2: docker-compose.yml → api, worker                       │
└─────────────────────────────────────────────────────────────────┘
          │
          │ (repeat for each managed server)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MANAGED SERVER N                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Communication Patterns

### Panel → Server (SSH)

All management commands use SSH:

```
Panel                          Managed Server
  │                                  │
  │──── SSH (port 22) ──────────────>│
  │     Command: git pull            │
  │     Command: docker compose up   │
  │     Command: cat /var/log/...    │
  │<─── Response ───────────────────│
```

**Why SSH?**
- Single authentication mechanism
- Works through firewalls
- Auditable command execution
- No additional ports needed

### Server → Panel (Agent API)

Metrics push from agent to panel:

```
Managed Server                 Panel
  │                              │
  │──── HTTPS POST ─────────────>│
  │     /api/agent/heartbeat     │
  │     {cpu, ram, disk, ...}    │
  │<─── 200 OK ─────────────────│
```

**Why agent pushes?**
- No inbound ports on managed servers
- Works behind NAT/firewalls
- Simpler security model

---

## Data Flow: Deployment

```
1. User clicks "Deploy" in UI
   │
   ▼
2. Controller creates Deployment record (status: queued)
   │
   ▼
3. DeployAppJob dispatched to Horizon queue
   │
   ▼
4. Job executes via SSH:
   ├── git clone/pull
   ├── Write .env file
   ├── docker compose build
   ├── docker compose down
   ├── docker compose up -d
   ├── Health check
   └── Configure Caddy domain
   │
   ▼
5. Update Deployment status (success/failed)
   │
   ▼
6. Send notification if failed
```

---

## Data Flow: Backup

```
1. Scheduler triggers backup job (or manual trigger)
   │
   ▼
2. Job executes via SSH:
   ├── mysqldump/pg_dump | gzip
   ├── tar volumes
   └── Calculate checksum
   │
   ▼
3. Upload to destination:
   ├── Google Drive (API)
   ├── Backblaze B2 (S3 API)
   ├── SFTP (phpseclib)
   └── Local (copy)
   │
   ▼
4. Verify upload (checksum match)
   │
   ▼
5. Apply retention policy (delete old backups)
   │
   ▼
6. Update Backup record, notify if failed
```

---

## Security Architecture

### Authentication Flow

```
1. User submits email + password
   │
   ▼
2. Validate credentials
   │
   ▼
3. Check 2FA status
   ├── Not configured → Force 2FA setup
   └── Configured → Challenge for TOTP
   │
   ▼
4. Verify TOTP code
   │
   ▼
5. Create session (database driver)
   │
   ▼
6. Access granted
```

### SSH Key Management

```
Panel Database                 Managed Server
┌─────────────────┐           ┌─────────────────┐
│ ssh_private_key │           │ authorized_keys │
│ (encrypted)     │           │ (public key)    │
└────────┬────────┘           └────────┬────────┘
         │                             │
         │     On server add:          │
         │     1. Generate keypair     │
         │     2. Store private (enc)  │
         │     3. Install script adds  │
         │        public to server     │
         └─────────────────────────────┘
```

### Agent Token Security

```
Panel Database                 Agent Config
┌─────────────────┐           ┌─────────────────┐
│ agent_token     │           │ AGENT_TOKEN     │
│ (hashed)        │           │ (plaintext)     │
└────────┬────────┘           └────────┬────────┘
         │                             │
         │     On heartbeat:           │
         │     1. Agent sends token    │
         │     2. Panel hashes + compares
         │     3. Token never stored   │
         │        in plaintext on panel│
         └─────────────────────────────┘
```

---

## Technology Choices

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Backend | Laravel 12 | Rapid development, good ecosystem |
| Frontend | React + Inertia | SPA feel, Laravel integration |
| Database | PostgreSQL | Robust, good JSON support |
| Queue | Redis + Horizon | Reliable, dashboard included |
| Reverse Proxy | Caddy | Auto SSL, simple config, API |
| Containers | Docker Compose | Simple, widely understood |
| SSH | phpseclib | Pure PHP, no dependencies |
| Auth | Sanctum | Simple session auth |

---

## Scalability Considerations

### Current Design (MVP)

- Single panel instance
- Single admin user
- ~10-50 managed servers
- ~1-5 apps per server

### Future Scaling

| Aspect | Current | Future |
|--------|---------|--------|
| Panel | Single VM | Load balanced |
| Database | Single PostgreSQL | Read replicas |
| Queue | Single Redis | Redis cluster |
| Users | Single admin | Multi-user + roles |
| Servers | Manual add | Auto-discovery |

---

## File Structure

```
ubuntu-panel/
├── app/
│   ├── Http/Controllers/      # Thin controllers
│   ├── Services/              # Business logic
│   │   ├── ServerService.php
│   │   ├── SshService.php
│   │   ├── DeploymentService.php
│   │   └── BackupService.php
│   ├── Models/                # Eloquent models
│   ├── Policies/              # Authorization
│   └── Jobs/                  # Queue jobs
├── resources/js/
│   ├── components/
│   │   ├── ui/                # shadcn/ui (from InteTeam)
│   │   ├── atoms/             # Basic elements
│   │   ├── molecules/         # Compositions
│   │   └── organisms/         # Complex sections
│   ├── Pages/                 # Inertia pages
│   └── layouts/               # Page layouts
├── database/migrations/       # 16 migration files
├── tests/
│   ├── Feature/               # HTTP tests
│   └── Unit/                  # Service tests
└── docs/                      # This documentation
```

---

## Related Documentation

- [Database Architecture](/docs/database/README.md)
- [API Specification](/docs/12-panel-api.md)
- [Agent Specification](/docs/11-agent-spec.md)
- [Security Baseline](/docs/02-security-baseline.md)
