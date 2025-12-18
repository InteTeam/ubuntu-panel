import { router, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerStatusBadge } from '@/components/Atoms/ServerStatusBadge';
import { ResourceMeter } from '@/components/Atoms/ResourceMeter';
import { InstallCommandBlock } from '@/components/Molecules/InstallCommandBlock';
import { ArrowLeft, Edit, Trash2, Key, Wifi } from 'lucide-react';

interface Metric {
    cpu_percent: number;
    ram_used_mb: number;
    ram_total_mb: number;
    disk_used_gb: number;
    disk_total_gb: number;
}

interface Server {
    id: string;
    name: string;
    host: string;
    port: number;
    username: string;
    status: 'online' | 'offline' | 'pending';
    os_version?: string;
    cpu_cores?: number;
    ram_mb?: number;
    disk_gb?: number;
    last_seen_at?: string;
    metrics?: Metric[];
}

interface Props {
    server: Server;
    installToken?: string;
}

export default function Show({ server, installToken }: Props) {
    const latestMetric = server.metrics?.[0];
    const panelUrl = window.location.origin;

    const handleTestConnection = () => {
        router.post(`/servers/${server.id}/test-connection`);
    };

    const handleRotateToken = () => {
        if (confirm('Are you sure? The agent will need to be reconfigured.')) {
            router.post(`/servers/${server.id}/rotate-token`);
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this server? This cannot be undone.')) {
            router.delete(`/servers/${server.id}`);
        }
    };

    return (
        <AuthLayout title={`${server.name} - UPanel`}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/servers">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {server.name}
                                </h1>
                                <ServerStatusBadge status={server.status} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">{server.host}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/servers/${server.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {server.status === 'pending' && installToken && (
                    <Card className="border-yellow-500">
                        <CardHeader>
                            <CardTitle className="text-yellow-600">Installation Required</CardTitle>
                            <CardDescription>
                                Run this command on your server to complete the setup.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InstallCommandBlock 
                                command={`curl -sSL ${panelUrl}/install/${installToken} | sudo bash`} 
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                This link expires in 1 hour. Refresh the page to generate a new one.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {server.status === 'online' && (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">OS Version</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold">{server.os_version || 'Unknown'}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">CPU Cores</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold">{server.cpu_cores || '-'}</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total RAM</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold">
                                        {server.ram_mb ? `${Math.round(server.ram_mb / 1024)} GB` : '-'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium">Total Disk</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-semibold">
                                        {server.disk_gb ? `${server.disk_gb} GB` : '-'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {latestMetric && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resource Usage</CardTitle>
                                    <CardDescription>Current resource utilization</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <ResourceMeter
                                        label="CPU"
                                        value={latestMetric.cpu_percent}
                                        max={100}
                                        unit="%"
                                    />
                                    <ResourceMeter
                                        label="RAM"
                                        value={Math.round(latestMetric.ram_used_mb / 1024)}
                                        max={Math.round(latestMetric.ram_total_mb / 1024)}
                                        unit=" GB"
                                    />
                                    <ResourceMeter
                                        label="Disk"
                                        value={latestMetric.disk_used_gb}
                                        max={latestMetric.disk_total_gb}
                                        unit=" GB"
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Server Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={handleTestConnection}>
                            <Wifi className="h-4 w-4 mr-2" />
                            Test Connection
                        </Button>
                        <Button variant="outline" onClick={handleRotateToken}>
                            <Key className="h-4 w-4 mr-2" />
                            Rotate Agent Token
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Connection Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Host</dt>
                                <dd className="font-mono">{server.host}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">SSH Port</dt>
                                <dd className="font-mono">{server.port}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Username</dt>
                                <dd className="font-mono">{server.username}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Last Seen</dt>
                                <dd>{server.last_seen_at || 'Never'}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
