# Notifications

Email alerts and in-app notifications.

---

## Notification Types

| Event | In-App | Email | Severity |
|-------|--------|-------|----------|
| Deployment success | ✅ | ❌ | info |
| Deployment failed | ✅ | ✅ | critical |
| Server offline | ✅ | ✅ | critical |
| Server back online | ✅ | ❌ | info |
| Backup success | ✅ | ❌ | info |
| Backup failed | ✅ | ✅ | critical |
| SSL expiring (7 days) | ✅ | ✅ | warning |
| SSL expired | ✅ | ✅ | critical |
| Security audit failed | ✅ | ✅ | warning |
| Disk space low (<10%) | ✅ | ✅ | warning |
| Rate limit triggered | ✅ | ❌ | info |
| New login detected | ❌ | ✅ | info |

---

## Implementation

### Notification Model

```php
// app/Models/Notification.php
class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'notifiable_type',
        'notifiable_id',
        'read_at',
        'email_sent_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'email_sent_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }
}
```

### Notification Service

```php
// app/Services/NotificationService.php
class NotificationService
{
    public function send(
        User $user,
        string $type,
        string $title,
        string $message,
        ?Model $notifiable = null,
        bool $sendEmail = false
    ): Notification {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'notifiable_type' => $notifiable?->getMorphClass(),
            'notifiable_id' => $notifiable?->getKey(),
        ]);

        if ($sendEmail && $this->shouldSendEmail($user, $type)) {
            SendNotificationEmail::dispatch($notification);
        }

        return $notification;
    }

    public function notifyAllAdmins(
        string $type,
        string $title,
        string $message,
        ?Model $notifiable = null,
        bool $sendEmail = false
    ): void {
        User::where('role', 'admin')->each(function ($user) use ($type, $title, $message, $notifiable, $sendEmail) {
            $this->send($user, $type, $title, $message, $notifiable, $sendEmail);
        });
    }

    private function shouldSendEmail(User $user, string $type): bool
    {
        // Check user preferences (future)
        // For MVP, always send for critical types
        return in_array($type, [
            'deployment_failed',
            'server_offline',
            'backup_failed',
            'ssl_expiring',
            'ssl_expired',
        ]);
    }
}
```

### Notification Events

```php
// Deployment Failed
class DeploymentFailedNotification
{
    public function __construct(
        public Deployment $deployment
    ) {}

    public function send(): void
    {
        $app = $this->deployment->app;
        
        app(NotificationService::class)->send(
            user: $this->deployment->user ?? User::first(),
            type: 'deployment_failed',
            title: "Deployment failed: {$app->name}",
            message: "Deployment to {$this->deployment->environment} failed. Error: {$this->deployment->error_message}",
            notifiable: $this->deployment,
            sendEmail: true
        );
    }
}

// Server Offline
class ServerOfflineNotification
{
    public function __construct(
        public Server $server
    ) {}

    public function send(): void
    {
        app(NotificationService::class)->notifyAllAdmins(
            type: 'server_offline',
            title: "Server offline: {$this->server->name}",
            message: "Server {$this->server->host} has not responded for 5 minutes.",
            notifiable: $this->server,
            sendEmail: true
        );
    }
}

// Backup Failed
class BackupFailedNotification
{
    public function __construct(
        public Backup $backup
    ) {}

    public function send(): void
    {
        app(NotificationService::class)->notifyAllAdmins(
            type: 'backup_failed',
            title: "Backup failed: {$this->backup->app->name}",
            message: "Backup failed. Error: {$this->backup->error_message}",
            notifiable: $this->backup,
            sendEmail: true
        );
    }
}

// SSL Expiring
class SslExpiringNotification
{
    public function __construct(
        public Domain $domain,
        public int $daysRemaining
    ) {}

    public function send(): void
    {
        app(NotificationService::class)->notifyAllAdmins(
            type: 'ssl_expiring',
            title: "SSL expiring: {$this->domain->domain}",
            message: "SSL certificate expires in {$this->daysRemaining} days.",
            notifiable: $this->domain,
            sendEmail: true
        );
    }
}
```

---

## Email Templates

### Base Layout

```blade
{{-- resources/views/emails/layout.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
        .alert-critical { border-left: 4px solid #ef4444; }
        .alert-warning { border-left: 4px solid #f59e0b; }
        .alert-info { border-left: 4px solid #3b82f6; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>UPanel</h1>
        </div>
        <div class="content {{ $alertClass ?? '' }}">
            @yield('content')
        </div>
        <div class="footer">
            <p>UPanel - Server Management</p>
            <p><a href="{{ config('app.url') }}">Open Panel</a></p>
        </div>
    </div>
</body>
</html>
```

### Deployment Failed Email

