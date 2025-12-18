import { Link } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, ShieldX, Monitor, Clock, MapPin } from 'lucide-react';

interface LoginAttempt {
    id: string;
    email: string;
    ip_address: string;
    user_agent: string;
    success: boolean;
    created_at: string;
}

interface Session {
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current: boolean;
}

interface Props {
    loginAttempts: LoginAttempt[];
    twoFactorEnabled: boolean;
    sessions: Session[];
}

export default function Index({ loginAttempts, twoFactorEnabled, sessions }: Props) {
    const parseUserAgent = (ua: string) => {
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown Browser';
    };

    return (
        <AuthLayout title="Security - UPanel">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your account security settings
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>
                                Add an extra layer of security to your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {twoFactorEnabled ? (
                                        <>
                                            <ShieldCheck className="h-5 w-5 text-green-500" />
                                            <span className="text-green-600 dark:text-green-400 font-medium">Enabled</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldX className="h-5 w-5 text-red-500" />
                                            <span className="text-red-600 dark:text-red-400 font-medium">Disabled</span>
                                        </>
                                    )}
                                </div>
                                <Link href="/two-factor/setup">
                                    <Button variant="outline" size="sm">
                                        {twoFactorEnabled ? 'Manage' : 'Enable'}
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Monitor className="h-5 w-5" />
                                Active Sessions
                            </CardTitle>
                            <CardDescription>
                                Devices currently logged into your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{sessions.length}</p>
                            <p className="text-sm text-gray-500">active session(s)</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Sessions</CardTitle>
                        <CardDescription>
                            These devices are currently logged into your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {sessions.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No active sessions</p>
                        ) : (
                            <div className="space-y-3">
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Monitor className="h-5 w-5 text-gray-400" />
                                            <div>
                                                <p className="font-medium flex items-center gap-2">
                                                    {parseUserAgent(session.user_agent)}
                                                    {session.is_current && (
                                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                                                            Current
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {session.ip_address}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {session.last_activity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Login Attempts</CardTitle>
                        <CardDescription>
                            Last 20 login attempts to your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loginAttempts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No login attempts recorded</p>
                        ) : (
                            <div className="space-y-2">
                                {loginAttempts.map((attempt) => (
                                    <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {attempt.success ? (
                                                <ShieldCheck className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <ShieldX className="h-5 w-5 text-red-500" />
                                            )}
                                            <div>
                                                <p className="font-medium">
                                                    {attempt.success ? 'Successful login' : 'Failed login attempt'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {attempt.ip_address} • {new Date(attempt.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
