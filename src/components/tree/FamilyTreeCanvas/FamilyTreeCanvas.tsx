'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  type ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Trash2, Pencil } from 'lucide-react';

import { FamilyNodeCard } from './FamilyNodeCard';
import type { FamilyMember, FamilyEdge } from '@/types/tree.types';
import { cn } from '@/lib/cn';
import { useTreeColors, type TreeColors } from '@/hooks/useTreeColors';

const nodeTypes = { familyNode: FamilyNodeCard };

export type CanvasControls = {
  zoomIn(): void;
  zoomOut(): void;
  fitView(): void;
  toggleMinimap(): void;
};

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_W     = 160;
const NODE_H     = 130;
const H_GAP      = 100;  // gap between unrelated nodes in same generation
const V_GAP      = 150;  // vertical gap between generations
const SPOUSE_GAP = 32;   // tight gap between co-placed spouses

// ── Adjacency helpers ────────────────────────────────────────────────────────
// Both parent-child and adoptive-parent count for hierarchy/collapse features
const isParentEdge = (e: FamilyEdge) => e.type === 'parent-child' || e.type === 'adoptive-parent';

function buildAdjacency(members: FamilyMember[], familyEdges: FamilyEdge[]) {
  const childrenMap = new Map<string, string[]>();
  const parentsMap  = new Map<string, string[]>();
  const spousesMap  = new Map<string, string[]>();
  members.forEach(({ id }) => { childrenMap.set(id, []); parentsMap.set(id, []); spousesMap.set(id, []); });
  familyEdges.forEach((e) => {
    if (isParentEdge(e)) {
      if (!childrenMap.get(e.source)!.includes(e.target)) childrenMap.get(e.source)!.push(e.target);
      if (!parentsMap.get(e.target)!.includes(e.source))  parentsMap.get(e.target)!.push(e.source);
    } else if (e.type === 'spouse') {
      if (!spousesMap.get(e.source)!.includes(e.target)) spousesMap.get(e.source)!.push(e.target);
      if (!spousesMap.get(e.target)!.includes(e.source)) spousesMap.get(e.target)!.push(e.source);
    }
  });
  return { childrenMap, parentsMap, spousesMap };
}

