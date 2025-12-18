import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  help?: string;
}

export function FormField({ label, name, error, required = false, help, ...inputProps }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
        {...inputProps}
      />
      {help && !error && (
        <p className="text-sm text-gray-600">{help}</p>
      )}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export default FormField;