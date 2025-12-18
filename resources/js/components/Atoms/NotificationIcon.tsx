import { cn } from '@/lib/utils';
import { Rocket, Archive, Server, Bell } from 'lucide-react';

type NotificationType = 'deployment' | 'backup' | 'server' | 'system';

interface NotificationIconProps {
    type: NotificationType;
    className?: string;
}

export function NotificationIcon({ type, className }: NotificationIconProps) {
    const iconConfig: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
        deployment: { 
            icon: <Rocket className="h-4 w-4" />, 
            color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/50' 
        },
        backup: { 
            icon: <Archive className="h-4 w-4" />, 
            color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/50' 
        },
        server: { 
            icon: <Server className="h-4 w-4" />, 
            color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/50' 
        },
        system: { 
            icon: <Bell className="h-4 w-4" />, 
            color: 'text-gray-500 bg-gray-100 dark:bg-gray-700' 
        },
    };

    const config = iconConfig[type] || iconConfig.system;

    return (
        <span className={cn(
            'inline-flex items-center justify-center w-8 h-8 rounded-full',
            config.color,
            className
        )}>
            {config.icon}
        </span>
    );
}
