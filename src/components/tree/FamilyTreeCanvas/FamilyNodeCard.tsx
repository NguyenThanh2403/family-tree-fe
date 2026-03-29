'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { User, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useTreeColors } from '@/hooks/useTreeColors';
import type { FamilyMember } from '@/types/tree.types';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatLifespan(birthYear?: number, deathYear?: number): string {
  if (!birthYear) return '';
  return deathYear ? `${birthYear} – ${deathYear}` : `b. ${birthYear}`;
}

/** Derive rough age category from birth/death years */
function getAgeGroup(birthYear?: number, deathYear?: number): 'elder' | 'adult' | 'young' | 'unknown' {
  if (!birthYear) return 'unknown';
  const refYear = deathYear ?? new Date().getFullYear();
  const age = refYear - birthYear;
  if (age >= 70) return 'elder';
  if (age >= 30) return 'adult';
  return 'young';
}

/** Roman numeral for generation badge (capped at 10) */
function genRoman(g: number): string {
  const map: Record<number, string> = {
    0: 'I', 1: 'II', 2: 'III', 3: 'IV', 4: 'V',
    5: 'VI', 6: 'VII', 7: 'VIII', 8: 'IX', 9: 'X',
  };
  return map[Math.min(g, 9)] ?? String(g + 1);
}

// ── per-gender colour tokens ──────────────────────────────────────────────────
const genderStyles = {
  male: {
    accent:      '#4a90d9',
    accentBg:    'rgba(74,144,217,0.13)',
    handleColor: '#4a90d9',
    border:      '#2a5580',
    gradFrom:    '#1a3a5c',
    badge:       'bg-blue-500/20 text-blue-300',
  },
  female: {
    accent:      '#db2777',
    accentBg:    'rgba(219,39,119,0.13)',
    handleColor: '#db2777',
    border:      '#7a1545',
    gradFrom:    '#4a0e2a',
    badge:       'bg-pink-500/20 text-pink-300',
  },
  unknown: {
    accent:      '#9d8090',
    accentBg:    'rgba(157,128,144,0.10)',
    handleColor: '#9d8090',
    border:      '#3d2535',
    gradFrom:    '#2a1a22',
    badge:       'bg-[#3d2535] text-[#9d8090]',
  },
} as const;

// ── types ─────────────────────────────────────────────────────────────────────

interface FamilyNodeData extends Record<string, unknown> {
  member:            FamilyMember;
  isRoot?:           boolean;
  isSelected?:       boolean;
  generation?:       number;
  hasParents?:       boolean;
  hasChildren?:      boolean;
  isAncCollapsed?:   boolean;
  isDescCollapsed?:  boolean;
  hiddenAncCount?:   number;
  hiddenDescCount?:  number;
  onContextMenu?:    (id: string, x: number, y: number) => void;
  onCollapseAnc?:    (id: string) => void;
  onCollapseDesc?:   (id: string) => void;
  onFocusToggle?:    (id: string) => void;
}

// ── component ─────────────────────────────────────────────────────────────────

