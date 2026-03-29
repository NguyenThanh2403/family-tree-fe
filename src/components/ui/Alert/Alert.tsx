'use client';

import * as React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const variantConfig: Record<
  AlertVariant,
  { tone: string; icon: React.ReactNode }
> = {
  info: { tone: '#4a90d9', icon: <Info size={16} /> },
  success: { tone: '#4ade80', icon: <CheckCircle2 size={16} /> },
  warning: { tone: '#f59e0b', icon: <TriangleAlert size={16} /> },
  error: { tone: '#ef4444', icon: <AlertCircle size={16} /> },
};

export function Alert({
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  children,
  className,
}: AlertProps) {
  const { tone, icon: defaultIcon } = variantConfig[variant];

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 rounded-xl border p-4 shadow-md',
        'bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]',
        className,
      )}
    >
      <span className="shrink-0 mt-0.5 rounded-full p-1.5" aria-hidden style={{ color: tone, backgroundColor: `${tone}22` }}>
        {icon ?? defaultIcon}
      </span>

      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-1" style={{ color: tone }}>{title}</p>}
        <div className="text-sm text-[var(--text-secondary)]">{children}</div>
      </div>

      {dismissible && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 hover:opacity-70 transition-opacity text-[var(--text-muted)]"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
