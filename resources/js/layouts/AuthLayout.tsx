import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '@/components/Organisms/Navigation';
import UserDropdown from '@/components/Organisms/UserDropdown';
import { NotificationBell } from '@/components/Organisms/NotificationBell';
import FlashMessage from '@/components/Molecules/FlashMessage';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AuthLayout({ children, title = 'UPanel' }: AuthLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <ThemeProvider>
            <Head>
                <title>{title}</title>
            </Head>

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-gray-600/75 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Mobile sidebar */}
                <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform lg:hidden ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="flex h-16 items-center justify-between px-4 border-b dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">UP</span>
                            </div>
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">UPanel</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                    <Navigation />
                </div>

                {/* Desktop sidebar */}
                <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                    <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r dark:border-gray-700">
                        <div className="flex h-16 items-center px-4 border-b dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">UP</span>
                                </div>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">UPanel</span>
                            </div>
                        </div>
                        <Navigation />
                    </div>
                </div>

                {/* Main content */}
                <div className="lg:pl-64">
                    {/* Header */}
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 px-4 sm:px-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        <div className="flex-1" />

                        <NotificationBell />
                        <UserDropdown />
                    </header>

                    {/* Page content */}
                    <main className="p-4 sm:p-6 lg:p-8">
                        <FlashMessage />
                        {children}
                    </main>
                </div>
            </div>

            <Toaster />
        </ThemeProvider>
    );
}
