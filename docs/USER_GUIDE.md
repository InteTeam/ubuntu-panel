# UPanel User Guide

Complete guide from installation to deploying your first application.

---

## Table of Contents

1. [Initial Setup](#1-initial-setup)
2. [First Login & Security](#2-first-login--security)
3. [Adding Your First Server](#3-adding-your-first-server)
4. [Installing UPanel Agent on Your VPS](#4-installing-upanel-agent-on-your-vps)
5. [Creating Your First Application](#5-creating-your-first-application)
6. [Deploying Your Application](#6-deploying-your-application)
7. [Managing Deployments](#7-managing-deployments)
8. [Setting Up Backups](#8-setting-up-backups)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Initial Setup

After installing UPanel on your panel server, you need to create the admin account.

### Step 1: Access Setup Page

Open your browser and navigate to:
```
http://your-panel-domain.com/setup
```

### Step 2: Create Admin Account

Fill in the form:
- **Email**: Your admin email (e.g., `admin@yourcompany.com`)
- **Password**: Strong password (min 8 characters)
- **Confirm Password**: Repeat password

Click **"Create Admin Account"**

You'll be redirected to the login page with a success message.

> **Note**: The setup page is only accessible once. After creating the admin account, it becomes unavailable.

---

## 2. First Login & Security

### Step 1: Log In

Go to `/login` and enter your credentials.

### Step 2: Set Up Two-Factor Authentication (Recommended)

After login, go to **Security** in the sidebar.

1. Click **"Enable 2FA"**
2. Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
3. Enter the 6-digit code from your app
4. Save the recovery codes in a safe place

From now on, you'll need both password and 2FA code to log in.

---

## 3. Adding Your First Server

This registers a server in UPanel. The actual agent installation comes next.

### Step 1: Navigate to Servers

Click **"Servers"** in the sidebar, then click **"+ Add Server"**

### Step 2: Fill Server Details

| Field | Description | Example |
|-------|-------------|---------|
| **Server Name** | Friendly name for this server | `Production VPS` |
| **Host** | IP address or domain of your VPS | `203.0.113.50` or `vps.example.com` |
| **SSH Port** | SSH port (usually 22) | `22` |
| **SSH Username** | User for SSH connections | `upanel` (default) |
| **Agent Port** | Port for UPanel agent | `8443` (default) |

### Step 3: Create Server

Click **"Create Server"**

You'll be taken to the server details page showing:
- Status: **Pending** (yellow badge)
- An install command to run on your VPS

---

## 4. Installing UPanel Agent on Your VPS

Now you need to run the install script on your actual VPS server.

### Prerequisites

Your VPS must have:
- Ubuntu 22.04 or 24.04 LTS
- Root or sudo access
- Internet connection
- Ports open: SSH (22) and Agent port (8443)

### Step 1: Copy the Install Command

On the server details page in UPanel, you'll see:

```bash
curl -sSL https://your-panel.com/install/abc123token | sudo bash
```

Copy this command.

### Step 2: SSH into Your VPS

```bash
ssh root@your-vps-ip
```

### Step 3: Run the Install Script

Paste and run the install command. The script will:

```
[1/6] Creating upanel user...
[2/6] Setting up SSH key...
[3/6] Installing Docker...
[4/6] Setting up UPanel Agent...
[5/6] Starting Agent...
[6/6] Completing registration...

✓ Installation complete!
```

### Step 4: Verify in UPanel

Go back to UPanel in your browser. The server status should change from **Pending** to **Online** (green badge).

You'll now see:
- CPU, RAM, Disk usage metrics
- OS version and system specs
- Connection status

> **Troubleshooting**: If status stays "Pending", check:
> - Is port 8443 open on your VPS firewall?
> - Can the panel reach your VPS IP?
> - Check agent logs: `docker logs upanel-agent`

---

## 5. Creating Your First Application

Now let's deploy a Laravel application with Docker.

### Prerequisites

Your app needs:
- A Git repository (GitHub, GitLab, Gitea, etc.)
- A `docker-compose.yml` file in the repo
- Environment variables defined

### Step 1: Navigate to Apps

Click **"Apps"** in the sidebar, then click **"+ Add Application"**

### Step 2: Basic Information

| Field | Value |
|-------|-------|
| **Application Name** | `My Laravel App` |
| **Server** | Select your server from dropdown |

### Step 3: Git Repository

| Field | Value |
|-------|-------|
| **Repository URL** | `https://github.com/youruser/your-laravel-app.git` |
| **Git Branch** | `main` |
| **Git Credentials** | "Public repository" or select saved credentials |

#### For Private Repositories

If your repo is private, you need to add Git credentials first:

1. Go to **Settings** → **Git Credentials**
2. Click **"Add Credentials"**
3. Choose type:
   - **HTTPS**: Use a Personal Access Token as password
   - **SSH**: Paste your private key
4. Save and select it in the app form

### Step 4: Deployment Settings

| Field | Value |
|-------|-------|
| **Deploy Path** | `/home/upanel/apps/my-laravel-app` |
| **Docker Compose File** | `docker-compose.yml` |
| **Primary Domain** | `app.yourdomain.com` (optional) |
| **Staging Domain** | `staging.yourdomain.com` (optional) |

### Step 5: Environment Variables

Add your Laravel environment variables:

**Production:**
```
APP_NAME=MyLaravelApp
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.yourdomain.com
APP_KEY=base64:your-key-here

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=laravel
DB_USERNAME=laravel
DB_PASSWORD=your-db-password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis
```

**Staging** (optional):
```
APP_ENV=staging
APP_DEBUG=true
APP_URL=https://staging.yourdomain.com
```

### Step 6: Create Application

Click **"Create Application"**

The app is now registered but not yet deployed.

---

## 6. Deploying Your Application

### Step 1: Trigger Deployment

On the app details page, click the **"Deploy"** button.

### Step 2: Confirm

A dialog asks: "Deploy to production?"

Click **"Confirm"**

### Step 3: Monitor Deployment

The deployment appears in "Recent Deployments" with status:

1. **Queued** - Waiting in queue
2. **Running** - Deployment in progress
3. **Success** - Deployed successfully
4. **Failed** - Something went wrong

### What Happens During Deployment

1. SSH connection to your server
2. Git clone (first time) or pull (updates)
3. `.env` file written from your environment variables
4. `docker compose build` - builds containers
5. `docker compose down` - stops old containers
6. `docker compose up -d` - starts new containers
7. Health check - verifies containers are running
8. Caddy configuration - sets up domain with SSL

### Step 4: Access Your App

Once status shows **Success**:
- Click the domain link in the app summary
- Your Laravel app should be live!

---

## 7. Managing Deployments

### View Deployment History

The app details page shows recent deployments with:
- Status badge
- Branch name
- Environment (production/staging)
- Who triggered it
- Timestamp
- Duration

### Rollback to Previous Version

If a deployment breaks something:

1. Find a working deployment in the history
2. Click **"Rollback"** on that deployment
3. Confirm the rollback

This creates a new deployment that reverts to that commit.

### Redeploy

To deploy the latest code:
1. Push changes to your Git branch
2. Click **"Deploy"** in UPanel
3. It pulls latest code and redeploys

---

## 8. Setting Up Backups

### Step 1: Create Backup Destination

Go to **Backups** → **"Add Destination"**

Choose a storage type:

| Type | Use Case |
|------|----------|
| **Local** | Backup to server disk (quick, but risky) |
| **SFTP** | Backup to another server via SSH |
| **Backblaze B2** | Cheap cloud storage |
| **Google Drive** | Client-accessible backups |

Fill in the credentials for your chosen storage.

### Step 2: Create Backup Schedule

Click **"Add Schedule"**

| Field | Description |
|-------|-------------|
| **Name** | `Daily Production Backup` |
| **App** | Select your app |
| **Destination** | Select storage destination |
| **Schedule** | Cron expression (e.g., `0 2 * * *` for 2 AM daily) |
| **Retention** | How many backups to keep |

### Step 3: Manual Backup

You can also trigger backups manually:
1. Go to Backups
2. Click **"Backup Now"** on any schedule

---

## 9. Troubleshooting

### Server Won't Connect

**Symptoms**: Status stays "Pending" or "Offline"

**Check**:
```bash
# On your VPS, check if agent is running
docker ps | grep upanel

# Check agent logs
docker logs upanel-agent

# Verify port is open
sudo ufw status
sudo ufw allow 8443
```

### Deployment Fails

**Symptoms**: Deployment status shows "Failed"

**Common causes**:

| Error | Solution |
|-------|----------|
| "Git clone failed" | Check repo URL and credentials |
| "Build failed" | Check Dockerfile syntax |
| "Container crash" | Check app logs: `docker logs container-name` |
| "Health check failed" | Verify app starts correctly |

**View deployment logs**:
1. Click on the failed deployment
2. Check the log output for specific errors

### App Not Accessible

**Symptoms**: Domain shows error or doesn't load

**Check**:
```bash
# On your VPS, verify containers are running
cd /home/upanel/apps/your-app
docker compose ps

# Check container logs
docker compose logs

# Verify Caddy is routing correctly
docker logs caddy
```

### SSL Certificate Issues

**Symptoms**: Browser shows certificate warning

**Check**:
- Is your domain DNS pointing to the VPS IP?
- Is port 443 open on firewall?
- Wait a few minutes for Let's Encrypt to issue certificate

```bash
# Check Caddy logs for certificate errors
docker logs caddy | grep -i cert
```

---

## Quick Reference

### Common Commands on Your VPS

```bash
# Check UPanel agent status
docker ps | grep upanel

# View agent logs
docker logs upanel-agent

# Restart agent
cd /opt/upanel && docker compose restart

# Check app containers
cd /home/upanel/apps/your-app
docker compose ps
docker compose logs -f

# Restart app containers
docker compose restart
```

### UPanel Navigation

| Section | Purpose |
|---------|---------|
| **Dashboard** | Overview of all servers and apps |
| **Servers** | Manage VPS servers |
| **Apps** | Manage deployed applications |
| **Backups** | Configure backup schedules |
| **Security** | 2FA, sessions, login history |
| **Settings** | Profile and preferences |

---

## Next Steps

- Set up backup schedules for all production apps
- Configure monitoring alerts (coming soon)
- Add staging environments for testing
- Review security settings regularly

---

*Need help? Check the [Troubleshooting](#9-troubleshooting) section or open an issue on GitHub.*
