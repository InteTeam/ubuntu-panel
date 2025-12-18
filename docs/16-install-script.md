# Install Script

The one-liner bash script that sets up managed servers.

---

## Overview

When adding a server in UPanel, the user gets a command like:

```bash
curl -fsSL https://panel.example.com/install/abc123xyz | bash
```

This script:
1. Validates the environment
2. Installs Docker, Caddy
3. Hardens the server (SSH, firewall, fail2ban)
4. Creates upanel user with SSH key
5. Installs and starts the agent
6. Registers with the panel

---

## Script Generation

The panel generates a unique script per server registration:

```php
// app/Http/Controllers/InstallController.php
public function script(string $token)
{
    $server = Server::where('install_token', hash('sha256', $token))
        ->where('install_token_expires_at', '>', now())
        ->where('status', 'pending')
        ->firstOrFail();

    $script = view('install.script', [
        'panelUrl' => config('app.url'),
        'token' => $token,
        'serverId' => $server->id,
        'sshPublicKey' => $server->ssh_public_key,
        'agentToken' => $server->generateAgentToken(), // Raw token, not hashed
    ])->render();

    return response($script)
        ->header('Content-Type', 'text/plain');
}
```

---

## Full Install Script

```bash
#!/bin/bash
#
# UPanel Server Setup Script
# Generated for: {{ $serverId }}
# Expires: {{ $expiresAt }}
#

set -e

PANEL_URL="{{ $panelUrl }}"
TOKEN="{{ $token }}"
SERVER_ID="{{ $serverId }}"
AGENT_TOKEN="{{ $agentToken }}"
SSH_PUBLIC_KEY="{{ $sshPublicKey }}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (sudo)"
fi

# Check Ubuntu
if ! grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
    log_error "This script requires Ubuntu 22.04 or 24.04"
fi

UBUNTU_VERSION=$(lsb_release -rs)
if [[ "$UBUNTU_VERSION" != "22.04" && "$UBUNTU_VERSION" != "24.04" ]]; then
    log_warn "Untested Ubuntu version: $UBUNTU_VERSION (recommended: 22.04 or 24.04)"
fi

log_info "Starting UPanel server setup..."

# ============================================
# 1. System Update
# ============================================
log_info "Updating system packages..."
apt update -qq
DEBIAN_FRONTEND=noninteractive apt upgrade -y -qq

# ============================================
# 2. Install Dependencies
# ============================================
log_info "Installing dependencies..."
apt install -y -qq \
    curl \
    wget \
    git \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# ============================================
# 3. Install Docker
# ============================================
if command -v docker &> /dev/null; then
    log_info "Docker already installed"
else
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
fi

# Ensure Docker service is running
systemctl enable docker
systemctl start docker

# ============================================
# 4. Install Caddy
# ============================================
if command -v caddy &> /dev/null; then
    log_info "Caddy already installed"
else
    log_info "Installing Caddy..."
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
    apt update -qq
    apt install -y caddy
fi

# Enable Caddy API
if ! grep -q "admin localhost:2019" /etc/caddy/Caddyfile; then
    echo -e "{\n\tadmin localhost:2019\n}\n$(cat /etc/caddy/Caddyfile)" > /etc/caddy/Caddyfile
fi

systemctl enable caddy
systemctl restart caddy

# ============================================
# 5. Create upanel User
# ============================================
log_info "Creating upanel user..."
if id "upanel" &>/dev/null; then
    log_info "User upanel already exists"
else
    useradd -m -s /bin/bash upanel
fi

# Add to groups
usermod -aG sudo upanel
usermod -aG docker upanel

# Allow sudo without password for specific commands
cat > /etc/sudoers.d/upanel << 'EOF'
upanel ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart caddy
upanel ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload caddy
upanel ALL=(ALL) NOPASSWD: /usr/bin/ufw *
upanel ALL=(ALL) NOPASSWD: /usr/bin/fail2ban-client *
EOF
chmod 440 /etc/sudoers.d/upanel

# ============================================
# 6. Setup SSH Key
# ============================================
log_info "Configuring SSH access..."
mkdir -p /home/upanel/.ssh
echo "$SSH_PUBLIC_KEY" > /home/upanel/.ssh/authorized_keys
chmod 700 /home/upanel/.ssh
chmod 600 /home/upanel/.ssh/authorized_keys
chown -R upanel:upanel /home/upanel/.ssh

# ============================================
# 7. Harden SSH
# ============================================
log_info "Hardening SSH configuration..."
cat > /etc/ssh/sshd_config.d/upanel-hardening.conf << 'EOF'
# UPanel SSH Hardening
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
X11Forwarding no
AllowAgentForwarding no
EOF

systemctl restart sshd

# ============================================
# 8. Configure Firewall
# ============================================
log_info "Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw allow 8443/tcp comment 'UPanel Agent'
ufw --force enable

# ============================================
# 9. Configure Fail2ban
# ============================================
log_info "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# ============================================
# 10. Enable Automatic Updates
# ============================================
log_info "Enabling automatic security updates..."
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF

cat > /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}";
    "${distro_id}:${distro_codename}-security";
    "${distro_id}ESMApps:${distro_codename}-apps-security";
    "${distro_id}ESM:${distro_codename}-infra-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

systemctl restart unattended-upgrades

# ============================================
# 11. Install UPanel Agent
# ============================================
log_info "Installing UPanel agent..."
mkdir -p /opt/upanel-agent

cat > /opt/upanel-agent/.env << EOF
PANEL_URL=$PANEL_URL
SERVER_ID=$SERVER_ID
AGENT_TOKEN=$AGENT_TOKEN
HEARTBEAT_INTERVAL=60
EOF

cat > /opt/upanel-agent/docker-compose.yml << 'EOF'
version: '3.8'

services:
  agent:
    image: ghcr.io/inte-team/upanel-agent:latest
    container_name: upanel-agent
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
    ports:
      - "8443:8443"
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:8443/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

cd /opt/upanel-agent
docker compose pull
docker compose up -d

# ============================================
# 12. Create App Directories
# ============================================
log_info "Creating application directories..."
mkdir -p /var/www
chown upanel:upanel /var/www

# ============================================
# 13. Register with Panel
# ============================================
log_info "Registering with UPanel..."

REGISTRATION_DATA=$(cat << EOF
{
    "hostname": "$(hostname)",
    "os_version": "$(lsb_release -ds)",
    "cpu_cores": $(nproc),
    "ram_mb": $(free -m | awk '/^Mem:/{print $2}'),
    "disk_gb": $(df -BG / | awk 'NR==2{print $2}' | tr -d 'G'),
    "agent_version": "1.0.0"
}
EOF
)

RESPONSE=$(curl -s -X POST "$PANEL_URL/api/install/$TOKEN/complete" \
    -H "Content-Type: application/json" \
    -d "$REGISTRATION_DATA")

if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    log_info "Registration successful!"
else
    log_error "Registration failed: $RESPONSE"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "============================================"
echo -e "${GREEN}UPanel Server Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Server Details:"
echo "  Hostname:    $(hostname)"
echo "  OS:          $(lsb_release -ds)"
echo "  CPU Cores:   $(nproc)"
echo "  RAM:         $(free -h | awk '/^Mem:/{print $2}')"
echo "  Disk:        $(df -h / | awk 'NR==2{print $2}')"
echo ""
echo "Services Installed:"
echo "  ✅ Docker"
echo "  ✅ Caddy"
echo "  ✅ Fail2ban"
echo "  ✅ UFW Firewall"
echo "  ✅ Automatic Updates"
echo "  ✅ UPanel Agent"
echo ""
echo "Security Hardening:"
echo "  ✅ SSH: Root login disabled"
echo "  ✅ SSH: Password auth disabled"
echo "  ✅ Firewall: Only 22, 80, 443, 8443 open"
echo "  ✅ Fail2ban: SSH protection enabled"
echo ""
echo "The server will appear in your UPanel dashboard shortly."
echo ""
```

