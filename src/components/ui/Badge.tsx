import React from 'react';
import { cn } from '../../lib/utils';
import { getStatusBadgeVariant } from '../../lib/formatters';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'auto';
  statusText?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  statusText,
  children,
  ...props
}) => {
  if (variant === 'auto' && statusText) {
    const v = getStatusBadgeVariant(statusText);
    return (
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border tabular-nums whitespace-nowrap',
          v.bg,
          v.text,
          v.border,
          className
        )}
        {...props}
      >
        {children || statusText}
      </span>
    );
  }

  const styles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
    warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    danger: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
    info: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border tabular-nums whitespace-nowrap',
        styles[variant === 'auto' ? 'default' : variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