export const FamilyNodeCard = memo(function FamilyNodeCard({ data, selected }: NodeProps) {
  const {
    member,
    isRoot,
    isSelected,
    generation = 0,
    hasParents,
    hasChildren,
    isAncCollapsed,
    isDescCollapsed,
    hiddenAncCount = 0,
    hiddenDescCount = 0,
    onContextMenu,
    onCollapseAnc,
    onCollapseDesc,
    onFocusToggle,
  } = data as FamilyNodeData;
  const isActive   = isSelected || selected;
  const isDeceased = !!member.deathYear;
  const lifespan   = formatLifespan(member.birthYear, member.deathYear);
  const ageGroup   = getAgeGroup(member.birthYear, member.deathYear);
  const gs         = genderStyles[member.gender ?? 'unknown'] ?? genderStyles.unknown;
  const colors     = useTreeColors();

  const avatarSize = ageGroup === 'elder' ? 52 : ageGroup === 'adult' ? 46 : 40;
  const iconSize   = ageGroup === 'elder' ? 22 : ageGroup === 'adult' ? 18 : 16;

  function triggerMenu(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    onContextMenu?.(member.id, e.clientX, e.clientY);
  }

  const handleStyle = {
    background:   gs.handleColor,
    border:       `3px solid ${colors.bg}`,
    width:        12,
    height:       12,
    borderRadius: '50%',
  };

  return (
    <div onContextMenu={triggerMenu} className="relative group">

      {/* ── Focus button (prune to this branch) — TOP-CENTER ── */}
      {hasParents && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); (onFocusToggle ?? onCollapseAnc)?.(member.id); }}
          title={isAncCollapsed ? 'Hiện toàn bộ cây' : 'Thu gọn về nhánh này'}
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5
                     px-1.5 h-5 rounded-full border text-[9px] font-bold
                     transition-all duration-150 shadow-sm"
          style={{
            background:  isAncCollapsed ? gs.accent : colors.labelBg,
            borderColor: gs.border,
            color:       isAncCollapsed ? '#fff' : gs.accent,
          }}
          aria-pressed={isAncCollapsed}
          aria-label={isAncCollapsed ? 'Hiện toàn bộ cây' : 'Thu gọn về nhánh này'}
        >
          {isAncCollapsed ? (
            <><ChevronDown size={9} />{hiddenAncCount > 0 ? `-${hiddenAncCount}` : ''}</>
          ) : (
            <ChevronUp size={9} />
          )}
        </button>
      )}

      {/* ── Collapse descendants button — BOTTOM-CENTER ── */}
      {hasChildren && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onCollapseDesc?.(member.id); }}
          title={isDescCollapsed ? 'Hiện hậu duệ' : 'Ẩn hậu duệ'}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5
                     px-1.5 h-5 rounded-full border text-[9px] font-bold
                     transition-all duration-150 shadow-sm"
          style={{
            background:  isDescCollapsed ? gs.accent : colors.labelBg,
            borderColor: gs.border,
            color:       isDescCollapsed ? '#fff' : gs.accent,
          }}
          aria-pressed={isDescCollapsed}
          aria-label={isDescCollapsed ? `Hiện hậu duệ (${hiddenDescCount} ẩn)` : 'Ẩn hậu duệ'}
        >
          {isDescCollapsed ? (
            <><ChevronUp size={9} />{hiddenDescCount > 0 ? `+${hiddenDescCount}` : ''}</>
          ) : (
            <ChevronDown size={9} />
          )}
        </button>
      )}

      {/* ── Handles ── */}
      <Handle type="target"  position={Position.Top}    style={handleStyle} aria-label="Connect as child" />
      <Handle type="source"  position={Position.Bottom} style={handleStyle} aria-label="Connect as parent" />
      <Handle type="source"  position={Position.Right}  id="right" style={handleStyle} aria-label="Connect as spouse (right)" />
      <Handle type="target"  position={Position.Left}   id="left"  style={handleStyle} aria-label="Connect as spouse (left)" />

      {/* ── Root badge (hidden on hover) ── */}
      {isRoot && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded-full
                     text-[8px] font-bold text-white bg-amber-500 shadow pointer-events-none
                     group-hover:opacity-0 transition-opacity duration-150 whitespace-nowrap"
          aria-label="Root member"
        >
          ★ GỐC
        </div>
      )}

      {/* ── Hover context-menu button ── */}
      <button
        aria-label={`Options for ${member.name}`}
        onClick={triggerMenu}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute -top-2.5 -right-2.5 z-20 w-5 h-5 rounded-full
                   flex items-center justify-center shadow-md
                   opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ background: gs.accent }}
      >
        <MoreHorizontal size={11} className="text-white" />
      </button>

      {/* ── Card body ── */}
      <div
        className={cn(
          'flex flex-col items-center gap-2 w-40 rounded-xl pt-4 pb-3 px-3',
          'transition-all duration-150 cursor-pointer select-none relative overflow-hidden',
          isDeceased && 'opacity-70',
        )}
        style={{
          backgroundColor: isActive ? gs.accentBg : colors.labelBg,
          backgroundImage: `linear-gradient(160deg, ${gs.gradFrom}55 0%, transparent 60%)`,
          border:    `${isActive ? 2 : 1}px solid ${isActive ? gs.accent : gs.border}`,
          boxShadow: isActive ? `0 0 22px ${gs.accentBg}` : undefined,
        }}
      >
        {/* Generation badge — top-left */}
        <span
          className={cn('absolute top-2 left-2 z-10 text-[8px] font-bold px-1 rounded', gs.badge)}
          title={`Đời thứ ${generation + 1}`}
        >
          {genRoman(generation)}
        </span>

        {/* Deceased dagger — top-right */}
        {isDeceased && (
          <span
            className="absolute top-2 right-2 z-10 text-[11px] leading-none"
            style={{ color: colors.buttonText }}
            title="Đã mất"
          >
            †
          </span>
        )}

        {/* Avatar */}
        <div
          className="relative z-10 rounded-full flex items-center justify-center overflow-hidden mt-1"
          style={{
            width:     avatarSize,
            height:    avatarSize,
            boxShadow: `0 0 0 2px ${gs.accent}`,
            background: gs.accentBg,
          }}
        >
          {member.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
          ) : (
            <User size={iconSize} style={{ color: gs.accent }} aria-hidden />
          )}
        </div>

        {/* Name */}
        <span
          className="relative z-10 text-[12px] font-semibold text-white text-center leading-tight line-clamp-2 w-full"
          style={{ textDecoration: isDeceased ? 'line-through' : undefined, textDecorationColor: colors.buttonText }}
        >
          {member.name}
        </span>

        {/* Lifespan */}
        {lifespan && (
          <span className="relative z-10 text-[10px] font-medium" style={{ color: gs.accent }}>
            {lifespan}
          </span>
        )}

        {/* Birthplace */}
        {member.birthPlace && (
          <span className="relative z-10 text-[9px] text-center truncate w-full" style={{ color: colors.buttonText }}>
            📍 {member.birthPlace}
          </span>
        )}
      </div>
    </div>
  );
});
