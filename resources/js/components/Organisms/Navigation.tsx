import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Server,
    AppWindow,
    Database,
    Shield,
    Settings,
    Bell,
} from 'lucide-react';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    active?: boolean;
}

export default function Navigation() {
    const { url } = usePage();

    const navigation: NavItem[] = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutDashboard className="h-5 w-5" />,
            active: url === '/dashboard',
        },
        {
            name: 'Servers',
            href: '/servers',
            icon: <Server className="h-5 w-5" />,
            active: url.startsWith('/servers'),
        },
        {
            name: 'Applications',
            href: '/apps',
            icon: <AppWindow className="h-5 w-5" />,
            active: url.startsWith('/apps'),
        },
        {
            name: 'Backups',
            href: '/backups',
            icon: <Database className="h-5 w-5" />,
            active: url.startsWith('/backups'),
        },
        {
            name: 'Security',
            href: '/security',
            icon: <Shield className="h-5 w-5" />,
            active: url.startsWith('/security'),
        },
        {
            name: 'Notifications',
            href: '/notifications',
            icon: <Bell className="h-5 w-5" />,
            active: url.startsWith('/notifications'),
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: <Settings className="h-5 w-5" />,
            active: url.startsWith('/settings'),
        },
    ];

    return (
        <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        item.active
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    )}
                >
                    <span className={cn(
                        'mr-3',
                        item.active
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    )}>
                        {item.icon}
                    </span>
                    {item.name}
                </Link>
            ))}
        </nav>
    );
}
