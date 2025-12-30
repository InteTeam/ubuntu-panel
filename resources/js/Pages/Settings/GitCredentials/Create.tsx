import { useForm, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Key, Info } from 'lucide-react';

type CredentialType = 'ssh_key' | 'token' | 'basic';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'token' as CredentialType,
        private_key: '',
        passphrase: '',
        token: '',
        username: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/settings/git-credentials');
    };

    return (
        <AuthLayout title="Add Git Credential - UPanel">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/settings/git-credentials">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Git Credential</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Create a new credential for private repository access
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" />
                                Credential Details
                            </CardTitle>
                            <CardDescription>
                                Choose the authentication type and provide the required credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., GitHub PAT, GitLab Deploy Key"
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(v) => setData('type', v as CredentialType)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="token">Personal Access Token</SelectItem>
                                            <SelectItem value="ssh_key">SSH Key</SelectItem>
                                            <SelectItem value="basic">Basic Auth (Username/Password)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                                </div>
                            </div>

                            {data.type === 'token' && (
                                <div className="space-y-4">
                                    <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                                        <div className="flex">
                                            <Info className="h-5 w-5 text-blue-400" />
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                    Personal Access Token
                                                </h3>
                                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                                    Generate a token from your Git provider with repository read access.
                                                    For GitHub, use a Fine-grained token or Classic token with repo scope.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="token">Token</Label>
                                        <Input
                                            id="token"
                                            type="password"
                                            value={data.token}
                                            onChange={(e) => setData('token', e.target.value)}
                                            placeholder="ghp_xxxxxxxxxxxx or glpat-xxxxxxxxxxxx"
                                        />
                                        {errors.token && <p className="text-sm text-red-600">{errors.token}</p>}
                                    </div>
                                </div>
                            )}

                            {data.type === 'ssh_key' && (
                                <div className="space-y-4">
                                    <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                                        <div className="flex">
                                            <Info className="h-5 w-5 text-blue-400" />
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                    SSH Private Key
                                                </h3>
                                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                                    Paste your private key (usually ~/.ssh/id_rsa or ~/.ssh/id_ed25519).
                                                    The public key should be added to your Git provider as a deploy key.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="private_key">Private Key</Label>
                                        <Textarea
                                            id="private_key"
                                            value={data.private_key}
                                            onChange={(e) => setData('private_key', e.target.value)}
                                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                                            rows={8}
                                            className="font-mono text-sm"
                                        />
                                        {errors.private_key && <p className="text-sm text-red-600">{errors.private_key}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="passphrase">Passphrase (optional)</Label>
                                        <Input
                                            id="passphrase"
                                            type="password"
                                            value={data.passphrase}
                                            onChange={(e) => setData('passphrase', e.target.value)}
                                            placeholder="Leave empty if key has no passphrase"
                                        />
                                    </div>
                                </div>
                            )}

                            {data.type === 'basic' && (
                                <div className="space-y-4">
                                    <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                                        <div className="flex">
                                            <Info className="h-5 w-5 text-blue-400" />
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                                    Basic Authentication
                                                </h3>
                                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                                    Use your username and a password or token. For GitHub, use your
                                                    username and a Personal Access Token as the password.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="username">Username</Label>
                                            <Input
                                                id="username"
                                                value={data.username}
                                                onChange={(e) => setData('username', e.target.value)}
                                                placeholder="git or your username"
                                            />
                                            {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">Password / Token</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Password or access token"
                                            />
                                            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Credential'}
                        </Button>
                        <Link href="/settings/git-credentials">
                            <Button type="button" variant="outline">Cancel</Button>
                        </Link>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
