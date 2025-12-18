# Implementation Tasks - UPanel MVP

**Total Phases:** 5  
**Estimated Duration:** 4-6 weeks  
**Last Updated:** 2024-12-16

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| 🔲 | Not Started |
| 🔄 | In Progress |
| ✅ | Completed |
| ⏸️ | Blocked |

---

## TDD Workflow Reminder

**Each task includes development AND testing together:**

```
1. Write failing test first
2. Write minimal code to pass
3. Refactor
4. Run: php artisan test --filter={Feature}
5. Move to next task only when tests pass
```

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup ✅
| Status | Task |
|--------|------|
| ✅ | Create Laravel 12 project |
| ✅ | Configure Docker Compose (dev environment) |
| ✅ | Install dependencies: Inertia, React, Tailwind |
| ✅ | Copy UI components from InteTeam CRM |
| ✅ | Configure PostgreSQL + Redis |
| ✅ | Setup Horizon for queues |
| ✅ | Configure PHPStan Level 9 |
| ✅ | Configure Laravel Pint |
| ✅ | Create initial Pest test structure |

**Progress:** ✅ 9/9 tasks  
**Deliverable:** Running dev environment with empty shell

---

### 1.2 Database Migrations ✅

| Status | Migration | Test |
|--------|-----------|------|
| ✅ | 001_create_users_table | 🔲 Model test |
| ✅ | 002_create_sessions_table | 🔲 - |
| ✅ | 003_create_password_reset_tokens_table | 🔲 - |
| ✅ | 004_create_login_attempts_table | 🔲 Model test |
| ✅ | 005_create_servers_table | 🔲 Model test |
| ✅ | 006_create_server_metrics_table | 🔲 Model test |
| ✅ | 007_create_git_credentials_table | 🔲 Model test |
| ✅ | 008_create_apps_table | 🔲 Model test |
| ✅ | 009_create_deployments_table | 🔲 Model test |
| ✅ | 010_create_domains_table | 🔲 Model test |
| ✅ | 011_create_backup_destinations_table | 🔲 Model test |
| ✅ | 012_create_backups_table | 🔲 Model test |
| ✅ | 013_create_backup_schedules_table | 🔲 Model test |
| ✅ | 014_create_security_events_table | 🔲 Model test |
| ✅ | 015_create_notifications_table | 🔲 Model test |
| ✅ | 016_create_activity_log_table | 🔲 Model test |

**Progress:** ✅ 16/16 migrations applied, 🔲 0/12 model tests  
**Deliverable:** All tables created with proper indexes

---

### 1.3 Authentication System ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | User model + factory |
| ✅ | Setup wizard (first user creation) |
| ✅ | Login page + controller |
| ✅ | 2FA setup flow (TOTP) |
| ✅ | 2FA challenge on login |
| ✅ | Recovery codes generation |
| ✅ | Password reset flow |
| ✅ | Rate limiting middleware |
| ✅ | Session management (database driver) |
| ✅ | Auth middleware stack |

#### Tests (TDD - write these FIRST)
| Status | Test |
|--------|------|
| ✅ | Guest redirected to login |
| ✅ | Setup wizard creates admin |
| ✅ | Setup blocked when user exists |
| ✅ | Login requires valid credentials |
| ✅ | Login fails with wrong password |
| ✅ | 2FA required after first login |
| ✅ | 2FA setup generates QR code |
| ✅ | 2FA confirm validates TOTP |
| ✅ | Recovery codes work (single use) |
| ✅ | Password reset sends email |
| ✅ | Password reset token expires |
| ✅ | Rate limiting blocks after 5 attempts |

**Progress:** ✅ 10/10 dev, ✅ 12/12 tests  
**Deliverable:** Complete auth system with 2FA

---

### 1.4 Base Layout & Navigation ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | GuestLayout component |
| ✅ | AuthLayout component (sidebar + header) |
| ✅ | Navigation component |
| ✅ | User dropdown menu |
| ✅ | Flash message component |
| ✅ | Dark mode support (ThemeProvider) |
| ✅ | Loading states |