function assignGenerations(
  ids: string[],
  childrenMap: Map<string, string[]>,
  parentsMap: Map<string, string[]>,
  spousesMap: Map<string, string[]>,
  familyEdges: FamilyEdge[] = [],
): Map<string, number> {
  const genMap = new Map<string, number>();

  // ── Step 1: BFS from roots ───────────────────────────────────────────────────
  const roots = ids.filter((id) => parentsMap.get(id)!.length === 0);
  const queue: { id: string; g: number }[] = (roots.length > 0 ? roots : [ids[0]]).map((id) => ({ id, g: 0 }));
  while (queue.length > 0) {
    const { id, g } = queue.shift()!;
    if (genMap.has(id) && genMap.get(id)! >= g) continue;
    genMap.set(id, g);
    childrenMap.get(id)!.forEach((child) => {
      const pGens = parentsMap.get(child)!.map((p) => genMap.get(p) ?? -1).filter((x) => x >= 0);
      const childG = pGens.length > 0 ? Math.max(...pGens) + 1 : g + 1;
      if (!genMap.has(child) || genMap.get(child)! < childG) queue.push({ id: child, g: childG });
    });
  }
  ids.forEach((id) => { if (!genMap.has(id)) genMap.set(id, 0); });

  // ── Step 2: Align spouses — each pair lives at max(genA, genB) ──────────────
  let changed = true;
  while (changed) {
    changed = false;
    ids.forEach((id) => {
      spousesMap.get(id)!.forEach((sp) => {
        const target = Math.max(genMap.get(id)!, genMap.get(sp)!);
        if (genMap.get(id) !== target) { genMap.set(id, target); changed = true; }
        if (genMap.get(sp) !== target) { genMap.set(sp, target); changed = true; }
      });
    });
  }

  // ── Step 3: Push children below their (possibly updated) parents ────────────
  changed = true;
  while (changed) {
    changed = false;
    ids.forEach((id) => {
      childrenMap.get(id)!.forEach((child) => {
        const minG = genMap.get(id)! + 1;
        if ((genMap.get(child) ?? 0) < minG) { genMap.set(child, minG); changed = true; }
      });
    });
  }

  // ── Step 4: Raise each adoptive-parent to be exactly one gen above their child
  // Root adoptive parents start at gen 0 from BFS, but should be at childGen-1.
  // Only ever RAISE the parent (never lower it, so bio roots stay put).
  changed = true;
  while (changed) {
    changed = false;
    familyEdges.forEach((e) => {
      if (e.type !== 'adoptive-parent') return;
      const childGen  = genMap.get(e.target) ?? 0;
      const parentGen = genMap.get(e.source) ?? 0;
      const desired   = childGen - 1;
      if (parentGen < desired) { genMap.set(e.source, desired); changed = true; }
    });
    // Re-cascade bio+adoptive children below any raised nodes
    ids.forEach((id) => {
      childrenMap.get(id)!.forEach((child) => {
        const minG = genMap.get(id)! + 1;
        if ((genMap.get(child) ?? 0) < minG) { genMap.set(child, minG); changed = true; }
      });
    });
    // Re-align spouses after cascade
    ids.forEach((id) => {
      spousesMap.get(id)!.forEach((sp) => {
        const target = Math.max(genMap.get(id)!, genMap.get(sp)!);
        if (genMap.get(id) !== target) { genMap.set(id, target); changed = true; }
        if (genMap.get(sp) !== target) { genMap.set(sp, target); changed = true; }
      });
    });
  }

  // ── Step 5: Align sibling-bond partners to same generation (like spouses) ───
  changed = true;
  while (changed) {
    changed = false;
    familyEdges.forEach((e) => {
      if (e.type !== 'sibling-bond') return;
      const targetG = Math.max(genMap.get(e.source)!, genMap.get(e.target)!);
      if (genMap.get(e.source) !== targetG) { genMap.set(e.source, targetG); changed = true; }
      if (genMap.get(e.target) !== targetG) { genMap.set(e.target, targetG); changed = true; }
    });
    // Re-cascade after sibling-bond alignment
    ids.forEach((id) => {
      childrenMap.get(id)!.forEach((child) => {
        const minG = genMap.get(id)! + 1;
        if ((genMap.get(child) ?? 0) < minG) { genMap.set(child, minG); changed = true; }
      });
    });
  }

  return genMap;
}

/** Push nodes right until no two overlap. */
function resolveOverlaps(ids: string[], positions: Map<string, { x: number; y: number }>): void {
  const sorted = [...ids].sort((a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0));
  for (let i = 1; i < sorted.length; i++) {
    const minX = (positions.get(sorted[i - 1])?.x ?? 0) + NODE_W + H_GAP;
    const cur  = positions.get(sorted[i])!;
    if (cur.x < minX) positions.set(sorted[i], { ...cur, x: minX });
  }
}

/** Build [[id, spouse?, ...], ...] groups with spouses adjacent. */
function toCoupleGroups(ids: string[], spousesMap: Map<string, string[]>): string[][] {
  const groups: string[][] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) continue;
    const g = [id];
    spousesMap.get(id)!.forEach((sp) => { if (ids.includes(sp) && !seen.has(sp)) g.push(sp); });
    g.forEach((x) => seen.add(x));
    groups.push(g);
  }
  return groups;
}

/**
 * Hierarchical layout — 3 passes, no overlaps guaranteed.
 * Returns both node positions and generation numbers.
 */
