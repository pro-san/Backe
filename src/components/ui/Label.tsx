import React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  disabled?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, optional, error, disabled, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-xs font-semibold select-none transition-colors',
          error
            ? 'text-rose-600 dark:text-rose-400'
            : disabled
            ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
            : 'text-slate-700 dark:text-slate-200',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {required && (
          <span
            className="text-rose-500 ml-1 font-bold"
            aria-hidden="true"
            title="Required field"
          >
            *
          </span>
        )}
        {optional && !required && (
          <span className="text-[11px] font-normal text-slate-400 ml-1.5" aria-hidden="true">
            (optional)
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
export default Label;
