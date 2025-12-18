# Server Management

How servers are registered, managed, and monitored in UPanel.

---

## Server Lifecycle

```
Add Server in UI
    ↓
Generate SSH keypair + agent token
    ↓
Show one-liner install command
    ↓
User runs command on target server
    ↓
Script: installs Docker, Caddy, hardens server, installs agent
    ↓
Agent calls panel API with token
    ↓
Panel marks server as "online"
    ↓
Server ready for app deployments
```

---

## Adding a Server

### Step 1: UI Form

```
Name: [Production Server 1]
Host: [192.168.1.100] or [server.example.com]
SSH Port: [22]
Username: [upanel] (default, will be created)
```

### Step 2: Panel Generates

- **SSH Keypair**: Ed25519 (more secure than RSA, shorter keys)
- **Agent Token**: 64-char random string, hashed before storage

### Step 3: Display Install Command

```bash
curl -fsSL https://panel.example.com/install/abc123def456 | bash
```

Token embedded in URL, single-use, expires in 1 hour.

---

## Install Script Flow

`/install/{token}` returns a bash script that:

```bash
#!/bin/bash
set -e

PANEL_URL="https://panel.example.com"
TOKEN="abc123def456"

# 1. Check Ubuntu version
if ! grep -q "Ubuntu" /etc/os-release; then
    echo "Error: Ubuntu required"
    exit 1
fi

# 2. Update system
apt update && apt upgrade -y

# 3. Install dependencies
apt install -y curl wget git ufw fail2ban

# 4. Install Docker
curl -fsSL https://get.docker.com | sh

# 5. Install Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install -y caddy

# 6. Create upanel user
useradd -m -s /bin/bash upanel
usermod -aG sudo upanel
usermod -aG docker upanel

# 7. Setup SSH key (fetched from panel)
mkdir -p /home/upanel/.ssh
curl -fsSL "$PANEL_URL/api/install/$TOKEN/pubkey" > /home/upanel/.ssh/authorized_keys
chmod 700 /home/upanel/.ssh
chmod 600 /home/upanel/.ssh/authorized_keys
chown -R upanel:upanel /home/upanel/.ssh

# 8. Harden SSH
cat > /etc/ssh/sshd_config.d/upanel.conf << 'EOF'
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
EOF
systemctl restart sshd

# 9. Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8443/tcp  # Agent API
ufw --force enable

# 10. Configure fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600
findtime = 600
EOF
systemctl enable fail2ban
systemctl start fail2ban

# 11. Enable automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

# 12. Install UPanel agent
mkdir -p /opt/upanel-agent
curl -fsSL "$PANEL_URL/api/install/$TOKEN/agent" -o /opt/upanel-agent/docker-compose.yml
cd /opt/upanel-agent
docker compose pull
docker compose up -d

# 13. Register with panel
curl -fsSL -X POST "$PANEL_URL/api/install/$TOKEN/complete" \
    -H "Content-Type: application/json" \
    -d "{
        \"hostname\": \"$(hostname)\",
        \"os_version\": \"$(lsb_release -ds)\",
        \"cpu_cores\": $(nproc),
        \"ram_mb\": $(free -m | awk '/^Mem:/{print $2}'),
        \"disk_gb\": $(df -BG / | awk 'NR==2{print $2}' | tr -d 'G')
    }"

echo ""
echo "✅ UPanel agent installed successfully!"
echo "   Server will appear in your panel shortly."
```

---

## SSH Key Management

### Generation

```php
// ServerService.php
public function generateSshKeypair(): array
{
    $privateKey = sodium_crypto_sign_keypair();
    
    // Or use phpseclib for Ed25519
    $key = EC::createKey('Ed25519');
    
    return [
        'private' => $key->toString('OpenSSH'),
        'public' => $key->getPublicKey()->toString('OpenSSH'),
    ];
}
```

### Storage

Private keys encrypted with `APP_KEY`:

```php
// Server model
protected $casts = [
    'ssh_private_key' => 'encrypted',
    'ssh_public_key' => 'string', // Public key not sensitive
];
```

### Usage

```php
// SshService.php
use phpseclib3\Net\SSH2;
use phpseclib3\Crypt\PublicKeyLoader;

public function connect(Server $server): SSH2
{
    $ssh = new SSH2($server->host, $server->port);
    
    $key = PublicKeyLoader::load($server->ssh_private_key);
    
    if (!$ssh->login($server->username, $key)) {
        throw new SshConnectionException("Failed to connect to {$server->name}");
    }
    
    return $ssh;
}

public function execute(Server $server, string $command): string
{
    $ssh = $this->connect($server);
    $output = $ssh->exec($command);
    $ssh->disconnect();
    
    return $output;
}
```

