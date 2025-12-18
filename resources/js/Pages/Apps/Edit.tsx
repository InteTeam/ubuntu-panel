import { useForm, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnvEditor } from '@/components/Molecules/EnvEditor';
import { ArrowLeft } from 'lucide-react';

interface GitCredential {
    id: string;
    name: string;
    type: string;
}

interface App {
    id: string;
    server_id: string;
    name: string;
    git_repository: string;
    git_branch: string;
    git_credentials_id?: string;
    deploy_path: string;
    docker_compose_file: string;
    env_production?: Record<string, string>;
    env_staging?: Record<string, string>;
    primary_domain?: string;
    staging_domain?: string;
}

interface Props {
    app: App;
    gitCredentials: GitCredential[];
}

export default function Edit({ app, gitCredentials }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: app.name,
        git_repository: app.git_repository,
        git_branch: app.git_branch,
        git_credentials_id: app.git_credentials_id || '',
        deploy_path: app.deploy_path,
        docker_compose_file: app.docker_compose_file,
        env_production: app.env_production || {},
        env_staging: app.env_staging || {},
        primary_domain: app.primary_domain || '',
        staging_domain: app.staging_domain || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/apps/${app.id}`);
    };

    return (
        <AuthLayout title={`Edit ${app.name} - UPanel`}>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={`/apps/${app.id}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Application</h1>
                        <p className="text-gray-500 dark:text-gray-400">Update {app.name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Application Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
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
                                </div>

                                <div className="space-y-2">
                                    <Label>Git Credentials</Label>
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
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="docker_compose_file">Docker Compose File</Label>
                                    <Input
                                        id="docker_compose_file"
                                        value={data.docker_compose_file}
                                        onChange={(e) => setData('docker_compose_file', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primary_domain">Primary Domain</Label>
                                    <Input
                                        id="primary_domain"
                                        value={data.primary_domain}
                                        onChange={(e) => setData('primary_domain', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="staging_domain">Staging Domain</Label>
                                    <Input
                                        id="staging_domain"
                                        value={data.staging_domain}
                                        onChange={(e) => setData('staging_domain', e.target.value)}
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
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Link href={`/apps/${app.id}`}>
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
