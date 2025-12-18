# Panel API

REST API for the React frontend.

---

## Authentication

All endpoints (except `/api/agent/*`) require session auth via Laravel Sanctum.

```
Cookie: laravel_session=...
X-XSRF-TOKEN: ...
```

---

## Endpoints

### Auth

```
POST   /login                    # Email + password
POST   /logout                   # End session
POST   /2fa/challenge            # Verify TOTP
POST   /forgot-password          # Request reset
POST   /reset-password           # Complete reset

GET    /api/user                 # Current user
PUT    /api/user/profile         # Update profile
POST   /api/user/2fa/setup       # Start 2FA setup
POST   /api/user/2fa/confirm     # Confirm 2FA
DELETE /api/user/2fa             # Disable 2FA (requires password)
```

### Setup (First-Time Only)

```
GET    /api/setup/status         # { "required": true/false }
POST   /api/setup                # Create first admin
```

### Servers

```
GET    /api/servers                       # List all
POST   /api/servers                       # Add server (returns install command)
GET    /api/servers/{id}                  # Server detail
PUT    /api/servers/{id}                  # Update server
DELETE /api/servers/{id}                  # Delete server

GET    /api/servers/{id}/metrics          # CPU/RAM/Disk history
GET    /api/servers/{id}/containers       # Docker containers
POST   /api/servers/{id}/test-connection  # Test SSH
POST   /api/servers/{id}/security-audit   # Run audit
POST   /api/servers/{id}/reboot           # Reboot server
POST   /api/servers/{id}/rotate-token     # Rotate agent token
```

### Apps

```
GET    /api/apps                          # List all
POST   /api/apps                          # Create app
GET    /api/apps/{id}                     # App detail
PUT    /api/apps/{id}                     # Update app
DELETE /api/apps/{id}                     # Delete app

GET    /api/apps/{id}/containers          # List containers
POST   /api/apps/{id}/containers/{name}/restart  # Restart container
GET    /api/apps/{id}/containers/{name}/logs     # Container logs

GET    /api/apps/{id}/env                 # Get env vars (masked)
PUT    /api/apps/{id}/env                 # Update env vars
```

### Deployments

```
GET    /api/apps/{id}/deployments         # Deployment history
POST   /api/apps/{id}/deployments         # Start deployment
GET    /api/deployments/{id}              # Deployment detail + logs
POST   /api/deployments/{id}/cancel       # Cancel running deployment
POST   /api/deployments/{id}/rollback     # Rollback to this deployment
```

### Domains

```
GET    /api/apps/{id}/domains             # List domains
POST   /api/apps/{id}/domains             # Add domain
DELETE /api/domains/{id}                  # Remove domain
POST   /api/domains/{id}/verify-ssl       # Check SSL status
```

### Backups

```
GET    /api/backups                       # List all backups
GET    /api/apps/{id}/backups             # Backups for app
POST   /api/apps/{id}/backups             # Create manual backup
DELETE /api/backups/{id}                  # Delete backup
POST   /api/backups/{id}/restore          # Restore backup

GET    /api/backup-destinations           # List destinations
POST   /api/backup-destinations           # Add destination
PUT    /api/backup-destinations/{id}      # Update destination
DELETE /api/backup-destinations/{id}      # Delete destination
POST   /api/backup-destinations/{id}/test # Test connection
```

### Backup Schedules

```
GET    /api/apps/{id}/backup-schedules    # List schedules
POST   /api/apps/{id}/backup-schedules    # Create schedule
PUT    /api/backup-schedules/{id}         # Update schedule
DELETE /api/backup-schedules/{id}         # Delete schedule
```

### Git Credentials

```
GET    /api/git-credentials               # List all
POST   /api/git-credentials               # Add credentials
PUT    /api/git-credentials/{id}          # Update
DELETE /api/git-credentials/{id}          # Delete
```

### Activity & Notifications

```
GET    /api/activity                      # Activity log
GET    /api/notifications                 # User notifications
POST   /api/notifications/mark-read       # Mark all read
DELETE /api/notifications/{id}            # Delete notification
```

### Security Events

```
GET    /api/security-events               # Security audit log
```

### Dashboard

```
GET    /api/dashboard/stats               # Overview stats
```

### Agent (No Session Auth)

```
POST   /api/agent/heartbeat               # Agent heartbeat
POST   /api/agent/register                # Agent registration
GET    /api/install/{token}               # Install script
GET    /api/install/{token}/pubkey        # SSH public key
GET    /api/install/{token}/agent         # Agent docker-compose.yml
POST   /api/install/{token}/complete      # Complete registration
```

---

## Request/Response Examples

### Create Server

**Request:**
```
POST /api/servers
Content-Type: application/json

{
    "name": "Production Server",
    "host": "192.168.1.100",
    "port": 22,
    "username": "upanel"
}
```