---

## Server Status

### Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Created, waiting for install script to run |
| `online` | Agent responding, SSH works |
| `offline` | Agent not responding (>5 min) |
| `error` | SSH or agent error |

### Health Check (Every 60 seconds)

Agent sends heartbeat to panel:

```
POST /api/agent/heartbeat
Authorization: Bearer {agent_token}

{
    "cpu_percent": 23.5,
    "ram_used_mb": 1024,
    "ram_total_mb": 4096,
    "disk_used_gb": 45,
    "disk_total_gb": 100,
    "containers": [
        {"name": "myapp_web_1", "status": "running"},
        {"name": "myapp_db_1", "status": "running"}
    ]
}
```

Panel updates `last_seen_at` and stores metrics.

### Offline Detection

Horizon scheduled job every 2 minutes:

```php
// CheckServerStatus job
$offlineThreshold = now()->subMinutes(5);

Server::where('status', 'online')
    ->where('last_seen_at', '<', $offlineThreshold)
    ->each(function ($server) {
        $server->update(['status' => 'offline']);
        
        Notification::send(
            User::admins()->get(),
            new ServerOfflineNotification($server)
        );
    });
```

---

## Server Actions

### Test Connection

```php
// ServerController@testConnection
public function testConnection(Server $server)
{
    try {
        $ssh = $this->sshService->connect($server);
        $output = $ssh->exec('echo "connected"');
        $ssh->disconnect();
        
        return response()->json(['success' => true]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 422);
    }
}
```

### Reboot Server

```php
public function reboot(Server $server)
{
    $this->authorize('manage', $server);
    
    // Graceful reboot
    $this->sshService->execute($server, 'sudo reboot');
    
    $server->update(['status' => 'offline']);
    
    ActivityLog::log('rebooted', $server);
    
    return response()->json(['message' => 'Reboot initiated']);
}
```

### Run Security Audit

```php
public function securityAudit(Server $server)
{
    $checks = [
        'ssh_root_disabled' => $this->checkSshRootDisabled($server),
        'ssh_password_disabled' => $this->checkSshPasswordDisabled($server),
        'firewall_active' => $this->checkFirewallActive($server),
        'fail2ban_running' => $this->checkFail2banRunning($server),
        'updates_enabled' => $this->checkAutoUpdates($server),
    ];
    
    $passed = count(array_filter($checks));
    $total = count($checks);
    $score = (int) (($passed / $total) * 100);
    
    $server->update(['security_score' => $score]);
    
    return response()->json([
        'score' => $score,
        'checks' => $checks,
    ]);
}

private function checkSshRootDisabled(Server $server): bool
{
    $output = $this->sshService->execute(
        $server, 
        "grep -E '^PermitRootLogin' /etc/ssh/sshd_config"
    );
    return str_contains($output, 'no');
}
```

### Delete Server

```php
public function destroy(Server $server)
{
    $this->authorize('delete', $server);
    
    // Optional: uninstall agent remotely
    if ($server->status === 'online') {
        try {
            $this->sshService->execute($server, 
                'cd /opt/upanel-agent && docker compose down && rm -rf /opt/upanel-agent'
            );
        } catch (Exception $e) {
            // Log but continue - server might be unreachable
        }
    }
    
    // Cascade deletes apps, deployments, etc.
    $server->delete();
    
    ActivityLog::log('deleted', $server);
    
    return response()->json(['message' => 'Server deleted']);
}
```

---

## UI Pages

### Server List (`/servers`)

| Column | Data |
|--------|------|
| Name | Link to detail |
| Host | IP/hostname |
| Status | Badge: online/offline/error |
| Apps | Count |
| CPU/RAM | Mini progress bars |
| Last Seen | Relative time |
| Actions | Test, Reboot, Delete |

### Server Detail (`/servers/{id}`)

Tabs:
- **Overview**: Status, specs, security score
- **Apps**: List of deployed apps
- **Metrics**: CPU/RAM/Disk charts (7 days)
- **Security**: Audit results, hardening status
- **Logs**: Recent activity
- **Settings**: Edit name, SSH port, danger zone (delete)

---

## Artisan Commands

```bash
# Test SSH connection
php artisan upanel:test-server {server_id}

# Run security audit
php artisan upanel:audit-server {server_id}

# Force status refresh
php artisan upanel:refresh-server {server_id}

# List all servers
php artisan upanel:list-servers

# Cleanup pending servers (>24h old)
php artisan upanel:cleanup-pending-servers
```
