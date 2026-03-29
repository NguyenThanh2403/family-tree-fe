'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { FamilyEdge, EdgeFormData } from '@/types/tree.types';

interface EdgeEditModalProps {
  open: boolean;
  edge: FamilyEdge | null;
  onClose: () => void;
  onSave: (edgeId: string, data: Partial<EdgeFormData>) => Promise<void>;
  loading?: boolean;
}

export function EdgeEditModal({ open, edge, onClose, onSave, loading }: EdgeEditModalProps) {
  const [marriageYear, setMarriageYear] = useState('');
  const [divorceYear, setDivorceYear] = useState('');
  const [adoptionYear, setAdoptionYear] = useState('');
  const [bondYear, setBondYear] = useState('');

  useEffect(() => {
    if (edge) {
      setMarriageYear(edge.marriageYear?.toString() ?? '');
      setDivorceYear(edge.divorceYear?.toString() ?? '');
      setAdoptionYear(edge.adoptionYear?.toString() ?? '');
      setBondYear(edge.bondYear?.toString() ?? '');
    }
  }, [edge]);

  if (!edge) return null;

  const title =
    edge.type === 'spouse'
      ? 'Sửa quan hệ hôn nhân'
      : edge.type === 'adoptive-parent'
      ? 'Sửa quan hệ nhận nuôi'
      : edge.type === 'sibling-bond'
      ? 'Sửa quan hệ kết nghĩa'
      : 'Sửa quan hệ';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!edge) return;
    const data: Partial<EdgeFormData> = {};
    if (edge.type === 'spouse') {
      if (marriageYear) data.marriageYear = parseInt(marriageYear, 10);
      if (divorceYear)  data.divorceYear  = parseInt(divorceYear, 10);
    } else if (edge.type === 'adoptive-parent') {
      if (adoptionYear) data.adoptionYear = parseInt(adoptionYear, 10);
    } else if (edge.type === 'sibling-bond') {
      if (bondYear) data.bondYear = parseInt(bondYear, 10);
    }
    await onSave(edge.id, data);
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {edge.type === 'spouse' && (
          <>
            <Input
              label="Năm kết hôn"
              type="number"
              placeholder="vd: 2000"
              value={marriageYear}
              onChange={(e) => setMarriageYear(e.target.value)}
            />
            <Input
              label="Năm ly hôn (nếu có)"
              type="number"
              placeholder="Để trống nếu vẫn đang kết hôn"
              value={divorceYear}
              onChange={(e) => setDivorceYear(e.target.value)}
            />
          </>
        )}
        {edge.type === 'adoptive-parent' && (
          <Input
            label="Năm nhận nuôi"
            type="number"
            placeholder="vd: 2005"
            value={adoptionYear}
            onChange={(e) => setAdoptionYear(e.target.value)}
          />
        )}
        {edge.type === 'sibling-bond' && (
          <Input
            label="Năm kết nghĩa"
            type="number"
            placeholder="vd: 2005"
            value={bondYear}
            onChange={(e) => setBondYear(e.target.value)}
          />
        )}
        {edge.type === 'parent-child' && (
          <p className="text-sm text-[var(--text-muted)]">Quan hệ cha/mẹ – con không có thông tin năm để chỉnh sửa.</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading || edge.type === 'parent-child'}>
            {loading ? 'Đang lưu…' : 'Lưu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
