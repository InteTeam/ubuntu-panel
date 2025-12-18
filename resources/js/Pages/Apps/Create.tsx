import { useForm, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnvEditor } from '@/components/Molecules/EnvEditor';
import { ArrowLeft } from 'lucide-react';

interface Server {
    id: string;
    name: string;
}

interface GitCredential {
    id: string;
    name: string;
    type: string;
}

interface Props {
    servers: Server[];
    gitCredentials: GitCredential[];
}

export default function Create({ servers, gitCredentials }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        server_id: '',
        name: '',
        git_repository: '',
        git_branch: 'main',
        git_credentials_id: '',
        deploy_path: '',
        docker_compose_file: 'docker-compose.yml',
        env_production: {} as Record<string, string>,
        env_staging: {} as Record<string, string>,
        primary_domain: '',
        staging_domain: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/apps');
    };

    return (
        <AuthLayout title="Add Application - UPanel">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/apps">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Application</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Deploy a new application from a Git repository
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Application Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="My App"
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="server_id">Server</Label>
                                    <Select value={data.server_id} onValueChange={(v) => setData('server_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a server" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {servers.map((server) => (
                                                <SelectItem key={server.id} value={server.id}>
                                                    {server.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.server_id && <p className="text-sm text-red-600">{errors.server_id}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Git Repository</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="git_repository">Repository URL</Label>
                                <Input
                                    id="git_repository"
                                    value={data.git_repository}
                                    onChange={(e) => setData('git_repository', e.target.value)}
                                    placeholder="https://github.com/user/repo.git"
                                />
                                {errors.git_repository && <p className="text-sm text-red-600">{errors.git_repository}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="git_branch">Branch</Label>
                                    <Input
                                        id="git_branch"
                                        value={data.git_branch}
                                        onChange={(e) => setData('git_branch', e.target.value)}
                                    />
                                    {errors.git_branch && <p className="text-sm text-red-600">{errors.git_branch}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="git_credentials_id">Git Credentials (optional)</Label>
                                    <Select value={data.git_credentials_id} onValueChange={(v) => setData('git_credentials_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Public repository" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Public repository</SelectItem>
                                            {gitCredentials.map((cred) => (
                                                <SelectItem key={cred.id} value={cred.id}>
                                                    {cred.name} ({cred.type})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Deployment Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="deploy_path">Deploy Path</Label>
                                    <Input
                                        id="deploy_path"
                                        value={data.deploy_path}
                                        onChange={(e) => setData('deploy_path', e.target.value)}
                                        placeholder="/home/upanel/apps/my-app"
                                    />
                                    {errors.deploy_path && <p className="text-sm text-red-600">{errors.deploy_path}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="docker_compose_file">Docker Compose File</Label>
                                    <Input
                                        id="docker_compose_file"
                                        value={data.docker_compose_file}
                                        onChange={(e) => setData('docker_compose_file', e.target.value)}
                                    />
                                    {errors.docker_compose_file && <p className="text-sm text-red-600">{errors.docker_compose_file}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary_domain">Primary Domain (optional)</Label>
                                    <Input
                                        id="primary_domain"
                                        value={data.primary_domain}
                                        onChange={(e) => setData('primary_domain', e.target.value)}
                                        placeholder="app.example.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="staging_domain">Staging Domain (optional)</Label>
                                    <Input
                                        id="staging_domain"
                                        value={data.staging_domain}
                                        onChange={(e) => setData('staging_domain', e.target.value)}
                                        placeholder="staging.example.com"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Environment Variables</CardTitle>
                            <CardDescription>Configure environment variables for each environment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <EnvEditor
                                label="Production"
                                value={data.env_production}
                                onChange={(v) => setData('env_production', v)}
                            />
                            <EnvEditor
                                label="Staging"
                                value={data.env_staging}
                                onChange={(v) => setData('env_staging', v)}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Application'}
                        </Button>
                        <Link href="/apps">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
