import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { BackupStatusBadge } from '@/components/Atoms/BackupStatusBadge';
import { Trash2, Database, Archive, Clock } from 'lucide-react';

interface BackupRowProps {
    backup: {
        id: string;
        type: 'full' | 'database';
        status: 'queued' | 'running' | 'success' | 'failed';
        file_size_bytes?: number;
        created_at: string;
        finished_at?: string;
        app?: { id: string; name: string };
        destination?: { id: string; name: string };
        error_message?: string;
    };
}

export function BackupRow({ backup }: BackupRowProps) {
    const handleDelete = () => {
        if (confirm('Delete this backup?')) {
            router.delete(`/backups/${backup.id}`);
        }
    };

    const formatSize = (bytes?: number) => {
        if (!bytes) return '-';
        const units = ['B', 'KB', 'MB', 'GB'];
        const factor = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, factor)).toFixed(2)} ${units[factor]}`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 last:border-b-0">
            <div className="flex items-center gap-4 flex-1">
                <BackupStatusBadge status={backup.status} />
                
                <div className="flex items-center gap-2">
                    {backup.type === 'database' ? (
                        <Database className="h-4 w-4 text-gray-400" />
                    ) : (
                        <Archive className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm font-medium capitalize">{backup.type}</span>
                </div>

                {backup.app && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {backup.app.name}
                    </span>
                )}

                {backup.destination && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        {backup.destination.name}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {backup.status === 'success' && (
                    <span>{formatSize(backup.file_size_bytes)}</span>
                )}

                {backup.status === 'failed' && backup.error_message && (
                    <span className="text-red-500 text-xs max-w-xs truncate" title={backup.error_message}>
                        {backup.error_message}
                    </span>
                )}

                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{formatDate(backup.created_at)}</span>
                </div>

                <Button variant="ghost" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
            </div>
        </div>
    );
}
