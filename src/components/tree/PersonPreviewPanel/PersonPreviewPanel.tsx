'use client';

import { memo, Children } from 'react';
import { X, User, MapPin, Heart, Users, Baby, Star, Info, ChevronRight, UserCheck, GitMerge } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('tree.preview');
  const tm = useTranslations('tree.member');
  const { member, father, mother, otherParents = [], spouses, children, siblings, adoptiveParents = [], bondedSiblings = [], eldestSon, ancestorCount, descendantCount } = data;

  const lifespan = member.birthYear
    ? `${member.birthYear}${member.deathYear ? ` – ${member.deathYear}` : ''}`
    : t('unknownBirthYear');

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
            <div className={badge(member.gender === 'female' ? tm('female') : member.gender === 'male' ? tm('male') : tm('unknown'), member.gender === 'female' ? 'pink' : member.gender === 'male' ? 'blue' : 'neutral')}>
              <User size={13} />
              <span>{member.gender === 'female' ? tm('female') : member.gender === 'male' ? tm('male') : tm('unknown')}</span>
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
          <div className={badge(`${ancestorCount} ${t('ancestors')}`, 'neutral')}>
            {ancestorCount} {t('ancestors')}
          </div>
          <div className={badge(`${descendantCount} ${t('descendants')}`, 'neutral')}>
            {descendantCount} {t('descendants')}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label={t('close')}
              className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-active)]"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Spouse(s) */}
      <Section title={t('spouse')} icon={<Heart size={14} className="text-[#db2777]" aria-hidden />} empty={t('noSpouseData')}>
        {spouses.map((sp) => (
          <Row key={sp.person.id}
            primary={sp.person.name}
            secondary={sp.person.birthYear ? `${t('birth')} ${sp.person.birthYear}` : undefined}
            meta={sp.marriageYear ? `${t('married')} ${sp.marriageYear}${sp.divorceYear ? ` – ${sp.divorceYear}` : ''}` : t('unknownMarriedYear')}
          />
        ))}
      </Section>

      {/* Parents */}
      <Section title={t('parent')} icon={<Users size={14} className="text-[#4a90d9]" aria-hidden />} empty={t('unknown')}>
        <Row primary={father?.name ?? t('unknown')} meta={father ? t('father') : undefined} muted={!father} />
        <Row primary={mother?.name ?? t('unknown')} meta={mother ? t('mother') : undefined} muted={!mother} />
        {otherParents.map((p) => (
          <Row key={p.id} primary={p.name} meta={t('guardianship')} />
        ))}
      </Section>

      {/* Adoptive Parents */}
      {adoptiveParents.length > 0 && (
        <Section title={t('adoptiveParent')} icon={<UserCheck size={14} className="text-[#22d3ee]" aria-hidden />}>
          {adoptiveParents.map(({ person, adoptionYear }) => (
            <Row
              key={person.id}
              primary={person.name}
              secondary={person.birthYear ? `${t('birth')} ${person.birthYear}` : undefined}
              meta={adoptionYear ? `${t('adoptedYear')} ${adoptionYear}` : t('adoptiveParent')}
            />
          ))}
        </Section>
      )}

      {/* Children */}
      <Section title={t('child')} icon={<Baby size={14} className="text-[#4a90d9]" aria-hidden />} empty={t('noChildren')}>
        {children.map((child, idx) => {
          const isEldest = eldestSon && eldestSon.id === child.id;
          return (
            <Row
              key={child.id}
              primary={child.name}
              secondary={child.birthYear ? `${t('birth')} ${child.birthYear}` : undefined}
              meta={isEldest ? t('eldestSon') : `${t('nth')} ${idx + 1}`}
              highlight={isEldest}
            />
          );
        })}
      </Section>

      {/* Siblings */}
      <Section title={t('sibling')} icon={<Users size={14} className="text-[#9d8090]" aria-hidden />} empty={t('noSiblingData')}>
        {data.birthOrderLabel && (
          <Row primary={data.birthOrderLabel} meta={t('birthOrder')} />
        )}
        {siblings.map((sib) => (
          <Row key={sib.id} primary={sib.name} secondary={sib.birthYear ? `${t('birth')} ${sib.birthYear}` : undefined} />
        ))}
      </Section>

      {/* Bonded siblings */}
      {bondedSiblings.length > 0 && (
        <Section title={t('bondedSibling')} icon={<GitMerge size={14} className="text-[#a855f7]" aria-hidden />}>
          {bondedSiblings.map(({ person, bondYear }) => (
            <Row
              key={person.id}
              primary={person.name}
              secondary={person.birthYear ? `${t('birth')} ${person.birthYear}` : undefined}
              meta={bondYear ? `${t('bondYear')} ${bondYear}` : t('bondedSibling')}
            />
          ))}
        </Section>
      )}

      {/* Notes */}
      {member.note && (
        <Section title={t('notes')} icon={<Info size={14} className="text-[#db2777]" aria-hidden />}>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{member.note}</p>
        </Section>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <ChevronRight size={12} />
          {t('clickNodeInfo')}
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(member.id)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm"
          >
            {t('edit')}
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
