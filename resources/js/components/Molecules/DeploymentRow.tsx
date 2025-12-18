import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DeploymentStatusBadge } from '@/components/Atoms/DeploymentStatusBadge';
import { RotateCcw, GitCommit, User, Clock } from 'lucide-react';

interface DeploymentRowProps {
    deployment: {
        id: string;
        commit_hash: string;
        commit_message?: string;
        branch: string;
        environment: string;
        status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
        created_at: string;
        duration_seconds?: number;
        is_rollback: boolean;
        user?: {
            email: string;
        };
    };
    appId: string;
    canRollback?: boolean;
}

export function DeploymentRow({ deployment, appId, canRollback = false }: DeploymentRowProps) {
    const handleRollback = () => {
        if (confirm('Are you sure you want to rollback to this deployment?')) {
            router.post(`/apps/${appId}/rollback/${deployment.id}`);
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '-';
        if (seconds < 60) return `${seconds}s`;
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 last:border-b-0">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <DeploymentStatusBadge status={deployment.status} />
                
                <div className="flex items-center gap-2 min-w-0">
                    <GitCommit className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <code className="text-sm font-mono">{deployment.commit_hash.slice(0, 7)}</code>
                    {deployment.is_rollback && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                            Rollback
                        </span>
                    )}
                </div>

                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {deployment.environment}
                </span>

                {deployment.commit_message && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {deployment.commit_message}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {deployment.user && (
                    <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{deployment.user.email}</span>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(deployment.duration_seconds)}</span>
                </div>

                <span className="text-xs">{formatDate(deployment.created_at)}</span>

                {canRollback && deployment.status === 'success' && (
                    <Button variant="ghost" size="sm" onClick={handleRollback}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
