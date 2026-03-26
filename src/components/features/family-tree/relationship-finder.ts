/**
 * relationship-finder.ts
 *
 * BFS-based algorithm to find the relationship path between any two nodes
 * in a family tree and produce a Vietnamese kinship description.
 *
 * Graph model:
 *  - parent-child edges  (source = parent, target = child)  → "cha/mẹ" upward, "con" downward
 *  - sibling edges       (undirected in practice)
 *  - spouse edges        (undirected)
 */

import type { FamilyNode, FamilyEdge } from "@/core/stores/family-tree-store";

// ─── Public result type ────────────────────────────────────────────────────────

export interface RelationshipAnalysisResult {
  /** Ordered node ids from A → B through the tree */
  pathIds: string[];
  /** Net generation difference (positive = B is descendant of A) */
  generationDelta: number;
  /** Short label describing how A and B are related, e.g. "Ông – Cháu" */
  relationshipLabel: string;
  /** How A addresses B, e.g. 'A gọi B là "Cháu", xưng là "Ông"' */
  addressFromA: string;
  /** How B addresses A, e.g. 'B gọi A là "Ông", xưng là "Cháu"' */
  addressFromB: string;
  /** Human-readable description of the path */
  description: string;
}

// ─── Internal graph edge direction ────────────────────────────────────────────

type EdgeKind = "parent" | "child" | "sibling" | "spouse";

interface GraphEdge {
  to: string;
  kind: EdgeKind;
  generationStep: number; // +1 going to child, -1 going to parent, 0 sibling/spouse
}

// ─── Build adjacency list from ReactFlow nodes/edges ──────────────────────────

function buildGraph(nodes: FamilyNode[], edges: FamilyEdge[]): Map<string, GraphEdge[]> {
  const graph = new Map<string, GraphEdge[]>();

  for (const node of nodes) {
    graph.set(node.id, []);
  }

  for (const edge of edges) {
    const label = edge.data?.relationLabel ?? "";

    if (label === "vợ/chồng") {
      // Undirected spouse link
      graph.get(edge.source)?.push({ to: edge.target, kind: "spouse", generationStep: 0 });
      graph.get(edge.target)?.push({ to: edge.source, kind: "spouse", generationStep: 0 });
    } else if (label === "anh/chị/em") {
      // Undirected sibling link
      graph.get(edge.source)?.push({ to: edge.target, kind: "sibling", generationStep: 0 });
      graph.get(edge.target)?.push({ to: edge.source, kind: "sibling", generationStep: 0 });
    } else {
      // Parent-child: source = parent, target = child
      graph.get(edge.source)?.push({ to: edge.target, kind: "child", generationStep: 1 });
      graph.get(edge.target)?.push({ to: edge.source, kind: "parent", generationStep: -1 });
    }
  }

  return graph;
}

// ─── BFS path finder ──────────────────────────────────────────────────────────

interface BFSState {
  nodeId: string;
  path: string[];
  steps: EdgeKind[];
  genDelta: number;
}

function bfs(
  startId: string,
  endId: string,
  graph: Map<string, GraphEdge[]>
): { path: string[]; steps: EdgeKind[]; genDelta: number } | null {
  if (startId === endId) return { path: [startId], steps: [], genDelta: 0 };

  const visited = new Set<string>([startId]);
  const queue: BFSState[] = [{ nodeId: startId, path: [startId], steps: [], genDelta: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = graph.get(current.nodeId) ?? [];

    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;
      visited.add(neighbor.to);

      const newPath = [...current.path, neighbor.to];
      const newSteps = [...current.steps, neighbor.kind];
      const newGenDelta = current.genDelta + neighbor.generationStep;

      if (neighbor.to === endId) {
        return { path: newPath, steps: newSteps, genDelta: newGenDelta };
      }

      queue.push({
        nodeId: neighbor.to,
        path: newPath,
        steps: newSteps,
        genDelta: newGenDelta,
      });
    }
  }

  return null;
}

// ─── Vietnamese kinship label rules ───────────────────────────────────────────

/**
 * Determine the Vietnamese kinship terms based on:
 * - generationDelta: how many generations B is below A
 * - pathSteps: the edge kinds along the path (to detect lateral/collateral paths)
 * - nodeData: to check gender of A/B for gender-specific terms
 */
function getVietnameseKinship(
  genDelta: number,
  pathSteps: EdgeKind[],
  nodeA: FamilyNode,
  nodeB: FamilyNode
): {
  labelA: string; // what A is called (B calls A this)
  labelB: string; // what B is called (A calls B this)
  selfA: string;  // A's self-reference when talking to B
  selfB: string;  // B's self-reference when talking to A
} {
  const genderA = nodeA.data.member.gender;
  const genderB = nodeB.data.member.gender;

  // ── Direct spouse ──
  if (pathSteps.length === 1 && pathSteps[0] === "spouse") {
    if (genderA === "male") return { labelA: "Chồng", labelB: "Vợ", selfA: "Anh", selfB: "Em" };
    if (genderA === "female") return { labelA: "Vợ", labelB: "Chồng", selfA: "Em", selfB: "Anh" };
    return { labelA: "Vợ/Chồng", labelB: "Vợ/Chồng", selfA: "Tôi", selfB: "Tôi" };
  }

  // ── Direct sibling ──
  if (pathSteps.length === 1 && pathSteps[0] === "sibling") {
    // Older vs younger is unknown from pure graph; default to anh/em
    if (genderA === "male") return { labelA: "Anh", labelB: "Em", selfA: "Anh", selfB: "Em" };
    if (genderA === "female") return { labelA: "Chị", labelB: "Em", selfA: "Chị", selfB: "Em" };
    return { labelA: "Anh/Chị", labelB: "Em", selfA: "Anh/Chị", selfB: "Em" };
  }

  // ── Direct line ──
  if (genDelta === 0 && pathSteps.every((s) => s !== "parent" && s !== "child")) {
    return { labelA: "Anh/Chị", labelB: "Em", selfA: "Anh/Chị", selfB: "Em" };
  }

  if (genDelta === 1) {
    // A is parent of B
    const labelA = genderA === "female" ? "Mẹ" : "Ba/Cha";
    return { labelA, labelB: "Con", selfA: genderA === "female" ? "Mẹ" : "Ba", selfB: "Con" };
  }
  if (genDelta === -1) {
    // A is child of B
    const labelB = genderB === "female" ? "Mẹ" : "Ba/Cha";
    return { labelA: "Con", labelB, selfA: "Con", selfB: genderB === "female" ? "Mẹ" : "Ba" };
  }

  if (genDelta === 2) {
    // A is grandparent of B
    const labelA = genderA === "female" ? "Bà" : "Ông";
    return { labelA, labelB: "Cháu", selfA: labelA, selfB: "Cháu" };
  }
  if (genDelta === -2) {
    // A is grandchild of B
    const labelB = genderB === "female" ? "Bà" : "Ông";
    return { labelA: "Cháu", labelB, selfA: "Cháu", selfB: labelB };
  }

  if (genDelta === 3) {
    const labelA = genderA === "female" ? "Cụ (Cố)" : "Cụ (Cố)";
    return { labelA, labelB: "Chít/Cháu cố", selfA: "Cụ", selfB: "Cháu cố" };
  }
  if (genDelta === -3) {
    const labelB = genderB === "female" ? "Cụ (Cố)" : "Cụ (Cố)";
    return { labelA: "Chít/Cháu cố", labelB, selfA: "Cháu cố", selfB: "Cụ" };
  }

  // ── Lateral / collateral relatives ──
  // Detect if path goes up then down (common ancestor pattern)
  const hasParentStep = pathSteps.includes("parent");
  const hasChildStep = pathSteps.includes("child");
  const isCollateral = hasParentStep && hasChildStep;

  if (isCollateral) {
    // Count upward steps to find degree of cousinhood
    const upSteps = pathSteps.filter((s) => s === "parent").length;
    const downSteps = pathSteps.filter((s) => s === "child").length;

    if (upSteps === 1 && downSteps === 1) {
      // Uncle/aunt relationship
      if (genDelta === -1) {
        // A is uncle/aunt of B
        const labelA = genderA === "female" ? "Dì/Cô" : "Chú/Bác";
        return { labelA, labelB: "Cháu", selfA: genderA === "female" ? "Dì" : "Chú", selfB: "Cháu" };
      }
      if (genDelta === 1) {
        // A is nephew/niece of B
        const labelB = genderB === "female" ? "Dì/Cô" : "Chú/Bác";
        return { labelA: "Cháu", labelB, selfA: "Cháu", selfB: genderB === "female" ? "Dì" : "Chú" };
      }
    }

    if (upSteps === 1 && downSteps === 2) {
      const labelA = genderA === "female" ? "Dì/Cô" : "Chú/Bác";
      return { labelA, labelB: "Cháu họ", selfA: genderA === "female" ? "Dì" : "Chú", selfB: "Cháu" };
    }

    if (upSteps === 2 && downSteps === 1) {
      const labelB = genderB === "female" ? "Dì/Cô" : "Chú/Bác";
      return { labelA: "Cháu họ", labelB, selfA: "Cháu", selfB: genderB === "female" ? "Bà" : "Ông" };
    }

    if (upSteps >= 2 && downSteps >= 2) {
      return { labelA: "Anh/Chị họ", labelB: "Em/Anh/Chị họ", selfA: "Anh/Chị", selfB: "Em" };
    }
  }

  // Fallback for far generations or uncharted paths
  if (genDelta > 3) {
    return { labelA: `Tổ tiên (${genDelta} đời)`, labelB: "Hậu duệ", selfA: "Tổ", selfB: "Cháu" };
  }
  if (genDelta < -3) {
    return { labelA: "Hậu duệ", labelB: `Tổ tiên (${Math.abs(genDelta)} đời)`, selfA: "Cháu", selfB: "Tổ" };
  }

  return { labelA: "Họ hàng", labelB: "Họ hàng", selfA: "Tôi", selfB: "Tôi" };
}

