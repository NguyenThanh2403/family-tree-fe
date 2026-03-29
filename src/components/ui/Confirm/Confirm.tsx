'use client';

import { Modal } from '../Modal';
import { Button } from '../Button';

export interface ConfirmProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function Confirm({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      closeOnOverlayClick={!loading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {/* Empty content — description is shown in header */}
      <span />
    </Modal>
  );
}
