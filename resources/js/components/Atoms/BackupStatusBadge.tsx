import { cn } from '@/lib/utils';

type Status = 'queued' | 'running' | 'success' | 'failed';

interface BackupStatusBadgeProps {
    status: Status;
    className?: string;
}

export function BackupStatusBadge({ status, className }: BackupStatusBadgeProps) {
    const statusConfig: Record<Status, { label: string; color: string }> = {
        queued: { label: 'Queued', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        running: { label: 'Running', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
        success: { label: 'Success', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
        failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    };

    const config = statusConfig[status] || statusConfig.queued;

    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            config.color,
            className
        )}>
            {status === 'running' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
            )}
            {config.label}
        </span>
    );
}
