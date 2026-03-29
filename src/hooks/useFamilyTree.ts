'use client';

import { useTreeStore } from '@/core/store/tree.store';

export function useFamilyTree() {
  const currentTree = useTreeStore((s) => s.currentTree);
  const selectedNodeIds = useTreeStore((s) => s.selectedNodeIds);
  const isLoading = useTreeStore((s) => s.isLoading);
  const error = useTreeStore((s) => s.error);

  const fetchTree = useTreeStore((s) => s.fetchTree);
  const addMember = useTreeStore((s) => s.addMember);
  const updateMember = useTreeStore((s) => s.updateMember);
  const deleteMember = useTreeStore((s) => s.deleteMember);
  const addEdge = useTreeStore((s) => s.addEdge);
  const updateEdge = useTreeStore((s) => s.updateEdge);
  const deleteEdge = useTreeStore((s) => s.deleteEdge);
  const selectNode = useTreeStore((s) => s.selectNode);
  const deselectAll = useTreeStore((s) => s.deselectAll);
  const checkDuplicateEdge = useTreeStore((s) => s.checkDuplicateEdge);
  const clearError = useTreeStore((s) => s.clearError);

  const members = currentTree?.members ?? [];
  const edges = currentTree?.edges ?? [];

  return {
    tree: currentTree,
    members,
    edges,
    selectedNodeIds,
    isLoading,
    error,
    fetchTree,
    addMember,
    updateMember,
    deleteMember,
    addEdge,
    updateEdge,
    deleteEdge,
    selectNode,
    deselectAll,
    checkDuplicateEdge,
    clearError,
  };
}
