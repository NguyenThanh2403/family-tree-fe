'use client';

import * as React from 'react';
import { User, Edit2, Trash2, Crown } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Gender } from '@/types/tree.types';
import { formatLifespan } from '@/lib/utils';

export interface NodeChipProps {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  avatarUrl?: string;
  isRoot?: boolean;
  isSelected?: boolean;
  isHighlighted?: boolean;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const genderColors: Record<Gender, string> = {
  male: 'border-blue-400 bg-blue-50',
  female: 'border-pink-400 bg-pink-50',
  unknown: 'border-neutral-300 bg-neutral-50',
};

const genderAvatarBg: Record<Gender, string> = {
  male: 'bg-blue-100 text-blue-600',
  female: 'bg-pink-100 text-pink-600',
  unknown: 'bg-neutral-100 text-neutral-500',
};

export function NodeChip({
  id,
  name,
  gender,
  birthYear,
  deathYear,
  avatarUrl,
  isRoot = false,
  isSelected = false,
  isHighlighted = false,
  onClick,
  onEdit,
  onDelete,
  className,
}: NodeChipProps) {
  const lifespan = formatLifespan(birthYear, deathYear);
  const isDead = !!deathYear;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`${name}${lifespan ? `, ${lifespan}` : ''}`}
      onClick={() => onClick?.(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(id);
      }}
      className={cn(
        'relative group flex flex-col items-center gap-1.5',
        'w-32 rounded-xl border-2 px-3 py-3',
        'cursor-pointer transition-all duration-150 select-none',
        'hover:shadow-md',
        genderColors[gender],
        isSelected && '!border-green-500 ring-2 ring-green-300',
        isHighlighted && 'ring-2 ring-amber-300 !border-amber-400',
        isDead && 'opacity-70',
        className,
      )}
    >
      {/* Root badge */}
      {isRoot && (
        <Crown
          size={12}
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-amber-500 fill-amber-400"
          aria-label="Tree root"
        />
      )}

      {/* Avatar */}
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center text-xl overflow-hidden',
          genderAvatarBg[gender],
        )}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User size={22} aria-hidden />
        )}
      </div>

      {/* Name */}
      <span className="text-xs font-semibold text-neutral-800 text-center leading-tight line-clamp-2">
        {name}
      </span>

      {/* Lifespan */}
      {lifespan && (
        <span className="text-[10px] text-neutral-500">{lifespan}</span>
      )}

      {/* Action buttons (visible on hover) */}
      {(onEdit || onDelete) && (
        <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1">
          {onEdit && (
            <button
              aria-label={`Edit ${name}`}
              onClick={(e) => { e.stopPropagation(); onEdit(id); }}
              className="w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm
                         flex items-center justify-center text-neutral-500
                         hover:text-green-600 hover:border-green-400 transition-colors"
            >
              <Edit2 size={10} />
            </button>
          )}
          {onDelete && (
            <button
              aria-label={`Delete ${name}`}
              onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              className="w-6 h-6 rounded-full bg-white border border-neutral-200 shadow-sm
                         flex items-center justify-center text-neutral-500
                         hover:text-red-600 hover:border-red-400 transition-colors"
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
