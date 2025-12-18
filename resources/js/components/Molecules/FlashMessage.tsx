import { usePage } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface PageProps {
    flash: {
        alert?: string;
        type?: 'success' | 'error' | 'warning' | 'info';
    };
    [key: string]: unknown;
}

export default function FlashMessage() {
    const { flash } = usePage<PageProps>().props;

    if (!flash?.alert) {
        return null;
    }

    const icons = {
        success: <CheckCircle className="h-4 w-4" />,
        error: <XCircle className="h-4 w-4" />,
        warning: <AlertTriangle className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
    };

    const variants: Record<string, 'default' | 'destructive'> = {
        success: 'default',
        error: 'destructive',
        warning: 'default',
        info: 'default',
    };

    const type = flash.type || 'info';

    return (
        <Alert variant={variants[type]} className="mb-4">
            <div className="flex items-center gap-2">
                {icons[type]}
                <AlertDescription>{flash.alert}</AlertDescription>
            </div>
        </Alert>
    );
}
