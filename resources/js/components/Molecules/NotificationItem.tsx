import { router } from '@inertiajs/react';
import { NotificationIcon } from '@/components/Atoms/NotificationIcon';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
    notification: {
        id: string;
        type: 'deployment' | 'backup' | 'server' | 'system';
        title: string;
        message: string;
        read_at: string | null;
        created_at: string;
    };
    compact?: boolean;
}

export function NotificationItem({ notification, compact = false }: NotificationItemProps) {
    const isUnread = !notification.read_at;

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.post(`/notifications/${notification.id}/read`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.delete(`/notifications/${notification.id}`);
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className={cn(
            'flex items-start gap-3 p-3 rounded-lg transition-colors',
            isUnread ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800',
            compact ? 'py-2' : 'py-3'
        )}>
            <NotificationIcon type={notification.type} />
            
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className={cn(
                        'text-sm truncate',
                        isUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'
                    )}>
                        {notification.title}
                    </p>
                    {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                </div>
                {!compact && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {notification.message}
                    </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDate(notification.created_at)}
                </p>
            </div>

            <div className="flex items-center gap-1">
                {isUnread && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAsRead} title="Mark as read">
                        <Check className="h-4 w-4 text-green-500" />
                    </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleDelete} title="Delete">
                    <X className="h-4 w-4 text-gray-400 hover:text-red-500" />
                </Button>
            </div>
        </div>
    );
}
