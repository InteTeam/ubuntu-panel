<?php

declare(strict_types=1);

namespace App\Mail;

use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

final class NotificationMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(
        public Notification $notification,
    ) {}

    public function envelope(): Envelope
    {
        $prefix = match ($this->notification->type) {
            'deployment' => '🚀',
            'backup' => '💾',
            'server' => '🖥️',
            default => '🔔',
        };

        return new Envelope(
            subject: "{$prefix} {$this->notification->title} - UPanel",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.notification',
            with: [
                'notification' => $this->notification,
                'url' => url('/notifications'),
            ],
        );
    }
}