// ─── Entry point ───────────────────────────────────────────────────────────────

export function analyzeRelationship(
  nodeAId: string,
  nodeBId: string,
  nodes: FamilyNode[],
  edges: FamilyEdge[]
): RelationshipAnalysisResult | null {
  const graph = buildGraph(nodes, edges);
  const result = bfs(nodeAId, nodeBId, graph);

  if (!result) return null;

  const nodeA = nodes.find((n) => n.id === nodeAId)!;
  const nodeB = nodes.find((n) => n.id === nodeBId)!;
  const nameA = nodeA.data.member.fullName;
  const nameB = nodeB.data.member.fullName;

  const { genDelta, path, steps } = result;
  const kinship = getVietnameseKinship(genDelta, steps, nodeA, nodeB);

  // Build path description
  const pathNodeNames = path.map((id) => nodes.find((n) => n.id === id)?.data.member.fullName ?? id);
  const pathDescription = pathNodeNames.join(" → ");

  const genLabel =
    genDelta === 0
      ? "cùng thế hệ"
      : genDelta > 0
      ? `${nameB} kém ${nameA} ${genDelta} thế hệ`
      : `${nameB} hơn ${nameA} ${Math.abs(genDelta)} thế hệ`;

  const description =
    path.length <= 2
      ? `${nameA} và ${nameB} có quan hệ trực tiếp (${genLabel})`
      : `Đường dẫn: ${pathDescription} (${genLabel})`;

  return {
    pathIds: path,
    generationDelta: genDelta,
    relationshipLabel: `${kinship.labelA} – ${kinship.labelB}`,
    addressFromA: `${nameA} gọi ${nameB} là "${kinship.labelB}", xưng là "${kinship.selfA}"`,
    addressFromB: `${nameB} gọi ${nameA} là "${kinship.labelA}", xưng là "${kinship.selfB}"`,
    description,
  };
}
