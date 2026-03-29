import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  error,
  disabled,
  required,
  id,
  className,
}: SelectProps) {
  const selectId = id ?? React.useId();
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value ?? ''}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={errorId}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-lg border px-3 py-2 pr-9 text-sm',
            'bg-[var(--surface-raised)] text-[var(--text-primary)]',
            'transition-colors duration-150',
            'focus:outline-none',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[var(--border)] hover:border-[var(--border-hover)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            !value && 'text-[var(--text-muted)]',
            className,
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          aria-hidden
        />
      </div>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
