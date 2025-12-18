import AuthLayout from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, AppWindow, Database, Shield } from 'lucide-react';

export default function Dashboard() {
    const stats = [
        { name: 'Servers', value: '0', icon: Server, href: '/servers' },
        { name: 'Applications', value: '0', icon: AppWindow, href: '/apps' },
        { name: 'Backups', value: '0', icon: Database, href: '/backups' },
        { name: 'Security Events', value: '0', icon: Shield, href: '/security' },
    ];

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
                    {stats.map((stat) => (
                        <Card key={stat.name}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.name}
                                </CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    <a href={stat.href} className="hover:underline">
                                        View all →
                                    </a>
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest actions across your servers</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                No recent activity
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>System Status</CardTitle>
                            <CardDescription>Overall health of your infrastructure</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                No servers connected
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthLayout>
    );
}
