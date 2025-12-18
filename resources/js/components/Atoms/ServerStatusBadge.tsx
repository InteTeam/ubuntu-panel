import { cn } from '@/lib/utils';

type Status = 'online' | 'offline' | 'pending' | 'error';

interface ServerStatusBadgeProps {
    status: Status;
    className?: string;
}

export function ServerStatusBadge({ status, className }: ServerStatusBadgeProps) {
    const statusConfig: Record<Status, { label: string; color: string }> = {
        online: { label: 'Online', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        offline: { label: 'Offline', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
        error: { label: 'Error', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };

    const config = statusConfig[status] || statusConfig.error;

    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            config.color,
            className
        )}>
            <span className={cn(
                'w-1.5 h-1.5 rounded-full mr-1.5',
                status === 'online' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
            )} />
            {config.label}
        </span>
    );
}
