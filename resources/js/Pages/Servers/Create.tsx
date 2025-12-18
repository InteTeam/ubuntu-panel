import { useForm, Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        host: '',
        port: 22,
        username: 'upanel',
        agent_port: 8443,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/servers');
    };

    return (
        <AuthLayout title="Add Server - UPanel">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/servers">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Server</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Connect a new server to UPanel
                        </p>
                    </div>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Server Details</CardTitle>
                        <CardDescription>
                            Enter the server information. After creating, you'll get an install command.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Server Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Production Server"
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="host">Host (IP or Domain)</Label>
                                <Input
                                    id="host"
                                    value={data.host}
                                    onChange={(e) => setData('host', e.target.value)}
                                    placeholder="192.168.1.100 or server.example.com"
                                />
                                {errors.host && <p className="text-sm text-red-600">{errors.host}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="port">SSH Port</Label>
                                    <Input
                                        id="port"
                                        type="number"
                                        value={data.port}
                                        onChange={(e) => setData('port', parseInt(e.target.value) || 22)}
                                    />
                                    {errors.port && <p className="text-sm text-red-600">{errors.port}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">SSH Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                    />
                                    {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="agent_port">Agent Port</Label>
                                <Input
                                    id="agent_port"
                                    type="number"
                                    value={data.agent_port}
                                    onChange={(e) => setData('agent_port', parseInt(e.target.value) || 8443)}
                                />
                                <p className="text-xs text-gray-500">Port for the UPanel agent (default: 8443)</p>
                                {errors.agent_port && <p className="text-sm text-red-600">{errors.agent_port}</p>}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Server'}
                                </Button>
                                <Link href="/servers">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
