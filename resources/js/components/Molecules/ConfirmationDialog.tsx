import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
}

export function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
}: ConfirmationDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onClose}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay
                    className={cn(
                        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
                    )}
                />
                <DialogPrimitive.Content
                    className={cn(
                        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg',
                        'translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background',
                        'p-6 shadow-lg duration-200 sm:rounded-lg',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
                        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
                    )}
                >
                    <div className="flex flex-col space-y-2 text-center sm:text-left">
                        <DialogPrimitive.Title className="text-lg font-semibold">
                            {title}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-sm text-muted-foreground">
                            {description}
                        </DialogPrimitive.Description>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            type="button"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant}
                            onClick={handleConfirm}
                            type="button"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
