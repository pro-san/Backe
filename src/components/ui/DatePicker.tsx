import React, { useId } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      id,
      name,
      required,
      'aria-invalid': ariaInvalid,
      'aria-describedby': ariaDescribedBy,
      'aria-errormessage': ariaErrorMessage,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || (name ? `datepicker-${name}` : generatedId);
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Determine aria-invalid: prefer explicit prop, fallback to true if error exists
    const resolvedAriaInvalid =
      ariaInvalid !== undefined
        ? ariaInvalid
        : error
        ? true
        : undefined;

    // Build describedby IDs: combine error, hint, and any user-provided aria-describedby
    const describedByIds = [
      error ? errorId : null,
      hint ? hintId : null,
      ariaDescribedBy || null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    const resolvedAriaErrorMessage =
      ariaErrorMessage || (error ? errorId : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <Label htmlFor={inputId} required={required} error={!!error}>
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          <div
            className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center w-4 h-4"
            aria-hidden="true"
          >
            {icon || <CalendarIcon className="w-4 h-4" />}
          </div>
          <input
            {...props}
            type="date"
            id={inputId}
            name={name}
            ref={ref}
            required={required}
            aria-required={required ? 'true' : undefined}
            aria-invalid={resolvedAriaInvalid}
            aria-errormessage={resolvedAriaErrorMessage}
            aria-describedby={describedByIds}
            className={cn(
              'w-full h-9 rounded-lg border bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-950 [color-scheme:light] dark:[color-scheme:dark]',
              error
                ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500 text-rose-900 dark:text-rose-100'
                : 'border-slate-300 dark:border-slate-700',
              className
            )}
          />
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-rose-600 dark:text-rose-400 mt-1"
          >
            {error}
          </p>
        )}
        {hint && (
          <p id={hintId} className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
