# UPanel Agent Feature

**Status:** Planning
**Priority:** Critical
**Phase:** 2

---

## Overview

Lightweight Go-based agent that runs on managed servers, sending heartbeats and metrics to the panel. The agent runs as a Docker container and communicates outbound-only to the panel.

---

## User Stories

- As an admin, I want servers to report their status automatically
- As an admin, I want to see CPU, RAM, and disk usage in real-time
- As an admin, I want to see Docker container statuses
- As an admin, I want servers to appear online after running the install script

---

## Acceptance Criteria

- [ ] Agent sends heartbeat every 60 seconds
- [ ] Heartbeat includes CPU, RAM, disk metrics
- [ ] Heartbeat includes Docker container list with status
- [ ] Panel API receives and stores heartbeats
- [ ] Server status updates to "online" after first heartbeat
- [ ] Server status changes to "offline" after 5 minutes without heartbeat
- [ ] Agent exposes /health endpoint for local checks
- [ ] Agent image published to GitHub Container Registry
- [ ] Install script successfully pulls and runs agent

---

## Architecture

```
┌─────────────────────────────────────────┐
│ Managed Server                          │
│                                         │
│  ┌─────────────┐    ┌────────────────┐ │
│  │ UPanel Agent│───▶│ Docker Socket  │ │
│  │ (container) │    └────────────────┘ │
│  └──────┬──────┘                        │
│         │ HTTPS POST every 60s          │
└─────────┼───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│ UPanel (panel server)                   │
│  POST /api/agent/heartbeat              │
│  Authorization: Bearer {agent_token}    │
└─────────────────────────────────────────┘
```

---

## Technical Design

### Agent (Go)

| Component | Description |
|-----------|-------------|
| Language | Go 1.21+ |
| Dependencies | docker/docker, gopsutil |
| Container | Alpine-based, ~15MB |
| Port | 8443 (health check only) |

### API Endpoints (Panel Side)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/agent/heartbeat | Receive metrics from agent |
| GET | /api/install/{token}/pubkey | Return SSH public key |
| POST | /api/install/{token}/complete | Complete registration |

### Heartbeat Payload

```json
{
    "server_id": "01HQXYZ...",
    "timestamp": "2024-01-15T10:30:00Z",
    "metrics": {
        "cpu_percent": 23.5,
        "ram_used_mb": 1024,
        "ram_total_mb": 4096,
        "disk_used_gb": 45,
        "disk_total_gb": 100
    },
    "containers": [
        {
            "id": "abc123",
            "name": "myapp_web_1",
            "image": "myapp:latest",
            "status": "running"
        }
    ],
    "agent_version": "1.0.0"
}
```

---

## Implementation Tasks

### Phase 1: Agent Core (Go)

| # | Task | Description |
|---|------|-------------|
| 1.1 | Create agent directory | `/agent` with Go module |
| 1.2 | Implement metrics collection | CPU, RAM, disk via gopsutil |
| 1.3 | Implement Docker container listing | Via Docker API |
| 1.4 | Implement heartbeat sender | HTTPS POST to panel |
| 1.5 | Implement health endpoint | GET /health on :8443 |
| 1.6 | Create Dockerfile | Multi-stage, Alpine-based |
| 1.7 | Test locally | Run agent against local panel |

### Phase 2: Panel API

| # | Task | Description |
|---|------|-------------|
| 2.1 | Create HeartbeatController | Receive and validate heartbeats |
| 2.2 | Create HeartbeatRequest | Validate payload structure |
| 2.3 | Update ServerService | Store metrics, update status |
| 2.4 | Create server_metrics migration | If not exists |
| 2.5 | Add offline detection job | Mark offline after 5 min |
| 2.6 | Test heartbeat API | With Pest tests |

### Phase 3: Install Script & Registration

| # | Task | Description |
|---|------|-------------|
| 3.1 | Update install.blade.php | Fix image reference |
| 3.2 | Create InstallController@complete | Handle registration |
| 3.3 | Create pubkey endpoint | Return SSH public key |
| 3.4 | Test full install flow | End-to-end test |

### Phase 4: CI/CD & Publishing

| # | Task | Description |
|---|------|-------------|
| 4.1 | Create GitHub Actions workflow | Build and push agent |
| 4.2 | Push to ghcr.io | GitHub Container Registry |
| 4.3 | Tag releases | Semantic versioning |
| 4.4 | Update install script | Use correct image path |

---

## File Structure

```
/agent
├── main.go              # Entry point
├── collector/
│   ├── metrics.go       # CPU, RAM, disk collection
│   └── docker.go        # Container listing
├── sender/
│   └── heartbeat.go     # Send to panel
├── health/
│   └── server.go        # Health endpoint
├── Dockerfile           # Multi-stage build
├── go.mod
└── go.sum

/app
├── Http/Controllers/
│   └── Agent/
│       └── HeartbeatController.php
├── Http/Requests/
│   └── Agent/
│       └── HeartbeatRequest.php
└── Jobs/
    └── CheckServerStatus.php
```

---

## Security

| Concern | Mitigation |
|---------|------------|
| Token in transit | HTTPS only |
| Token storage | Hashed in DB |
| Docker socket | Read-only mount |
| Agent compromise | Limited to metrics, no exec |

---

## Testing

### Agent Tests (Go)

- [ ] Metrics collection returns valid data
- [ ] Docker listing handles empty state
- [ ] Heartbeat retries on failure
- [ ] Health endpoint returns 200

### Panel Tests (Pest)

- [ ] Heartbeat requires valid token
- [ ] Heartbeat updates server last_seen_at
- [ ] Heartbeat stores metrics
- [ ] Invalid token returns 401
- [ ] Malformed payload returns 422
- [ ] Offline detection marks server offline

---

## Estimated Complexity

| Component | Effort |
|-----------|--------|
| Agent (Go) | Medium |
| Panel API | Low |
| Install script fixes | Low |
| CI/CD | Low |
| **Total** | **Medium** |

---

## Dependencies

- Go 1.21+
- Docker for building agent image
- GitHub Container Registry access
- Panel running for testing

---

## Open Questions

1. Should we use GHCR or Docker Hub?
   - **Recommendation:** GHCR (free, integrated with GitHub)

2. Should agent support self-update?
   - **Recommendation:** Defer to v2, manual update via SSH for now

3. What about ARM servers?
   - **Recommendation:** Build multi-arch image (amd64 + arm64)
