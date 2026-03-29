# Relationship Analysis Algorithm

## Data Model

```ts
// A node in the family tree
interface FamilyNode {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'unknown';
  birthYear?: number;
  deathYear?: number;
}

// A directed edge between two nodes
interface FamilyEdge {
  id: string;
  source: string;                   // parent
  target: string;                   // child
  type: RelationshipType;
}

type RelationshipType =
  | 'parent-child'                  // source is parent, target is child
  | 'spouse';                       // bidirectional
```

---

## Graph Representation

Build an **undirected adjacency list** that captures both directions:

```
adjacency[nodeId] = [
  { neighborId, edgeType, direction: 'up'|'down'|'lateral' }
]
```

- `parent → child` edge: direction = `down` from parent, `up` from child
- `spouse` edge: direction = `lateral` for both

---

## Path Finding (BFS)

```ts
function findPath(
  graph: AdjacencyGraph,
  fromId: string,
  toId: string
): PathStep[] | null {
  // Standard BFS
  const queue: [string, PathStep[]][] = [[fromId, []]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;
    if (current === toId) return path;
    if (visited.has(current)) continue;
    visited.add(current);

    for (const neighbor of graph[current] ?? []) {
      if (!visited.has(neighbor.id)) {
        queue.push([
          neighbor.id,
          [...path, { id: current, to: neighbor.id, direction: neighbor.direction }]
        ]);
      }
    }
  }
  return null; // no connection
}
```

---

## Generation Delta Calculation

Walk the path and accumulate:
- `up` step (going to parent): `delta -= 1`
- `down` step (going to child): `delta += 1`
- `lateral` step (spouse): `delta += 0`

```ts
function calcGenerationDelta(path: PathStep[]): number {
  return path.reduce((acc, step) => {
    if (step.direction === 'up') return acc - 1;
    if (step.direction === 'down') return acc + 1;
    return acc;
  }, 0);
}
```

`generationDelta > 0` → B is a descendant of A  
`generationDelta < 0` → B is an ancestor of A  
`generationDelta === 0` → same generation (sibling, spouse, cousin)

---

## Relationship Label Resolution

### Vietnamese Kinship Map (patrilineal bias)

| generationDelta | Relationship (B relative to A) | A addresses B as | B addresses A as |
|---|---|---|---|
| +3 | Chắt | Chắt | Cụ |
| +2 | Cháu | Cháu | Ông/Bà |
| +1 | Con | Con | Bố/Mẹ |
| 0 (sibling) | Anh/Chị/Em | Anh/Chị/Em | Em/Anh/Chị |
| 0 (spouse) | Vợ/Chồng | Em/Anh | Anh/Em |
| -1 | Bố/Mẹ | Bố/Mẹ | Con |
| -2 | Ông/Bà | Ông/Bà | Cháu |
| -3 | Cụ | Cụ | Chắt |

Gender of B determines: Ông (male) / Bà (female), Bố (male) / Mẹ (female), etc.

### Lateral path detection

If path crosses a spouse edge, it's an in-law relationship prefix:
- `Bố/Mẹ vợ/chồng`, `Anh/Chị em vợ/chồng`

### Vietnamese Addressing Logic (simplified)

```ts
function resolveViAddress(
  fromNode: FamilyNode,
  toNode: FamilyNode,
  generationDelta: number,
  pathSteps: PathStep[],
  locale: 'en' | 'vi'
): { addressFromA: string; addressFromB: string } {
  const hasSpouseEdge = pathSteps.some(s => s.edgeType === 'spouse');
  
  // Direct lineage
  if (!hasSpouseEdge) {
    return resolveDirectLineage(fromNode, toNode, generationDelta, locale);
  }
  
  // Through marriage
  return resolveInLawRelationship(fromNode, toNode, generationDelta, pathSteps, locale);
}
```

---

## Full Analysis Output

```ts
interface RelationshipAnalysis {
  found: boolean;
  relationshipLabel: string;        // "Ông – Cháu" / "Grandfather – Grandson"
  addressFromA: string;             // How A addresses B
  addressFromB: string;             // How B addresses A
  generationDelta: number;          // +N = B is N gen below A
  description: string;             // Full human sentence
  pathIds: string[];                // [A, ..., B]
}
```

### Example

```ts
// nodeA = Nguyễn Văn An (male, 1940)
// nodeB = Nguyễn Văn Cường (male, 1985)
// Path: An → (parent-child, down) → Bình → (parent-child, down) → Cường

{
  found: true,
  relationshipLabel: "Ông – Cháu",
  addressFromA: "Cháu",            // An gọi Cường là: Cháu
  addressFromB: "Ông",             // Cường gọi An là: Ông
  generationDelta: 2,
  description: "Nguyễn Văn An là Ông nội của Nguyễn Văn Cường",
  pathIds: ["an-id", "binh-id", "cuong-id"]
}
```

---

## Error Cases

| Case | Response |
|---|---|
| No path found | `{ found: false, description: "Không tìm thấy mối quan hệ" }` |
| Same node | Error: "Không thể phân tích quan hệ với chính mình" |
| Spouse loop | Handle gracefully, mark as `in-law` |
