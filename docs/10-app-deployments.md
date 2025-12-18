# App Deployments

How applications are deployed, managed, and rolled back.

---

## Deployment Flow

```
User clicks "Deploy" in UI
    ↓
Panel creates deployment record (status: queued)
    ↓
Horizon job dispatched
    ↓
SSH to server
    ↓
Git pull/clone
    ↓
Write .env file
    ↓
docker compose build
    ↓
docker compose down (old containers)
    ↓
docker compose up -d
    ↓
Health check
    ↓
Configure Caddy (if new domain)
    ↓
Update deployment status (success/failed)
    ↓
Send notification
```

---

## Adding an App

### Required Fields

```
Server: [Select server]
Name: [my-laravel-app]
Git Repository: [https://github.com/user/repo.git]
Branch: [main]
Deploy Path: [/var/www/my-laravel-app]
```

### Optional Fields

```
Git Credentials: [Select or create] (for private repos)
Docker Compose File: [docker-compose.yml] (default)
Primary Domain: [app.example.com]
Staging Domain: [staging.app.example.com]
```

### Environment Variables

Key-value editor in UI:

```
APP_NAME=MyApp
APP_ENV=production
APP_KEY=base64:...
DB_HOST=db
DB_DATABASE=app
DB_USERNAME=app
DB_PASSWORD=secret
```

Stored encrypted, injected as `.env` during deployment.

---

## Deployment Process (Detail)

### 1. Queue the Job

```php
// DeploymentController@store
public function store(DeployRequest $request, App $app)
{
    $deployment = $app->deployments()->create([
        'user_id' => auth()->id(),
        'branch' => $request->branch ?? $app->git_branch,
        'environment' => $request->environment,
        'status' => 'queued',
    ]);
    
    DeployAppJob::dispatch($deployment);
    
    return response()->json($deployment);
}
```

### 2. Deployment Job

```php
// Jobs/DeployAppJob.php
class DeployAppJob implements ShouldQueue
{
    public $timeout = 600; // 10 minutes max
    public $tries = 1;     // Don't retry automatically
    
    public function handle(SshService $ssh, DeploymentService $deploy)
    {
        $this->deployment->update([
            'status' => 'running',
            'started_at' => now(),
        ]);
        
        try {
            $server = $this->deployment->app->server;
            $app = $this->deployment->app;
            
            // Connect
            $connection = $ssh->connect($server);
            
            // Clone or pull
            $commitHash = $deploy->pullCode($connection, $app, $this->deployment);
            
            // Write .env
            $deploy->writeEnvFile($connection, $app, $this->deployment->environment);
            
            // Build and deploy
            $deploy->dockerBuild($connection, $app);
            $deploy->dockerUp($connection, $app);
            
            // Health check
            $deploy->healthCheck($connection, $app);
            
            // Configure Caddy if needed
            $deploy->configureCaddy($connection, $app, $this->deployment->environment);
            
            // Success
            $this->deployment->update([
                'status' => 'success',
                'commit_hash' => $commitHash,
                'finished_at' => now(),
                'duration_seconds' => now()->diffInSeconds($this->deployment->started_at),
            ]);
            
            $app->update([
                'status' => 'running',
                'current_commit' => $commitHash,
            ]);
            
        } catch (Exception $e) {
            $this->deployment->update([
                'status' => 'failed',
                'finished_at' => now(),
                'error_message' => $e->getMessage(),
            ]);
            
            $app->update(['status' => 'failed']);
            
            // Notify
            Notification::send(
                $this->deployment->user,
                new DeploymentFailedNotification($this->deployment)
            );
        }
    }
}
```

### 3. Pull Code

```php
// DeploymentService.php
public function pullCode(SSH2 $ssh, App $app, Deployment $deployment): string
{
    $path = $app->deploy_path;
    $repo = $app->git_repository;
    $branch = $deployment->branch;
    
    // Check if directory exists
    $exists = trim($ssh->exec("test -d {$path}/.git && echo 'yes' || echo 'no'"));
    
    if ($exists === 'yes') {
        // Pull
        $this->log($deployment, "Pulling latest code...");
        $ssh->exec("cd {$path} && git fetch origin && git checkout {$branch} && git pull origin {$branch}");
    } else {
        // Clone
        $this->log($deployment, "Cloning repository...");
        $ssh->exec("git clone --branch {$branch} {$repo} {$path}");
    }
    
    // Get commit hash
    $hash = trim($ssh->exec("cd {$path} && git rev-parse HEAD"));
    $message = trim($ssh->exec("cd {$path} && git log -1 --pretty=%B"));
    
    $deployment->update([
        'commit_hash' => $hash,
        'commit_message' => $message,
    ]);
    
    $this->log($deployment, "Checked out {$hash}");
    
    return $hash;
}
```

