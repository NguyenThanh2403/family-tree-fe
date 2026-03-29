import type {
  AdjacencyGraph,
  AdjacencyEntry,
  PathStep,
  RelationshipAnalysis,
} from '@/types/relationship.types';
import type { FamilyMember, FamilyEdge } from '@/types/tree.types';
import { resolveRelationshipLabel } from './address-resolver';

// ============================================================
// Graph construction
// ============================================================

export function buildAdjacencyGraph(edges: FamilyEdge[]): AdjacencyGraph {
  const graph: AdjacencyGraph = {};

  const addEntry = (from: string, entry: AdjacencyEntry) => {
    if (!graph[from]) graph[from] = [];
    graph[from].push(entry);
  };

  const isParentEdge = (edge: FamilyEdge) => edge.type === 'parent-child' || edge.type === 'adoptive-parent';

  for (const edge of edges) {
    if (isParentEdge(edge)) {
      // source = parent → target = child
      addEntry(edge.source, {
        id: edge.target,
        direction: 'down',
        edgeType: 'parent-child',
      });
      addEntry(edge.target, {
        id: edge.source,
        direction: 'up',
        edgeType: 'parent-child',
      });
    } else if (edge.type === 'spouse') {
      addEntry(edge.source, {
        id: edge.target,
        direction: 'lateral',
        edgeType: 'spouse',
      });
      addEntry(edge.target, {
        id: edge.source,
        direction: 'lateral',
        edgeType: 'spouse',
      });
    } else if (edge.type === 'sibling-bond') {
      addEntry(edge.source, {
        id: edge.target,
        direction: 'lateral',
        edgeType: 'sibling-bond',
      });
      addEntry(edge.target, {
        id: edge.source,
        direction: 'lateral',
        edgeType: 'sibling-bond',
      });
    }
  }

  return graph;
}

// ============================================================
// BFS path finder
// ============================================================

export function findPath(
  graph: AdjacencyGraph,
  fromId: string,
  toId: string,
): PathStep[] | null {
  if (fromId === toId) return [];

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
          [
            ...path,
            {
              from: current,
              to: neighbor.id,
              direction: neighbor.direction,
              edgeType: neighbor.edgeType,
            },
          ],
        ]);
      }
    }
  }

  return null;
}

// ============================================================
// Generation delta
// ============================================================

export function calcGenerationDelta(path: PathStep[]): number {
  return path.reduce((acc, step) => {
    if (step.direction === 'up') return acc - 1;
    if (step.direction === 'down') return acc + 1;
    return acc;
  }, 0);
}

// ============================================================
// Main analysis function
// ============================================================

export function analyzeRelationship(
  nodeA: FamilyMember,
  nodeB: FamilyMember,
  edges: FamilyEdge[],
  locale: 'en' | 'vi' = 'vi',
): RelationshipAnalysis {
  const graph = buildAdjacencyGraph(edges);
  const path = findPath(graph, nodeA.id, nodeB.id);

  if (path === null) {
    return {
      found: false,
      relationshipLabel: '',
      addressFromA: '',
      addressFromB: '',
      generationDelta: 0,
      description:
        locale === 'vi'
          ? 'Không tìm thấy mối liên hệ giữa hai người này.'
          : 'No family connection found between these two people.',
      pathIds: [],
    };
  }

  const generationDelta = calcGenerationDelta(path);
  const hasSpouseEdge = path.some((s) => s.edgeType === 'spouse');
  const pathIds = [nodeA.id, ...path.map((s) => s.to)];

  const labels = resolveRelationshipLabel(
    nodeA,
    nodeB,
    generationDelta,
    hasSpouseEdge,
    locale,
  );

  const description =
    locale === 'vi'
      ? `${nodeA.name} là ${labels.addressFromB} của ${nodeB.name}`
      : `${nodeA.name} is the ${labels.addressFromB} of ${nodeB.name}`;

  return {
    found: true,
    relationshipLabel: labels.relationshipLabel,
    addressFromA: labels.addressFromA,
    addressFromB: labels.addressFromB,
    generationDelta,
    description,
    pathIds,
  };
}
