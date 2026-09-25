import React, { useId } from 'react';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      children,
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
    const selectId = id || (name ? `select-${name}` : generatedId);
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    // WCAG: Determine aria-invalid
    const resolvedAriaInvalid: boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined =
      ariaInvalidProp !== undefined
        ? ariaInvalidProp
        : error
        ? 'true'
        : undefined;

    // WCAG: Merge describedby IDs
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
          <Label htmlFor={selectId} required={required} error={!!error}>
            {label}
          </Label>
        )}
        <div className="relative">
          <select
            {...props}
            id={selectId}
            name={name}
            ref={ref}
            required={required}
            aria-required={required ? 'true' : undefined}
            aria-invalid={resolvedAriaInvalid}
            aria-errormessage={resolvedAriaErrorMessage}
            aria-describedby={resolvedAriaDescribedBy}
            className={cn(
              'w-full h-9 rounded-lg border bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-950',
              error
                ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500 text-rose-900 dark:text-rose-100'
                : 'border-slate-300 dark:border-slate-700',
              className
            )}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium"
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

Select.displayName = 'Select';
export default Select;