### 4. Write Env File

```php
public function writeEnvFile(SSH2 $ssh, App $app, string $environment): void
{
    // Base env vars
    $vars = json_decode(decrypt($app->env_vars), true) ?? [];
    
    // Environment overrides
    if ($environment === 'production' && $app->env_production) {
        $vars = array_merge($vars, json_decode(decrypt($app->env_production), true) ?? []);
    } elseif ($environment === 'staging' && $app->env_staging) {
        $vars = array_merge($vars, json_decode(decrypt($app->env_staging), true) ?? []);
    }
    
    // Build .env content
    $content = '';
    foreach ($vars as $key => $value) {
        $escaped = str_replace('"', '\\"', $value);
        $content .= "{$key}=\"{$escaped}\"\n";
    }
    
    // Write to server
    $path = $app->deploy_path . '/.env';
    $ssh->exec("cat > {$path} << 'ENVEOF'\n{$content}\nENVOF");
    $ssh->exec("chmod 600 {$path}");
}
```

### 5. Docker Operations

```php
public function dockerBuild(SSH2 $ssh, App $app): void
{
    $path = $app->deploy_path;
    $file = $app->docker_compose_file;
    
    $this->log($deployment, "Building containers...");
    
    $output = $ssh->exec("cd {$path} && docker compose -f {$file} build --no-cache 2>&1");
    $this->log($deployment, $output);
}

public function dockerUp(SSH2 $ssh, App $app): void
{
    $path = $app->deploy_path;
    $file = $app->docker_compose_file;
    
    $this->log($deployment, "Starting containers...");
    
    // Down first (graceful)
    $ssh->exec("cd {$path} && docker compose -f {$file} down --remove-orphans 2>&1");
    
    // Up
    $output = $ssh->exec("cd {$path} && docker compose -f {$file} up -d 2>&1");
    $this->log($deployment, $output);
}
```

### 6. Health Check

```php
public function healthCheck(SSH2 $ssh, App $app): void
{
    $this->log($deployment, "Running health check...");
    
    // Wait for containers to start
    sleep(5);
    
    // Check container status
    $path = $app->deploy_path;
    $file = $app->docker_compose_file;
    
    $status = $ssh->exec("cd {$path} && docker compose -f {$file} ps --format json");
    $containers = json_decode($status, true);
    
    foreach ($containers as $container) {
        if ($container['State'] !== 'running') {
            throw new DeploymentException(
                "Container {$container['Name']} is not running: {$container['State']}"
            );
        }
    }
    
    // Optional: HTTP health endpoint
    if ($app->primary_domain) {
        $healthUrl = "http://localhost:{$this->getAppPort($app)}/health";
        $response = $ssh->exec("curl -sf {$healthUrl} || echo 'FAILED'");
        
        if (str_contains($response, 'FAILED')) {
            throw new DeploymentException("Health endpoint not responding");
        }
    }
    
    $this->log($deployment, "Health check passed");
}
```

### 7. Configure Caddy

```php
public function configureCaddy(SSH2 $ssh, App $app, string $environment): void
{
    $domain = $environment === 'production' 
        ? $app->primary_domain 
        : $app->staging_domain;
    
    if (!$domain) {
        return;
    }
    
    $port = $this->getAppPort($app);
    
    // Use Caddy API
    $config = json_encode([
        '@id' => "upanel-{$app->id}-{$environment}",
        'match' => [['host' => [$domain]]],
        'handle' => [[
            'handler' => 'reverse_proxy',
            'upstreams' => [['dial' => "localhost:{$port}"]],
        ]],
    ]);
    
    $ssh->exec("curl -X POST http://localhost:2019/config/apps/http/servers/srv0/routes -H 'Content-Type: application/json' -d '{$config}'");
    
    // Update domain record
    Domain::updateOrCreate(
        ['domain' => $domain],
        [
            'app_id' => $app->id,
            'server_id' => $app->server_id,
            'environment' => $environment,
            'upstream_port' => $port,
            'status' => 'active',
            'caddy_configured' => true,
        ]
    );
}
```

---

## Rollback

### Process

