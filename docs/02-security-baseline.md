# Security Baseline

The core differentiator: follow this = secure server, no excuses.

## One-Liner Install Runs These Steps

### 1. System Updates
```bash
apt update && apt upgrade -y
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 2. SSH Hardening
```bash
# /etc/ssh/sshd_config changes:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

### 3. Firewall (UFW)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH (consider changing port)
ufw allow 80/tcp    # HTTP (Caddy)
ufw allow 443/tcp   # HTTPS (Caddy)
ufw enable
```

### 4. Fail2Ban
```bash
apt install -y fail2ban

# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600
```

### 5. Automatic Security Updates
```bash
# /etc/apt/apt.conf.d/50unattended-upgrades
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
```

### 6. Non-Root User for Panel
```bash
adduser upanel
usermod -aG sudo upanel
usermod -aG docker upanel
# SSH key added during registration
```
