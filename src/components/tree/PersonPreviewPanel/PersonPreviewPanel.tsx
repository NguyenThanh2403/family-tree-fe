'use client';

import { memo, Children } from 'react';
import { X, User, MapPin, Heart, Users, Baby, Star, Info, ChevronRight, UserCheck, GitMerge } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { FamilyMember } from '@/types/tree.types';

export interface PersonPreviewData {
  member: FamilyMember;
  father?: FamilyMember;
  mother?: FamilyMember;
  otherParents?: FamilyMember[];
  spouses: { person: FamilyMember; marriageYear?: number; divorceYear?: number }[];
  children: FamilyMember[];
  siblings: FamilyMember[];
  adoptiveParents: { person: FamilyMember; adoptionYear?: number }[];
  bondedSiblings: { person: FamilyMember; bondYear?: number }[];
  eldestSon?: FamilyMember;
  birthOrderLabel?: string;
  ancestorCount: number;
  descendantCount: number;
}

interface PersonPreviewPanelProps {
  data: PersonPreviewData;
  onClose?: () => void;
  onEdit?: (id: string) => void;
}

const badge = (label: string, tone: 'pink' | 'blue' | 'neutral' = 'neutral') => {
  const toneClass =
    tone === 'pink'
      ? 'bg-[#db2777]/15 text-[#f7c0de] border border-[#db2777]/40'
      : tone === 'blue'
      ? 'bg-[#4a90d9]/15 text-[#c5ddf8] border border-[#4a90d9]/40'
      : 'bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border)]';
  return cn('px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1', toneClass);
};

export const PersonPreviewPanel = memo(function PersonPreviewPanel({ data, onClose, onEdit }: PersonPreviewPanelProps) {
  const { member, father, mother, otherParents = [], spouses, children, siblings, adoptiveParents = [], bondedSiblings = [], eldestSon, ancestorCount, descendantCount } = data;

  const lifespan = member.birthYear
    ? `${member.birthYear}${member.deathYear ? ` – ${member.deathYear}` : ''}`
    : 'Chưa rõ năm sinh';

  return (
    <aside
      className={cn(
        'absolute left-4 bottom-4 z-30 w-[340px]',
        'rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl shadow-[#db2777]/10',
        'p-4 space-y-3 backdrop-blur-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={badge(member.gender === 'female' ? 'Nữ' : member.gender === 'male' ? 'Nam' : 'Khác', member.gender === 'female' ? 'pink' : member.gender === 'male' ? 'blue' : 'neutral')}>
              <User size={13} />
              <span>{member.gender === 'female' ? 'Nữ' : member.gender === 'male' ? 'Nam' : 'Khác'}</span>
            </div>
            <div className={badge(lifespan, 'neutral')}>{lifespan}</div>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-tight truncate">{member.name}</h3>
          {member.birthPlace && (
            <div className="text-sm text-[var(--text-muted)] flex items-center gap-1">
              <MapPin size={13} className="text-[#db2777]" />
              <span className="truncate">{member.birthPlace}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={badge(`${ancestorCount} tổ tiên`, 'neutral')}>
            {ancestorCount} tổ tiên
          </div>
          <div className={badge(`${descendantCount} hậu duệ`, 'neutral')}>
            {descendantCount} hậu duệ
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Spouse(s) */}
      <Section title="Vợ/Chồng" icon={<Heart size={14} className="text-[#db2777]" aria-hidden />} empty="Chưa có dữ liệu">
        {spouses.map((sp) => (
          <Row key={sp.person.id}
            primary={sp.person.name}
            secondary={sp.person.birthYear ? `b. ${sp.person.birthYear}` : undefined}
            meta={sp.marriageYear ? `Kết hôn ${sp.marriageYear}${sp.divorceYear ? ` – ${sp.divorceYear}` : ''}` : 'Chưa rõ năm kết hôn'}
          />
        ))}
      </Section>

      {/* Parents */}
      <Section title="Cha/Mẹ" icon={<Users size={14} className="text-[#4a90d9]" aria-hidden />} empty="Chưa rõ">
        <Row primary={father?.name ?? 'Chưa rõ'} meta={father ? 'Cha' : undefined} muted={!father} />
        <Row primary={mother?.name ?? 'Chưa rõ'} meta={mother ? 'Mẹ' : undefined} muted={!mother} />
        {otherParents.map((p) => (
          <Row key={p.id} primary={p.name} meta="Giám hộ" />
        ))}
      </Section>

      {/* Adoptive Parents */}
      {adoptiveParents.length > 0 && (
        <Section title="Cha/Mẹ nuôi" icon={<UserCheck size={14} className="text-[#22d3ee]" aria-hidden />}>
          {adoptiveParents.map(({ person, adoptionYear }) => (
            <Row
              key={person.id}
              primary={person.name}
              secondary={person.birthYear ? `b. ${person.birthYear}` : undefined}
              meta={adoptionYear ? `Nhận nuôi ${adoptionYear}` : 'Cha/Mẹ nuôi'}
            />
          ))}
        </Section>
      )}

      {/* Children */}
      <Section title="Con" icon={<Baby size={14} className="text-[#4a90d9]" aria-hidden />} empty="Chưa có con">
        {children.map((child, idx) => {
          const isEldest = eldestSon && eldestSon.id === child.id;
          return (
            <Row
              key={child.id}
              primary={child.name}
              secondary={child.birthYear ? `b. ${child.birthYear}` : undefined}
              meta={isEldest ? 'Trưởng nam' : `Thứ ${idx + 1}`}
              highlight={isEldest}
            />
          );
        })}
      </Section>

      {/* Siblings */}
      <Section title="Anh/Chị/Em" icon={<Users size={14} className="text-[#9d8090]" aria-hidden />} empty="Không có dữ liệu">
        {data.birthOrderLabel && (
          <Row primary={data.birthOrderLabel} meta="Vị trí trong gia đình" />
        )}
        {siblings.map((sib) => (
          <Row key={sib.id} primary={sib.name} secondary={sib.birthYear ? `b. ${sib.birthYear}` : undefined} />
        ))}
      </Section>

      {/* Bonded siblings */}
      {bondedSiblings.length > 0 && (
        <Section title="Anh em kết nghĩa" icon={<GitMerge size={14} className="text-[#a855f7]" aria-hidden />}>
          {bondedSiblings.map(({ person, bondYear }) => (
            <Row
              key={person.id}
              primary={person.name}
              secondary={person.birthYear ? `b. ${person.birthYear}` : undefined}
              meta={bondYear ? `Kết nghĩa ${bondYear}` : 'Anh em kết nghĩa'}
            />
          ))}
        </Section>
      )}

      {/* Notes */}
      {member.note && (
        <Section title="Ghi chú" icon={<Info size={14} className="text-[#db2777]" aria-hidden />}>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{member.note}</p>
        </Section>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <ChevronRight size={12} />
          Nhấn node khác để xem nhanh thông tin
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(member.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm"
          >
            Chỉnh sửa
          </button>
        )}
      </div>
    </aside>
  );
});

function Section({ title, icon, children, empty }: { title: string; icon?: React.ReactNode; children: React.ReactNode; empty?: string }) {
  const isEmpty = Children.count(children) === 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {icon}
        <span>{title}</span>
      </div>
      <div className="bg-[var(--surface-active)] border border-[var(--border)] rounded-xl p-2.5 space-y-1.5">
        {isEmpty && empty ? (
          <p className="text-sm text-[var(--text-muted)]">{empty}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function Row({ primary, secondary, meta, muted = false, highlight = false }: { primary: string; secondary?: string; meta?: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className={cn(
      'flex items-center justify-between gap-2 rounded-lg px-2 py-1.5',
      highlight ? 'bg-[#db2777]/10 border border-[#db2777]/40 text-[var(--text-primary)]' : 'text-[var(--text-primary)]',
      muted && 'text-[var(--text-muted)]'
    )}>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate">{primary}</p>
        {secondary && <p className="text-[11px] text-[var(--text-muted)] truncate">{secondary}</p>}
      </div>
      <div className="text-[11px] text-[var(--text-muted)] font-semibold whitespace-nowrap">{meta}</div>
    </div>
  );
}
