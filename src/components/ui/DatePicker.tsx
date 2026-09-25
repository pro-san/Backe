import React, { useId } from 'react';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  errorMessage?: string;
  hint?: string;
  icon?: React.ReactNode;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-describedby'?: string;
  ariaDescribedBy?: string;
  'aria-errormessage'?: string;
  ariaErrorMessage?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      className,
      label,
      error,
      errorMessage,
      hint,
      icon,
      id,
      name,
      required,
      'aria-invalid': ariaInvalidKebab,
      ariaInvalid: ariaInvalidCamel,
      'aria-describedby': ariaDescribedByKebab,
      ariaDescribedBy: ariaDescribedByCamel,
      'aria-errormessage': ariaErrorMessageKebab,
      ariaErrorMessage: ariaErrorMessageCamel,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || (name ? `datepicker-${name}` : generatedId);
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // Support both 'error' and 'errorMessage' props
    const resolvedError = error || errorMessage;

    // Resolve aria-invalid: prefer explicit prop (kebab or camel), otherwise set to 'true' if error exists
    const explicitAriaInvalid = ariaInvalidKebab !== undefined ? ariaInvalidKebab : ariaInvalidCamel;
    const resolvedAriaInvalid: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined =
      explicitAriaInvalid !== undefined
        ? explicitAriaInvalid
        : resolvedError
        ? 'true'
        : undefined;

    // Resolve custom aria-describedby tokens
    const explicitDescribedBy = ariaDescribedByKebab || ariaDescribedByCamel || '';
    const customTokens = explicitDescribedBy ? explicitDescribedBy.split(/\s+/).filter(Boolean) : [];

    // Dynamically associate error and hint elements
    const linkedIds = [
      ...(resolvedError ? [errorId] : []),
      ...(hint ? [hintId] : []),
      ...customTokens,
    ];

    const resolvedAriaDescribedBy =
      Array.from(new Set(linkedIds)).join(' ') || undefined;

    // Resolve aria-errormessage: points to error message element when invalid
    const explicitErrorMessage = ariaErrorMessageKebab || ariaErrorMessageCamel;
    const resolvedAriaErrorMessage =
      explicitErrorMessage || (resolvedError ? errorId : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <Label htmlFor={inputId} required={required} error={!!resolvedError}>
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
            aria-describedby={resolvedAriaDescribedBy}
            className={cn(
              'w-full h-9 rounded-lg border bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-950 [color-scheme:light] dark:[color-scheme:dark]',
              resolvedError
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 focus:border-rose-500 text-rose-900 dark:text-rose-100'
                : 'border-slate-300 dark:border-slate-700',
              className
            )}
          />
        </div>
        {resolvedError && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            aria-atomic="true"
            className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1.5 font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{resolvedError}</span>
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
