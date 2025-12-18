import { Head } from '@inertiajs/react';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/contexts/ThemeContext';
import FlashMessage from '@/components/Molecules/FlashMessage';

interface GuestLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function GuestLayout({ children, title = 'UPanel' }: GuestLayoutProps) {
    return (
        <ThemeProvider>
            <Head>
                <title>{title}</title>
            </Head>
            
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-2">
                            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">UP</span>
                            </div>
                            <span className="text-2xl font-semibold text-gray-900 dark:text-white">UPanel</span>
                        </div>
                    </div>
                    
                    <FlashMessage />
                    
                    {children}
                </div>
            </div>
            
            <Toaster />
        </ThemeProvider>
    );
}
