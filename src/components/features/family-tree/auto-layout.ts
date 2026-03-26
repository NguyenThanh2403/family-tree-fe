import dagre from "@dagrejs/dagre";
import type { FamilyNode, FamilyEdge } from "@/core/stores/family-tree-store";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 120;

/**
 * Runs a Dagre top-down (TB) layout on nodes/edges and returns new positions.
 * Does NOT mutate the original arrays.
 */
export function autoLayout(
  nodes: FamilyNode[],
  edges: FamilyEdge[]
): { nodes: FamilyNode[]; edges: FamilyEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 40, edgesep: 20 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    // Skip spouse edges from layout calculation so they don't distort tree structure
    if (edge.data?.relationLabel !== "vợ/chồng") {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  const laidNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    if (!pos) return node;
    return {
      ...node,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: laidNodes, edges };
}
