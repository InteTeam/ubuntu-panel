import { cn } from '@/lib/utils';

type Status = 'pending' | 'deploying' | 'running' | 'stopped' | 'failed';

interface AppStatusBadgeProps {
    status: Status;
    className?: string;
}

export function AppStatusBadge({ status, className }: AppStatusBadgeProps) {
    const statusConfig: Record<Status, { label: string; color: string }> = {
        pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        deploying: { label: 'Deploying', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
        running: { label: 'Running', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        stopped: { label: 'Stopped', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            config.color,
            className
        )}>
            {status === 'deploying' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
            )}
            {status === 'running' && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
            )}
            {config.label}
        </span>
    );
}
