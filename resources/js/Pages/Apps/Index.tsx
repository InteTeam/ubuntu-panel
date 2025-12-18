import { Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { AppCard } from '@/components/Molecules/AppCard';
import { Plus, AppWindow } from 'lucide-react';

interface App {
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
}

interface Props {
    apps: App[];
}

export default function Index({ apps }: Props) {
    return (
        <AuthLayout title="Applications - UPanel">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applications</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Manage your deployed applications
                        </p>
                    </div>
                    <Link href="/apps/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Application
                        </Button>
                    </Link>
                </div>

                {apps.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                        <AppWindow className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                            No applications
                        </h3>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">
                            Get started by adding a new application.
                        </p>
                        <div className="mt-6">
                            <Link href="/apps/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Application
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {apps.map((app) => (
                            <AppCard key={app.id} app={app} />
                        ))}
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
