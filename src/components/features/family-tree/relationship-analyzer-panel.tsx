"use client";

import React from "react";
import { X, GitMerge, Users, ChevronRight } from "lucide-react";
import { analyzeRelationship } from "./relationship-finder";
import type { FamilyNode, FamilyEdge } from "@/core/stores/family-tree-store";
import { useI18n } from "@/lib/i18n";

interface RelationshipAnalyzerPanelProps {
  nodeA: FamilyNode;
  nodeB: FamilyNode;
  nodes: FamilyNode[];
  edges: FamilyEdge[];
  onClose: () => void;
}

export function RelationshipAnalyzerPanel({
  nodeA,
  nodeB,
  nodes,
  edges,
  onClose,
}: RelationshipAnalyzerPanelProps) {
  const result = analyzeRelationship(nodeA.id, nodeB.id, nodes, edges);
  const { t } = useI18n();
  const az = t.familyTree.analyzer;

  const nameA = nodeA.data.member.fullName;
  const nameB = nodeB.data.member.fullName;

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 500,
        background: "var(--color-bg-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        border: "1px solid var(--color-border-light)",
        width: "min(460px, 90vw)",
        animation: "scaleIn 0.18s ease",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--color-border-light)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "var(--radius-md)",
            background: "var(--color-primary-light, #FFF7ED)",
            color: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <GitMerge size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "14px",
              color: "var(--color-text)",
            }}
          >
            {az.title}
          </div>
          {/* Two-node preview */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "4px",
            }}
          >
            <NodeChip name={nameA} gender={nodeA.data.member.gender} />
            <ChevronRight size={12} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            <NodeChip name={nameB} gender={nodeB.data.member.gender} />
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-alt)",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {result === null ? (
          /* No path found */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              padding: "16px 0",
              color: "var(--color-text-muted)",
            }}
          >
            <Users size={36} strokeWidth={1} style={{ opacity: 0.4 }} />
            <p style={{ fontSize: "13px", textAlign: "center" }}>
              {az.noPath}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Relation label badge */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  padding: "6px 20px",
                  borderRadius: "var(--radius-full, 9999px)",
                  background: "var(--color-primary-light, #FFF7ED)",
                  border: "1.5px solid var(--color-primary)",
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  letterSpacing: "0.5px",
                }}
              >
                {result.relationshipLabel}
              </div>
            </div>

            {/* Address forms */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <AddressRow text={result.addressFromA} />
              <AddressRow text={result.addressFromB} />
            </div>

            {/* Generation info */}
            {result.generationDelta !== 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-alt)",
                  border: "1px solid var(--color-border-light)",
                }}
              >
                <span style={{ fontSize: "18px" }}>🌳</span>
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
                🌳 {az.generationApart.replace("$n", String(Math.abs(result.generationDelta)))}
                </span>
              </div>
            )}

            {/* Path description */}
            <div
              style={{
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-alt)",
                border: "1px solid var(--color-border-light)",
                fontSize: "12px",
                color: "var(--color-text-muted)",
                lineHeight: 1.6,
              }}
            >
              {result.description}
            </div>

            {/* Path breadcrumbs (if more than 2 nodes) */}
            {result.pathIds.length > 2 && (
              <PathBreadcrumb pathIds={result.pathIds} nodes={nodes} pathLabel={az.pathLabel} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function NodeChip({ name, gender }: { name: string; gender: "male" | "female" | "other" }) {
  const color =
    gender === "male" ? "#3B82F6" : gender === "female" ? "#EC4899" : "#8B5CF6";
  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: 600,
        color,
        background: `${color}14`,
        border: `1px solid ${color}44`,
        borderRadius: "var(--radius-sm)",
        padding: "3px 8px",
        maxWidth: "140px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
      title={name}
    >
      {name}
    </span>
  );
}

function AddressRow({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        background: "var(--color-bg-alt)",
        border: "1px solid var(--color-border-light)",
        fontSize: "13px",
        color: "var(--color-text-secondary)",
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}

function PathBreadcrumb({ pathIds, nodes, pathLabel }: { pathIds: string[]; nodes: FamilyNode[]; pathLabel: string }) {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        background: "var(--color-bg-alt)",
        border: "1px solid var(--color-border-light)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px",
      }}
    >
      <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginRight: "4px", fontWeight: 600 }}>
        {pathLabel}
      </span>
      {pathIds.map((id, idx) => {
        const node = nodes.find((n) => n.id === id);
        const name = node?.data.member.fullName ?? id;
        const gender = node?.data.member.gender ?? "other";
        const color =
          gender === "male" ? "#3B82F6" : gender === "female" ? "#EC4899" : "#8B5CF6";
        return (
          <React.Fragment key={id}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color,
                maxWidth: "100px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={name}
            >
              {name}
            </span>
            {idx < pathIds.length - 1 && (
              <ChevronRight size={10} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
