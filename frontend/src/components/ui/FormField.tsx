import { Label, Input } from '../ui';
import type { InputProps } from '../ui';

export interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = ({
  label,
  error,
  helperText,
  required,
  id,
  ...inputProps
}: FormFieldProps) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={fieldId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
        className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
        {...inputProps}
      />
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${fieldId}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