function buildHierarchicalLayout(
  members: FamilyMember[],
  familyEdges: FamilyEdge[],
  direction: 'vertical' | 'horizontal' = 'vertical',
): { positions: Map<string, { x: number; y: number }>; genMap: Map<string, number> } {
  if (members.length === 0) return { positions: new Map(), genMap: new Map() };
  const ids = members.map((m) => m.id);
  const { childrenMap, parentsMap, spousesMap } = buildAdjacency(members, familyEdges);
  const genMap = assignGenerations(ids, childrenMap, parentsMap, spousesMap, familyEdges);

  const byGen  = new Map<number, string[]>();
  genMap.forEach((g, id) => { if (!byGen.has(g)) byGen.set(g, []); byGen.get(g)!.push(id); });
  const maxGen = Math.max(...genMap.values(), 0);
  const positions = new Map<string, { x: number; y: number }>();

  // ── Pass 2: Top-down initial placement ──────────────────────────────────────
  for (let g = 0; g <= maxGen; g++) {
    const rawIds = [...(byGen.get(g) ?? [])];
    const y      = g * (NODE_H + V_GAP);

    // Build ordered list: spouses adjacent
    const placed  = new Set<string>();
    const ordered: string[] = [];
    for (const id of rawIds) {
      if (placed.has(id)) continue;
      placed.add(id); ordered.push(id);
      spousesMap.get(id)!.forEach((sp) => {
        if (!placed.has(sp) && rawIds.includes(sp)) { placed.add(sp); ordered.push(sp); }
      });
    }

    if (g === 0) {
      const totalW = ordered.length * NODE_W + (ordered.length - 1) * H_GAP;
      ordered.forEach((id, i) => positions.set(id, { x: i * (NODE_W + H_GAP) - totalW / 2, y }));
    } else {
      // Sort couple groups by average parent X, then place each group
      const coupleGroups = toCoupleGroups(ordered, spousesMap).sort((gA, gB) => {
        const avgPX = (group: string[]) => {
          const pxs: number[] = [];
          group.forEach((id) => parentsMap.get(id)!.forEach((p) => {
            if (positions.has(p)) pxs.push(positions.get(p)!.x + NODE_W / 2);
          }));
          return pxs.length ? pxs.reduce((s, x) => s + x, 0) / pxs.length : 0;
        };
        return avgPX(gA) - avgPX(gB);
      });

      let cursor = -Infinity;
      for (const group of coupleGroups) {
        const pxs: number[] = [];
        group.forEach((id) => parentsMap.get(id)!.forEach((p) => {
          if (positions.has(p)) pxs.push(positions.get(p)!.x + NODE_W / 2);
        }));
        const groupW = group.length * NODE_W + (group.length - 1) * SPOUSE_GAP;
        // Guard against -Infinity cascade: if cursor isn't set yet and no parents are known,
        // place near origin so that positions stay finite (edges won't disappear)
        const targetCenter = pxs.length
          ? pxs.reduce((s, x) => s + x, 0) / pxs.length
          : isFinite(cursor)
            ? cursor + groupW / 2 + H_GAP
            : 0;
        const start  = Math.max(targetCenter - groupW / 2, isFinite(cursor) ? cursor : targetCenter - groupW / 2);
        group.forEach((id, i) => positions.set(id, { x: start + i * (NODE_W + SPOUSE_GAP), y }));
        cursor = start + groupW + H_GAP;
      }
    }
    resolveOverlaps(ordered, positions);
  }

  // ── Pass 3: Bottom-up centering + re-resolve overlaps (2×) ─────────────────
  for (let iter = 0; iter < 2; iter++) {
    for (let g = maxGen - 1; g >= 0; g--) {
      const genIds = byGen.get(g) ?? [];
      for (const group of toCoupleGroups(genIds, spousesMap)) {
        const allChildren = new Set<string>();
        group.forEach((id) => childrenMap.get(id)!.forEach((c) => allChildren.add(c)));
        if (allChildren.size === 0) continue;
        const cxs = [...allChildren].filter((c) => positions.has(c)).map((c) => positions.get(c)!.x + NODE_W / 2);
        if (cxs.length === 0) continue;
        const childMid = cxs.reduce((s, x) => s + x, 0) / cxs.length;
        const groupW   = group.length * NODE_W + (group.length - 1) * SPOUSE_GAP;
        const newStart = childMid - groupW / 2;
        const y        = positions.get(group[0])!.y;
        group.forEach((id, i) => positions.set(id, { x: newStart + i * (NODE_W + SPOUSE_GAP), y }));
      }
      resolveOverlaps(genIds, positions);
    }
  }

  // Center tree at origin
  const allXs = [...positions.values()].map((p) => p.x);
  const shift  = -((Math.min(...allXs) + Math.max(...allXs) + NODE_W) / 2);
  positions.forEach((p, id) => positions.set(id, { ...p, x: p.x + shift }));

  // Horizontal direction: rotate 90°
  if (direction === 'horizontal') {
    positions.forEach((p, id) => positions.set(id, { x: p.y, y: p.x }));
  }

  return { positions, genMap };
}