---

## API Endpoints

### GET /install/{token}

Returns the bash script.

**Headers:**
- `Content-Type: text/plain`

### GET /install/{token}/pubkey

Returns just the SSH public key (for debugging).

### POST /install/{token}/complete

Called by script to confirm installation.

**Request:**
```json
{
    "hostname": "prod-server-1",
    "os_version": "Ubuntu 24.04 LTS",
    "cpu_cores": 4,
    "ram_mb": 8192,
    "disk_gb": 100,
    "agent_version": "1.0.0"
}
```

**Response:**
```json
{
    "status": "ok",
    "server_id": "01HQXYZ...",
    "message": "Server registered successfully"
}
```

---

## Security Considerations

### Token Security

- Token is 64 random characters
- Hashed (SHA256) before storage
- Expires after 1 hour
- Single use (invalidated after registration)
- Only valid for pending servers

### Script Security

- Script served over HTTPS only
- Token embedded in URL, not querystring (no logs)
- Installation runs as root (required for system changes)
- SSH key from panel (not user-provided)

### Post-Install

- Password auth disabled immediately
- Root login disabled immediately
- Firewall enabled immediately
- Only panel can SSH in (via generated key)

---

## Troubleshooting

### Script Fails to Download

```bash
# Check if token is valid
curl -I https://panel.example.com/install/abc123

# 200 = valid
# 404 = expired or invalid token
```

### Docker Not Starting

```bash
# Check Docker status
systemctl status docker

# View logs
journalctl -u docker -n 50
```

### Agent Not Connecting

```bash
# Check agent status
cd /opt/upanel-agent
docker compose ps
docker compose logs

# Test connectivity
curl -s https://panel.example.com/api/health
```

### SSH Connection Refused

```bash
# Check sshd
systemctl status sshd

# Check firewall
ufw status

# Check authorized_keys
cat /home/upanel/.ssh/authorized_keys
```

---

## Manual Installation

If the one-liner fails, you can run steps manually:

```bash
# Download script
curl -fsSL https://panel.example.com/install/abc123 -o install.sh

# Review it
less install.sh

# Run with debug
bash -x install.sh
```

Or run individual sections from the script.
