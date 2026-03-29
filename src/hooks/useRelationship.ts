'use client';

import { useMemo } from 'react';
import { analyzeRelationship } from '@/lib/relationship/analyzer';
import type { FamilyMember, FamilyEdge } from '@/types/tree.types';
import type { RelationshipAnalysis } from '@/types/relationship.types';
import type { Locale } from '@/i18n';

export function useRelationship(
  nodeA: FamilyMember | undefined,
  nodeB: FamilyMember | undefined,
  edges: FamilyEdge[],
  locale: Locale = 'vi',
): RelationshipAnalysis | null {
  return useMemo(() => {
    if (!nodeA || !nodeB) return null;
    if (nodeA.id === nodeB.id) return null;
    return analyzeRelationship(nodeA, nodeB, edges, locale);
  }, [nodeA, nodeB, edges, locale]);
}
