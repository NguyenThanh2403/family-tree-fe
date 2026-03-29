'use client';

import { useEffect, useRef } from 'react';
import { UserPlus, UserCheck, Heart, Users, GitFork, GitBranch, Baby, Edit2, Trash2 } from 'lucide-react';
import { useTreeColors } from '@/hooks/useTreeColors';

export type RelativeRole = 'parent' | 'adoptive-parent' | 'spouse' | 'sibling' | 'sibling-bond' | 'child' | 'adoptive-child';

interface NodeContextMenuProps {
  memberId: string;
  memberName: string;
  x: number;
  y: number;
  onAddRelative: (memberId: string, role: RelativeRole) => void;
  onEdit: (memberId: string) => void;
  onDelete: (memberId: string) => void;
  onClose: () => void;
}

const ADD_ITEMS: { role: RelativeRole; label: string; icon: React.ElementType; iconClass: string }[] = [
  { role: 'parent',          label: 'Thêm cha/mẹ',              icon: UserPlus,   iconClass: 'text-blue-500' },
  { role: 'adoptive-parent', label: 'Thêm cha/mẹ nuôi',         icon: UserCheck,  iconClass: 'text-cyan-500' },
  { role: 'spouse',          label: 'Thêm vợ/chồng',            icon: Heart,      iconClass: 'text-pink-500' },
  { role: 'child',           label: 'Thêm con',                    icon: GitBranch,  iconClass: 'text-green-600' },
  { role: 'adoptive-child',  label: 'Thêm con nuôi',               icon: Baby,       iconClass: 'text-emerald-500' },
  { role: 'sibling',         label: 'Thêm anh/chị/em',   icon: Users,      iconClass: 'text-amber-500' },
  { role: 'sibling-bond',    label: 'Thêm kết nghĩa', icon: GitFork, iconClass: 'text-violet-500' },
];

export function NodeContextMenu({
  memberId,
  memberName,
  x,
  y,
  onAddRelative,
  onEdit,
  onDelete,
  onClose,
}: NodeContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const colors = useTreeColors();

  // Close on outside click or Escape
  useEffect(() => {
    function handleDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  // Adjust position so menu doesn't overflow viewport
  const adjustedX = Math.min(x, window.innerWidth - 210);
  const adjustedY = Math.min(y, window.innerHeight - 280);

  return (
    <div
      ref={ref}
      style={{ left: adjustedX, top: adjustedY, backgroundColor: colors.labelBg, borderColor: colors.border }}
      className="fixed z-50 w-52 rounded-xl shadow-2xl border py-1.5 overflow-hidden"
      role="menu"
      aria-label={`Actions for ${memberName}`}
    >
      <p
        className="px-3 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider truncate border-b"
        style={{ color: colors.buttonText, borderColor: colors.border }}
      >
        {memberName}
      </p>

      <div className="py-0.5">
        {ADD_ITEMS.map(({ role, label, icon: Icon, iconClass }) => (
          <button
            key={role}
            role="menuitem"
            onClick={() => { onAddRelative(memberId, role); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-opacity hover:opacity-80 active:opacity-60"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Icon size={14} className={iconClass} aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <div className="border-t py-0.5" style={{ borderColor: colors.border }}>
        <button
          role="menuitem"
          onClick={() => { onEdit(memberId); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-opacity hover:opacity-80 active:opacity-60"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Edit2 size={14} style={{ color: colors.buttonText }} aria-hidden />
          Chỉnh sửa
        </button>
        <button
          role="menuitem"
          onClick={() => { onDelete(memberId); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400
                     hover:bg-[#3a1e2e] active:bg-[#4a2638] transition-colors"
        >
          <Trash2 size={14} aria-hidden />
          Xóa thành viên
        </button>
      </div>
    </div>
  );
}

