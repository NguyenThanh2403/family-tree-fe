import * as React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:brightness-90 disabled:opacity-50',
  secondary:
    'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--surface-active)] hover:border-[var(--border-hover)] active:brightness-95 disabled:opacity-50',
  ghost:
    'bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] active:bg-[var(--surface-active)] disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
  link:
    'bg-transparent text-[var(--accent)] hover:underline underline-offset-2 disabled:opacity-50 p-0',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg',
          'transition-colors duration-150 focus-visible:ring-2',
          'focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
          'disabled:cursor-not-allowed select-none',
          variantClasses[variant],
          variant !== 'link' && sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} aria-hidden />
        ) : (
          leftIcon && <span aria-hidden>{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && <span aria-hidden>{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
