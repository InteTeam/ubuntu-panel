import { Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { ServerCard } from '@/components/Molecules/ServerCard';
import { Plus, Server } from 'lucide-react';

interface Server {
    id: string;
    name: string;
    host: string;
    status: 'online' | 'offline' | 'pending';
    os_version?: string;
    cpu_cores?: number;
    ram_mb?: number;
    disk_gb?: number;
    apps_count?: number;
}

interface Props {
    servers: Server[];
}

export default function Index({ servers }: Props) {
    return (
        <AuthLayout title="Servers - UPanel">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Servers</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage your connected servers
                        </p>
                    </div>
                    <Link href="/servers/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Server
                        </Button>
                    </Link>
                </div>

                {servers.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <Server className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                            No servers
                        </h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Get started by adding a new server.
                        </p>
                        <div className="mt-6">
                            <Link href="/servers/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Server
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {servers.map((server) => (
                            <ServerCard key={server.id} server={server} />
                        ))}
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
