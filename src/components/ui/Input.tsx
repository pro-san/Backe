import React, { useId } from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
      'aria-invalid': ariaInvalidProp,
      'aria-describedby': ariaDescribedByProp,
      'aria-errormessage': ariaErrorMessageProp,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || (name ? `input-${name}` : generatedId);
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    // WCAG: Determine aria-invalid:
    // If error exists, aria-invalid evaluates to true unless explicitly overridden
    const resolvedAriaInvalid: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined =
      ariaInvalidProp !== undefined
        ? ariaInvalidProp
        : error
        ? 'true'
        : undefined;

    // WCAG: Merge describedby IDs:
    // Link dynamic error message and hint IDs with any custom IDs passed in aria-describedby
    const customIds = ariaDescribedByProp
      ? ariaDescribedByProp.split(/\s+/).filter(Boolean)
      : [];

    const idsToInclude = [
      ...(error ? [errorId] : []),
      ...(hint ? [hintId] : []),
      ...customIds,
    ];

    const resolvedAriaDescribedBy =
      Array.from(new Set(idsToInclude)).join(' ') || undefined;

    const resolvedAriaErrorMessage =
      ariaErrorMessageProp || (error ? errorId : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <Label htmlFor={inputId} required={required} error={!!error}>
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div
              className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center w-4 h-4"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            {...props}
            id={inputId}
            name={name}
            ref={ref}
            required={required}
            aria-required={required ? 'true' : undefined}
            aria-invalid={resolvedAriaInvalid}
            aria-errormessage={resolvedAriaErrorMessage}
            aria-describedby={resolvedAriaDescribedBy}
            className={cn(
              'w-full h-9 rounded-lg border bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-950',
              icon ? 'pl-9' : '',
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
            className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium"
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

Input.displayName = 'Input';
export default Input;
