// ============================================================
// Tree & Person types
// ============================================================

export type Gender = 'male' | 'female' | 'unknown';

export type RelationshipType =
  | 'parent-child'      // Quan hệ huyết thống cha/mẹ - con
  | 'adoptive-parent'   // Cha/mẹ nuôi - con nuôi
  | 'spouse'            // Vợ chồng
  | 'sibling-bond';     // Anh em kết nghĩa / anh em nuôi

export interface FamilyMember {
  id: string;
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  birthPlace?: string;
  avatarUrl?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyEdge {
  id: string;
  source: string;       // node id
  target: string;       // node id
  type: RelationshipType;
  marriageYear?: number;
  divorceYear?: number;
  adoptionYear?: number;
  bondYear?: number;
}

export interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: FamilyMember[];
  edges: FamilyEdge[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// React Flow wrapper types
// ============================================================

import type { Node, Edge } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  member: FamilyMember;
  isRoot?: boolean;
}

export type FamilyFlowNode = Node<NodeData>;
export type FamilyFlowEdge = Edge;

// ============================================================
// Form types
// ============================================================

export interface NodeFormData {
  name: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  birthPlace?: string;
  note?: string;
  avatarUrl?: string;
  // Optional relationship year fields (populated when creating a relative in one-step flow)
  marriageYear?: number;
  divorceYear?: number;
  adoptionYear?: number;
  bondYear?: number;
}

export interface EdgeFormData {
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  marriageYear?: number;
  divorceYear?: number;
  adoptionYear?: number;
  bondYear?: number;
}
