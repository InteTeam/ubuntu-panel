import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
        };

        return (
            <input
                type="checkbox"
                ref={ref}
                checked={checked}
                onChange={handleChange}
                className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${className || ''}`}
                {...props}
            />
        );
    }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };