'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import type { RelationshipType } from '@/types/tree.types';
import type { ValidationError } from '@/types/relationship.types';
import { useState } from 'react';

interface RelationshipModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (type: RelationshipType, marriageYear?: number, divorceYear?: number, adoptionYear?: number, bondYear?: number) => void;
  sourceNodeName: string;
  targetNodeName: string;
  validationErrors?: ValidationError[];
  hasDuplicate?: boolean;
  loading?: boolean;
}

export function RelationshipModal({
  open,
  onClose,
  onConfirm,
  sourceNodeName,
  targetNodeName,
  validationErrors = [],
  hasDuplicate = false,
  loading = false,
}: RelationshipModalProps) {
  const t = useTranslations('tree.relationship');
  const tv = useTranslations('validation');
  const tc = useTranslations('common');

  const [selectedType, setSelectedType] = useState<RelationshipType>('parent-child');
  const [marriageYear, setMarriageYear] = useState<string>('');
  const [divorceYear,  setDivorceYear]  = useState<string>('');
  const [adoptionYear, setAdoptionYear] = useState<string>('');
  const [bondYear, setBondYear] = useState<string>('');

  const options = [
    { value: 'parent-child' as RelationshipType, label: `${sourceNodeName} → Cha/mẹ ruột của ${targetNodeName}` },
    { value: 'adoptive-parent' as RelationshipType, label: `${sourceNodeName} → Cha/mẹ nuôi của ${targetNodeName}` },
    { value: 'spouse' as RelationshipType, label: `${sourceNodeName} ♥ Vợ/Chồng của ${targetNodeName}` },
    { value: 'sibling-bond' as RelationshipType, label: `${sourceNodeName} ⇄ Anh em kết nghĩa với ${targetNodeName}` },
  ];

  const errorLabel = (code: string) => {
    const map: Record<string, string> = {
      INVALID_YEAR: 'Năm kết hôn không hợp lệ',
      INVALID_ADOPTION_YEAR: 'Năm nhận nuôi không hợp lệ',
      INVALID_BOND_YEAR: 'Năm kết nghĩa không hợp lệ',
    };
    return map[code] ?? (tv as (k: string) => string)(code);
  };

  function handleConfirm() {
    const mYear = marriageYear.trim() ? Number(marriageYear) : undefined;
    const dYear = divorceYear.trim()  ? Number(divorceYear)  : undefined;
    const aYear = adoptionYear.trim() ? Number(adoptionYear) : undefined;
    const bYear = bondYear.trim()     ? Number(bondYear)     : undefined;
    onConfirm(
      selectedType,
      Number.isFinite(mYear) ? mYear : undefined,
      Number.isFinite(dYear) ? dYear : undefined,
      Number.isFinite(aYear) ? aYear : undefined,
      Number.isFinite(bYear) ? bYear : undefined,
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('connectTitle')}
      description={t('connectDesc')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {tc('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={validationErrors.length > 0 && !hasDuplicate}
          >
            {tc('confirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {hasDuplicate && (
          <Alert variant="warning">
            {t('existingWarning')}
          </Alert>
        )}

        {validationErrors.length > 0 && !hasDuplicate && (
          <Alert variant="error">
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((e) => (
                <li key={e.code}>{errorLabel(e.code)}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Select
          label={t('selectType')}
          options={options}
          value={selectedType}
          onChange={(v) => setSelectedType(v as RelationshipType)}
        />

        {selectedType === 'spouse' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="marriage-year">
                Năm kết hôn (tùy chọn)
              </label>
              <input
                id="marriage-year"
                type="number"
                min={1800}
                max={3000}
                placeholder="vd. 2000"
                value={marriageYear}
                onChange={(e) => setMarriageYear(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-active)] px-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="divorce-year">
                Năm ly hôn (tùy chọn, để trống nếu đang kết hôn)
              </label>
              <input
                id="divorce-year"
                type="number"
                min={1800}
                max={3000}
                placeholder="vd. 2020"
                value={divorceYear}
                onChange={(e) => setDivorceYear(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-active)] px-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>
          </div>
        )}

        {selectedType === 'adoptive-parent' && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="adoption-year">
              Năm nhận nuôi (tùy chọn)
            </label>
            <input
              id="adoption-year"
              type="number"
              min={1800}
              max={3000}
              placeholder="vd. 2010"
              value={adoptionYear}
              onChange={(e) => setAdoptionYear(e.target.value)}
              className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-active)] px-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
        )}

        {selectedType === 'sibling-bond' && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-primary)]" htmlFor="bond-year">
              Năm kết nghĩa (tùy chọn)
            </label>
            <input
              id="bond-year"
              type="number"
              min={1800}
              max={3000}
              placeholder="vd. 2005"
              value={bondYear}
              onChange={(e) => setBondYear(e.target.value)}
              className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-active)] px-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
