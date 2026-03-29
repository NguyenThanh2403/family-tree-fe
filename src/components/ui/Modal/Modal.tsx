'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  // Sync open/close with <dialog>
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Lock body scroll
  React.useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Handle native cancel (ESC key)
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className={cn(
        'backdrop:bg-black/65 data-[theme=light]:backdrop:bg-white/70 backdrop:backdrop-blur-sm',
        'bg-[var(--surface)] text-[var(--text-primary)]',
        'rounded-2xl shadow-2xl shadow-[#db2777]/15 p-0 border border-[var(--border)]',
        'relative open:flex open:flex-col open:items-center open:justify-center',
        'max-h-[90vh] px-4 py-4',
        size === 'md' ? 'max-w-sm' : sizeClasses[size],
        // <dialog> default styles override
        '[&:not([open])]:hidden',
      )}
      style={{
        inset: 0,
        margin: 'auto',
      }}
    >
      {/* Header */}
      {(title || description) && (
        <div className="flex items-start justify-start gap-3 pr-10">
          <div>
            {title && (
              <h2 id={titleId} className="text-base font-semibold text-[var(--text-primary)]">
                {title}
              </h2>
            )}
            {description && (
              <p id={descId} className="text-sm text-[var(--text-muted)] mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Close button - positioned at top-right corner */}
      <button
        onClick={onClose}
        aria-label="Close dialog"
        className="absolute top-3 right-3 shrink-0 rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
      >
        <X size={18} />
      </button>

      {/* Body */}
      <div className="px-2 py-1.5 flex-1 overflow-y-auto">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-end gap-2 px-2 py-1.5">
          {footer}
        </div>
      )}
    </dialog>
  );
}
