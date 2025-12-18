# App Deployments Feature

**Status:** Planning  
**Priority:** Critical  
**Phase:** 3

---

## Overview

Git-based deployments with Docker Compose, environment management, and rollback support.

---

## User Stories

- As an admin, I want to add an app with Git repo and deploy path
- As an admin, I want to deploy from any branch to production or staging
- As an admin, I want to see deployment logs in real-time
- As an admin, I want to rollback to a previous deployment
- As an admin, I want to manage environment variables per environment
- As an admin, I want to configure domains with automatic SSL

---

## Acceptance Criteria

- [ ] Create app with Git repo, branch, deploy path
- [ ] Support private repos via Git credentials
- [ ] Deploy clones/pulls code, writes .env, runs docker compose
- [ ] Deployment logs stream to UI (polling MVP)
- [ ] Failed deployments send email notification
- [ ] Rollback creates new deployment at previous commit
- [ ] Environment variables encrypted at rest
- [ ] Separate env vars for production vs staging
- [ ] Domains auto-configured in Caddy
- [ ] SSL certificates auto-provisioned

---

## Guideline Compliance

See [FEATURE_DESIGN_CHECKLIST.md](/docs/FEATURE_DESIGN_CHECKLIST.md)

**Status:** 0/47 (0%) - Not started

---

## Technical Design

### Database Tables
- `git_credentials` - [/docs/database/migrations/007_create_git_credentials_table.md]
- `apps` - [/docs/database/migrations/008_create_apps_table.md]
- `deployments` - [/docs/database/migrations/009_create_deployments_table.md]
- `domains` - [/docs/database/migrations/010_create_domains_table.md]

### Models
- `App\Models\GitCredential`
- `App\Models\App`
- `App\Models\Deployment`
- `App\Models\Domain`

### Services
- `App\Services\AppService` - App CRUD
- `App\Services\DeploymentService` - Deployment logic
- `App\Services\GitService` - Clone/pull operations
- `App\Services\CaddyService` - Domain configuration

### Controllers
- `App\Http\Controllers\AppController`
- `App\Http\Controllers\DeploymentController`
- `App\Http\Controllers\DomainController`
- `App\Http\Controllers\GitCredentialController`

### Jobs
- `App\Jobs\DeployAppJob` - Main deployment job
- `App\Jobs\RollbackAppJob` - Rollback deployment

---

## Frontend Components

### Pages
- `Pages/Apps/Index.tsx` - App list
- `Pages/Apps/Create.tsx` - Add app form
- `Pages/Apps/Show.tsx` - App detail (tabs)
- `Pages/Deployments/Show.tsx` - Deployment logs

### Components (Reuse)
- `ui/button`, `ui/input`, `ui/card`, `ui/table`, `ui/tabs`, `ui/dialog`
- `Atoms/LoadingSpinner`, `Atoms/EmptyState`
- `Molecules/FormField`, `Molecules/ConfirmationDialog`

### Components (Create)
- `atoms/AppStatusBadge` - pending/deploying/running/stopped/failed
- `atoms/DeploymentStatusBadge` - queued/running/success/failed
- `atoms/ContainerStatusBadge` - running/stopped/restarting
- `molecules/AppCard` - App summary
- `molecules/DeploymentRow` - Deployment history item
- `molecules/ContainerRow` - Container status
- `molecules/EnvVariableRow` - Key-value editor row
- `organisms/AppTable` - App list
- `organisms/DeployModal` - Branch/env selection
- `organisms/LogViewer` - Real-time logs
- `organisms/EnvEditor` - Environment variable editor
- `organisms/ContainerList` - Container management

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/apps | List apps |
| POST | /api/apps | Create app |
| GET | /api/apps/{id} | App detail |
| PUT | /api/apps/{id} | Update app |
| DELETE | /api/apps/{id} | Delete app |
| GET | /api/apps/{id}/env | Get env vars (masked) |
| PUT | /api/apps/{id}/env | Update env vars |
| GET | /api/apps/{id}/containers | List containers |
| POST | /api/apps/{id}/containers/{name}/restart | Restart container |
| GET | /api/apps/{id}/containers/{name}/logs | Container logs |
| GET | /api/apps/{id}/deployments | Deployment history |
| POST | /api/apps/{id}/deployments | Start deployment |
| GET | /api/deployments/{id} | Deployment detail + logs |
| POST | /api/deployments/{id}/cancel | Cancel deployment |
| POST | /api/deployments/{id}/rollback | Rollback to this |
| GET | /api/apps/{id}/domains | List domains |
| POST | /api/apps/{id}/domains | Add domain |
| DELETE | /api/domains/{id} | Remove domain |
| GET | /api/git-credentials | List credentials |
| POST | /api/git-credentials | Add credentials |
| DELETE | /api/git-credentials/{id} | Delete credentials |

---

## Deployment Flow

```
1. User clicks Deploy
2. Create deployment record (queued)
3. Dispatch DeployAppJob to Horizon
4. SSH to server
5. Git clone/pull to deploy_path
6. Write .env from encrypted vars
7. docker compose build
8. docker compose down
9. docker compose up -d
10. Health check (container running)
11. Configure Caddy domain
12. Update deployment status
13. Send notification if failed
```

---

## Testing

- [ ] Create app stores encrypted env vars
- [ ] Private repo requires git credentials
- [ ] Deployment job dispatched to queue
- [ ] Deployment status transitions correctly
- [ ] Deployment log updated during process
- [ ] Failed deployment sends notification
- [ ] Rollback creates new deployment
- [ ] Env vars decrypted only on server
- [ ] Container list from docker compose ps
- [ ] Domain configures Caddy API

---

## Tasks

See [IMPLEMENTATION_TASKS.md](/docs/IMPLEMENTATION_TASKS.md) - Phase 3
