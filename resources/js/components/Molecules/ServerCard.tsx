import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServerStatusBadge } from '@/components/Atoms/ServerStatusBadge';
import { Server, Cpu, HardDrive, MemoryStick } from 'lucide-react';

interface ServerCardProps {
    server: {
        id: string;
        name: string;
        host: string;
        status: 'online' | 'offline' | 'pending';
        os_version?: string;
        cpu_cores?: number;
        ram_mb?: number;
        disk_gb?: number;
        apps_count?: number;
    };
}

export function ServerCard({ server }: ServerCardProps) {
    return (
        <Link href={`/servers/${server.id}`}>
            <Card className="hover:border-blue-500 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                        <Server className="h-5 w-5 text-gray-500" />
                        {server.name}
                    </CardTitle>
                    <ServerStatusBadge status={server.status} />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {server.host}
                    </p>
                    
                    {server.status === 'online' && (
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                                <Cpu className="h-3 w-3" />
                                <span>{server.cpu_cores || '-'} cores</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MemoryStick className="h-3 w-3" />
                                <span>{server.ram_mb ? Math.round(server.ram_mb / 1024) : '-'} GB</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <HardDrive className="h-3 w-3" />
                                <span>{server.disk_gb || '-'} GB</span>
                            </div>
                        </div>
                    )}

                    {server.status === 'pending' && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Waiting for installation...
                        </p>
                    )}

                    {server.apps_count !== undefined && server.apps_count > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            {server.apps_count} app{server.apps_count !== 1 ? 's' : ''} deployed
                        </p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
