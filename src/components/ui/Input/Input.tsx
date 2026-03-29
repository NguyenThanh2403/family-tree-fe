import * as React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      containerClassName,
      id,
      className,
      required,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? React.useId();
    const errorId = error ? `${inputId}-error` : undefined;
    const hintId = hint ? `${inputId}-hint` : undefined;

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-0.5" aria-hidden>
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftAddon && (
            <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none">
              {leftAddon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              [errorId, hintId].filter(Boolean).join(' ') || undefined
            }
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-sm',
              'bg-[var(--surface-raised)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
              'transition-colors duration-150',
              'focus:outline-none',
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-[var(--border)] hover:border-[var(--border-hover)]',
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            {...props}
          />

          {rightAddon && (
            <div className="absolute right-3 text-[var(--text-muted)] pointer-events-none">
              {rightAddon}
            </div>
          )}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-[var(--text-muted)]">
            {hint}
          </p>
        )}

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
