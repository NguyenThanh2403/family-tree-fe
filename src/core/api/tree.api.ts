import apiClient from './client';
import type { FamilyTree, FamilyMember, FamilyEdge, NodeFormData, EdgeFormData } from '@/types/tree.types';
import { treeMock } from './mock/tree.mock';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const _treeApi = {
  // Trees
  listTrees: async () => {
    const { data } = await apiClient.get<FamilyTree[]>('/trees');
    return data;
  },

  getTree: async (treeId: string) => {
    const { data } = await apiClient.get<FamilyTree>(`/trees/${treeId}`);
    return data;
  },

  createTree: async (payload: { name: string; description?: string }) => {
    const { data } = await apiClient.post<FamilyTree>('/trees', payload);
    return data;
  },

  updateTree: async (treeId: string, patch: Partial<Pick<FamilyTree, 'name' | 'description'>>) => {
    const { data } = await apiClient.patch<FamilyTree>(`/trees/${treeId}`, patch);
    return data;
  },

  deleteTree: async (treeId: string) => {
    await apiClient.delete(`/trees/${treeId}`);
  },

  // Members
  addMember: async (treeId: string, payload: NodeFormData) => {
    const { data } = await apiClient.post<FamilyMember>(
      `/trees/${treeId}/members`,
      payload,
    );
    return data;
  },

  updateMember: async (treeId: string, memberId: string, payload: Partial<NodeFormData>) => {
    const { data } = await apiClient.patch<FamilyMember>(
      `/trees/${treeId}/members/${memberId}`,
      payload,
    );
    return data;
  },

  deleteMember: async (treeId: string, memberId: string) => {
    await apiClient.delete(`/trees/${treeId}/members/${memberId}`);
  },

  // Edges
  addEdge: async (treeId: string, payload: EdgeFormData) => {
    const { data } = await apiClient.post<FamilyEdge>(
      `/trees/${treeId}/edges`,
      payload,
    );
    return data;
  },

  updateEdge: async (treeId: string, edgeId: string, payload: Partial<EdgeFormData>) => {
    const { data } = await apiClient.patch<FamilyEdge>(
      `/trees/${treeId}/edges/${edgeId}`,
      payload,
    );
    return data;
  },

  deleteEdge: async (treeId: string, edgeId: string) => {
    await apiClient.delete(`/trees/${treeId}/edges/${edgeId}`);
  },
};

export const treeApi = USE_MOCK ? treeMock : _treeApi;