```
User clicks "Rollback to [deployment]"
    ↓
Confirm dialog (destructive action)
    ↓
Create new deployment record (is_rollback: true)
    ↓
git checkout {commit_hash}
    ↓
docker compose build && up
    ↓
Health check
```

### Implementation

```php
public function rollback(Deployment $targetDeployment)
{
    $app = $targetDeployment->app;
    
    $rollback = $app->deployments()->create([
        'user_id' => auth()->id(),
        'commit_hash' => $targetDeployment->commit_hash,
        'branch' => $targetDeployment->branch,
        'environment' => $targetDeployment->environment,
        'status' => 'queued',
        'is_rollback' => true,
        'rollback_from_id' => $app->deployments()->latest()->first()->id,
    ]);
    
    RollbackAppJob::dispatch($rollback, $targetDeployment->commit_hash);
    
    return response()->json($rollback);
}
```

---

## Deployment Logs

### Real-time Streaming

Option 1: **Polling** (MVP - simpler)

```php
// DeploymentController@log
public function log(Deployment $deployment)
{
    return response()->json([
        'status' => $deployment->status,
        'log' => $deployment->log,
    ]);
}
```

Frontend polls every 2 seconds during deployment.

Option 2: **Server-Sent Events** (Future)

```php
public function streamLog(Deployment $deployment)
{
    return response()->stream(function () use ($deployment) {
        while ($deployment->fresh()->status === 'running') {
            echo "data: " . json_encode(['log' => $deployment->log]) . "\n\n";
            ob_flush();
            flush();
            sleep(1);
        }
    }, 200, [
        'Content-Type' => 'text/event-stream',
        'Cache-Control' => 'no-cache',
    ]);
}
```

---

## Container Management

### View Containers

```php
public function containers(App $app)
{
    $ssh = $this->sshService->connect($app->server);
    
    $output = $ssh->exec(
        "cd {$app->deploy_path} && docker compose ps --format json"
    );
    
    return response()->json(json_decode($output, true));
}
```

### Container Actions

```php
public function restartContainer(App $app, string $container)
{
    $ssh = $this->sshService->connect($app->server);
    
    $ssh->exec(
        "cd {$app->deploy_path} && docker compose restart {$container}"
    );
    
    ActivityLog::log('restarted_container', $app, ['container' => $container]);
    
    return response()->json(['message' => 'Container restarted']);
}

public function containerLogs(App $app, string $container)
{
    $ssh = $this->sshService->connect($app->server);
    
    $logs = $ssh->exec(
        "cd {$app->deploy_path} && docker compose logs --tail=200 {$container}"
    );
    
    return response()->json(['logs' => $logs]);
}
```

---

## UI Pages

### App List (`/apps`)

| Column | Data |
|--------|------|
| Name | Link to detail |
| Server | Server name |
| Status | Badge: running/stopped/failed/deploying |
| Domain | Primary domain link |
| Last Deploy | Relative time + commit |
| Actions | Deploy, Stop, Delete |

### App Detail (`/apps/{id}`)

Tabs:
- **Overview**: Status, domains, current commit
- **Deployments**: History table with rollback buttons
- **Containers**: List with restart/logs buttons
- **Environment**: Key-value editor (production + staging)
- **Domains**: Manage domains + SSL status
- **Settings**: Git config, paths, danger zone

### Deploy Modal

```
Branch: [main] (dropdown of remote branches)
Environment: [Production] / [Staging]
[Deploy]
```

Shows live log output during deployment.

---

## Error Handling

### Common Failures

| Error | Cause | Auto-Recovery |
|-------|-------|---------------|
| Git clone failed | Invalid repo URL, no access | No - fix config |
| Build failed | Dockerfile error | No - fix code |
| Container crash | App error | No - check logs |
| Port conflict | Another app using port | No - change port |
| Disk full | No space | Alert, manual cleanup |

### Deployment Timeout

If deployment exceeds 10 minutes:

```php
public function failed(Throwable $exception)
{
    $this->deployment->update([
        'status' => 'failed',
        'error_message' => 'Deployment timed out after 10 minutes',
        'finished_at' => now(),
    ]);
    
    // Notify
    Notification::send(...);
}
```

---

## Zero-Downtime Deployment (Future)

MVP does simple down/up. Future enhancement:

```
docker compose up -d --no-deps --scale web=2 web
    ↓
Wait for new container healthy
    ↓
docker compose stop web_old
    ↓
docker compose rm web_old
```

Requires:
- Health checks in docker-compose.yml
- Caddy upstream health checks
- Proper signal handling in app
