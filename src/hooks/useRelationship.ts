'use client';

import { useMemo } from 'react';
import { analyzeRelationship } from '@/lib/relationship/analyzer';
import type { FamilyMember, FamilyEdge } from '@/types/tree.types';
import type { RelationshipAnalysis } from '@/types/relationship.types';

export function useRelationship(
  nodeA: FamilyMember | undefined,
  nodeB: FamilyMember | undefined,
  edges: FamilyEdge[],
  locale: 'en' | 'vi' = 'vi',
): RelationshipAnalysis | null {
  return useMemo(() => {
    if (!nodeA || !nodeB) return null;
    if (nodeA.id === nodeB.id) return null;
    return analyzeRelationship(nodeA, nodeB, edges, locale);
  }, [nodeA, nodeB, edges, locale]);
}
