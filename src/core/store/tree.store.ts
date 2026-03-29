import { create } from 'zustand';
import type { FamilyTree, FamilyMember, FamilyEdge, NodeFormData, EdgeFormData } from '@/types/tree.types';
import { treeApi } from '../api/tree.api';
import { validateNewRelationship } from '../validation/tree.validation';
import { hasDuplicateRelation } from '../validation/tree.validation';
import type { ValidationResult } from '@/types/relationship.types';

interface TreeState {
  trees: FamilyTree[];
  currentTree: FamilyTree | null;
  selectedNodeIds: string[];
  isLoading: boolean;
  error: string | null;

  // Tree CRUD
  fetchTrees: () => Promise<void>;
  fetchTree: (treeId: string) => Promise<void>;
  createTree: (name: string, description?: string) => Promise<FamilyTree>;
  deleteTree: (treeId: string) => Promise<void>;

  // Member CRUD
  addMember: (treeId: string, data: NodeFormData) => Promise<FamilyMember>;
  updateMember: (treeId: string, memberId: string, data: Partial<NodeFormData>) => Promise<void>;
  deleteMember: (treeId: string, memberId: string) => Promise<void>;

  // Edge CRUD
  addEdge: (treeId: string, data: EdgeFormData) => Promise<{ result: FamilyEdge; validation: ValidationResult }>;
  updateEdge: (treeId: string, edgeId: string, data: Partial<EdgeFormData>) => Promise<void>;
  deleteEdge: (treeId: string, edgeId: string) => Promise<void>;

  // UI state
  selectNode: (nodeId: string) => void;
  deselectAll: () => void;
  clearError: () => void;

  // Check duplicate edge (returns true if already exists)
  checkDuplicateEdge: (sourceId: string, targetId: string) => boolean;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  trees: [],
  currentTree: null,
  selectedNodeIds: [],
  isLoading: false,
  error: null,

  fetchTrees: async () => {
    set({ isLoading: true, error: null });
    try {
      const trees = await treeApi.listTrees();
      set({ trees, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Error' });
    }
  },

  fetchTree: async (treeId) => {
    set({ isLoading: true, error: null });
    try {
      const tree = await treeApi.getTree(treeId);
      set({ currentTree: tree, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'Error' });
    }
  },

  createTree: async (name, description) => {
    const tree = await treeApi.createTree({ name, description });
    set((s) => ({ trees: [...s.trees, tree] }));
    return tree;
  },

  deleteTree: async (treeId) => {
    await treeApi.deleteTree(treeId);
    set((s) => ({
      trees: s.trees.filter((t) => t.id !== treeId),
      currentTree: s.currentTree?.id === treeId ? null : s.currentTree,
    }));
  },

  addMember: async (treeId, data) => {
    const member = await treeApi.addMember(treeId, data);
    set((s) => {
      if (!s.currentTree || s.currentTree.id !== treeId) return s;
      return {
        currentTree: {
          ...s.currentTree,
          members: [...s.currentTree.members, member],
        },
      };
    });
    return member;
  },

  updateMember: async (treeId, memberId, data) => {
    const updated = await treeApi.updateMember(treeId, memberId, data);
    set((s) => {
      if (!s.currentTree) return s;
      return {
        currentTree: {
          ...s.currentTree,
          members: s.currentTree.members.map((m) =>
            m.id === memberId ? updated : m,
          ),
        },
      };
    });
  },

  deleteMember: async (treeId, memberId) => {
    await treeApi.deleteMember(treeId, memberId);
    set((s) => {
      if (!s.currentTree) return s;
      return {
        currentTree: {
          ...s.currentTree,
          members: s.currentTree.members.filter((m) => m.id !== memberId),
          edges: s.currentTree.edges.filter(
            (e) => e.source !== memberId && e.target !== memberId,
          ),
        },
      };
    });
  },

  addEdge: async (treeId, data) => {
    const { currentTree } = get();
    if (!currentTree) throw new Error('No active tree');

    // Pre-validate
    const validation = validateNewRelationship(
      { members: currentTree.members, edges: currentTree.edges },
      {
        sourceId: data.sourceId,
        targetId: data.targetId,
        type: data.type,
        marriageYear: data.marriageYear,
        divorceYear: data.divorceYear,
        adoptionYear: data.adoptionYear,
        bondYear: data.bondYear,
      },
    );

    if (!validation.valid) {
      return { result: {} as FamilyEdge, validation };
    }

    const edge = await treeApi.addEdge(treeId, data);
    set((s) => {
      if (!s.currentTree) return s;
      return {
        currentTree: {
          ...s.currentTree,
          edges: [...s.currentTree.edges, edge],
        },
      };
    });
    return { result: edge, validation };
  },

  updateEdge: async (treeId, edgeId, data) => {
    const edge = await treeApi.updateEdge(treeId, edgeId, data);
    set((s) => {
      if (!s.currentTree) return s;
      return {
        currentTree: {
          ...s.currentTree,
          edges: s.currentTree.edges.map((e) => (e.id === edgeId ? edge : e)),
        },
      };
    });
  },

  deleteEdge: async (treeId, edgeId) => {
    await treeApi.deleteEdge(treeId, edgeId);
    set((s) => {
      if (!s.currentTree) return s;
      return {
        currentTree: {
          ...s.currentTree,
          edges: s.currentTree.edges.filter((e) => e.id !== edgeId),
        },
      };
    });
  },

  selectNode: (nodeId) => {
    set((s) => {
      const already = s.selectedNodeIds.includes(nodeId);
      if (already) {
        return { selectedNodeIds: s.selectedNodeIds.filter((id) => id !== nodeId) };
      }
      // Max 2 selected at once (for relationship analysis)
      const next = [...s.selectedNodeIds, nodeId].slice(-2);
      return { selectedNodeIds: next };
    });
  },

  deselectAll: () => set({ selectedNodeIds: [] }),

  clearError: () => set({ error: null }),

  checkDuplicateEdge: (sourceId, targetId) => {
    const { currentTree } = get();
    if (!currentTree) return false;
    return hasDuplicateRelation(currentTree.edges, sourceId, targetId);
  },
}));
