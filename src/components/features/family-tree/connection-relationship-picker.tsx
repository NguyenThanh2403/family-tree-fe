"use client";

import React, { useState } from "react";
import { X, Users, Heart, ChevronRight, AlertCircle } from "lucide-react";
import {
  useFamilyTreeStore,
  useActiveTree,
  CONNECTION_RELATION_META,
  validateConnectionRelation,
  type ConnectionRelationType,
} from "@/core/stores/family-tree-store";
import { useI18n } from "@/lib/i18n";

const CONNECTION_TYPES: ConnectionRelationType[] = ["parent-child", "child-parent", "sibling", "spouse"];

const TYPE_ICONS: Record<ConnectionRelationType, React.ReactNode> = {
  "parent-child": <span style={{ fontSize: "16px" }}>👨‍👧</span>,
  "child-parent": <span style={{ fontSize: "16px" }}>👧‍👨</span>,
  sibling: <Users size={16} />,
  spouse: <Heart size={16} />,
};

export function ConnectionRelationshipPicker() {
  const {
    isConnectionPickerOpen,
    pendingConnection,
    closeConnectionPicker,
    confirmConnectionRelation,
  } = useFamilyTreeStore();
  const activeTree = useActiveTree();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t } = useI18n();
  const cp = t.familyTree.connPicker;
  const cr = t.familyTree.connRelations;

  if (!isConnectionPickerOpen || !pendingConnection) return null;

  const sourceMember = activeTree?.nodes.find((n) => n.id === pendingConnection.source)?.data.member;
  const targetMember = activeTree?.nodes.find((n) => n.id === pendingConnection.target)?.data.member;

  const sourceLabel = sourceMember?.fullName ?? "Người A";
  const targetLabel = targetMember?.fullName ?? "Người B";

  // Pre-compute validation for all options
  const validations = Object.fromEntries(
    CONNECTION_TYPES.map((relType) => [
      relType,
      activeTree
        ? validateConnectionRelation(
            relType,
            pendingConnection.source,
            pendingConnection.target,
            activeTree.nodes,
            activeTree.edges
          )
        : { valid: false, reason: cp.allInvalidReason },
    ])
  ) as Record<ConnectionRelationType, { valid: boolean; reason?: string }>;

  // Check if already connected (applies to all options equally)
  const allInvalid = CONNECTION_TYPES.every((t) => !validations[t].valid);

  function handleSelectType(relType: ConnectionRelationType) {
    const v = validations[relType];
    if (!v.valid) {
      setErrorMsg(v.reason ?? "Không thể tạo quan hệ này");
      return;
    }
    setErrorMsg(null);
    confirmConnectionRelation(relType);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeConnectionPicker}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(44, 24, 16, 0.4)",
          zIndex: 1000,
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.12s ease",
        }}
      />

      {/* Compact picker panel */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          background: "var(--color-bg-card)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-xl)",
          width: "min(420px, 92vw)",
          animation: "scaleIn 0.18s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid var(--color-border-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--color-text)",
                marginBottom: "6px",
              }}
            >
              Xác nhận mối quan hệ
            </h3>
            {/* Connection preview */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 10px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-alt)",
                border: "1px solid var(--color-border-light)",
              }}
            >
              <ConectionNodeChip name={sourceLabel} />
              <ChevronRight size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
              <ConectionNodeChip name={targetLabel} />
            </div>
          </div>
          <button
            onClick={closeConnectionPicker}
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

        {/* Question / warning */}
        {allInvalid ? (
          <div
            style={{
              margin: "12px 18px 6px",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <AlertCircle size={15} style={{ color: "#DC2626", flexShrink: 0, marginTop: "1px" }} />
            <span style={{ fontSize: "13px", color: "#B91C1C", fontWeight: 500 }}>
              {validations["parent-child"].reason ?? cp.allInvalidReason}
            </span>
          </div>
        ) : (
          <div
            style={{
              padding: "12px 18px 6px",
              fontSize: "13px",
              color: "var(--color-text-muted)",
              fontWeight: 600,
            }}
          >
            {cp.question}
          </div>
        )}

        {/* Error toast for clicked disabled option */}
        {errorMsg && (
          <div
            style={{
              margin: "0 18px 6px",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={14} style={{ color: "#EA580C", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#C2410C" }}>{errorMsg}</span>
          </div>
        )}

        {/* Relation options */}
        <div
          style={{
            padding: "6px 12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          {CONNECTION_TYPES.map((relType) => {
            const meta = CONNECTION_RELATION_META[relType];
            const validation = validations[relType];
            const isDisabled = !validation.valid;

            // Substitute actual member names into description
            const desc = cr[relType].descTemplate
              .replace("$source", sourceLabel)
              .replace("$target", targetLabel);

            return (
              <button
                key={relType}
                onClick={() => handleSelectType(relType)}
                title={isDisabled ? (validation.reason ?? "") : desc}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${isDisabled ? "#E5E7EB" : `${meta.color}33`}`,
                  background: isDisabled ? "#F9FAFB" : `${meta.color}08`,
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  opacity: isDisabled ? 0.6 : 1,
                  transition: "all 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (isDisabled) return;
                  const el = e.currentTarget;
                  el.style.background = `${meta.color}14`;
                  el.style.borderColor = `${meta.color}77`;
                  el.style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  if (isDisabled) return;
                  const el = e.currentTarget;
                  el.style.background = `${meta.color}08`;
                  el.style.borderColor = `${meta.color}33`;
                  el.style.transform = "";
                }}
              >
                <div
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "var(--radius-md)",
                    background: isDisabled ? "#F3F4F6" : `${meta.color}18`,
                    color: isDisabled ? "#9CA3AF" : meta.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {TYPE_ICONS[relType]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: isDisabled ? "#9CA3AF" : meta.color,
                      marginBottom: "2px",
                    }}
                  >
                    {cr[relType].label}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: isDisabled ? "#D1D5DB" : "var(--color-text-muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={isDisabled ? (validation.reason ?? desc) : desc}
                  >
                    {isDisabled ? (validation.reason ?? desc) : desc}
                  </div>
                </div>
                {isDisabled ? (
                  <AlertCircle size={14} style={{ color: "#D1D5DB", flexShrink: 0 }} />
                ) : (
                  <ChevronRight size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Cancel */}
        <div
          style={{
            padding: "0 12px 14px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={closeConnectionPicker}
            style={{
              padding: "6px 16px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-alt)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {cp.cancel}
          </button>
        </div>
      </div>
    </>
  );
}

function ConectionNodeChip({ name }: { name: string }) {
  return (
    <span
      style={{
        fontSize: "12px",
        fontWeight: 600,
        color: "var(--color-primary)",
        background: "var(--color-bg-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-sm)",
        padding: "3px 8px",
        maxWidth: "130px",
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
