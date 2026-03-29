# Validation & Business Rules

## Node Validation

### On Create / Edit

| Rule | Error Message |
|---|---|
| `name` required, min 2 chars | "Tên phải có ít nhất 2 ký tự" |
| `gender` must be valid enum | "Giới tính không hợp lệ" |
| `birthYear` if provided: 1000 ≤ year ≤ current year | "Năm sinh không hợp lệ" |
| `deathYear` if provided: > birthYear | "Năm mất phải sau năm sinh" |
| `deathYear` ≤ current year | "Năm mất không thể trong tương lai" |

---

## Relationship / Edge Validation

### General Rules

| Rule | Code | Description |
|---|---|---|
| No self-relation | `SELF_RELATION` | Node cannot be related to itself |
| No cycle in lineage | `CYCLE_DETECTED` | Parent/child chain must be acyclic |
| Single relationship constraint | `DUPLICATE_RELATION` | Only 1 edge between any 2 nodes |
| Max 2 parents | `MAX_PARENTS_EXCEEDED` | Person can have at most 2 parents |
| Max 1 active spouse | `MAX_SPOUSE_EXCEEDED` | Can have multiple marriages but must mark previous as ended |
| Gender consistency (spouse) | `GENDER_MISMATCH` | Spouse relationship: must be opposite gender (configurable) |
| Age consistency (parent-child) | `AGE_INCONSISTENCY` | Parent must be born ≥ 13 years before child |
| Parent cannot be descendant | `LOGICAL_CONTRADICTION` | If A is already a descendant of B, B cannot become parent of A |

---

## Cycle Detection Algorithm

```ts
/**
 * Detect if adding edge (source → target, type: parent-child) 
 * would create a cycle in the lineage graph.
 *
 * Strategy: DFS from target; if we ever reach source, cycle detected.
 */
function wouldCreateCycle(
  nodes: FamilyNode[],
  edges: FamilyEdge[],
  newSource: string,  // prospective parent
  newTarget: string   // prospective child
): boolean {
  // Build parent-child adjacency (directed: parent → children)
  const children: Record<string, string[]> = {};
  for (const edge of edges) {
    if (edge.type === 'parent-child') {
      if (!children[edge.source]) children[edge.source] = [];
      children[edge.source].push(edge.target);
    }
  }

  // DFS from newTarget downward
  const visited = new Set<string>();
  const stack = [newTarget];
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === newSource) return true; // cycle found
    if (visited.has(current)) continue;
    visited.add(current);
    for (const child of children[current] ?? []) {
      stack.push(child);
    }
  }
  
  return false;
}
```

---

## Max Parents Check

```ts
function countParents(edges: FamilyEdge[], childId: string): number {
  return edges.filter(
    e => e.type === 'parent-child' && e.target === childId
  ).length;
}

// Before adding parent-child edge:
if (countParents(edges, newChildId) >= 2) {
  throw new ValidationError('MAX_PARENTS_EXCEEDED');
}
```

---

## Duplicate Relation Check

```ts
function hasDuplicateRelation(
  edges: FamilyEdge[],
  nodeA: string,
  nodeB: string
): boolean {
  return edges.some(e =>
    (e.source === nodeA && e.target === nodeB) ||
    (e.source === nodeB && e.target === nodeA)
  );
}
```

If duplicate found → show `<Confirm>` dialog: 
> "A relationship already exists between these nodes. Do you want to replace it?"

---

## Age Consistency Check

```ts
function isAgeConsistent(
  parentBirthYear: number | undefined,
  childBirthYear: number | undefined,
  minAgeDiff = 13
): boolean {
  if (!parentBirthYear || !childBirthYear) return true; // skip if unknown
  return childBirthYear - parentBirthYear >= minAgeDiff;
}
```

---

## Full Validation Pipeline

```ts
async function validateNewRelationship(
  ctx: { nodes: FamilyNode[]; edges: FamilyEdge[] },
  payload: { sourceId: string; targetId: string; type: RelationshipType }
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];

  // 1. Self-relation
  if (payload.sourceId === payload.targetId) {
    errors.push({ code: 'SELF_RELATION', field: 'target' });
  }

  // 2. Duplicate
  if (hasDuplicateRelation(ctx.edges, payload.sourceId, payload.targetId)) {
    errors.push({ code: 'DUPLICATE_RELATION', field: 'target' });
  }

  if (payload.type === 'parent-child') {
    // 3. Cycle
    if (wouldCreateCycle(ctx.nodes, ctx.edges, payload.sourceId, payload.targetId)) {
      errors.push({ code: 'CYCLE_DETECTED', field: 'target' });
    }

    // 4. Max parents
    if (countParents(ctx.edges, payload.targetId) >= 2) {
      errors.push({ code: 'MAX_PARENTS_EXCEEDED', field: 'target' });
    }

    // 5. Age consistency
    const parent = ctx.nodes.find(n => n.id === payload.sourceId);
    const child  = ctx.nodes.find(n => n.id === payload.targetId);
    if (parent && child && !isAgeConsistent(parent.birthYear, child.birthYear)) {
      errors.push({ code: 'AGE_INCONSISTENCY', field: 'target' });
    }
  }

  return { valid: errors.length === 0, errors };
}
```

---

## Error Messages (i18n keys)

```json
{
  "validation.SELF_RELATION": "A person cannot be related to themselves.",
  "validation.CYCLE_DETECTED": "This relationship would create a logical loop in the family tree.",
  "validation.DUPLICATE_RELATION": "A relationship between these two people already exists.",
  "validation.MAX_PARENTS_EXCEEDED": "A person can only have at most 2 parents.",
  "validation.AGE_INCONSISTENCY": "The parent must be at least 13 years older than the child.",
  "validation.GENDER_MISMATCH": "Spouse relationship requires opposite genders."
}
```
