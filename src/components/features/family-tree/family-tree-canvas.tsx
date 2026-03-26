"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type NodeTypes,
  type EdgeTypes,
  BackgroundVariant,
  type OnSelectionChangeParams,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useFamilyTreeStore, useActiveTree } from "@/core/stores/family-tree-store";
import { FamilyMemberNode } from "./family-member-node";
import { FamilyEdge } from "./family-edge";
import { FamilyTreeToolbar } from "./family-tree-toolbar";
import { MemberModal } from "./member-modal";
import { MemberDetailPanel } from "./member-detail-panel";
import { RelationshipPicker } from "./relationship-picker";
import { ConnectionRelationshipPicker } from "./connection-relationship-picker";
import { RelationshipAnalyzerPanel } from "./relationship-analyzer-panel";
import { Trees } from "lucide-react";
import type { Connection } from "@xyflow/react";
import type { FamilyNode } from "@/core/stores/family-tree-store";

// ── Stable references for node/edge type maps ──
const nodeTypes: NodeTypes = {
  familyMember: FamilyMemberNode as any,
};

const edgeTypes: EdgeTypes = {
  familyEdge: FamilyEdge as any,
};

export function FamilyTreeCanvas() {
  const { onNodesChange, onEdgesChange, openConnectionPicker, selectNode } = useFamilyTreeStore();
  const activeTree = useActiveTree();

  // Track the two selected nodes for relationship analysis
  const [selectedPair, setSelectedPair] = useState<[FamilyNode, FamilyNode] | null>(null);

  const nodes = activeTree?.nodes ?? [];
  const edges = activeTree?.edges ?? [];

  const defaultViewport = useMemo(() => ({ x: 0, y: 0, zoom: 0.85 }), []);

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    setSelectedPair(null);
  }, [selectNode]);

  // Intercept drag-connect to show relationship picker instead of auto-creating edge
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      openConnectionPicker({
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
      });
    },
    [openConnectionPicker]
  );

  // Multi-select handler: when exactly 2 nodes selected, open relationship analyzer
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 2) {
        setSelectedPair([selectedNodes[0] as FamilyNode, selectedNodes[1] as FamilyNode]);
      } else {
        setSelectedPair(null);
      }
    },
    []
  );

  if (!activeTree) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          color: "var(--color-text-muted)",
        }}
      >
        <Trees size={48} strokeWidth={1} />
        <p style={{ fontSize: "16px" }}>Chưa có cây gia phả nào. Hãy tạo cây mới từ thanh công cụ.</p>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, position: "relative", background: "var(--color-bg)" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onPaneClick={handlePaneClick}
        onSelectionChange={handleSelectionChange}
        defaultViewport={defaultViewport}
        minZoom={0.1}
        maxZoom={2}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
        style={{ background: "var(--color-bg)" }}
      >
        {/* Background dots pattern */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border)"
        />

        {/* Zoom / fit controls */}
        <Controls
          showInteractive={false}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            bottom: 24,
            left: 16,
          }}
        />

        {/* Mini-map */}
        <MiniMap
          nodeColor={(node) => {
            const gender = (node.data as any)?.member?.gender;
            if (gender === "male") return "#3B82F6";
            if (gender === "female") return "#EC4899";
            return "#8B5CF6";
          }}
          maskColor="rgba(253, 250, 246, 0.6)"
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            bottom: 24,
            right: 16,
          }}
        />

        {/* Empty state overlay when tree has no members */}
        {nodes.length === 0 && (
          <Panel position="top-center">
            <div
              style={{
                marginTop: "80px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                color: "var(--color-text-muted)",
              }}
            >
              <Trees size={56} strokeWidth={1} color="var(--color-primary)" style={{ opacity: 0.4 }} />
              <p style={{ fontSize: "15px", textAlign: "center" }}>
                Cây gia phả đang trống.
                <br />
                Nhấn <strong style={{ color: "var(--color-primary)" }}>Thêm thành viên</strong> để bắt đầu.
              </p>
            </div>
          </Panel>
        )}

        {/* Detail panel — floats inside canvas */}
        <MemberDetailPanel />

        {/* Relationship analyzer — shown when exactly 2 nodes are selected */}
        {selectedPair && (
          <Panel position="top-center" style={{ margin: 0, padding: 0 }}>
            <RelationshipAnalyzerPanel
              nodeA={selectedPair[0]}
              nodeB={selectedPair[1]}
              nodes={nodes}
              edges={edges}
              onClose={() => setSelectedPair(null)}
            />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

/**
 * Top-level wrapper that includes toolbar + canvas + modal.
 * Needs ReactFlowProvider (provided by parent page using `dynamic`).
 */
export function FamilyTreeViewer() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        border: "1px solid var(--color-border-light)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-lg)",
        background: "var(--color-bg-card)",
      }}
    >
      <FamilyTreeToolbar />
      <FamilyTreeCanvas />
      <MemberModal />
      <RelationshipPicker />
      <ConnectionRelationshipPicker />
    </div>
  );
}
