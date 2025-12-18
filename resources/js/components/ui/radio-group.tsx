import React from 'react';

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
    ({ className, value, onValueChange, disabled, children, ...props }, ref) => {
        const handleChange = (itemValue: string) => {
            if (!disabled && onValueChange) {
                onValueChange(itemValue);
            }
        };

        return (
            <div
                ref={ref}
                className={`grid gap-2 ${className || ''}`}
                role="radiogroup"
                {...props}
            >
                {React.Children.map(children, (child) => {
                    if (React.isValidElement<RadioGroupItemProps>(child) && child.type === RadioGroupItem) {
                        return React.cloneElement(child, {
                            checked: child.props.value === value,
                            onClick: () => handleChange(child.props.value),
                            disabled: disabled || child.props.disabled,
                        });
                    }
                    return child;
                })}
            </div>
        );
    }
);
RadioGroup.displayName = 'RadioGroup';

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    checked?: boolean;
    onClick?: () => void;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
    ({ className, value, checked, onClick, disabled, id, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type="radio"
                id={id}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={onClick}
                onClick={onClick}
                className={`h-4 w-4 rounded-full border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
                {...props}
            />
        );
    }
);

RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
