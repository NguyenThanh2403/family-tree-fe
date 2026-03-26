import type React from "react";
import { create } from "zustand";
import {
  type Node,
  type Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
} from "@xyflow/react";
import type { FamilyMember } from "@/types";

// ──────────────────────────────────────────────
// Extended node data attached to each React-Flow node
// ──────────────────────────────────────────────
export interface FamilyNodeData extends Record<string, unknown> {
  member: FamilyMember;
  isRoot?: boolean;
}

export type FamilyNode = Node<FamilyNodeData, "familyMember">;
export type FamilyEdge = Edge<{ relationLabel?: string }>;

// ── Relationship type system ──────────────────────────────
export type RelationshipType = "cha" | "me" | "con" | "anh" | "chi" | "em" | "vo_chong";
export type ConnectionRelationType = "parent-child" | "child-parent" | "sibling" | "spouse";

export interface RelationshipMeta {
  label: string;
  description: string;
  edgeLabel: string;
  defaultGender: "male" | "female" | "other";
  generationOffset: number;
  color: string;
  bgColor: string;
  borderColor: string;
  positionHint: string;
}

export const RELATIONSHIP_META: Record<RelationshipType, RelationshipMeta> = {
  cha: {
    label: "Cha", description: "Người cha, ông nội/ngoại",
    edgeLabel: "cha", defaultGender: "male", generationOffset: -1,
    color: "#2563EB", bgColor: "#EFF6FF", borderColor: "#93C5FD", positionHint: "↑ Thế hệ trên",
  },
  me: {
    label: "Mẹ", description: "Người mẹ, bà nội/ngoại",
    edgeLabel: "mẹ", defaultGender: "female", generationOffset: -1,
    color: "#DB2777", bgColor: "#FDF2F8", borderColor: "#F9A8D4", positionHint: "↑ Thế hệ trên",
  },
  con: {
    label: "Con", description: "Con trai, con gái, con nuôi",
    edgeLabel: "con", defaultGender: "other", generationOffset: 1,
    color: "#16A34A", bgColor: "#F0FDF4", borderColor: "#86EFAC", positionHint: "↓ Thế hệ dưới",
  },
  anh: {
    label: "Anh", description: "Anh trai, anh nuôi",
    edgeLabel: "anh/chị/em", defaultGender: "male", generationOffset: 0,
    color: "#7C3AED", bgColor: "#F5F3FF", borderColor: "#C4B5FD", positionHint: "← Cùng thế hệ",
  },
  chi: {
    label: "Chị", description: "Chị gái, chị nuôi",
    edgeLabel: "anh/chị/em", defaultGender: "female", generationOffset: 0,
    color: "#9333EA", bgColor: "#FAF5FF", borderColor: "#D8B4FE", positionHint: "← Cùng thế hệ",
  },
  em: {
    label: "Em", description: "Em trai, em gái, em nuôi",
    edgeLabel: "anh/chị/em", defaultGender: "other", generationOffset: 0,
    color: "#0891B2", bgColor: "#ECFEFF", borderColor: "#A5F3FC", positionHint: "→ Cùng thế hệ",
  },
  vo_chong: {
    label: "Vợ/Chồng", description: "Vợ hoặc chồng, người bạn đời",
    edgeLabel: "vợ/chồng", defaultGender: "other", generationOffset: 0,
    color: "#E11D48", bgColor: "#FFF1F2", borderColor: "#FECDD3", positionHint: "→ Cùng thế hệ",
  },
};

export const CONNECTION_RELATION_META: Record<ConnectionRelationType, { label: string; description: string; color: string }> = {
  "parent-child": { label: "Từ là Cha/Mẹ của Đến", description: "Từ là cha/mẹ của Đến", color: "#2563EB" },
  "child-parent": { label: "Đến là Cha/Mẹ của Từ", description: "Đến là cha/mẹ của Từ", color: "#16A34A" },
  sibling: { label: "Anh/Chị/Em", description: "Hai người là anh chị em", color: "#7C3AED" },
  spouse: { label: "Vợ/Chồng", description: "Hai người là vợ chồng", color: "#E11D48" },
};

// ──────────────────────────────────────────────
// Per-tree state
// ──────────────────────────────────────────────
export interface TreeData {
  id: string;
  name: string;
  description?: string;
  nodes: FamilyNode[];
  edges: FamilyEdge[];
  createdAt: string;
  updatedAt: string;
}