function buildFlowNodes(
  members: FamilyMember[],
  _visibleEdges: FamilyEdge[],  // unused: layout already precomputed
  allEdges: FamilyEdge[],       // full edge list — hasParents/rootIds must survive collapse
  selectedNodeIds: string[],
  layout: Map<string, { x: number; y: number }>,
  savedPositions: Map<string, { x: number; y: number }>,
  generationMap: Map<string, number>,
  ancestorsCollapsed: Set<string>,
  descendantsCollapsed: Set<string>,
  focusedRoots: Set<string>,
  focusHiddenCount: number,
  hiddenAncCount: Map<string, number>,
  hiddenDescCount: Map<string, number>,
  onContextMenu?: (id: string, x: number, y: number) => void,
  onCollapseAncestors?: (id: string) => void,
  onCollapseDescendants?: (id: string) => void,
  onFocusToggle?: (id: string) => void,
): Node[] {
  // Use allEdges so that collapsing parents doesn't remove the expand button
  const rootIds    = new Set(members.filter((m) => !allEdges.some((e) => isParentEdge(e) && e.target === m.id)).map((m) => m.id));
  const hasParents = new Set(allEdges.filter((e) => isParentEdge(e)).map((e) => e.target));
  const hasChildren = new Set(allEdges.filter((e) => isParentEdge(e)).map((e) => e.source));
  return members.map((m) => ({
    id:   m.id,
    type: 'familyNode',
    position: savedPositions.get(m.id) ?? layout.get(m.id) ?? { x: 0, y: 0 },
    data: {
      member:          m,
      isRoot:          rootIds.has(m.id),
      isSelected:      selectedNodeIds.includes(m.id),
      generation:      generationMap.get(m.id) ?? 0,
      hasParents:      hasParents.has(m.id),
      hasChildren:     hasChildren.has(m.id),
      isAncCollapsed:  focusedRoots.size > 0 ? focusedRoots.has(m.id) : ancestorsCollapsed.has(m.id),
      isDescCollapsed: descendantsCollapsed.has(m.id),
      hiddenAncCount:  focusedRoots.size > 0 && focusedRoots.has(m.id)
        ? focusHiddenCount
        : hiddenAncCount.get(m.id) ?? 0,
      hiddenDescCount: hiddenDescCount.get(m.id) ?? 0,
      onContextMenu,
      onCollapseAnc:  onCollapseAncestors,
      onCollapseDesc: onCollapseDescendants,
      onFocusToggle,
    },
  }));
}


