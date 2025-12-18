# UPanel Overview

## Problem Statement

Existing server panels are either:
- Expensive (Plesk, cPanel)
- Complex and heavy (Zabbix, enterprise tools)
- Missing security-first approach
- No good GUI for Docker Compose workflows
- Poor staging environment support

## Solution

Lightweight panel that:
1. Hardens Ubuntu servers on first install
2. Provides GUI for Docker Compose deployments
3. Manages staging/production environments per app
4. Handles backups to client-owned storage (Google Drive)
5. Monitors basics without external dependencies

## Target Users

- Small agencies managing client apps
- Self-hosted SaaS providers
- Anyone running Laravel/Next.js on VPS

## Tech Stack

### Panel (Main Application)
- **Framework**: Laravel 11 + Inertia.js + React
- **Database**: PostgreSQL (panel data)
- **Queue**: Redis + Laravel Horizon
- **Hosting**: Single VM on own infrastructure

### Managed Servers
- **OS**: Ubuntu 22.04 / 24.04 LTS
- **Container Runtime**: Docker + Docker Compose
- **Reverse Proxy**: Caddy (automatic HTTPS)
- **Agent**: Lightweight daemon for metrics + command execution

### Supported App Stacks
- Laravel + React/Vue (Docker Compose)
- Next.js + Supabase (Docker Compose)
- Any Docker Compose based app

## Deployment Model

```
Inte.Team Infrastructure (Dell R550 / Proxmox)
└── UPanel VM
    ├── Panel Web UI
    ├── PostgreSQL
    ├── Redis
    └── Horizon Workers

Client/Project Servers (VPS, Dedicated, VMs)
├── UPanel Agent
├── Docker + Apps
├── Caddy
└── Hardened Ubuntu
```

## Non-Goals (v1)

- Kubernetes support
- Multi-region orchestration
- Public multi-tenant SaaS
- Windows server support
- Complex monitoring dashboards