**Response:**
```json
{
    "data": {
        "id": "01HQXYZ...",
        "name": "Production Server",
        "host": "192.168.1.100",
        "port": 22,
        "username": "upanel",
        "status": "pending",
        "created_at": "2024-01-15T10:00:00Z"
    },
    "install_command": "curl -fsSL https://panel.example.com/install/abc123 | bash",
    "install_token_expires_at": "2024-01-15T11:00:00Z"
}
```

### Start Deployment

**Request:**
```
POST /api/apps/01ABC.../deployments
Content-Type: application/json

{
    "branch": "main",
    "environment": "production"
}
```

**Response:**
```json
{
    "data": {
        "id": "01DEF...",
        "app_id": "01ABC...",
        "status": "queued",
        "branch": "main",
        "environment": "production",
        "created_at": "2024-01-15T10:00:00Z"
    }
}
```

### Get Deployment Logs

**Request:**
```
GET /api/deployments/01DEF...
```

**Response:**
```json
{
    "data": {
        "id": "01DEF...",
        "status": "running",
        "branch": "main",
        "commit_hash": "abc123...",
        "commit_message": "Fix bug",
        "started_at": "2024-01-15T10:00:05Z",
        "log": "[10:00:05] Starting deployment...\n[10:00:06] Pulling code...\n[10:00:15] Building containers...\n"
    }
}
```

### Dashboard Stats

**Request:**
```
GET /api/dashboard/stats
```

**Response:**
```json
{
    "servers": {
        "total": 5,
        "online": 4,
        "offline": 1
    },
    "apps": {
        "total": 12,
        "running": 10,
        "stopped": 1,
        "failed": 1
    },
    "deployments": {
        "today": 3,
        "success_rate": 92.5
    },
    "backups": {
        "last_24h": 8,
        "failed": 0
    }
}
```

---

## Error Responses

### Validation Error (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "host": ["The host field is required."],
        "port": ["The port must be between 1 and 65535."]
    }
}
```

### Not Found (404)

```json
{
    "message": "Server not found."
}
```

### Unauthorized (401)

```json
{
    "message": "Unauthenticated."
}
```

### Forbidden (403)

```json
{
    "message": "You do not have permission to perform this action."
}
```

### Server Error (500)

```json
{
    "message": "An error occurred while processing your request."
}
```

---

## Pagination

List endpoints support pagination:

```
GET /api/servers?page=1&per_page=20
```

**Response:**
```json
{
    "data": [...],
    "meta": {
        "current_page": 1,
        "last_page": 3,
        "per_page": 20,
        "total": 52
    },
    "links": {
        "first": "/api/servers?page=1",
        "last": "/api/servers?page=3",
        "next": "/api/servers?page=2",
        "prev": null
    }
}
```

---

## Filtering & Sorting

```
GET /api/servers?status=online&sort=-created_at
GET /api/apps?server_id=01ABC...&status=running
GET /api/deployments?status=failed&sort=-finished_at
GET /api/backups?type=database&from=2024-01-01&to=2024-01-31
```

---

## Rate Limiting

| Endpoint Group | Limit |
|----------------|-------|
| Auth (login, reset) | 5/min |
| API (authenticated) | 60/min |
| Agent heartbeat | 2/min per server |

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705312800
```

---

## TypeScript Types

Generate with `php artisan typescript:generate`:

```typescript
// types/api.ts

interface Server {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    status: 'pending' | 'online' | 'offline' | 'error';
    last_seen_at: string | null;
    os_version: string | null;
    cpu_cores: number | null;
    ram_mb: number | null;
    disk_gb: number | null;
    security_score: number | null;
    created_at: string;
    updated_at: string;
}

interface App {
    id: string;
    server_id: string;
    name: string;
    git_repository: string;
    git_branch: string;
    deploy_path: string;
    primary_domain: string | null;
    staging_domain: string | null;
    status: 'pending' | 'deploying' | 'running' | 'stopped' | 'failed';
    current_commit: string | null;
    created_at: string;
    updated_at: string;
    server?: Server;
}

interface Deployment {
    id: string;
    app_id: string;
    user_id: string | null;
    commit_hash: string;
    commit_message: string | null;
    branch: string;
    environment: 'production' | 'staging';
    status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
    started_at: string | null;
    finished_at: string | null;
    duration_seconds: number | null;
    log: string | null;
    error_message: string | null;
    is_rollback: boolean;
    created_at: string;
}

interface Backup {
    id: string;
    app_id: string;
    backup_destination_id: string;
    type: 'database' | 'files' | 'full';
    status: 'pending' | 'running' | 'success' | 'failed';
    size_bytes: number | null;
    file_path: string | null;
    error_message: string | null;
    created_at: string;
}

// ... etc
```
