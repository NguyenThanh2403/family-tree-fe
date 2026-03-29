'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import {
  UserPlus, ZoomIn, ZoomOut, Maximize2, Search,
  LayoutTemplate, AlignCenter,
  Undo2, Redo2, Map, BarChart2,
} from 'lucide-react';

import { useFamilyTree } from '@/hooks/useFamilyTree';
import { useRelationship } from '@/hooks/useRelationship';
import { useTreeColors } from '@/hooks/useTreeColors';
import { Confirm } from '@/components/ui/Confirm';
import { NodeForm } from '@/components/tree/NodeForm';
import { RelationshipModal } from '@/components/tree/RelationshipModal';
import { RelationshipAnalysisPanel } from '@/components/tree/RelationshipAnalysisPanel';
import { PersonPreviewPanel } from '@/components/tree/PersonPreviewPanel';
import { NodeContextMenu, type RelativeRole } from '@/components/tree/NodeContextMenu';
import { EdgeEditModal } from '@/components/tree/EdgeEditModal';
import { validateNewRelationship, countParents, hasSpouseTimeOverlap } from '@/core/validation/tree.validation';
import type { CanvasControls } from '@/components/tree/FamilyTreeCanvas';
import type { FamilyMember, NodeFormData, RelationshipType } from '@/types/tree.types';
import type { ValidationError } from '@/types/relationship.types';

function TreeCanvasLoading() {
  const colors = useTreeColors();

  return (
    <div style={{ backgroundColor: colors.bg }} className="flex-1 flex items-center justify-center">
      <div
        style={{ borderColor: colors.spouse }}
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      />
    </div>
  );
}

// Lazy-load ReactFlow (heavy bundle)
const FamilyTreeCanvas = dynamic(
  () => import('@/components/tree/FamilyTreeCanvas').then((m) => m.FamilyTreeCanvas),
  {
    ssr: false,
    loading: TreeCanvasLoading,
  },
);

// ── Types ────────────────────────────────────────────────────────────────────
type NodeFormContext =
  | { mode: 'create' }
  | { mode: 'create-relative'; anchorId: string; role: RelativeRole }
  | { mode: 'edit'; memberId: string }
  | null;

interface TreeViewerClientProps {
  treeId: string;
}

// ── Empty state illustration ──────────────────────────────────────────────────
function TreeIllustration() {
  return (
    <svg viewBox="0 0 160 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="70" y="130" width="20" height="45" rx="5" fill="currentColor" />
      <ellipse cx="80" cy="105" rx="45" ry="28" fill="currentColor" />
      <ellipse cx="80" cy="78"  rx="38" ry="24" fill="currentColor" />
      <ellipse cx="80" cy="54"  rx="30" ry="20" fill="currentColor" />
      <ellipse cx="80" cy="34"  rx="22" ry="16" fill="currentColor" />
    </svg>
  );
}