#### Tests
| Status | Test |
|--------|------|
| ✅ | Guest pages use GuestLayout |
| ✅ | Auth pages use AuthLayout |
| ✅ | Flash messages display correctly |

**Progress:** ✅ 7/7 dev, ✅ 3/3 tests  
**Deliverable:** Functional layouts for all pages

---

## Phase 2: Server Management (Week 2-3) 🔄

### 2.1 Server Models & Services ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | Server model + factory + policy |
| ✅ | ServerService (CRUD + SSH) |
| ✅ | SshService (connection, execute) |
| ✅ | SSH keypair generation (Ed25519) |
| ✅ | Encrypted key storage |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Server CRUD operations |
| 🔲 | SSH key generation format |
| 🔲 | SSH connection mock |
| 🔲 | SSH command execution mock |
| 🔲 | Policy: only admin can manage |

**Progress:** 🔲 0/5 dev, 🔲 0/5 tests

---

### 2.2 Server UI ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | ServerList page (`/servers`) |
| ✅ | ServerCreate page (`/servers/new`) |
| ✅ | ServerDetail page (`/servers/:id`) |
| ✅ | ServerStatusBadge (atom) |
| ✅ | ResourceMeter (atom) |
| ✅ | ServerCard (molecule) |
| ✅ | ServerTable (organism) |
| ✅ | InstallCommandBlock (molecule) |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Server list loads |
| 🔲 | Create server with valid data |
| 🔲 | Create server validation errors |
| 🔲 | Server detail shows data |

**Progress:** 🔲 0/8 dev, 🔲 0/4 tests

---

### 2.3 Install Script System ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | Install token generation |
| ✅ | `/install/{token}` endpoint (returns script) |
| ✅ | `/api/install/{token}/pubkey` endpoint |
| ✅ | `/api/install/{token}/complete` endpoint |
| ✅ | Token expiration (1 hour) |
| ✅ | Script template (Blade) |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Valid token returns script |
| 🔲 | Expired token returns 404 |
| 🔲 | Pubkey endpoint returns public key |
| 🔲 | Complete registration updates server |
| 🔲 | Complete fails with invalid token |

**Progress:** 🔲 0/6 dev, 🔲 0/5 tests

---

### 2.4 Agent Integration ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | Agent docker-compose.yml generation |
| ✅ | `/api/agent/heartbeat` endpoint |
| ✅ | Agent token validation (hashed) |
| ✅ | Metrics storage (server_metrics) |
| ✅ | Server status updates (online/offline) |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Heartbeat updates last_seen_at |
| 🔲 | Invalid token rejected (401) |
| 🔲 | Metrics stored in database |
| 🔲 | Offline detection after 5 min |

**Progress:** 🔲 0/5 dev, 🔲 0/4 tests

---

### 2.5 Server Actions ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | Test connection (SSH) |
| ✅ | Security audit |
| ✅ | Reboot server |
| ✅ | Delete server |
| ✅ | Rotate agent token |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Test connection success (mock) |
| 🔲 | Test connection failure (mock) |
| 🔲 | Security audit returns results |
| 🔲 | Reboot dispatches job |
| 🔲 | Delete removes server + apps |
| 🔲 | Rotate token changes hash |

**Progress:** 🔲 0/5 dev, 🔲 0/6 tests  
**Deliverable:** Full server management with install script

---

## Phase 3: App Deployments (Week 3-4) 🔄

### 3.1 App Models & Services ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | App model + factory + policy |
| ✅ | GitCredentials model |
| ✅ | Deployment model + factory |
| ✅ | Domain model |
| ✅ | AppService |
| ✅ | DeploymentService |
| ✅ | GitService (clone, pull) |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | App CRUD operations |
| 🔲 | Git credential encryption |
| 🔲 | Deployment creation |
| 🔲 | Domain uniqueness |

**Progress:** 🔲 0/7 dev, 🔲 0/4 tests

---