```blade
{{-- resources/views/emails/deployment-failed.blade.php --}}
@extends('emails.layout', ['alertClass' => 'alert-critical'])

@section('content')
    <h2>Deployment Failed</h2>
    
    <p>A deployment has failed and requires your attention.</p>
    
    <table style="width: 100%; margin: 20px 0;">
        <tr>
            <td><strong>App:</strong></td>
            <td>{{ $deployment->app->name }}</td>
        </tr>
        <tr>
            <td><strong>Server:</strong></td>
            <td>{{ $deployment->app->server->name }}</td>
        </tr>
        <tr>
            <td><strong>Branch:</strong></td>
            <td>{{ $deployment->branch }}</td>
        </tr>
        <tr>
            <td><strong>Environment:</strong></td>
            <td>{{ $deployment->environment }}</td>
        </tr>
        <tr>
            <td><strong>Time:</strong></td>
            <td>{{ $deployment->finished_at->format('Y-m-d H:i:s') }} UTC</td>
        </tr>
    </table>
    
    <div style="background: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <strong>Error:</strong><br>
        <code>{{ $deployment->error_message }}</code>
    </div>
    
    <p style="text-align: center;">
        <a href="{{ route('deployments.show', $deployment) }}" class="button">
            View Deployment Logs
        </a>
    </p>
@endsection
```

### Server Offline Email

```blade
{{-- resources/views/emails/server-offline.blade.php --}}
@extends('emails.layout', ['alertClass' => 'alert-critical'])

@section('content')
    <h2>Server Offline</h2>
    
    <p>A server is not responding and may require immediate attention.</p>
    
    <table style="width: 100%; margin: 20px 0;">
        <tr>
            <td><strong>Server:</strong></td>
            <td>{{ $server->name }}</td>
        </tr>
        <tr>
            <td><strong>Host:</strong></td>
            <td>{{ $server->host }}</td>
        </tr>
        <tr>
            <td><strong>Last Seen:</strong></td>
            <td>{{ $server->last_seen_at?->format('Y-m-d H:i:s') }} UTC</td>
        </tr>
        <tr>
            <td><strong>Apps Affected:</strong></td>
            <td>{{ $server->apps->count() }}</td>
        </tr>
    </table>
    
    <p style="text-align: center;">
        <a href="{{ route('servers.show', $server) }}" class="button">
            View Server
        </a>
    </p>
@endsection
```

---

## Scheduled Checks

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule): void
{
    // Check server status every 2 minutes
    $schedule->job(new CheckServerStatus)->everyTwoMinutes();
    
    // Check SSL certificates daily
    $schedule->job(new CheckSslCertificates)->dailyAt('06:00');
    
    // Check disk space every hour
    $schedule->job(new CheckDiskSpace)->hourly();
    
    // Cleanup old notifications weekly
    $schedule->job(new CleanupNotifications)->weekly();
}
```

### SSL Certificate Check

```php
// Jobs/CheckSslCertificates.php
class CheckSslCertificates implements ShouldQueue
{
    public function handle(SshService $ssh): void
    {
        Domain::where('ssl_enabled', true)
            ->whereNotNull('ssl_expires_at')
            ->where('ssl_expires_at', '<=', now()->addDays(7))
            ->each(function ($domain) {
                $daysRemaining = now()->diffInDays($domain->ssl_expires_at);
                
                (new SslExpiringNotification($domain, $daysRemaining))->send();
            });
    }
}
```

### Disk Space Check

```php
// Jobs/CheckDiskSpace.php
class CheckDiskSpace implements ShouldQueue
{
    public function handle(): void
    {
        Server::where('status', 'online')->each(function ($server) {
            $metrics = $server->metrics()->latest()->first();
            
            if (!$metrics) return;
            
            $usedPercent = ($metrics->disk_used_gb / $metrics->disk_total_gb) * 100;
            
            if ($usedPercent >= 90) {
                (new DiskSpaceLowNotification($server, $usedPercent))->send();
            }
        });
    }
}
```

---

## In-App Notification UI

### Bell Icon (Header)

```tsx
// components/NotificationBell.tsx
export function NotificationBell() {
    const { data: notifications } = useNotifications();
    const unreadCount = notifications?.filter(n => !n.read_at).length ?? 0;
    
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <NotificationList notifications={notifications} />
            </PopoverContent>
        </Popover>
    );
}
```

### Notification List

```tsx
// components/NotificationList.tsx
export function NotificationList({ notifications }) {
    const markAllRead = useMarkAllNotificationsRead();
    
    return (
        <div>
            <div className="flex justify-between items-center p-2 border-b">
                <span className="font-semibold">Notifications</span>
                <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                    Mark all read
                </Button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications?.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No notifications</p>
                ) : (
                    notifications?.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))
                )}
            </div>
        </div>
    );
}
```

---

## Configuration

```php
// config/upanel.php
return [
    'notifications' => [
        'email' => [
            'enabled' => env('UPANEL_EMAIL_NOTIFICATIONS', true),
            'from_address' => env('MAIL_FROM_ADDRESS', 'noreply@upanel.example.com'),
            'from_name' => env('MAIL_FROM_NAME', 'UPanel'),
        ],
        'retention_days' => 30, // Auto-delete old notifications
    ],
];
```

### Mail Configuration

```env
# .env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@upanel.example.com
MAIL_FROM_NAME="UPanel"
```

For testing, use Mailtrap or `MAIL_MAILER=log`.
