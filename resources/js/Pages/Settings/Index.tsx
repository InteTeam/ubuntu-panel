import { useForm } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Lock } from 'lucide-react';

interface Props {
    user: {
        id: string;
        email: string;
        timezone: string;
        email_notifications: boolean;
        role: string;
    };
}

const timezones = [
    'UTC',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
];

export default function Index({ user }: Props) {
    const profileForm = useForm({
        email: user.email,
        timezone: user.timezone,
        email_notifications: user.email_notifications,
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.put('/settings/profile');
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <AuthLayout title="Settings - UPanel">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Manage your account settings and preferences
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile
                        </CardTitle>
                        <CardDescription>
                            Update your account information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                />
                                {profileForm.errors.email && (
                                    <p className="text-sm text-red-500">{profileForm.errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select
                                    value={profileForm.data.timezone}
                                    onValueChange={(v) => profileForm.setData('timezone', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezones.map((tz) => (
                                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Email Notifications</Label>
                                    <p className="text-sm text-gray-500">
                                        Receive email notifications for important events
                                    </p>
                                </div>
                                <Switch
                                    checked={profileForm.data.email_notifications}
                                    onCheckedChange={(v) => profileForm.setData('email_notifications', v)}
                                />
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={profileForm.processing}>
                                    {profileForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <p className="text-sm text-gray-500">
                                    Role: <span className="font-medium capitalize">{user.role}</span>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Current Password</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                />
                                {passwordForm.errors.current_password && (
                                    <p className="text-sm text-red-500">{passwordForm.errors.current_password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                />
                                {passwordForm.errors.password && (
                                    <p className="text-sm text-red-500">{passwordForm.errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <Button type="submit" disabled={passwordForm.processing}>
                                {passwordForm.processing ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
