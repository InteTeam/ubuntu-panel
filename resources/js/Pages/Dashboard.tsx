import { Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerStatusBadge } from '@/components/Atoms/ServerStatusBadge';
import { DeploymentStatusBadge } from '@/components/Atoms/DeploymentStatusBadge';
import { BackupStatusBadge } from '@/components/Atoms/BackupStatusBadge';
import { Server, AppWindow, Rocket, Archive, Clock } from 'lucide-react';

interface Stats {
    servers: number;
    servers_online: number;
    apps: number;
    apps_running: number;
    deployments_today: number;
    backups_today: number;
}

interface Deployment {
    id: string;
    status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
    environment: string;
    created_at: string;
    app?: { id: string; name: string };
    user?: { email: string };
}

interface Backup {
    id: string;
    type: 'full' | 'database';
    status: 'queued' | 'running' | 'success' | 'failed';
    created_at: string;
    app?: { id: string; name: string };
}

interface ServerItem {
    id: string;
    name: string;
    host: string;
    status: string;
    last_seen_at: string | null;
}

interface Props {
    stats: Stats;
    recentDeployments: Deployment[];
    recentBackups: Backup[];
    servers: ServerItem[];
}

export default function Dashboard({ stats, recentDeployments, recentBackups, servers }: Props) {
    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <AuthLayout title="Dashboard - UPanel">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Welcome to UPanel. Monitor your servers and applications.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Servers</CardTitle>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.servers}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.servers_online} online
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Applications</CardTitle>
                            <AppWindow className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.apps}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.apps_running} running
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Deployments Today</CardTitle>
                            <Rocket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.deployments_today}</div>
                            <p className="text-xs text-muted-foreground">
                                deployments
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Backups Today</CardTitle>
                            <Archive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.backups_today}</div>
                            <p className="text-xs text-muted-foreground">
                                backups
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Deployments</CardTitle>
                            <CardDescription>Latest deployment activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentDeployments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No deployments yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentDeployments.map((deployment) => (
                                        <div key={deployment.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <DeploymentStatusBadge status={deployment.status} />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {deployment.app?.name || 'Unknown App'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {deployment.environment} • {formatDate(deployment.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Backups</CardTitle>
                            <CardDescription>Latest backup activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recentBackups.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No backups yet
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {recentBackups.map((backup) => (
                                        <div key={backup.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <BackupStatusBadge status={backup.status} />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {backup.app?.name || 'Unknown App'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {backup.type} • {formatDate(backup.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Server Status</CardTitle>
                        <CardDescription>Health of your infrastructure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {servers.length === 0 ? (
                            <div className="text-center py-8">
                                <Server className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    No servers connected
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4">
                                    Add your first server to get started
                                </p>
                                <Link href="/servers/create" className="text-blue-600 hover:underline">
                                    Add Server →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {servers.map((server) => (
                                    <div key={server.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Server className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <Link href={`/servers/${server.id}`} className="font-medium hover:underline">
                                                    {server.name}
                                                </Link>
                                                <p className="text-xs text-gray-500">{server.host}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {server.last_seen_at && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(server.last_seen_at)}
                                                </span>
                                            )}
                                            <ServerStatusBadge status={server.status as any} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
