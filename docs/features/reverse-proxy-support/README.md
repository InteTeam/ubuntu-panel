# Reverse Proxy Support Feature

**Status:** Planning
**Priority:** High
**Phase:** Infrastructure

---

## Overview

Enable UPanel to run behind reverse proxies (Nginx Proxy Manager, Traefik, HAProxy, etc.) with proper header forwarding, SSL termination, and flexible port configuration.

---

## User Stories

- As an admin, I want to run UPanel behind Nginx Proxy Manager with SSL
- As an admin, I want to configure UPanel on a custom port (e.g., 8889)
- As an admin, I want UPanel to correctly detect HTTPS when SSL is terminated at the proxy
- As an admin, I want to run UPanel directly on ports 80/443 without a reverse proxy

---

## Acceptance Criteria

- [ ] Laravel correctly trusts proxy headers (X-Forwarded-For, X-Forwarded-Proto)
- [ ] `APP_URL` reflects the correct public URL with HTTPS
- [ ] Custom port configurable via `PROXY_PORT` in .env
- [ ] Docker compose file for reverse proxy mode (without Caddy)
- [ ] Documentation covers both standalone and reverse proxy setups
- [ ] Session cookies work correctly with HTTPS termination at proxy
- [ ] CSRF protection works correctly behind proxy

---

## Guideline Compliance

See [FEATURE_DESIGN_CHECKLIST.md](/docs/FEATURE_DESIGN_CHECKLIST.md)

### Backend Checklist

- [x] `declare(strict_types=1)` - N/A (config only)
- [x] No new models required
- [x] No new policies required
- [x] No new controllers required
- [x] No new services required
- [x] No new migrations required
- [x] No new validation required

### Frontend Checklist

- [x] No new components required (config via .env only)

### Security Checklist

- [x] Trusted proxies properly configured
- [x] HTTPS detection works behind proxy
- [x] Session security maintained
- [x] No sensitive data exposed

**Status:** Config-only feature, minimal checklist items apply.

---

## Technical Design

### Deployment Modes

| Mode | Compose File | SSL Handling | Port Config |
|------|--------------|--------------|-------------|
| Development | `docker-compose.yml` | None | `APP_PORT` (8000) |
| Standalone | `docker-compose.prod.yml` | Caddy auto-SSL | 80/443 fixed |
| Reverse Proxy | `docker-compose.proxy.yml` | External (NPM, etc.) | `PROXY_PORT` |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_URL` | `http://localhost:8000` | Public URL including protocol |
| `PROXY_PORT` | `8080` | Port to expose when behind reverse proxy |
| `TRUSTED_PROXIES` | `null` | Proxy IPs to trust (`*` for all, or CIDR) |
| `FORCE_HTTPS` | `false` | Force HTTPS URLs even if proxy sends HTTP |

### Laravel Trusted Proxies Configuration

In `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->trustProxies(
        at: env('TRUSTED_PROXIES') === '*'
            ? '*'
            : explode(',', env('TRUSTED_PROXIES', '')),
        headers: Request::HEADER_X_FORWARDED_FOR |
                 Request::HEADER_X_FORWARDED_HOST |
                 Request::HEADER_X_FORWARDED_PORT |
                 Request::HEADER_X_FORWARDED_PROTO |
                 Request::HEADER_X_FORWARDED_AWS_ELB
    );
})
```

### Docker Compose (Proxy Mode)

```yaml
# docker-compose.proxy.yml
services:
  app:
    # PHP-FPM application

  nginx:
    ports:
      - "${PROXY_PORT:-8080}:80"
    # No Caddy, no SSL - handled by external proxy

  # postgres, redis, queue, scheduler...
```

### Nginx Proxy Manager Configuration

User configures in NPM:
- Domain: `panel.example.com`
- Scheme: `http`
- Forward Hostname/IP: `server-ip`
- Forward Port: `8889` (or whatever PROXY_PORT is set to)
- SSL: Let's Encrypt via NPM
- Websockets: Off (not used)
- Force SSL: On

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `docker-compose.proxy.yml` | Create | Compose for reverse proxy mode |
| `.env.example` | Modify | Add proxy-related variables |
| `bootstrap/app.php` | Modify | Configure trusted proxies |
| `docs/DEPLOYMENT.md` | Modify | Add reverse proxy instructions |

---

## Testing

### Manual Testing

- [ ] Run behind Nginx Proxy Manager with SSL
- [ ] Verify `request()->secure()` returns true with HTTPS proxy
- [ ] Verify `url()` helper generates HTTPS URLs
- [ ] Verify login/logout works (session cookies)
- [ ] Verify CSRF tokens work
- [ ] Verify install script URLs use correct domain

### Verification Commands

```bash
# Check detected protocol
docker compose exec app php artisan tinker --execute="dump(request()->secure())"

# Check generated URLs
docker compose exec app php artisan tinker --execute="dump(url('/'))"
```

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| Trusting all proxies (`*`) | Only safe in Docker network isolation |
| IP spoofing via X-Forwarded-For | Only trust known proxy IPs in production |
| HTTP downgrade | `FORCE_HTTPS` option available |

### Recommended Production Settings

```env
# If NPM is on same Docker network
TRUSTED_PROXIES=172.16.0.0/12,10.0.0.0/8

# If NPM is on same host
TRUSTED_PROXIES=172.17.0.1

# If unsure (Docker isolated network only)
TRUSTED_PROXIES=*
```

---

## Documentation Updates

### DEPLOYMENT.md additions

1. New section: "Running Behind Reverse Proxy"
2. Nginx Proxy Manager step-by-step
3. Traefik configuration example
4. Troubleshooting proxy issues

---

## Open Questions

None - straightforward infrastructure configuration.

---

## References

- [Laravel Trusted Proxies](https://laravel.com/docs/11.x/requests#trusting-proxies)
- [Nginx Proxy Manager Docs](https://nginxproxymanager.com/guide/)
