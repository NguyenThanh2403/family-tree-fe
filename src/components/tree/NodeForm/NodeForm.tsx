'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { validateMember } from '@/core/validation/tree.validation';
import type { NodeFormData, Gender } from '@/types/tree.types';
import type { RelativeRole } from '@/components/tree/NodeContextMenu';

interface NodeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NodeFormData) => Promise<void>;
  initialData?: Partial<NodeFormData>;
  mode: 'create' | 'edit';
  /** When creating a relative, show relationship-specific year fields and contextual title */
  role?: RelativeRole;
  /** Name of the anchor member (for modal description) */
  anchorName?: string;
}

const CURRENT_YEAR = new Date().getFullYear();

const ROLE_TITLES: Record<RelativeRole, string> = {
  'parent':          'Thêm cha / mẹ',
  'adoptive-parent': 'Thêm cha / mẹ nuôi',
  'spouse':          'Thêm vợ / chồng',
  'child':           'Thêm con',
  'adoptive-child':  'Thêm con nuôi',
  'sibling':         'Thêm anh / chị / em ruột',
  'sibling-bond':    'Thêm anh / chị / em kết nghĩa',
};

export function NodeForm({ open, onClose, onSubmit, initialData, mode, role, anchorName }: NodeFormProps) {
  const t = useTranslations('tree.member');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');

  const [name, setName] = useState(initialData?.name ?? '');
  const [gender, setGender] = useState<Gender>(initialData?.gender ?? 'unknown');
  const [birthYear, setBirthYear] = useState(String(initialData?.birthYear ?? ''));
  const [deathYear, setDeathYear] = useState(String(initialData?.deathYear ?? ''));
  const [birthPlace, setBirthPlace] = useState(initialData?.birthPlace ?? '');
  const [note, setNote] = useState(initialData?.note ?? '');
  const [marriageYear, setMarriageYear] = useState('');
  const [divorceYear, setDivorceYear]   = useState('');
  const [bondYear, setBondYear] = useState('');
  const [adoptionYear, setAdoptionYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Delay slightly to ensure <dialog>.showModal() has opened the dialog
    const id = setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        if (typeof nameInputRef.current.select === 'function') {
          nameInputRef.current.select();
        }
      }
    }, 50);
    return () => clearTimeout(id);
  }, [open]);

  const genderOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
    { value: 'unknown', label: t('unknown') },
  ];

  const modalTitle = role ? ROLE_TITLES[role] : mode === 'create' ? tc('add') : tc('edit');
  const modalDesc  = role && anchorName ? `cho ${anchorName}` : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: NodeFormData = {
      name: name.trim(),
      gender,
      birthYear: birthYear ? parseInt(birthYear, 10) : undefined,
      deathYear: deathYear ? parseInt(deathYear, 10) : undefined,
      birthPlace: birthPlace.trim() || undefined,
      note: note.trim() || undefined,
      marriageYear:  role === 'spouse' && marriageYear.trim()  ? parseInt(marriageYear, 10)  : undefined,
      divorceYear:   role === 'spouse' && divorceYear.trim()   ? parseInt(divorceYear, 10)   : undefined,
      adoptionYear: (role === 'adoptive-parent' || role === 'adoptive-child') && adoptionYear.trim() ? parseInt(adoptionYear, 10) : undefined,
      bondYear:      role === 'sibling-bond' && bondYear.trim() ? parseInt(bondYear, 10) : undefined,
    };

    const validation = validateMember(data);
    if (!validation.valid) {
      setError(tv(validation.errors[0].code as Parameters<typeof tv>[0]));
      return;
    }

    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : tc('error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      description={modalDesc}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {tc('cancel')}
          </Button>
          <Button form="node-form" type="submit" loading={loading}>
            {tc('save')}
          </Button>
        </>
      }
    >
      <form id="node-form" onSubmit={handleSubmit} className="space-y-3" noValidate>
        {error && <Alert variant="error">{error}</Alert>}

        <Input
          ref={nameInputRef}
          label={t('name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label={t('gender')}
          options={genderOptions}
          value={gender}
          onChange={(v) => setGender(v as Gender)}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('birthYear')}
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="e.g. 1950"
            min={1000}
            max={CURRENT_YEAR}
          />
          <Input
            label={t('deathYear')}
            type="number"
            value={deathYear}
            onChange={(e) => setDeathYear(e.target.value)}
            placeholder={t('alive')}
            min={1000}
            max={CURRENT_YEAR}
          />
        </div>

        <Input
          label={t('birthPlace')}
          value={birthPlace}
          onChange={(e) => setBirthPlace(e.target.value)}
          placeholder="e.g. Hà Nội"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">{t('note')}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm bg-[var(--surface-raised)] text-[var(--text-primary)]
                       focus:outline-none focus:ring-0
                       resize-none hover:border-[var(--border-hover)] transition-colors"
          />
        </div>

        {/* ── Relationship year fields (one-step flow) ── */}
        {role === 'spouse' && (
          <div className="space-y-3 pt-2">
            <Input
              label="Năm kết hôn (tùy chọn)"
              type="number"
              value={marriageYear}
              onChange={(e) => setMarriageYear(e.target.value)}
              placeholder="vd. 2000"
              min={1800}
              max={CURRENT_YEAR + 1}
            />
            <Input
              label="Năm ly hôn (tùy chọn, để trống nếu đang kết hôn)"
              type="number"
              value={divorceYear}
              onChange={(e) => setDivorceYear(e.target.value)}
              placeholder="vd. 2020"
              min={1800}
              max={CURRENT_YEAR + 1}
            />
          </div>
        )}

        {(role === 'adoptive-parent' || role === 'adoptive-child') && (
          <div className="space-y-3 pt-2">
            <Input
              label="Năm nhận nuôi (tùy chọn)"
              type="number"
              value={adoptionYear}
              onChange={(e) => setAdoptionYear(e.target.value)}
              placeholder="vd. 2010"
              min={1800}
              max={CURRENT_YEAR + 1}
            />
          </div>
        )}

        {role === 'sibling-bond' && (
          <div className="space-y-3 pt-2">
            <Input
              label="Năm kết nghĩa (tùy chọn)"
              type="number"
              value={bondYear}
              onChange={(e) => setBondYear(e.target.value)}
              placeholder="vd. 2005"
              min={1800}
              max={CURRENT_YEAR + 1}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
