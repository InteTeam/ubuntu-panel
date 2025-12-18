import { router } from '@inertiajs/react';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationItem } from '@/components/Molecules/NotificationItem';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';

interface Notification {
    id: string;
    type: 'deployment' | 'backup' | 'server' | 'system';
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface Props {
    notifications: Notification[];
    unreadCount: number;
}

export default function Index({ notifications, unreadCount }: Props) {
    const handleMarkAllRead = () => {
        router.post('/notifications/read-all');
    };

    const handleDeleteAll = () => {
        if (confirm('Delete all notifications?')) {
            router.delete('/notifications');
        }
    };

    return (
        <AuthLayout title="Notifications - UPanel">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {unreadCount > 0 && (
                            <Button variant="outline" onClick={handleMarkAllRead}>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="outline" onClick={handleDeleteAll}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear all
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Notifications</CardTitle>
                        <CardDescription>
                            Your recent notifications from deployments, backups, and servers
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    No notifications
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    You're all caught up! New notifications will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y dark:divide-gray-700">
                                {notifications.map((notification) => (
                                    <NotificationItem 
                                        key={notification.id} 
                                        notification={notification} 
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