function buildFlowEdges(edges: FamilyEdge[], colors: TreeColors): Edge[] {
  return edges.map((e) => {
    const isSpouse = e.type === 'spouse';
    const isParentChild = e.type === 'parent-child' || e.type === 'adoptive-parent';
    const isSiblingBond = e.type === 'sibling-bond';

    return {
      id:     e.id,
      source: e.source,
      target: e.target,
      ...(isSpouse ? { sourceHandle: 'right', targetHandle: 'left' } : {}),
      type: isSpouse || isSiblingBond ? 'straight' : 'smoothstep',
      // Spouse: animated dashed crimson line
      // Parent-child: solid steel-blue stepped line with arrow
      label: isSpouse
        ? (e.marriageYear ? `♥ ${e.marriageYear}${e.divorceYear ? `–${e.divorceYear}` : ''}` : '♥')
        : isSiblingBond
        ? (e.bondYear ? `Kết nghĩa ${e.bondYear}` : 'Kết nghĩa')
        : isParentChild && e.type === 'adoptive-parent' && e.adoptionYear
        ? `Nhận nuôi ${e.adoptionYear}`
        : undefined,
      labelStyle: isSpouse
        ? { fontSize: 11, fill: colors.spouse, fontWeight: 600 }
        : isSiblingBond
        ? { fontSize: 11, fill: colors.siblingBond, fontWeight: 600 }
        : isParentChild && e.type === 'adoptive-parent'
        ? { fontSize: 11, fill: colors.adoptive, fontWeight: 600 }
        : undefined,
      labelBgStyle: isSpouse
        ? { fill: colors.labelBg, fillOpacity: 0.85 }
        : isSiblingBond
        ? { fill: colors.labelBg, fillOpacity: 0.85 }
        : isParentChild && e.type === 'adoptive-parent'
        ? { fill: colors.labelBg, fillOpacity: 0.9 }
        : undefined,
      style: {
        stroke:          isSpouse ? colors.spouse : isSiblingBond ? colors.siblingBond : e.type === 'adoptive-parent' ? colors.adoptive : colors.parentChild,
        strokeWidth:     isSpouse ? 2         : isSiblingBond ? 1.5 : 1.5,
        strokeDasharray: isSpouse ? '7,4'     : isSiblingBond ? '4,3' : e.type === 'adoptive-parent' ? '6,4' : undefined,
        opacity:         0.85,
      },
      animated: isSpouse || isSiblingBond,
      markerEnd: isParentChild
        ? { type: MarkerType.ArrowClosed, color: e.type === 'adoptive-parent' ? colors.adoptive : colors.parentChild, width: 14, height: 14 }
        : undefined,
    };
  });
}

interface FamilyTreeCanvasProps {
  treeId: string;
  members: FamilyMember[];
  edges: FamilyEdge[];
  selectedNodeIds?: string[];
  onNodeSelect?: (ids: string[]) => void;
  onContextMenu?: (memberId: string, x: number, y: number) => void;
  onEdgeConnect?: (sourceId: string, targetId: string) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onEdgeEdit?: (edgeId: string) => void;
  onControlsReady?: (controls: CanvasControls) => void;
  direction?: 'vertical' | 'horizontal';
  readOnly?: boolean;
  className?: string;
}

