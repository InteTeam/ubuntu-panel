# Features Roadmap

## Phase 1: Foundation (MVP)

### Server Management
- [ ] Add server via one-liner install
- [ ] View server status (online/offline)
- [ ] Basic metrics: CPU, RAM, disk usage
- [ ] SSH key management
- [ ] Manual SSH terminal in browser (optional, nice-to-have)

### Security
- [ ] Automated hardening on install
- [ ] UFW rule management via UI
- [ ] Fail2ban status and ban list
- [ ] Security audit checklist with pass/fail

### Docker Deployments
- [ ] Add app: Git repo URL + branch
- [ ] Docker Compose file detection
- [ ] Environment variables management (.env)
- [ ] Deploy: pull → build → up
- [ ] Rollback to previous deployment
- [ ] View container logs

### Domains & SSL
- [ ] Add domain to app
- [ ] Caddy auto-configuration via API
- [ ] Automatic Let's Encrypt SSL
- [ ] Staging subdomain generation (staging.app.com)

---

## Phase 2: Backups & Environments

### Backups
- [ ] Scheduled database dumps (MySQL, PostgreSQL)
- [ ] Docker volume backups
- [ ] Google Drive integration (service account)
- [ ] Backblaze B2 integration
- [ ] SFTP destination support
- [ ] Backup history and restore

### Staging Environments
- [ ] Branch-based deployments (main → prod, develop → staging)
- [ ] Separate .env per environment
- [ ] Database cloning for staging
- [ ] One-click promote staging → production

---

## Phase 3: Polish

### Notifications
- [ ] Email alerts (deployment success/fail, server down)
- [ ] Slack/Discord webhooks
- [ ] Backup failure alerts

### UI/UX
- [ ] Dashboard with all servers overview
- [ ] Deployment history timeline
- [ ] Quick actions (restart, redeploy, logs)

### Advanced
- [ ] Cron job management
- [ ] Database GUI (basic queries, table view)
- [ ] SSL certificate expiry monitoring
- [ ] Resource usage graphs (7-day history)

---

## Future / Maybe

- [ ] Multi-user with roles (admin, viewer)
- [ ] API for external integrations
- [ ] Mobile app (React Native)
- [ ] Ansible playbook export
- [ ] Public SaaS version
