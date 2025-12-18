import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div 
            className={cn(
                'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
                sizeClasses[size],
                className
            )}
        />
    );
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
        </div>
    );
}

export function ButtonLoader() {
    return <LoadingSpinner size="sm" className="mr-2" />;
}