export function FamilyTreeCanvas({
  treeId,
  members,
  edges: familyEdges,
  selectedNodeIds = [],
  onNodeSelect,
  onContextMenu,
  onEdgeConnect,
  onEdgeDelete,
  onEdgeEdit,
  onControlsReady,
  direction = 'vertical',
  readOnly  = false,
  className,
}: FamilyTreeCanvasProps) {
  const userPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const [edgeMenu,    setEdgeMenu]    = useState<{ id: string; x: number; y: number } | null>(null);
  const [showMinimap, setShowMinimap] = useState(true);
  // ancestorsCollapsed: legacy toggle to hide ancestors upward (used when no focus mode)
  const [ancestorsCollapsed, setAncestorsCollapsed] = useState<Set<string>>(new Set());
  // descendantsCollapsed: legacy toggle to hide descendants downward (used when no focus mode)
  const [descendantsCollapsed, setDescendantsCollapsed] = useState<Set<string>>(new Set());
  // focusedRoots: when non-empty, we only keep each focused node, its spouse(s), and all descendants
  const [focusedRoots, setFocusedRoots] = useState<Set<string>>(new Set());
  const edgeMenuRef = useRef<HTMLDivElement>(null);

  // Get theme-aware tree colors
  const colors = useTreeColors();

  // Parents map for ancestor-collapse computation
  const parentsMap = useMemo(() => {
    const map = new Map<string, string[]>();
    members.forEach(({ id }) => map.set(id, []));
    familyEdges.forEach((e) => { if (isParentEdge(e)) map.get(e.target)?.push(e.source); });
    return map;
  }, [members, familyEdges]);

  // Children map for descendant-collapse computation
  const childrenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    members.forEach(({ id }) => map.set(id, []));
    familyEdges.forEach((e) => { if (isParentEdge(e)) map.get(e.source)?.push(e.target); });
    return map;
  }, [members, familyEdges]);

  // Spouses map (needed so that spouse of a hidden parent also gets hidden)
  const spousesMapLocal = useMemo(() => {
    const map = new Map<string, string[]>();
    members.forEach(({ id }) => map.set(id, []));
    familyEdges.forEach((e) => {
      if (e.type === 'spouse') {
        map.get(e.source)?.push(e.target);
        map.get(e.target)?.push(e.source);
      }
    });
    return map;
  }, [members, familyEdges]);

  // BFS UPWARD: find all ancestors of every node that has requested ancestor-collapse
  const hiddenAncestors = useMemo(() => {
    if (ancestorsCollapsed.size === 0) return new Set<string>();
    const hidden  = new Set<string>();
    const queue   = [...ancestorsCollapsed];
    while (queue.length > 0) {
      const id = queue.shift()!;
      (parentsMap.get(id) ?? []).forEach((p) => {
        if (!hidden.has(p)) {
          hidden.add(p);
          queue.push(p);
          // Also hide the spouse of p (they form a couple unit)
          spousesMapLocal.get(p)?.forEach((sp) => {
            if (!hidden.has(sp) && !ancestorsCollapsed.has(sp)) {
              hidden.add(sp);
              queue.push(sp);
            }
          });
        }
      });
    }
    return hidden;
  }, [ancestorsCollapsed, parentsMap, spousesMapLocal]);

  // BFS DOWNWARD: find all descendants of every node that has requested descendant-collapse
  const hiddenDescendants = useMemo(() => {
    if (descendantsCollapsed.size === 0) return new Set<string>();
    const hidden = new Set<string>();
    const queue  = [...descendantsCollapsed];
    while (queue.length > 0) {
      const id = queue.shift()!;
      (childrenMap.get(id) ?? []).forEach((child) => {
        if (!hidden.has(child)) {
          hidden.add(child);
          queue.push(child);
          spousesMapLocal.get(child)?.forEach((sp) => {
            if (!hidden.has(sp)) {
              hidden.add(sp);
              queue.push(sp);
            }
          });
        }
      });
    }
    return hidden;
  }, [descendantsCollapsed, childrenMap, spousesMapLocal]);

  // Union of all hidden nodes
  const hiddenNodes = useMemo(() => {
    // If focus mode is active, hide everything outside the focused subtrees
    if (focusedRoots.size > 0) {
      const keep = new Set<string>();
      const queue: string[] = [];
      focusedRoots.forEach((id) => {
        keep.add(id);
        queue.push(id);
        // Always keep spouse(s) of the focused node for context
        spousesMapLocal.get(id)?.forEach((sp) => {
          if (!keep.has(sp)) { keep.add(sp); queue.push(sp); }
        });
      });
      while (queue.length > 0) {
        const pid = queue.shift()!;
        (childrenMap.get(pid) ?? []).forEach((child) => {
          if (!keep.has(child)) {
            keep.add(child);
            queue.push(child);
          }
        });
      }
      const hidden = new Set<string>();
      members.forEach((m) => { if (!keep.has(m.id)) hidden.add(m.id); });
      return hidden;
    }

    // Legacy collapse: union of ancestor + descendant hides
    const hidden = new Set<string>(hiddenAncestors);
    hiddenDescendants.forEach((id) => hidden.add(id));
    return hidden;
  }, [focusedRoots, members, spousesMapLocal, childrenMap, hiddenAncestors, hiddenDescendants]);

  // Count how many ancestors are hidden for each collapsed node (for badge)
  const hiddenAncCount = useMemo(() => {
    const counts = new Map<string, number>();
    ancestorsCollapsed.forEach((nodeId) => {
      const seen = new Set<string>();
      const q = [...(parentsMap.get(nodeId) ?? [])];
      while (q.length > 0) {
        const id = q.shift()!;
        if (seen.has(id)) continue;
        seen.add(id);
        (parentsMap.get(id) ?? []).forEach((p) => { if (!seen.has(p)) q.push(p); });
        spousesMapLocal.get(id)?.forEach((sp) => { if (!seen.has(sp)) q.push(sp); });
      }
      counts.set(nodeId, seen.size);
    });
    return counts;
  }, [ancestorsCollapsed, parentsMap, spousesMapLocal]);

  // Count how many descendants are hidden for each collapsed node (for badge)
  const hiddenDescCount = useMemo(() => {
    const counts = new Map<string, number>();
    descendantsCollapsed.forEach((nodeId) => {
      const seen = new Set<string>();
      const q = [...(childrenMap.get(nodeId) ?? [])];
      while (q.length > 0) {
        const id = q.shift()!;
        if (seen.has(id)) continue;
        seen.add(id);
        (childrenMap.get(id) ?? []).forEach((c) => { if (!seen.has(c)) q.push(c); });
        spousesMapLocal.get(id)?.forEach((sp) => { if (!seen.has(sp)) q.push(sp); });
      }
      counts.set(nodeId, seen.size);
    });
    return counts;
  }, [descendantsCollapsed, childrenMap, spousesMapLocal]);

  const handleCollapseAncestors = useCallback((id: string) => {
    userPositions.current.clear();
    setAncestorsCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCollapseDescendants = useCallback((id: string) => {
    userPositions.current.clear();
    setDescendantsCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Focus mode: keep only this node, its spouse(s), and all descendants
  const handleFocusToggle = useCallback((id: string) => {
    userPositions.current.clear();
    setAncestorsCollapsed(new Set());
    setDescendantsCollapsed(new Set());
    setFocusedRoots((prev) => {
      // If already focused on this single node, clear focus; otherwise focus only this node
      if (prev.size === 1 && prev.has(id)) return new Set();
      return new Set([id]);
    });
  }, []);

  // Only render nodes/edges not hidden by ancestor-collapse
  const visibleMembers = useMemo(() => members.filter((m) => !hiddenNodes.has(m.id)), [members, hiddenNodes]);
  const visibleEdges   = useMemo(() => familyEdges.filter((e) => !hiddenNodes.has(e.source) && !hiddenNodes.has(e.target)), [familyEdges, hiddenNodes]);

  const { positions: layout, genMap } = useMemo(
    () => buildHierarchicalLayout(visibleMembers, visibleEdges, direction),
    [visibleMembers, visibleEdges, direction],
  );

  const initNodes = buildFlowNodes(
    visibleMembers,
    visibleEdges,
    familyEdges,
    selectedNodeIds,
    layout,
    userPositions.current,
    genMap,
    ancestorsCollapsed,
    descendantsCollapsed,
    focusedRoots,
    focusedRoots.size > 0 ? members.length - visibleMembers.length : 0,
    hiddenAncCount,
    hiddenDescCount,
    onContextMenu,
    handleCollapseAncestors,
    handleCollapseDescendants,
    handleFocusToggle,
  );
  const initEdges = buildFlowEdges(visibleEdges, colors);

  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges);

  // Sync nodes when anything relevant changes
  useEffect(() => {
    setNodes(
      buildFlowNodes(
        visibleMembers,
        visibleEdges,
        familyEdges,
        selectedNodeIds,
        layout,
        userPositions.current,
        genMap,
        ancestorsCollapsed,
        descendantsCollapsed,
        focusedRoots,
        focusedRoots.size > 0 ? members.length - visibleMembers.length : 0,
        hiddenAncCount,
        hiddenDescCount,
        onContextMenu,
        handleCollapseAncestors,
        handleCollapseDescendants,
        handleFocusToggle,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMembers, visibleEdges, familyEdges, selectedNodeIds, layout, genMap, ancestorsCollapsed, descendantsCollapsed, focusedRoots, hiddenAncCount, hiddenDescCount]);

  // Sync edges
  useEffect(() => {
    setEdges(buildFlowEdges(visibleEdges, colors));
  }, [visibleEdges, colors, setEdges]);

  // Persist drag positions
  const handleNodeDragStop = useCallback((_: React.MouseEvent, node: Node) => {
    userPositions.current.set(node.id, { x: node.position.x, y: node.position.y });
  }, []);

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!readOnly && connection.source && connection.target) {
        onEdgeConnect?.(connection.source, connection.target);
      }
    },
    [readOnly, onEdgeConnect],
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onNodeSelect?.([node.id]);
    },
    [onNodeSelect],
  );

  const handleEdgeClick = useCallback(
    (e: React.MouseEvent, edge: Edge) => {
      if (readOnly) return;
      e.stopPropagation();
      setEdgeMenu({ id: edge.id, x: e.clientX, y: e.clientY });
    },
    [readOnly],
  );

  const handleInit = useCallback(
    (instance: ReactFlowInstance) => {
      onControlsReady?.({
        zoomIn:        () => instance.zoomIn({ duration: 200 }),
        zoomOut:       () => instance.zoomOut({ duration: 200 }),
        fitView:       () => instance.fitView({ duration: 300, padding: 0.25 }),
        toggleMinimap: () => setShowMinimap((v) => !v),
      });
    },
    [onControlsReady],
  );

  // Close edge menu on outside click
  useEffect(() => {
    if (!edgeMenu) return;
    function handle(e: MouseEvent) {
      if (edgeMenuRef.current && !edgeMenuRef.current.contains(e.target as globalThis.Node)) {
        setEdgeMenu(null);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [edgeMenu]);

  return (
    <div className={cn('w-full h-full', className)} style={{ backgroundColor: colors.bg }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeDragStop={handleNodeDragStop}
        onEdgeClick={handleEdgeClick}
        onInit={handleInit}
        onPaneClick={() => setEdgeMenu(null)}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.1}
        maxZoom={2.5}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: false }}
        aria-label={`Family tree canvas for tree ${treeId}`}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color={colors.border} />
        {showMinimap && (
          <MiniMap
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
            maskColor={colors.minimapMask}
            nodeColor={(n) => {
              const gender = (n.data as { member: FamilyMember }).member?.gender;
              if (gender === 'male')   return colors.male;
              if (gender === 'female') return colors.female;
              return colors.neutral;
            }}
            pannable
            zoomable
          />
        )}
      </ReactFlow>

      {/* Edge context menu */}
      {edgeMenu && (
        <div
          ref={edgeMenuRef}
          style={{ left: edgeMenu.x, top: edgeMenu.y, backgroundColor: colors.bg, borderColor: colors.border }}
          className="fixed z-[60] rounded-xl shadow-2xl border overflow-hidden py-1"
        >
          <button
            onClick={() => { onEdgeEdit?.(edgeMenu.id); setEdgeMenu(null); }}
            style={{ '--hover-bg': colors.borderLight } as React.CSSProperties}
            className="flex items-center gap-2 px-3 py-2 text-sm text-sky-400
                       hover:opacity-80 active:opacity-60 w-full transition-opacity"
          >
            <Pencil size={14} aria-hidden />
            Sửa quan hệ
          </button>
          <button
            onClick={() => { onEdgeDelete?.(edgeMenu.id); setEdgeMenu(null); }}
            style={{ '--hover-bg': colors.borderLight } as React.CSSProperties}
            className="flex items-center gap-2 px-3 py-2 text-sm text-rose-400
                       hover:opacity-80 active:opacity-60 w-full transition-opacity"
          >
            <Trash2 size={14} aria-hidden />
            Xóa quan hệ
          </button>
        </div>
      )}

      {/* Edge legend removed - moved to toolbar */}
    </div>
  );
}

