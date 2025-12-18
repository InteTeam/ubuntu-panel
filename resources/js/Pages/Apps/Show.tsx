import { router, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppStatusBadge } from '@/components/Atoms/AppStatusBadge';
import { DeploymentRow } from '@/components/Molecules/DeploymentRow';
import { ArrowLeft, Edit, Trash2, Rocket, GitBranch, Server, Globe } from 'lucide-react';

interface Deployment {
    id: string;
    commit_hash: string;
    commit_message?: string;
    branch: string;
    environment: string;
    status: 'queued' | 'running' | 'success' | 'failed' | 'cancelled';
    created_at: string;
    duration_seconds?: number;
    is_rollback: boolean;
    user?: { email: string };
}

interface App {
    id: string;
    name: string;
    git_repository: string;
    git_branch: string;
    deploy_path: string;
    docker_compose_file: string;
    status: 'pending' | 'deploying' | 'running' | 'stopped' | 'failed';
    current_commit?: string;
    primary_domain?: string;
    staging_domain?: string;
    server?: { id: string; name: string };
    deployments?: Deployment[];
}

interface Props {
    app: App;
}

export default function Show({ app }: Props) {
    const handleDeploy = (environment: string) => {
        if (confirm(`Deploy to ${environment}?`)) {
            router.post(`/apps/${app.id}/deploy/${environment}`);
        }
    };

    const handleDelete = () => {
        if (confirm('Delete this application? This cannot be undone.')) {
            router.delete(`/apps/${app.id}`);
        }
    };

    const repoName = app.git_repository.split('/').slice(-2).join('/').replace('.git', '');

    return (
        <AuthLayout title={`${app.name} - UPanel`}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/apps">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {app.name}
                                </h1>
                                <AppStatusBadge status={app.status} />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">{repoName}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => handleDeploy('production')}>
                            <Rocket className="h-4 w-4 mr-2" />
                            Deploy
                        </Button>
                        <Link href={`/apps/${app.id}/edit`}>
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Server className="h-4 w-4" />
                                Server
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{app.server?.name || 'Not assigned'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <GitBranch className="h-4 w-4" />
                                Branch
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold">{app.git_branch}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Primary Domain
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {app.primary_domain ? (
                                <a href={`https://${app.primary_domain}`} target="_blank" className="font-semibold text-blue-600 hover:underline">
                                    {app.primary_domain}
                                </a>
                            ) : (
                                <p className="text-gray-500">Not configured</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Current Commit</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <code className="font-mono text-sm">
                                {app.current_commit?.slice(0, 7) || 'None'}
                            </code>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Deployments</CardTitle>
                        <CardDescription>Last 10 deployments</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {app.deployments && app.deployments.length > 0 ? (
                            <div className="divide-y dark:divide-gray-700">
                                {app.deployments.map((deployment) => (
                                    <DeploymentRow
                                        key={deployment.id}
                                        deployment={deployment}
                                        appId={app.id}
                                        canRollback
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                No deployments yet. Click "Deploy" to start your first deployment.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Repository</dt>
                                <dd className="font-mono">{app.git_repository}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Deploy Path</dt>
                                <dd className="font-mono">{app.deploy_path}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Docker Compose File</dt>
                                <dd className="font-mono">{app.docker_compose_file}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 dark:text-gray-400">Staging Domain</dt>
                                <dd className="font-mono">{app.staging_domain || 'Not configured'}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
