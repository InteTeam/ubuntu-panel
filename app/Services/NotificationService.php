<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Mail;

final class NotificationService
{
    public function getForUser(User $user, int $limit = 20): Collection
    {
        return Notification::forUser($user)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function getUnreadCount(User $user): int
    {
        return Notification::forUser($user)->unread()->count();
    }

    public function create(User $user, string $type, string $title, string $message, array $data = []): Notification
    {
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);

        if ($user->email_notifications) {
            $this->sendEmail($user, $notification);
        }

        return $notification;
    }

    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    public function markAllAsRead(User $user): int
    {
        return Notification::forUser($user)
            ->unread()
            ->update(['read_at' => now()]);
    }

    public function delete(Notification $notification): void
    {
        $notification->delete();
    }

    public function deleteAllForUser(User $user): int
    {
        return Notification::forUser($user)->delete();
    }

    // Notification types
    public function notifyDeploymentStarted(User $user, $app, $deployment): Notification
    {
        return $this->create($user, 'deployment', 'Deployment Started', 
            "Deployment for {$app->name} has started.",
            ['app_id' => $app->id, 'deployment_id' => $deployment->id]
        );
    }

    public function notifyDeploymentSuccess(User $user, $app, $deployment): Notification
    {
        return $this->create($user, 'deployment', 'Deployment Successful',
            "Deployment for {$app->name} completed successfully.",
            ['app_id' => $app->id, 'deployment_id' => $deployment->id]
        );
    }

    public function notifyDeploymentFailed(User $user, $app, $deployment, string $error): Notification
    {
        return $this->create($user, 'deployment', 'Deployment Failed',
            "Deployment for {$app->name} failed: {$error}",
            ['app_id' => $app->id, 'deployment_id' => $deployment->id, 'error' => $error]
        );
    }

    public function notifyBackupSuccess(User $user, $backup): Notification
    {
        return $this->create($user, 'backup', 'Backup Completed',
            "Backup for {$backup->app->name} completed successfully.",
            ['backup_id' => $backup->id, 'app_id' => $backup->app_id]
        );
    }

    public function notifyBackupFailed(User $user, $backup, string $error): Notification
    {
        return $this->create($user, 'backup', 'Backup Failed',
            "Backup for {$backup->app->name} failed: {$error}",
            ['backup_id' => $backup->id, 'app_id' => $backup->app_id, 'error' => $error]
        );
    }

    public function notifyServerOffline(User $user, $server): Notification
    {
        return $this->create($user, 'server', 'Server Offline',
            "Server {$server->name} is not responding.",
            ['server_id' => $server->id]
        );
    }

    public function notifyServerOnline(User $user, $server): Notification
    {
        return $this->create($user, 'server', 'Server Online',
            "Server {$server->name} is back online.",
            ['server_id' => $server->id]
        );
    }

    private function sendEmail(User $user, Notification $notification): void
    {
        Mail::to($user->email)->queue(
            new \App\Mail\NotificationMail($notification)
        );
    }
}
