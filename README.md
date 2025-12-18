# UPanel

Lightweight, security-first control panel for Ubuntu VMs and Docker deployments.

## Why UPanel?

- **Security by default** - hardened servers from first install
- **Simple Docker deployments** - GUI for Docker Compose workflows
- **Staging environments** - branch-based staging with one click
- **Backup flexibility** - Google Drive, Backblaze B2, SFTP
- **Free and self-hosted** - no per-server licensing fees

## Target Stack

- Laravel 12 + Inertia + React (panel)
- Docker Compose (app deployments)
- Caddy (reverse proxy, auto SSL)
- Ubuntu 22.04/24.04 LTS

## Architecture

```
UPanel (main instance)
    ↓ SSH + Agent API
Managed VMs (VPS, dedicated, Proxmox)
    ↓
Docker containers (client apps)
```

## Status

🚧 **Ready for Implementation** - Full documentation complete

---

## Documentation

### Getting Started

| Document | Purpose |
|----------|---------|
| [SOP](.sop.md) | Standard Operating Procedures - **START HERE** |
| [Architecture Overview](docs/architecture/overview.md) | System design and data flows |
| [Implementation Tasks](docs/IMPLEMENTATION_TASKS.md) | Phased task breakdown |

### Standards & Guidelines

| Document | Purpose |
|----------|---------|
| [Documentation Standards](docs/DOCUMENTATION_STANDARDS.md) | How to document features |
| [Feature Design Checklist](docs/FEATURE_DESIGN_CHECKLIST.md) | Compliance checklist |
| [Workflow Enforcement](docs/WORKFLOW_ENFORCEMENT.md) | Mandatory workflow steps |
| [Component Reuse Checklist](docs/COMPONENT_REUSE_CHECKLIST.md) | UI component inventory |
| [Development Guidelines](docs/DEVELOPMENT_GUIDELINES.md) | Coding standards |
| [Testing Guidelines](docs/TESTING_GUIDELINES.md) | Test standards (Pest 4) |

### Technical Design

| Document | Purpose |
|----------|---------|
| [Overview](docs/01-overview.md) | Problem, solution, tech stack |
| [Security Baseline](docs/02-security-baseline.md) | Server hardening checklist |
| [Installation Flow](docs/03-installation-flow.md) | One-liner + agent setup |
| [Features Roadmap](docs/04-features-roadmap.md) | Phased feature list |
| [Backup Strategy](docs/05-backup-strategy.md) | Google Drive, B2, SFTP |
| [Components Import](docs/06-components-import.md) | Reusable from InteTeam CRM |
| [Authentication](docs/07-authentication.md) | Login, 2FA, password reset |
| [Database Schema](docs/08-database-schema.md) | Full database design |

### Implementation Specs

| Document | Purpose |
|----------|---------|
| [Server Management](docs/09-server-management.md) | Add/manage servers |
| [App Deployments](docs/10-app-deployments.md) | Git, Docker Compose, rollback |
| [Agent Specification](docs/11-agent-spec.md) | Agent API and communication |
| [Panel API](docs/12-panel-api.md) | REST API (50+ endpoints) |
| [UI Pages](docs/13-ui-pages.md) | Page structure and components |
| [Notifications](docs/14-notifications.md) | Email and in-app alerts |
| [Docker Setup](docs/15-docker-setup.md) | Panel's own docker-compose |
| [Install Script](docs/16-install-script.md) | One-liner bash script |

### Database Documentation

| Document | Purpose |
|----------|---------|
| [Database README](docs/database/README.md) | Schema overview |
| [Migration 001-016](docs/database/migrations/) | Per-table documentation |

### Feature Documentation

| Feature | Status | Phase |
|---------|--------|-------|
| [Authentication](docs/features/authentication/README.md) | Documented | 1 |
| [Server Management](docs/features/server-management/README.md) | Documented | 2 |
| [App Deployments](docs/features/app-deployments/README.md) | Documented | 3 |
| [Backups](docs/features/backups/README.md) | Documented | 4 |

---

## Implementation Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation (setup, auth, layout) | 🔲 Ready to start |
| 2 | Server Management | 🔲 Documented |
| 3 | App Deployments | 🔲 Documented |
| 4 | Backups & Polish | 🔲 Documented |
| 5 | Hardening | 🔲 Documented |

See [IMPLEMENTATION_TASKS.md](docs/IMPLEMENTATION_TASKS.md) for detailed breakdown.

---

## Development

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- PHP 8.3+ (in container)

### Quick Start (When Ready)

```bash
# Clone
git clone https://github.com/inte-team/upanel.git
cd upanel

# Start development environment
docker compose up -d

# Install dependencies
docker compose exec app composer install
docker compose run --rm npm install

# Setup
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate

# Build frontend
docker compose run --rm npm run build

# Access
open http://localhost:8000
```

### Commands

```bash
# Tests (always feature-by-feature)
docker compose exec app php artisan test --filter=AuthTest
docker compose exec app php artisan test --filter=ServerTest

# Code quality
docker compose exec app ./vendor/bin/pint
docker compose exec app ./vendor/bin/phpstan analyse

# Frontend dev
docker compose run --rm npm run dev
```

---

## Component Reuse

This project reuses battle-tested components from InteTeam CRM:
- Full `ui/` layer (shadcn/ui)
- Generic atoms: LoadingSpinner, EmptyState, StatusBadge
- Generic molecules: FormField, ConfirmationDialog, SearchBox
- Layouts and providers

See [docs/06-components-import.md](docs/06-components-import.md) for import instructions.

---

## Documentation Completeness

| Category | Files | Status |
|----------|-------|--------|
| Standards | 7 | ✅ Complete |
| Reference | 16 | ✅ Complete |
| Database | 17 | ✅ Complete |
| Features | 4 | ✅ Complete |
| Architecture | 1 | ✅ Complete |

**Total: 45 documentation files**

---

## License

Proprietary - Inte.Team