// ── Toolbar button helper ─────────────────────────────────────────────────────
function TBtn({
  onClick, title, children, active, colors,
}: {
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
  active?: boolean;
  colors: ReturnType<typeof useTreeColors>;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={
        active
          ? { backgroundColor: colors.spouse, color: 'white' }
          : { color: colors.buttonText }
      }
      className={
        active
          ? 'flex items-center justify-center w-8 h-8 rounded-lg transition-colors'
          : 'flex items-center justify-center w-8 h-8 rounded-lg hover:opacity-80 transition-opacity'
      }
    >
      {children}
    </button>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export function TreeViewerClient({ treeId }: TreeViewerClientProps) {
  const t  = useTranslations('tree');
  const tc = useTranslations('common');
  const tv = useTranslations('validation');

  const {
    tree, members, edges, selectedNodeIds,
    isLoading, error,
    fetchTree, addMember, updateMember, deleteMember,
    addEdge, updateEdge, deleteEdge,
    selectNode, deselectAll,
    checkDuplicateEdge,
  } = useFamilyTree();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [nodeFormCtx, setNodeFormCtx]       = useState<NodeFormContext>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [canvasControls, setCanvasControls] = useState<CanvasControls | null>(null);
  const [layoutDir, setLayoutDir]           = useState<'vertical' | 'horizontal'>('vertical');
  const [searchQuery, setSearchQuery]       = useState('');
  const [showMinimap, setShowMinimap]       = useState(true);
  const [showStats,   setShowStats]         = useState(false);

  // Context menu (right-click node)
  const [contextMenu, setContextMenu] = useState<{
    memberId: string; memberName: string; x: number; y: number;
  } | null>(null);

  // Drag-to-connect edge flow
  const [pendingEdge, setPendingEdge]                   = useState<{ sourceId: string; targetId: string } | null>(null);
  const [edgeValidationErrors, setEdgeValidationErrors] = useState<ValidationError[]>([]);
  const [edgeLoading, setEdgeLoading]                   = useState(false);

  // Edge editing
  const [pendingEditEdgeId, setPendingEditEdgeId] = useState<string | null>(null);
  const [edgeEditLoading, setEdgeEditLoading]     = useState(false);

  // ── Data loading ──────────────────────────────────────────────────────────
  useEffect(() => { fetchTree(treeId); }, [treeId, fetchTree]);

  // Get theme-aware tree colors
  const colors = useTreeColors();

  // ── Relationship analysis (2 nodes selected) ─────────────────────────────
  const nodeA = members.find((m) => m.id === selectedNodeIds[0]);
  const nodeB = members.find((m) => m.id === selectedNodeIds[1]);
  const analysis = useRelationship(nodeA, nodeB, edges, 'vi');

  // ── Derived maps for quick lookups ───────────────────────────────────────
  const memberById = useMemo(() => {
    const map = new globalThis.Map<string, FamilyMember>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);
  const { parentsMap, childrenMap, spousesMap } = useMemo(() => {
    const p = new globalThis.Map<string, string[]>();
    const c = new globalThis.Map<string, string[]>();
    const s = new globalThis.Map<string, string[]>();
    members.forEach(({ id }) => { p.set(id, []); c.set(id, []); s.set(id, []); });
    edges.forEach((e) => {
      if (e.type === 'parent-child') {
        p.get(e.target)?.push(e.source);
        c.get(e.source)?.push(e.target);
      }
      if (e.type === 'spouse') {
        s.get(e.source)?.push(e.target);
        s.get(e.target)?.push(e.source);
      }
    });
    return { parentsMap: p, childrenMap: c, spousesMap: s };
  }, [members, edges]);

  // Maps for adoptive parents and bonded siblings
  const adoptiveParentsMap = useMemo(() => {
    const ap = new globalThis.Map<string, { parentId: string; adoptionYear?: number }[]>();
    members.forEach(({ id }) => ap.set(id, []));
    edges.forEach((e) => {
      if (e.type === 'adoptive-parent') {
        ap.get(e.target)?.push({ parentId: e.source, adoptionYear: e.adoptionYear });
      }
    });
    return ap;
  }, [members, edges]);

  const bondedSiblingsMap = useMemo(() => {
    const bs = new globalThis.Map<string, { siblingId: string; bondYear?: number }[]>();
    members.forEach(({ id }) => bs.set(id, []));
    edges.forEach((e) => {
      if (e.type === 'sibling-bond') {
        bs.get(e.source)?.push({ siblingId: e.target, bondYear: e.bondYear });
        bs.get(e.target)?.push({ siblingId: e.source, bondYear: e.bondYear });
      }
    });
    return bs;
  }, [members, edges]);

  const primarySelectedId = selectedNodeIds[selectedNodeIds.length - 1];
  const previewMember = primarySelectedId ? memberById.get(primarySelectedId) : undefined;

  const previewData = useMemo(() => {
    if (!previewMember) return null;
    const parentIds = parentsMap.get(previewMember.id) ?? [];
    const parentMembers = parentIds.map((id) => memberById.get(id)).filter(Boolean) as typeof members;
    const father = parentMembers.find((p) => p.gender === 'male');
    const mother = parentMembers.find((p) => p.gender === 'female');
    const otherParents = parentMembers.filter((p) => p !== father && p !== mother);

    const spouseIds = spousesMap.get(previewMember.id) ?? [];
    const spouses = spouseIds
      .map((id) => {
        const person = memberById.get(id);
        if (!person) return null;
        const marriageEdge = edges.find(
          (e) => e.type === 'spouse' &&
          ((e.source === previewMember.id && e.target === id) || (e.target === previewMember.id && e.source === id)),
        );
        return { person, marriageYear: marriageEdge?.marriageYear, divorceYear: marriageEdge?.divorceYear };
      })
      .filter(Boolean) as { person: typeof members[number]; marriageYear?: number; divorceYear?: number }[];

    const children = (childrenMap.get(previewMember.id) ?? [])
      .map((id) => memberById.get(id))
      .filter(Boolean)
      .sort((a, b) => (a?.birthYear ?? 9999) - (b?.birthYear ?? 9999) || a!.name.localeCompare(b!.name)) as typeof members;

    const eldestSon = children
      .filter((c) => c.gender === 'male')
      .sort((a, b) => (a?.birthYear ?? 9999) - (b?.birthYear ?? 9999))[0];

    const siblingIds = new Set<string>();
    parentIds.forEach((pid) => {
      (childrenMap.get(pid) ?? []).forEach((cid) => { if (cid !== previewMember.id) siblingIds.add(cid); });
    });
    const siblings = [...siblingIds]
      .map((id) => memberById.get(id))
      .filter(Boolean)
      .sort((a, b) => (a?.birthYear ?? 9999) - (b?.birthYear ?? 9999) || a!.name.localeCompare(b!.name)) as typeof members;

    // Birth order label (include self among siblings + self)
    const birthOrderLabel = (() => {
      const group = [previewMember, ...siblings]
        .sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999) || a.name.localeCompare(b.name));
      const pos = group.findIndex((p) => p.id === previewMember.id);
      if (pos === -1) return undefined;
      const nth = pos + 1;
      const genderLabel = previewMember.gender === 'male' ? 'con trai' : previewMember.gender === 'female' ? 'con gái' : 'con';
      if (nth === 1 && previewMember.gender === 'male') return 'Trưởng nam';
      if (nth === group.length) return `Út ${genderLabel}`;
      return `Thứ ${nth} (${genderLabel})`;
    })();

    const countAncestors = () => {
      const seen = new Set<string>();
      const q = [...parentIds];
      while (q.length) {
        const id = q.shift()!;
        if (seen.has(id)) continue;
        seen.add(id);
        (parentsMap.get(id) ?? []).forEach((p) => q.push(p));
      }
      return seen.size;
    };

    const countDescendants = () => {
      const seen = new Set<string>();
      const q = [...(childrenMap.get(previewMember.id) ?? [])];
      while (q.length) {
        const id = q.shift()!;
        if (seen.has(id)) continue;
        seen.add(id);
        (childrenMap.get(id) ?? []).forEach((c) => q.push(c));
      }
      return seen.size;
    };

    return {
      member: previewMember,
      father,
      mother,
      otherParents,
      spouses,
      children,
      siblings,
      adoptiveParents: (adoptiveParentsMap.get(previewMember.id) ?? []).map(({ parentId, adoptionYear }) => {
        const person = memberById.get(parentId);
        return person ? { person, adoptionYear } : null;
      }).filter(Boolean) as { person: FamilyMember; adoptionYear?: number }[],
      bondedSiblings: (bondedSiblingsMap.get(previewMember.id) ?? []).map(({ siblingId, bondYear }) => {
        const person = memberById.get(siblingId);
        return person ? { person, bondYear } : null;
      }).filter(Boolean) as { person: FamilyMember; bondYear?: number }[],
      eldestSon,
      birthOrderLabel,
      ancestorCount: countAncestors(),
      descendantCount: countDescendants(),
    };
  }, [previewMember, parentsMap, childrenMap, spousesMap, adoptiveParentsMap, bondedSiblingsMap, memberById, edges]);

  // ── Context-menu handlers ─────────────────────────────────────────────────
  const handleContextMenu = useCallback(
    (memberId: string, x: number, y: number) => {
      const member = members.find((m) => m.id === memberId);
      if (member) setContextMenu({ memberId, memberName: member.name, x, y });
    },
    [members],
  );

  const handleAddRelative = useCallback((id: string, role: RelativeRole) => {
    setNodeFormCtx({ mode: 'create-relative', anchorId: id, role });
    setContextMenu(null);
  }, []);

  const handleEditFromMenu = useCallback((id: string) => {
    setNodeFormCtx({ mode: 'edit', memberId: id });
    setContextMenu(null);
  }, []);

  const handleDeleteFromMenu = useCallback((id: string) => {
    setDeleteMemberId(id);
    setContextMenu(null);
  }, []);

  // ── Form submit handlers ──────────────────────────────────────────────────
  async function handleAddMember(data: NodeFormData) {
    await addMember(treeId, data);
    setNodeFormCtx(null);
  }

  async function handleEditMember(data: NodeFormData) {
    if (nodeFormCtx?.mode !== 'edit') return;
    await updateMember(treeId, nodeFormCtx.memberId, data);
    setNodeFormCtx(null);
  }

  async function handleAddRelativeConfirm(data: NodeFormData) {
    if (nodeFormCtx?.mode !== 'create-relative') return;
    const { anchorId, role } = nodeFormCtx;

    // Pre-flight validation
    if (role === 'parent' && countParents(edges, anchorId) >= 2) {
      throw new Error(tv('MAX_PARENTS_EXCEEDED'));
    }
    if (role === 'spouse' && hasSpouseTimeOverlap(edges, anchorId, data.marriageYear, data.divorceYear)) {
      throw new Error(tv('MAX_SPOUSE_EXCEEDED'));
    }

    const newMember = await addMember(treeId, data);
    setNodeFormCtx(null);

    if (role === 'parent') {
      await addEdge(treeId, { sourceId: newMember.id, targetId: anchorId, type: 'parent-child' });
    } else if (role === 'adoptive-parent') {
      await addEdge(treeId, { sourceId: newMember.id, targetId: anchorId, type: 'adoptive-parent', adoptionYear: data.adoptionYear });
    } else if (role === 'child') {
      await addEdge(treeId, { sourceId: anchorId, targetId: newMember.id, type: 'parent-child' });
    } else if (role === 'adoptive-child') {
      await addEdge(treeId, { sourceId: anchorId, targetId: newMember.id, type: 'adoptive-parent', adoptionYear: data.adoptionYear });
    } else if (role === 'spouse') {
      await addEdge(treeId, { sourceId: anchorId, targetId: newMember.id, type: 'spouse', marriageYear: data.marriageYear, divorceYear: data.divorceYear });
    } else if (role === 'sibling') {
      // Share biological parents
      const parentEdges = edges.filter((e) => e.type === 'parent-child' && e.target === anchorId);
      for (const pe of parentEdges) {
        await addEdge(treeId, { sourceId: pe.source, targetId: newMember.id, type: 'parent-child' });
      }
    } else if (role === 'sibling-bond') {
      // Create the kết nghĩa bond edge
      await addEdge(treeId, { sourceId: anchorId, targetId: newMember.id, type: 'sibling-bond', bondYear: data.bondYear });
      // Also make the new person an adoptive child of the anchor's parents (if they won't exceed 2 parents)
      const parentEdges = edges.filter((e) => (e.type === 'parent-child' || e.type === 'adoptive-parent') && e.target === anchorId);
      let adoptiveParentCount = 0;
      for (const pe of parentEdges) {
        if (adoptiveParentCount >= 2) break;
        await addEdge(treeId, { sourceId: pe.source, targetId: newMember.id, type: 'adoptive-parent', adoptionYear: data.bondYear });
        adoptiveParentCount++;
      }
    }
  }

  // ── Edge handlers ─────────────────────────────────────────────────────────
  const handleEdgeConnect = useCallback(
    (sourceId: string, targetId: string) => {
      // initial validation as parent-child to catch cycles/duplicates early
      const result = validateNewRelationship(
        { members, edges },
        { sourceId, targetId, type: 'parent-child' },
      );
      setEdgeValidationErrors(result.errors);
      setPendingEdge({ sourceId, targetId });
    },
    [members, edges],
  );

  async function handleEdgeConfirm(type: RelationshipType, marriageYear?: number, divorceYear?: number, adoptionYear?: number, bondYear?: number) {
    if (!pendingEdge) return;
    setEdgeLoading(true);
    try {
      const { validation } = await addEdge(treeId, {
        sourceId: pendingEdge.sourceId,
        targetId: pendingEdge.targetId,
        type,
        marriageYear,
        divorceYear,
        adoptionYear,
        bondYear,
      });
      if (validation.valid) { setPendingEdge(null); setEdgeValidationErrors([]); }
      else setEdgeValidationErrors(validation.errors);
    } finally {
      setEdgeLoading(false);
    }
  }

  const handleEdgeDelete = useCallback(
    async (edgeId: string) => { await deleteEdge(treeId, edgeId); },
    [treeId, deleteEdge],
  );

  const handleEdgeEdit = useCallback((edgeId: string) => {
    setPendingEditEdgeId(edgeId);
  }, []);

  async function handleEdgeSave(edgeId: string, data: Partial<import('@/types/tree.types').EdgeFormData>) {
    setEdgeEditLoading(true);
    try {
      await updateEdge(treeId, edgeId, data);
      setPendingEditEdgeId(null);
    } finally {
      setEdgeEditLoading(false);
    }
  }

  // ── Member delete ─────────────────────────────────────────────────────────
  async function handleDeleteMember() {
    if (!deleteMemberId) return;
    setDeleteLoading(true);
    try {
      await deleteMember(treeId, deleteMemberId);
      setDeleteMemberId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const editingMember  = nodeFormCtx?.mode === 'edit' ? members.find((m) => m.id === nodeFormCtx.memberId) : undefined;
  const deletingMember = members.find((m) => m.id === deleteMemberId);
  const sourceNode     = members.find((m) => m.id === pendingEdge?.sourceId);
  const targetNode     = members.find((m) => m.id === pendingEdge?.targetId);

  const nodeFormKey = nodeFormCtx
    ? nodeFormCtx.mode === 'edit'
      ? `edit-${nodeFormCtx.memberId}`
      : nodeFormCtx.mode === 'create-relative'
      ? `rel-${nodeFormCtx.anchorId}-${nodeFormCtx.role}`
      : 'create'
    : 'closed';

  const filteredMembers = searchQuery.trim()
    ? members.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : members;

  // Filter edges to only include those with both source and target in filteredMembers
  const filteredMemberIds = new Set(filteredMembers.map((m) => m.id));
  const filteredEdges = edges.filter((e) => filteredMemberIds.has(e.source) && filteredMemberIds.has(e.target));

  // ── Initial loading ───────────────────────────────────────────────────────
  if (isLoading && !tree) {
    return (
      <div
        className="-mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8 flex items-center justify-center"
        style={{ backgroundColor: colors.bg, height: 'calc(100dvh - 3.5rem)' }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: colors.spouse, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="-mx-4 md:-mx-6 lg:-mx-8 -my-4 md:-my-6 lg:-my-8 flex flex-col"
      style={{ backgroundColor: colors.bg, height: 'calc(100dvh - 3.5rem)' }}
    >
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-b"
        style={{ borderColor: colors.border, backgroundColor: colors.labelBg }}
      >
        {/* Add person */}
        <button
          onClick={() => setNodeFormCtx({ mode: 'create' })}
          style={{ backgroundColor: colors.spouse }}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-white text-sm font-medium transition-colors shrink-0 hover:opacity-90"
          title={t('addMember')}
        >
          <UserPlus size={15} />
          <span className="hidden sm:inline">{t('addMember')}</span>
        </button>

        <div className="w-px h-5 mx-0.5" style={{ backgroundColor: colors.border }} />

        {/* Zoom controls */}
        <TBtn colors={colors} onClick={() => canvasControls?.zoomIn()}  title="Phóng to (Zoom in)">  <ZoomIn  size={15} /></TBtn>
        <TBtn colors={colors} onClick={() => canvasControls?.zoomOut()} title="Thu nhỏ (Zoom out)"> <ZoomOut size={15} /></TBtn>
        <TBtn colors={colors} onClick={() => canvasControls?.fitView()} title="Vừa màn hình (Fit view)"> <Maximize2 size={15} /></TBtn>

        <div className="w-px h-5 mx-0.5" style={{ backgroundColor: colors.border }} />

        {/* Undo / Redo (UI placeholders) */}
        <TBtn colors={colors} title="Hoàn tác (Undo)"  onClick={() => {}}><Undo2 size={15} /></TBtn>
        <TBtn colors={colors} title="Làm lại (Redo)"   onClick={() => {}}><Redo2 size={15} /></TBtn>

        <div className="w-px h-5 mx-0.5" style={{ backgroundColor: colors.border }} />

        {/* Layout direction toggle */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: colors.border }}>
          <button
            onClick={() => setLayoutDir('vertical')}
            title="Bố cục dọc"
            style={{
              backgroundColor: layoutDir === 'vertical' ? colors.spouse : 'transparent',
              color: layoutDir === 'vertical' ? 'white' : colors.buttonText,
            }}
            className="flex items-center gap-1 px-2.5 h-8 text-xs font-medium transition-opacity hover:opacity-80"
          >
            <LayoutTemplate size={13} />
            <span className="hidden md:inline">Dọc</span>
          </button>
          <button
            onClick={() => setLayoutDir('horizontal')}
            title="Bố cục ngang"
            style={{
              backgroundColor: layoutDir === 'horizontal' ? colors.spouse : 'transparent',
              color: layoutDir === 'horizontal' ? 'white' : colors.buttonText,
              borderLeft: `1px solid ${colors.border}`,
            }}
            className="flex items-center gap-1 px-2.5 h-8 text-xs font-medium transition-opacity hover:opacity-80"
          >
            <AlignCenter size={13} />
            <span className="hidden md:inline">Ngang</span>
          </button>
        </div>

        <div className="w-px h-5 mx-0.5" style={{ backgroundColor: colors.border }} />

        {/* Mini-map toggle */}
        <TBtn
          colors={colors}
          title={showMinimap ? 'Ẩn minimap' : 'Hiện minimap'}
          active={showMinimap}
          onClick={() => {
            setShowMinimap((v) => !v);
            canvasControls?.toggleMinimap?.();
          }}
        >
          <Map size={15} />
        </TBtn>

        {/* Stats panel toggle */}
        <TBtn
          colors={colors}
          title="Thống kê"
          active={showStats}
          onClick={() => setShowStats((v) => !v)}
        >
          <BarChart2 size={15} />
        </TBtn>

        {/* Edge legend */}
        <div
          className="flex items-center gap-1.5 ml-1 px-2 h-8 rounded-lg border text-[9px] sm:text-[10px]"
          style={{ borderColor: colors.border, color: colors.buttonText }}
        >
          <span className="flex items-center gap-1 whitespace-nowrap">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="14" y2="4" stroke={colors.parentChild} strokeWidth="1.5" />
              <polygon points="14,2 20,4 14,6" fill={colors.parentChild} />
            </svg>
            <span className="hidden sm:inline">Cha/Mẹ</span><span className="sm:hidden">Cha/M</span>
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke={colors.spouse} strokeWidth="1.5" strokeDasharray="7,4" />
            </svg>
            <span className="hidden sm:inline">V/Chồng</span><span className="sm:hidden">V/C</span>
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="14" y2="4" stroke={colors.adoptive} strokeWidth="1.5" strokeDasharray="6,4" />
              <polygon points="14,2 20,4 14,6" fill={colors.adoptive} />
            </svg>
            <span className="hidden sm:inline">Cha/Mẹ Nuôi</span><span className="sm:hidden">CM Nuôi</span>
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke={colors.siblingBond} strokeWidth="1.5" strokeDasharray="4,3" />
            </svg>
            <span className="hidden sm:inline">Kết Nghĩa</span><span className="sm:hidden">KN</span>
          </span>
        </div>

        {selectedNodeIds.length > 0 && (
          <>
            <div className="w-px h-5 mx-0.5" style={{ backgroundColor: colors.border }} />
            <button
              onClick={deselectAll}
              style={{ color: colors.buttonText }}
              className="text-xs px-2 h-8 rounded-lg hover:opacity-80 transition-opacity"
            >
              Bỏ chọn
            </button>
          </>
        )}

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 bg-[#261620] border border-[#3d2535] rounded-lg px-2.5 h-8 w-48 md:w-64">
          <Search size={13} className="text-[#9d8090] shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white placeholder:text-[#9d8090] outline-none w-full"
          />
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="shrink-0 px-4 py-2 bg-rose-950/60 border-b border-rose-900/50 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* ── Canvas / Empty state ───────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {members.length === 0 && !isLoading ? (
          /* Empty state */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-4">
            <div className="w-44 h-44 text-[#3d2535] opacity-70">
              <TreeIllustration />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Your Family Tree Awaits</h2>
              <p className="text-[#9d8090] text-sm max-w-xs leading-relaxed">
                Start building your family tree by adding your first family member.
                Click the &apos;Add Person&apos; button to begin your journey.
              </p>
            </div>
            <button
              onClick={() => setNodeFormCtx({ mode: 'create' })}
              className="px-6 py-2.5 rounded-full bg-[#db2777]/20 border border-[#db2777] text-[#db2777] text-sm font-semibold hover:bg-[#db2777] hover:text-white transition-all duration-200"
            >
              Add First Person
            </button>
          </div>
        ) : (
          <FamilyTreeCanvas
            treeId={treeId}
            members={filteredMembers}
            edges={filteredEdges}
            selectedNodeIds={selectedNodeIds}
            direction={layoutDir}
            onNodeSelect={(ids) => { if (ids[0]) selectNode(ids[0]); }}
            onContextMenu={handleContextMenu}
            onEdgeConnect={handleEdgeConnect}
            onEdgeDelete={handleEdgeDelete}
            onEdgeEdit={handleEdgeEdit}
            onControlsReady={setCanvasControls}
          />
        )}

        {/* Person preview (single selection) */}
        {previewData && (
          <PersonPreviewPanel
            data={previewData}
            onClose={deselectAll}
            onEdit={(id) => setNodeFormCtx({ mode: 'edit', memberId: id })}
          />
        )}

        {/* Relationship analysis overlay */}
        {nodeA && nodeB && (
          <RelationshipAnalysisPanel
            nodeA={nodeA}
            nodeB={nodeB}
            analysis={analysis}
            onClose={deselectAll}
          />
        )}

        {/* Stats overlay */}
        {showStats && members.length > 0 && (
          <div className="absolute top-3 right-3 z-20 rounded-xl border border-[#3d2535] bg-[#1f1118]/90 backdrop-blur-sm p-4 min-w-[160px] shadow-xl text-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-white">Thống kê</span>
              <button
                onClick={() => setShowStats(false)}
                className="text-[#9d8090] hover:text-white text-xs leading-none ml-4"
                aria-label="Đóng"
              >✕</button>
            </div>
            <div className="space-y-1.5 text-[#9d8090]">
              <div className="flex justify-between gap-4">
                <span>Tổng số người</span>
                <span className="text-white font-medium">{members.length}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Nam</span>
                <span className="text-[#4a90d9] font-medium">
                  {members.filter((m) => m.gender === 'male').length}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Nữ</span>
                <span className="text-[#db2777] font-medium">
                  {members.filter((m) => m.gender === 'female').length}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Đã mất</span>
                <span className="text-[#9d8090] font-medium">
                  {members.filter((m) => !!m.deathYear).length}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Quan hệ</span>
                <span className="text-white font-medium">{edges.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Overlays & Modals ──────────────────────────────────────────────── */}
      {contextMenu && (
        <NodeContextMenu
          memberId={contextMenu.memberId}
          memberName={contextMenu.memberName}
          x={contextMenu.x}
          y={contextMenu.y}
          onAddRelative={handleAddRelative}
          onEdit={handleEditFromMenu}
          onDelete={handleDeleteFromMenu}
          onClose={() => setContextMenu(null)}
        />
      )}

      {nodeFormCtx !== null && (
        <NodeForm
          key={nodeFormKey}
          open
          onClose={() => setNodeFormCtx(null)}
          onSubmit={
            nodeFormCtx.mode === 'edit'
              ? handleEditMember
              : nodeFormCtx.mode === 'create-relative'
              ? handleAddRelativeConfirm
              : handleAddMember
          }
          initialData={editingMember}
          mode={nodeFormCtx.mode === 'edit' ? 'edit' : 'create'}
          role={nodeFormCtx.mode === 'create-relative' ? nodeFormCtx.role : undefined}
          anchorName={nodeFormCtx.mode === 'create-relative' ? members.find((m) => m.id === nodeFormCtx.anchorId)?.name : undefined}
        />
      )}

      <Confirm
        open={!!deleteMemberId}
        onConfirm={handleDeleteMember}
        onCancel={() => setDeleteMemberId(null)}
        title={t('deleteMember')}
        description={`${t('confirmDeleteMember')} "${deletingMember?.name}"`}
        variant="danger"
        confirmLabel={tc('delete')}
        cancelLabel={tc('cancel')}
        loading={deleteLoading}
      />

      {pendingEdge && sourceNode && targetNode && (
        <RelationshipModal
          open
          onClose={() => { setPendingEdge(null); setEdgeValidationErrors([]); }}
          onConfirm={handleEdgeConfirm}
          sourceNodeName={sourceNode.name}
          targetNodeName={targetNode.name}
          validationErrors={edgeValidationErrors}
          hasDuplicate={checkDuplicateEdge(pendingEdge.sourceId, pendingEdge.targetId)}
          loading={edgeLoading}
        />
      )}

      <EdgeEditModal
        open={!!pendingEditEdgeId}
        edge={pendingEditEdgeId ? (edges.find((e) => e.id === pendingEditEdgeId) ?? null) : null}
        onClose={() => setPendingEditEdgeId(null)}
        onSave={handleEdgeSave}
        loading={edgeEditLoading}
      />
    </div>
  );
}