### 3.2 App UI ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | AppList page (`/apps`) |
| ✅ | AppCreate page (`/apps/new`) |
| ✅ | AppDetail page (`/apps/:id`) |
| ✅ | AppStatusBadge (atom) |
| ✅ | ContainerStatusBadge (atom) |
| ✅ | AppCard (molecule) |
| ✅ | EnvEditor (molecule) |
| ✅ | DeploymentRow (molecule) |
| ✅ | ContainerRow (molecule) |
| ✅ | DeployModal (organism) |
| ✅ | LogViewer (organism) |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | App list loads |
| 🔲 | Create app with valid data |
| 🔲 | App detail shows deployments |
| 🔲 | Env vars masked in response |

**Progress:** 🔲 0/11 dev, 🔲 0/4 tests

---

### 3.3 Deployment System ✅

#### Development Tasks
| Status | Task |
|--------|------|
| ✅ | DeployAppJob (queued) |
| ✅ | Git clone operation |
| ✅ | Git pull operation |
| ✅ | .env file generation |
| ✅ | Docker Compose build |
| ✅ | Docker Compose up/down |
| ✅ | Health check |
| ✅ | Deployment logging |
| ✅ | Rollback functionality |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Job dispatched on deploy |
| 🔲 | Status: queued → running → success |
| 🔲 | Status: running → failed |
| 🔲 | Rollback creates new deployment |
| 🔲 | Failed deployment sends notification |
| 🔲 | Deployment log updated |

**Progress:** 🔲 0/9 dev, 🔲 0/6 tests

---

### 3.4 Caddy Integration

#### Development Tasks
| Status | Task |
|--------|------|
| 🔲 | Caddy API client |
| 🔲 | Domain → upstream mapping |
| 🔲 | Auto SSL provisioning |
| 🔲 | Domain status tracking |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Domain configuration via API (mock) |
| 🔲 | SSL status tracking |
| 🔲 | Remove domain from Caddy |

**Progress:** 🔲 0/4 dev, 🔲 0/3 tests

---

### 3.5 Deployment UI

#### Development Tasks
| Status | Task |
|--------|------|
| 🔲 | DeploymentDetail page (`/deployments/:id`) |
| 🔲 | DeploymentStatusBadge (atom) |
| 🔲 | Live log polling |
| 🔲 | Cancel deployment action |
| 🔲 | Rollback action |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Deployment detail loads |
| 🔲 | Cancel updates status |
| 🔲 | Rollback triggers new deployment |

**Progress:** 🔲 0/5 dev, 🔲 0/3 tests  
**Deliverable:** Full deployment pipeline with Docker Compose

---

## Phase 4: Backups & Polish (Week 4-5)

### 4.1 Backup System

#### Development Tasks
| Status | Task |
|--------|------|
| 🔲 | BackupDestination model |
| 🔲 | Backup model + factory |
| 🔲 | BackupSchedule model |
| 🔲 | BackupService |
| 🔲 | Database dump (MySQL, PostgreSQL) |
| 🔲 | Volume backup (tar) |
| 🔲 | Google Drive upload |
| 🔲 | Backblaze B2 upload |
| 🔲 | SFTP upload |
| 🔲 | Retention policy enforcement |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Backup creation |
| 🔲 | Schedule calculates next_run |
| 🔲 | Destination connection test (mock) |
| 🔲 | Retention deletes old backups |
| 🔲 | Failed backup sends notification |

**Progress:** 🔲 0/10 dev, 🔲 0/5 tests

---

### 4.2 Backup UI

#### Development Tasks
| Status | Task |
|--------|------|
| 🔲 | BackupList page (`/backups`) |
| 🔲 | BackupDestinations page |
| 🔲 | BackupStatusBadge (atom) |
| 🔲 | BackupDestinationCard (molecule) |
| 🔲 | BackupRow (molecule) |
| 🔲 | BackupScheduleForm (organism) |
| 🔲 | Manual backup trigger |
| 🔲 | Restore action |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Backup list loads |
| 🔲 | Create destination |
| 🔲 | Manual backup dispatches job |

**Progress:** 🔲 0/8 dev, 🔲 0/3 tests

---

### 4.3 Notifications

