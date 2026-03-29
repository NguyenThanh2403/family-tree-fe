import type {
  AdjacencyGraph,
  AdjacencyEntry,
  PathStep,
  RelationshipAnalysis,
} from '@/types/relationship.types';
import type { FamilyMember, FamilyEdge } from '@/types/tree.types';
import { resolveRelationshipLabel } from './address-resolver';
import type { Locale } from '@/i18n';

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
  locale: Locale = 'vi',
): RelationshipAnalysis {
  const graph = buildAdjacencyGraph(edges);
  const path = findPath(graph, nodeA.id, nodeB.id);

  if (path === null) {
    const noPathMessages: Record<Locale, string> = {
      en: 'No family connection found between these two people.',
      vi: 'Không tìm thấy mối liên hệ giữa hai người này.',
      zh: '未找到这两个人之间的家族联系。',
      ko: '이 두 사람 사이의 가족 관계를 찾을 수 없습니다.',
      ja: 'これら2人の間の家族のつながりが見つかりません。',
      th: 'ไม่พบความสัมพันธ์ครอบครัวระหว่างสองคนนี้',
    };

    return {
      found: false,
      relationshipLabel: '',
      addressFromA: '',
      addressFromB: '',
      generationDelta: 0,
      description: noPathMessages[locale] ?? noPathMessages.en,
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

  const templates: Record<Locale, (a: string, b: string, label: string) => string> = {
    en: (a, b, label) => `${a} is the ${label} of ${b}`,
    vi: (a, b, label) => `${a} là ${label} của ${b}`,
    zh: (a, b, label) => `${a} 是 ${b} 的 ${label}`,
    ko: (a, b, label) => `${a}은 ${b}의 ${label}`,
    ja: (a, b, label) => `${a}は${b}の${label}`,
    th: (a, b, label) => `${a} เป็น ${label} ของ ${b}`,
  };

  const description = (templates[locale] ?? templates.en)(nodeA.name, nodeB.name, labels.addressFromB);

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
