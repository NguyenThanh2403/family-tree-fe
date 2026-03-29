import type {
  ValidationError,
  ValidationResult,
  ValidationErrorCode,
} from '@/types/relationship.types';
import type { FamilyMember, FamilyEdge, RelationshipType } from '@/types/tree.types';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_PARENT_AGE_DIFF = 13;

// ============================================================
// Node / member validation
// ============================================================

export function validateMember(
  data: Partial<FamilyMember>,
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push({ code: 'NAME_TOO_SHORT', field: 'name' });
  }

  if (
    data.birthYear !== undefined &&
    (data.birthYear < 1000 || data.birthYear > CURRENT_YEAR)
  ) {
    errors.push({ code: 'INVALID_BIRTH_YEAR', field: 'birthYear' });
  }

  if (data.deathYear !== undefined) {
    if (data.deathYear > CURRENT_YEAR) {
      errors.push({ code: 'INVALID_DEATH_YEAR', field: 'deathYear' });
    }
    if (data.birthYear !== undefined && data.deathYear <= data.birthYear) {
      errors.push({ code: 'INVALID_DEATH_YEAR', field: 'deathYear' });
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================
// Relationship edge validation
// ============================================================

export function hasDuplicateRelation(
  edges: FamilyEdge[],
  nodeA: string,
  nodeB: string,
): boolean {
  return edges.some(
    (e) =>
      (e.source === nodeA && e.target === nodeB) ||
      (e.source === nodeB && e.target === nodeA),
  );
}

export function countParents(edges: FamilyEdge[], childId: string): number {
  return edges.filter(
    (e) => e.type === 'parent-child' && e.target === childId,
  ).length;
}

export function countActiveSpouses(
  edges: FamilyEdge[],
  nodeId: string,
): number {
  return edges.filter(
    (e) =>
      e.type === 'spouse' &&
      !e.divorceYear &&
      (e.source === nodeId || e.target === nodeId),
  ).length;
}

/**
 * Returns true if a new marriage period [newMarriageYear, newDivorceYear]
 * for `personId` overlaps with any existing spouse period.
 *
 * Intervals overlap when:  newStart < existEnd  AND  existStart < newEnd
 * A marriage with no divorce = ongoing = end of Infinity.
 * When newMarriageYear is undefined, only block an already-ongoing marriage.
 */
export function hasSpouseTimeOverlap(
  edges: FamilyEdge[],
  personId: string,
  newMarriageYear: number | undefined,
  newDivorceYear: number | undefined,
): boolean {
  const spouseEdges = edges.filter(
    (e) => e.type === 'spouse' && (e.source === personId || e.target === personId),
  );
  for (const e of spouseEdges) {
    if (newMarriageYear === undefined) {
      // No date info → only block an ongoing (not yet divorced) marriage
      if (!e.divorceYear) return true;
    } else {
      const existStart = e.marriageYear ?? 0;
      const existEnd   = e.divorceYear   ?? Infinity;
      const newStart   = newMarriageYear;
      const newEnd     = newDivorceYear  ?? Infinity;
      // Two periods overlap when newStart < existEnd AND existStart < newEnd
      if (newStart < existEnd && existStart < newEnd) return true;
    }
  }
  return false;
}

/**
 * DFS: detect if adding a parent-child edge (newSource → newTarget)
 * would create a cycle in the lineage graph.
 */
export function wouldCreateCycle(
  edges: FamilyEdge[],
  newSource: string,
  newTarget: string,
): boolean {
  // Build parent→children adjacency
  const children: Record<string, string[]> = {};
  for (const edge of edges) {
    if (edge.type === 'parent-child' || edge.type === 'adoptive-parent') {
      if (!children[edge.source]) children[edge.source] = [];
      children[edge.source].push(edge.target);
    }
  }

  // DFS from newTarget downward; if we reach newSource → cycle
  const visited = new Set<string>();
  const stack: string[] = [newTarget];

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === newSource) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const child of children[current] ?? []) {
      stack.push(child);
    }
  }

  return false;
}

export function validateNewRelationship(
  ctx: { members: FamilyMember[]; edges: FamilyEdge[] },
  payload: {
    sourceId: string;
    targetId: string;
    type: RelationshipType;
    marriageYear?: number;
    divorceYear?: number;
    adoptionYear?: number;
    bondYear?: number;
  },
): ValidationResult {
  const errors: ValidationError[] = [];
  const addError = (code: ValidationErrorCode, field?: string) =>
    errors.push({ code, field });

  // 1. Self-relation
  if (payload.sourceId === payload.targetId) {
    addError('SELF_RELATION', 'target');
  }

  // 2. Duplicate relation
  if (hasDuplicateRelation(ctx.edges, payload.sourceId, payload.targetId)) {
    addError('DUPLICATE_RELATION', 'target');
  }

  const isParentEdge = payload.type === 'parent-child' || payload.type === 'adoptive-parent';

  if (isParentEdge) {
    // 3. Cycle detection
    if (wouldCreateCycle(ctx.edges, payload.sourceId, payload.targetId)) {
      addError('CYCLE_DETECTED', 'target');
    }

    // 4. Max 2 biological parents (adoptive parents have no limit)
    if (payload.type === 'parent-child' && countParents(ctx.edges, payload.targetId) >= 2) {
      addError('MAX_PARENTS_EXCEEDED', 'target');
    }

    // 5. Age consistency
    const parent = ctx.members.find((m) => m.id === payload.sourceId);
    const child = ctx.members.find((m) => m.id === payload.targetId);
    if (
      parent?.birthYear &&
      child?.birthYear &&
      child.birthYear - parent.birthYear < MIN_PARENT_AGE_DIFF
    ) {
      addError('AGE_INCONSISTENCY', 'target');
    }
    // 6. Adoption year (if provided)
    if (payload.type === 'adoptive-parent' && payload.adoptionYear !== undefined) {
      if (
        payload.adoptionYear < 1800 ||
        payload.adoptionYear > CURRENT_YEAR + 1
      ) {
        addError('INVALID_ADOPTION_YEAR', 'adoptionYear');
      }
    }
  }

  if (payload.type === 'spouse') {
    // Check marriage period overlap for both parties
    if (
      hasSpouseTimeOverlap(ctx.edges, payload.sourceId, payload.marriageYear, payload.divorceYear) ||
      hasSpouseTimeOverlap(ctx.edges, payload.targetId, payload.marriageYear, payload.divorceYear)
    ) {
      addError('MAX_SPOUSE_EXCEEDED', 'target');
    }

    // Marriage year range check
    if (payload.marriageYear !== undefined) {
      if (payload.marriageYear < 1800 || payload.marriageYear > CURRENT_YEAR + 1) {
        addError('INVALID_YEAR', 'marriageYear');
      }
    }
    // Divorce year must be ≥ marriage year
    if (payload.divorceYear !== undefined) {
      if (payload.divorceYear < 1800 || payload.divorceYear > CURRENT_YEAR + 1) {
        addError('INVALID_YEAR', 'divorceYear');
      } else if (payload.marriageYear !== undefined && payload.divorceYear < payload.marriageYear) {
        addError('INVALID_YEAR', 'divorceYear');
      }
    }
  }

  if (payload.type === 'sibling-bond') {
    if (payload.bondYear !== undefined) {
      if (payload.bondYear < 1800 || payload.bondYear > CURRENT_YEAR + 1) {
        addError('INVALID_BOND_YEAR', 'bondYear');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
