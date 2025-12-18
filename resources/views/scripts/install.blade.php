#!/bin/bash
set -e

# UPanel Server Installation Script
# Generated for: {{ $panelUrl }}

PANEL_URL="{{ $panelUrl }}"
TOKEN="{{ $token }}"
AGENT_PORT="{{ $agentPort }}"
SSH_USER="upanel"

echo "==================================="
echo "  UPanel Server Installation"
echo "==================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Error: Please run as root (sudo)"
    exit 1
fi

# Check OS
if ! grep -q "Ubuntu" /etc/os-release; then
    echo "Error: This script only supports Ubuntu"
    exit 1
fi

echo "[1/6] Creating upanel user..."
if ! id "$SSH_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$SSH_USER"
    usermod -aG sudo "$SSH_USER"
    echo "$SSH_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/upanel
    chmod 440 /etc/sudoers.d/upanel
fi

echo "[2/6] Setting up SSH key..."
mkdir -p /home/$SSH_USER/.ssh
chmod 700 /home/$SSH_USER/.ssh

# Fetch and install public key
curl -sf "$PANEL_URL/api/install/$TOKEN/pubkey" > /home/$SSH_USER/.ssh/authorized_keys
chmod 600 /home/$SSH_USER/.ssh/authorized_keys
chown -R $SSH_USER:$SSH_USER /home/$SSH_USER/.ssh

echo "[3/6] Installing Docker..."
if ! command -v docker &>/dev/null; then
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker $SSH_USER
fi

echo "[4/6] Setting up UPanel agent..."
mkdir -p /opt/upanel
cd /opt/upanel

# Generate agent token
AGENT_TOKEN=$(openssl rand -hex 32)

# Create agent docker-compose
cat > docker-compose.yml << EOF
services:
  agent:
    image: ghcr.io/upanel/agent:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:$AGENT_PORT:8443"
    environment:
      PANEL_URL: $PANEL_URL
      AGENT_TOKEN: $AGENT_TOKEN
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /:/host:ro
EOF

chown -R $SSH_USER:$SSH_USER /opt/upanel

echo "[5/6] Starting agent..."
docker compose pull
docker compose up -d

echo "[6/6] Completing registration..."
OS_VERSION=$(lsb_release -ds 2>/dev/null || echo "Unknown")
CPU_CORES=$(nproc)
RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
DISK_GB=$(df -BG / | awk 'NR==2{print $2}' | tr -d 'G')

curl -sf -X POST "$PANEL_URL/api/install/$TOKEN/complete" \
    -H "Content-Type: application/json" \
    -d "{\"agent_token\":\"$AGENT_TOKEN\",\"os_version\":\"$OS_VERSION\",\"cpu_cores\":$CPU_CORES,\"ram_mb\":$RAM_MB,\"disk_gb\":$DISK_GB}"

echo ""
echo "==================================="
echo "  Installation Complete!"
echo "==================================="
echo "Your server is now connected to UPanel."
