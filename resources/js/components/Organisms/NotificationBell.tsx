import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { NotificationItem } from '@/components/Molecules/NotificationItem';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
    id: string;
    type: 'deployment' | 'backup' | 'server' | 'system';
    title: string;
    message: string;
    read_at: string | null;
    created_at: string;
}

interface NotificationBellProps {
    initialCount?: number;
}

export function NotificationBell({ initialCount = 0 }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/notifications/unread');
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchNotifications();
        }
    }, [open]);

    const handleMarkAllRead = () => {
        router.post('/notifications/read-all', {}, {
            onSuccess: () => {
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            },
        });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className={cn(
                            'absolute -top-1 -right-1 flex items-center justify-center',
                            'min-w-[18px] h-[18px] text-xs font-bold rounded-full',
                            'bg-red-500 text-white'
                        )}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <NotificationItem 
                                    key={notification.id} 
                                    notification={notification} 
                                    compact 
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-2 border-t dark:border-gray-700">
                    <Link href="/notifications" className="block">
                        <Button variant="ghost" className="w-full">
                            View all notifications
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
