import type { FamilyMember } from './tree.types';

export interface RelationshipAnalysis {
  found: boolean;
  relationshipLabel: string;    // e.g. "Ông – Cháu"
  addressFromA: string;         // How A addresses B
  addressFromB: string;         // How B addresses A
  generationDelta: number;      // positive = B is below A
  description: string;
  pathIds: string[];
}

export interface PathStep {
  from: string;
  to: string;
  direction: 'up' | 'down' | 'lateral';
  edgeType: import('./tree.types').RelationshipType;
}

export interface AdjacencyEntry {
  id: string;
  direction: 'up' | 'down' | 'lateral';
  edgeType: import('./tree.types').RelationshipType;
}

export type AdjacencyGraph = Record<string, AdjacencyEntry[]>;

export interface ValidationError {
  code: ValidationErrorCode;
  field?: string;
  message?: string;
}

export type ValidationErrorCode =
  | 'SELF_RELATION'
  | 'CYCLE_DETECTED'
  | 'DUPLICATE_RELATION'
  | 'MAX_PARENTS_EXCEEDED'
  | 'MAX_SPOUSE_EXCEEDED'
  | 'AGE_INCONSISTENCY'
  | 'GENDER_MISMATCH'
  | 'INVALID_YEAR'
  | 'INVALID_ADOPTION_YEAR'
  | 'INVALID_BOND_YEAR'
  | 'INVALID_BIRTH_YEAR'
  | 'INVALID_DEATH_YEAR'
  | 'NAME_TOO_SHORT';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface RelationshipContext {
  nodeA: FamilyMember;
  nodeB: FamilyMember;
  locale: 'en' | 'vi';
}
