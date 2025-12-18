# Server Management Feature

**Status:** Planning  
**Priority:** Critical  
**Phase:** 2

---

## Overview

Add, manage, and monitor Ubuntu servers with one-liner install and agent integration.

---

## User Stories

- As an admin, I want to add a server and get an install command
- As an admin, I want to see server status (online/offline)
- As an admin, I want to view server metrics (CPU, RAM, disk)
- As an admin, I want to test SSH connectivity
- As an admin, I want to run security audits
- As an admin, I want to reboot or delete servers

---

## Acceptance Criteria

- [ ] Add server generates SSH keypair and install command
- [ ] Install script hardens server (SSH, firewall, fail2ban)
- [ ] Agent installs and registers with panel
- [ ] Heartbeat updates server status every 60s
- [ ] Metrics stored and displayed (7 day history)
- [ ] Security audit checks hardening status
- [ ] SSH connection test verifies connectivity
- [ ] Delete server removes agent remotely

---

## Guideline Compliance

See [FEATURE_DESIGN_CHECKLIST.md](/docs/FEATURE_DESIGN_CHECKLIST.md)

**Status:** 0/47 (0%) - Not started

---

## Technical Design

### Database Tables
- `servers` - [/docs/database/migrations/005_create_servers_table.md]
- `server_metrics` - [/docs/database/migrations/006_create_server_metrics_table.md]

### Models
- `App\Models\Server`
- `App\Models\ServerMetric`

### Services
- `App\Services\ServerService`
- `App\Services\SshService`
- `App\Services\SecurityAuditService`

### Controllers
- `App\Http\Controllers\ServerController`
- `App\Http\Controllers\InstallController`
- `App\Http\Controllers\Agent\HeartbeatController`

### Jobs
- `App\Jobs\CheckServerStatus`

---

## Frontend Components

### Pages
- `Pages/Servers/Index.tsx` - Server list
- `Pages/Servers/Create.tsx` - Add server form
- `Pages/Servers/Show.tsx` - Server detail (tabs)

### Components (Reuse)
- `ui/button`, `ui/input`, `ui/card`, `ui/table`, `ui/tabs`
- `Atoms/LoadingSpinner`, `Atoms/EmptyState`
- `Molecules/FormField`, `Molecules/ConfirmationDialog`

### Components (Create)
- `atoms/ServerStatusBadge` - online/offline/pending/error
- `atoms/ResourceMeter` - CPU/RAM/Disk bar
- `atoms/SecurityScoreCircle` - 0-100 score
- `molecules/ServerCard` - Server summary
- `molecules/InstallCommandBlock` - Copy-able command
- `organisms/ServerTable` - Server list
- `organisms/ServerMetricsChart` - 7-day charts
- `organisms/SecurityAuditPanel` - Audit results

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/servers | List servers |
| POST | /api/servers | Add server |
| GET | /api/servers/{id} | Server detail |
| PUT | /api/servers/{id} | Update server |
| DELETE | /api/servers/{id} | Delete server |
| GET | /api/servers/{id}/metrics | Metrics history |
| POST | /api/servers/{id}/test-connection | Test SSH |
| POST | /api/servers/{id}/security-audit | Run audit |
| POST | /api/servers/{id}/reboot | Reboot |
| POST | /api/servers/{id}/rotate-token | Rotate agent token |
| GET | /install/{token} | Install script |
| POST | /api/install/{token}/complete | Registration |
| POST | /api/agent/heartbeat | Agent heartbeat |

---

## Testing

- [ ] Create server generates SSH keypair
- [ ] Install token expires after 1 hour
- [ ] Install script returned for valid token
- [ ] Registration updates server status
- [ ] Heartbeat updates last_seen_at
- [ ] Heartbeat stores metrics
- [ ] Offline detection after 5 minutes
- [ ] SSH test with mocked connection
- [ ] Security audit checks all items
- [ ] Delete removes server and apps

---

## Tasks

See [IMPLEMENTATION_TASKS.md](/docs/IMPLEMENTATION_TASKS.md) - Phase 2