interface FamilyTreeStore {
  trees: TreeData[];
  activeTreeId: string | null;

  // Selected node for context menu / detail panel
  selectedNodeId: string | null;

  // Modal state
  isModalOpen: boolean;
  modalMode: "add" | "edit";
  editingMember: FamilyMember | null;

  // Relationship picker state (adding new member)
  isRelationPickerOpen: boolean;
  relationPickerSourceId: string | null;
  addRelationType: RelationshipType | null;

  // Connection picker state (connecting existing nodes via drag)
  pendingConnection: { source: string; target: string; sourceHandle?: string | null } | null;
  isConnectionPickerOpen: boolean;

  // ── Tree-level actions ──
  createTree: (name: string, description?: string) => void;
  deleteTree: (treeId: string) => void;
  setActiveTree: (treeId: string) => void;

  // ── Node actions (within active tree) ──
  addMember: (member: Omit<FamilyMember, "id" | "generation">) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;

  // ── Flow actions ──
  onNodesChange: (changes: Parameters<typeof applyNodeChanges>[0]) => void;
  onEdgesChange: (changes: Parameters<typeof applyEdgeChanges>[0]) => void;
  onConnect: (connection: Connection) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;

  // ── UI actions ──
  openAddModal: () => void;
  openEditModal: (member: FamilyMember) => void;
  closeModal: () => void;
  selectNode: (nodeId: string | null) => void;

  openRelationPicker: (sourceNodeId: string) => void;
  closeRelationPicker: () => void;
  selectRelationType: (relType: RelationshipType) => void;

  openConnectionPicker: (conn: { source: string; target: string; sourceHandle?: string | null }) => void;
  closeConnectionPicker: () => void;
  confirmConnectionRelation: (relType: ConnectionRelationType) => void;
}

// ──────────────────────────────────────────────
// Helper: build a FamilyNode from a FamilyMember
// ──────────────────────────────────────────────
function memberToNode(member: FamilyMember, position?: { x: number; y: number }): FamilyNode {
  return {
    id: member.id,
    type: "familyMember",
    position: position ?? {
      x: Math.random() * 400 + 100,
      y: (member.generation ?? 0) * 180 + 80,
    },
    data: { member },
  };
}

// ──────────────────────────────────────────────
// Helper: generate a short unique id
// ──────────────────────────────────────────────
function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// ──────────────────────────────────────────────
// Seed data — one demo tree
// ──────────────────────────────────────────────
const rootMember: FamilyMember = {
  id: "root-1",
  fullName: "Nguyễn Văn Tổ",
  gender: "male",
  dateOfBirth: "1930-01-01",
  occupation: "Nông dân",
  bio: "Người sáng lập dòng họ",
  generation: 0,
};

