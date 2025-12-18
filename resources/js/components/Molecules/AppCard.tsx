import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppStatusBadge } from '@/components/Atoms/AppStatusBadge';
import { AppWindow, GitBranch, Server } from 'lucide-react';

interface AppCardProps {
    app: {
        id: string;
        name: string;
        git_repository: string;
        git_branch: string;
        status: 'pending' | 'deploying' | 'running' | 'stopped' | 'failed';
        server?: {
            id: string;
            name: string;
        };
        deployments_count?: number;
    };
}

export function AppCard({ app }: AppCardProps) {
    const repoName = app.git_repository.split('/').slice(-2).join('/').replace('.git', '');

    return (
        <Link href={`/apps/${app.id}`}>
            <Card className="hover:border-blue-500 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <AppWindow className="h-5 w-5 text-gray-500" />
                        {app.name}
                    </CardTitle>
                    <AppStatusBadge status={app.status} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            <span className="truncate">{repoName}</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                {app.git_branch}
                            </span>
                        </div>
                        
                        {app.server && (
                            <div className="flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                <span>{app.server.name}</span>
                            </div>
                        )}

                        {app.deployments_count !== undefined && app.deployments_count > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                                {app.deployments_count} deployment{app.deployments_count !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
