import type { FamilyTree, FamilyMember, FamilyEdge, NodeFormData, EdgeFormData } from '@/types/tree.types';
import { seedTree1, seedTree2, nextId, now } from './data';

const delay = (ms = 350) => new Promise<void>((res) => setTimeout(res, ms));

// ── In-memory store ──────────────────────────────────────────────────────────
// Deep-clone seed data so mutations don't contaminate the originals
let _trees: FamilyTree[] = [
  JSON.parse(JSON.stringify(seedTree1)),
  JSON.parse(JSON.stringify(seedTree2)),
];

function getTree(treeId: string): FamilyTree {
  const tree = _trees.find((t) => t.id === treeId);
  if (!tree) throw new Error(`Tree không tồn tại: ${treeId}`);
  return tree;
}

// ── Mock tree API ────────────────────────────────────────────────────────────

export const treeMock = {
  listTrees: async (): Promise<FamilyTree[]> => {
    await delay();
    return _trees.map((t) => ({ ...t }));
  },

  getTree: async (treeId: string): Promise<FamilyTree> => {
    await delay();
    return JSON.parse(JSON.stringify(getTree(treeId)));
  },

  createTree: async (payload: { name: string; description?: string }): Promise<FamilyTree> => {
    await delay(400);
    const tree: FamilyTree = {
      id: nextId(),
      name: payload.name,
      description: payload.description,
      ownerId: '1',
      members: [],
      edges: [],
      createdAt: now(),
      updatedAt: now(),
    };
    _trees = [..._trees, tree];
    return { ...tree };
  },

  updateTree: async (
    treeId: string,
    patch: Partial<Pick<FamilyTree, 'name' | 'description'>>,
  ): Promise<FamilyTree> => {
    await delay();
    const tree = getTree(treeId);
    Object.assign(tree, patch, { updatedAt: now() });
    return { ...tree };
  },

  deleteTree: async (treeId: string): Promise<void> => {
    await delay();
    _trees = _trees.filter((t) => t.id !== treeId);
  },

  // ── Members ──────────────────────────────────────────────────────────────

  addMember: async (treeId: string, payload: NodeFormData): Promise<FamilyMember> => {
    await delay();
    const tree = getTree(treeId);
    const member: FamilyMember = {
      id: nextId(),
      name: payload.name,
      gender: payload.gender,
      birthYear: payload.birthYear,
      deathYear: payload.deathYear,
      birthPlace: payload.birthPlace,
      note: payload.note,
      avatarUrl: payload.avatarUrl,
      createdAt: now(),
      updatedAt: now(),
    };
    tree.members = [...tree.members, member];
    tree.updatedAt = now();
    return { ...member };
  },

  updateMember: async (
    treeId: string,
    memberId: string,
    payload: Partial<NodeFormData>,
  ): Promise<FamilyMember> => {
    await delay();
    const tree = getTree(treeId);
    const idx = tree.members.findIndex((m) => m.id === memberId);
    if (idx === -1) throw new Error(`Member không tồn tại: ${memberId}`);
    tree.members[idx] = { ...tree.members[idx], ...payload, updatedAt: now() };
    tree.updatedAt = now();
    return { ...tree.members[idx] };
  },

  deleteMember: async (treeId: string, memberId: string): Promise<void> => {
    await delay();
    const tree = getTree(treeId);
    tree.members = tree.members.filter((m) => m.id !== memberId);
    // Also remove any edges involving this member
    tree.edges = tree.edges.filter(
      (e) => e.source !== memberId && e.target !== memberId,
    );
    tree.updatedAt = now();
  },

  // ── Edges ─────────────────────────────────────────────────────────────────

  addEdge: async (treeId: string, payload: EdgeFormData): Promise<FamilyEdge> => {
    await delay();
    const tree = getTree(treeId);
    const edge: FamilyEdge = {
      id: nextId(),
      source: payload.sourceId,
      target: payload.targetId,
      type: payload.type,
      marriageYear: payload.marriageYear,
      divorceYear: payload.divorceYear,
      adoptionYear: payload.adoptionYear,
      bondYear: payload.bondYear,
    };
    tree.edges = [...tree.edges, edge];
    tree.updatedAt = now();
    return { ...edge };
  },

  updateEdge: async (
    treeId: string,
    edgeId: string,
    payload: Partial<EdgeFormData>,
  ): Promise<FamilyEdge> => {
    await delay();
    const tree = getTree(treeId);
    const idx = tree.edges.findIndex((e) => e.id === edgeId);
    if (idx === -1) throw new Error(`Edge không tồn tại: ${edgeId}`);
    const updated: FamilyEdge = {
      ...tree.edges[idx],
      ...(payload.type && { type: payload.type }),
      ...(payload.marriageYear !== undefined && { marriageYear: payload.marriageYear }),
      ...(payload.divorceYear !== undefined && { divorceYear: payload.divorceYear }),
      ...(payload.adoptionYear !== undefined && { adoptionYear: payload.adoptionYear }),
      ...(payload.bondYear !== undefined && { bondYear: payload.bondYear }),
    };
    tree.edges[idx] = updated;
    tree.updatedAt = now();
    return { ...updated };
  },

  deleteEdge: async (treeId: string, edgeId: string): Promise<void> => {
    await delay();
    const tree = getTree(treeId);
    tree.edges = tree.edges.filter((e) => e.id !== edgeId);
    tree.updatedAt = now();
  },
};