const initialTrees: TreeData[] = [
  {
    id: "tree-1",
    name: "Dòng họ Nguyễn",
    description: "Gia phả dòng họ Nguyễn – 3 đời",
    nodes: [memberToNode(rootMember, { x: 300, y: 80 })],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ──────────────────────────────────────────────
// Connection Validation
// ──────────────────────────────────────────────
export interface ConnectionValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate whether a drag-connect relationship between source and target is allowed.
 * Returns { valid: true } when allowed, or { valid: false, reason } when not.
 */
export function validateConnectionRelation(
  relType: ConnectionRelationType,
  source: string,
  target: string,
  nodes: FamilyNode[],
  edges: FamilyEdge[]
): ConnectionValidationResult {
  // 1. Can't connect to self
  if (source === target) {
    return { valid: false, reason: "Không thể kết nối một người với chính họ" };
  }

  // 2. Already any edge between this pair (either direction)
  const alreadyConnected = edges.some(
    (e) =>
      (e.source === source && e.target === target) ||
      (e.source === target && e.target === source)
  );
  if (alreadyConnected) {
    return { valid: false, reason: "Hai người này đã có mối quan hệ với nhau" };
  }

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  if (!sourceNode || !targetNode) {
    return { valid: false, reason: "Không tìm thấy thành viên" };
  }

  const sourceMember = sourceNode.data.member;
  const targetMember = targetNode.data.member;

  switch (relType) {
    case "parent-child":
      // Source becomes parent of target → target must NOT already have a parent edge
      if (targetMember.parentId) {
        return { valid: false, reason: `"${targetMember.fullName}" đã có cha/mẹ trong cây` };
      }
      break;

    case "child-parent":
      // Target becomes parent of source → source must NOT already have a parent edge
      if (sourceMember.parentId) {
        return { valid: false, reason: `"${sourceMember.fullName}" đã có cha/mẹ trong cây` };
      }
      break;

    case "spouse":
      if (sourceMember.spouseId) {
        return { valid: false, reason: `"${sourceMember.fullName}" đã có vợ/chồng trong cây` };
      }
      if (targetMember.spouseId) {
        return { valid: false, reason: `"${targetMember.fullName}" đã có vợ/chồng trong cây` };
      }
      break;

    case "sibling":
      // Siblings are valid — no strict constraint, but warn if generation mismatch is large
      // (we allow it)
      break;
  }

  return { valid: true };
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────
export const useFamilyTreeStore = create<FamilyTreeStore>((set, get) => ({
  trees: initialTrees,
  activeTreeId: initialTrees[0].id,
  selectedNodeId: null,
  isModalOpen: false,
  modalMode: "add",
  editingMember: null,
  isRelationPickerOpen: false,
  relationPickerSourceId: null,
  addRelationType: null,
  pendingConnection: null,
  isConnectionPickerOpen: false,

  // ── Tree-level ──
  createTree: (name, description) => {
    const newTree: TreeData = {
      id: uid(),
      name,
      description,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => ({ trees: [...s.trees, newTree], activeTreeId: newTree.id }));
  },

  deleteTree: (treeId) => {
    set((s) => {
      const trees = s.trees.filter((t) => t.id !== treeId);
      const activeTreeId = s.activeTreeId === treeId ? (trees[0]?.id ?? null) : s.activeTreeId;
      return { trees, activeTreeId };
    });
  },

  setActiveTree: (treeId) => set({ activeTreeId: treeId, selectedNodeId: null }),

  // ── Member actions ──
  addMember: (memberData) => {
    const { activeTreeId, addRelationType, relationPickerSourceId } = get();
    if (!activeTreeId) return;

    const state = get();
    const activeTree = state.trees.find((t) => t.id === activeTreeId);
    if (!activeTree) return;

    const sourceNode = relationPickerSourceId
      ? activeTree.nodes.find((n) => n.id === relationPickerSourceId)
      : null;
    const sourceGen = sourceNode?.data.member.generation ?? 0;
    const sx = sourceNode?.position.x ?? 300;
    const sy = sourceNode?.position.y ?? 80;

    // ── Calculate position relative to source ────────────────
    let position: { x: number; y: number };
    let generation = 0;

    if (sourceNode && addRelationType) {
      const meta = RELATIONSHIP_META[addRelationType];
      generation = sourceGen + meta.generationOffset;

      switch (addRelationType) {
        case "cha":
          position = { x: sx - 130, y: sy - 220 };
          break;
        case "me":
          position = { x: sx + 130, y: sy - 220 };
          break;
        case "con": {
          const existingChildren = activeTree.nodes.filter(
            (n) => n.data.member.parentId === sourceNode.id
          );
          position = { x: sx - 130 + existingChildren.length * 260, y: sy + 220 };
          break;
        }
        case "anh":
        case "chi":
          position = { x: sx - 280, y: sy };
          break;
        case "em":
          position = { x: sx + 280, y: sy };
          break;
        case "vo_chong":
          position = { x: sx + 300, y: sy };
          break;
        default:
          position = { x: sx + 260, y: sy };
      }
    } else {
      position = { x: Math.random() * 400 + 100, y: 80 };
    }

    const newMember: FamilyMember = {
      ...memberData,
      id: uid(),
      generation,
      // parentId set for child and sibling (inherit same parent) relationships
      parentId:
        addRelationType === "con" && relationPickerSourceId
          ? relationPickerSourceId
          : addRelationType === "anh" || addRelationType === "chi" || addRelationType === "em"
          ? sourceNode?.data.member.parentId
          : memberData.parentId,
      spouseId:
        addRelationType === "vo_chong" && relationPickerSourceId
          ? relationPickerSourceId
          : memberData.spouseId,
    };

    const newNode: FamilyNode = { id: newMember.id, type: "familyMember", position, data: { member: newMember } };

    set((s) => ({
      trees: s.trees.map((tree) => {
        if (tree.id !== activeTreeId) return tree;

        let updatedEdges = [...tree.edges];
        let updatedNodes = [...tree.nodes, newNode];

        switch (addRelationType) {
          case "cha":
          case "me":
            // New node IS parent → edge: newNode → sourceNode
            updatedEdges.push({
              id: `e-${newMember.id}-${relationPickerSourceId}`,
              source: newMember.id,
              target: relationPickerSourceId!,
              type: "smoothstep",
              data: { relationLabel: addRelationType === "cha" ? "cha" : "mẹ" },
            });
            // Update source node's parentId
            updatedNodes = updatedNodes.map((n) =>
              n.id === relationPickerSourceId
                ? { ...n, data: { ...n.data, member: { ...n.data.member, parentId: newMember.id } } }
                : n
            );
            break;

          case "con":
            // Source IS parent → edge: sourceNode → newNode
            updatedEdges.push({
              id: `e-${relationPickerSourceId}-${newMember.id}`,
              source: relationPickerSourceId!,
              target: newMember.id,
              type: "smoothstep",
              data: { relationLabel: "con" },
            });
            break;

          case "anh":
          case "chi":
          case "em":
            updatedEdges.push({
              id: `e-sibling-${relationPickerSourceId}-${newMember.id}`,
              source: relationPickerSourceId!,
              target: newMember.id,
              type: "straight",
              style: { strokeDasharray: "6,4" } as React.CSSProperties,
              data: { relationLabel: "anh/chị/em" },
            });
            break;

          case "vo_chong":
            updatedEdges.push({
              id: `e-spouse-${relationPickerSourceId}-${newMember.id}`,
              source: relationPickerSourceId!,
              target: newMember.id,
              sourceHandle: "spouse-source",
              targetHandle: "spouse-target",
              data: { relationLabel: "vợ/chồng" },
            });
            // Update source node's spouseId too
            updatedNodes = updatedNodes.map((n) =>
              n.id === relationPickerSourceId
                ? { ...n, data: { ...n.data, member: { ...n.data.member, spouseId: newMember.id } } }
                : n
            );
            break;

          default:
            // Standalone add — no edge
            break;
        }

        return {
          ...tree,
          nodes: updatedNodes,
          edges: updatedEdges,
          updatedAt: new Date().toISOString(),
        };
      }),
      isModalOpen: false,
      addRelationType: null,
      relationPickerSourceId: null,
    }));
  },

  updateMember: (id, updates) => {
    const { activeTreeId } = get();
    if (!activeTreeId) return;
    set((s) => ({
      trees: s.trees.map((tree) => {
        if (tree.id !== activeTreeId) return tree;
        return {
          ...tree,
          nodes: tree.nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, member: { ...node.data.member, ...updates } } }
              : node
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
      isModalOpen: false,
      editingMember: null,
    }));
  },

  deleteMember: (id) => {
    const { activeTreeId } = get();
    if (!activeTreeId) return;
    set((s) => ({
      trees: s.trees.map((tree) => {
        if (tree.id !== activeTreeId) return tree;
        return {
          ...tree,
          nodes: tree.nodes.filter((n) => n.id !== id),
          edges: tree.edges.filter((e) => e.source !== id && e.target !== id),
          updatedAt: new Date().toISOString(),
        };
      }),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    }));
  },

  // ── Flow actions ──
  onNodesChange: (changes) => {
    const { activeTreeId } = get();
    if (!activeTreeId) return;
    set((s) => ({
      trees: s.trees.map((tree) =>
        tree.id !== activeTreeId
          ? tree
          : { ...tree, nodes: applyNodeChanges(changes, tree.nodes) as FamilyNode[] }
      ),
    }));
  },

  onEdgesChange: (changes) => {
    const { activeTreeId } = get();
    if (!activeTreeId) return;
    set((s) => ({
      trees: s.trees.map((tree) =>
        tree.id !== activeTreeId
          ? tree
          : { ...tree, edges: applyEdgeChanges(changes, tree.edges) as FamilyEdge[] }
      ),
    }));
  },

  onConnect: (connection) => {
    const { activeTreeId } = get();
    if (!activeTreeId) return;
    set((s) => ({
      trees: s.trees.map((tree) =>
        tree.id !== activeTreeId
          ? tree
          : {
              ...tree,
              edges: addEdge(
                { ...connection, type: "smoothstep", data: { relationLabel: "con" } },
                tree.edges
              ) as FamilyEdge[],
              updatedAt: new Date().toISOString(),
            }
      ),
    }));
  },

  updateNodePosition: (nodeId, position) => {
    const { activeTreeId } = get();
    if (!activeTreeId) return;
    set((s) => ({
      trees: s.trees.map((tree) =>
        tree.id !== activeTreeId
          ? tree
          : {
              ...tree,
              nodes: tree.nodes.map((n) => (n.id === nodeId ? { ...n, position } : n)),
            }
      ),
    }));
  },

  // ── UI ──
  openAddModal: () =>
    set({ isModalOpen: true, modalMode: "add", editingMember: null, addRelationType: null, relationPickerSourceId: null }),
  openEditModal: (member) =>
    set({ isModalOpen: true, modalMode: "edit", editingMember: member }),
  closeModal: () => set({ isModalOpen: false, editingMember: null, addRelationType: null, relationPickerSourceId: null }),
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  // Relationship picker (adding new member from a node)
  openRelationPicker: (sourceNodeId) =>
    set({ isRelationPickerOpen: true, relationPickerSourceId: sourceNodeId }),
  closeRelationPicker: () =>
    set({ isRelationPickerOpen: false }),
  selectRelationType: (relType) =>
    set({ addRelationType: relType, isRelationPickerOpen: false, isModalOpen: true, modalMode: "add", editingMember: null }),

  // Connection picker (drag-connect between existing nodes)
  openConnectionPicker: (conn) =>
    set({ pendingConnection: conn, isConnectionPickerOpen: true }),
  closeConnectionPicker: () =>
    set({ pendingConnection: null, isConnectionPickerOpen: false }),

  confirmConnectionRelation: (relType) => {
    const { pendingConnection, activeTreeId } = get();
    if (!pendingConnection || !activeTreeId) return;
    const { source, target } = pendingConnection;

    // Validate before applying
    const activeTree = get().trees.find((t) => t.id === activeTreeId);
    if (!activeTree) return;
    const validation = validateConnectionRelation(relType, source, target, activeTree.nodes, activeTree.edges);
    if (!validation.valid) {
      // Validation failed — close picker but don't create edge; caller UI handles the message
      return;
    }

    set((s) => ({
      trees: s.trees.map((tree) => {
        if (tree.id !== activeTreeId) return tree;
        let updatedNodes = tree.nodes;
        let newEdge: FamilyEdge;

        switch (relType) {
          case "parent-child":
            newEdge = { id: `e-${source}-${target}`, source, target, type: "smoothstep", data: { relationLabel: "con" } };
            updatedNodes = tree.nodes.map((n) =>
              n.id === target ? { ...n, data: { ...n.data, member: { ...n.data.member, parentId: source } } } : n
            );
            break;
          case "child-parent":
            newEdge = { id: `e-${target}-${source}`, source: target, target: source, type: "smoothstep", data: { relationLabel: "con" } };
            updatedNodes = tree.nodes.map((n) =>
              n.id === source ? { ...n, data: { ...n.data, member: { ...n.data.member, parentId: target } } } : n
            );
            break;
          case "sibling":
            newEdge = {
              id: `e-sibling-${source}-${target}`, source, target, type: "straight",
              style: { strokeDasharray: "6,4" } as React.CSSProperties, data: { relationLabel: "anh/chị/em" },
            };
            break;
          case "spouse":
            newEdge = {
              id: `e-spouse-${source}-${target}`, source, target,
              sourceHandle: "spouse-source", targetHandle: "spouse-target",
              data: { relationLabel: "vợ/chồng" },
            };
            updatedNodes = tree.nodes.map((n) => {
              if (n.id === source) return { ...n, data: { ...n.data, member: { ...n.data.member, spouseId: target } } };
              if (n.id === target) return { ...n, data: { ...n.data, member: { ...n.data.member, spouseId: source } } };
              return n;
            });
            break;
        }

        // Avoid duplicate edges
        const edgeExists = tree.edges.some((e) => e.id === newEdge.id);
        return {
          ...tree,
          nodes: updatedNodes,
          edges: edgeExists ? tree.edges : [...tree.edges, newEdge],
          updatedAt: new Date().toISOString(),
        };
      }),
      pendingConnection: null,
      isConnectionPickerOpen: false,
    }));
  },
}));

// ──────────────────────────────────────────────
// Selector helpers
// ──────────────────────────────────────────────
export function useActiveTree() {

  return useFamilyTreeStore((s) => s.trees.find((t) => t.id === s.activeTreeId) ?? null);
}
