import React, { useId } from 'react';
import { AlertCircle } from 'lucide-react';
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
  errorMessage?: string;
  hint?: string;
  options?: SelectOption[];
  'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  ariaInvalid?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
  'aria-describedby'?: string;
  ariaDescribedBy?: string;
  'aria-errormessage'?: string;
  ariaErrorMessage?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      errorMessage,
      hint,
      options,
      children,
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
    const selectId = id || (name ? `select-${name}` : generatedId);
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

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
          <Label htmlFor={selectId} required={required} error={!!resolvedError}>
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
              resolvedError
                ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500 focus:border-rose-500 text-rose-900 dark:text-rose-100'
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

Select.displayName = 'Select';
export default Select;