#### Development Tasks
| Status | Task |
|--------|------|
| 🔲 | Notification model |
| 🔲 | Email templates (deployment, backup, server) |
| 🔲 | In-app notification bell |
| 🔲 | Notification preferences |
| 🔲 | Mark as read |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Notification creation |
| 🔲 | Email sending (mocked) |
| 🔲 | Mark as read updates DB |
| 🔲 | Unread count correct |

**Progress:** 🔲 0/5 dev, 🔲 0/4 tests

---

### 4.4 Dashboard

#### Development Tasks
| Status | Task |
|--------|------|
| 🔲 | Dashboard page (`/`) |
| 🔲 | StatsCard (molecule) |
| 🔲 | ActivityItem (molecule) |
| 🔲 | DashboardStats (organism) |
| 🔲 | Recent activity list |
| 🔲 | Server status overview |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Dashboard loads with stats |
| 🔲 | Activity shows recent items |

**Progress:** 🔲 0/6 dev, 🔲 0/2 tests

---

### 4.5 Settings & Profile

#### Development Tasks
| Status | Task |
|--------|------|
| 🔲 | Settings page (`/settings`) |
| 🔲 | Profile update |
| 🔲 | Password change |
| 🔲 | 2FA management (regenerate codes) |
| 🔲 | Git credentials management |

#### Tests
| Status | Test |
|--------|------|
| 🔲 | Profile update works |
| 🔲 | Password change validates old password |
| 🔲 | 2FA regeneration works |
| 🔲 | Git credential CRUD |

**Progress:** 🔲 0/5 dev, 🔲 0/4 tests  
**Deliverable:** Complete MVP with backups and dashboard

---

## Phase 5: Hardening (Week 5-6)

### 5.1 Security Audit

| Status | Task |
|--------|------|
| 🔲 | All routes require auth |
| 🔲 | All actions have policy checks |
| 🔲 | Rate limiting on all endpoints |
| 🔲 | CSRF protection verified |
| 🔲 | XSS prevention (Inertia) |
| 🔲 | SQL injection prevention (Eloquent) |
| 🔲 | SSH command sanitization audit |

**Progress:** 🔲 0/7 tasks

---

### 5.2 Testing Completion

| Status | Task |
|--------|------|
| 🔲 | 80%+ coverage overall |
| 🔲 | All edge cases covered |
| 🔲 | Error states tested |
| 🔲 | Rate limit tests |
| 🔲 | 2FA bypass prevention tests |
| 🔲 | Multi-browser session tests |

**Progress:** 🔲 0/6 tasks

---

### 5.3 Documentation

| Status | Task |
|--------|------|
| 🔲 | API documentation complete |
| 🔲 | User guide (how to use) |
| 🔲 | Admin guide (how to deploy) |
| 🔲 | Troubleshooting guide |

**Progress:** 🔲 0/4 tasks

---

### 5.4 Production Readiness

| Status | Task |
|--------|------|
| 🔲 | docker-compose.prod.yml finalized |
| 🔲 | Environment variables documented |
| 🔲 | Backup of panel database |
| 🔲 | Monitoring setup (optional) |
| 🔲 | Error tracking (optional) |

**Progress:** 🔲 0/5 tasks  
**Deliverable:** Production-ready MVP

---

## Overall Progress

| Phase | Dev Tasks | Tests | Status |
|-------|-----------|-------|--------|
| 1. Foundation | 0/42 | 0/27 | 🔲 Not Started |
| 2. Server Management | 0/29 | 0/24 | 🔲 Not Started |
| 3. App Deployments | 0/36 | 0/20 | 🔲 Not Started |
| 4. Backups & Polish | 0/34 | 0/18 | 🔲 Not Started |
| 5. Hardening | 0/22 | - | 🔲 Not Started |

**Total: 0/163 dev tasks, 0/89 tests**

---

## Definition of Done

Each task is complete when:
- ✅ Tests written FIRST (TDD)
- ✅ Code passes all tests
- ✅ PHPStan Level 9 passing
- ✅ Pint formatting applied
- ✅ Feature tests: `php artisan test --filter={Feature}`
