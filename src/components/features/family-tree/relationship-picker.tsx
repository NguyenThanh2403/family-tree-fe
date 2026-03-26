"use client";

import React from "react";
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import {
  useFamilyTreeStore,
  useActiveTree,
  RELATIONSHIP_META,
  type RelationshipType,
} from "@/core/stores/family-tree-store";
import { useI18n } from "@/lib/i18n";

const RELATIONSHIP_ORDER: RelationshipType[] = ["cha", "me", "con", "anh", "chi", "em", "vo_chong"];

const POSITION_ICONS: Record<string, React.ReactNode> = {
  "↑": <ArrowUp size={11} />,
  "↓": <ArrowDown size={11} />,
  "←": <ArrowLeft size={11} />,
  "→": <ArrowRight size={11} />,
};

export function RelationshipPicker() {
  const { isRelationPickerOpen, relationPickerSourceId, closeRelationPicker, selectRelationType } =
    useFamilyTreeStore();
  const activeTree = useActiveTree();
  const { t } = useI18n();
  const rp = t.familyTree.relPicker;

  if (!isRelationPickerOpen) return null;

  const sourceName = relationPickerSourceId
    ? activeTree?.nodes.find((n) => n.id === relationPickerSourceId)?.data.member.fullName ?? "?"
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeRelationPicker}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(44, 24, 16, 0.45)",
          zIndex: 1000,
          backdropFilter: "blur(3px)",
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Panel */}
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
          width: "min(480px, 92vw)",
          animation: "scaleIn 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            color: "white",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "18px",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {rp.title}
            </h2>
            {sourceName && (
              <p style={{ fontSize: "13px", opacity: 0.9, marginTop: "4px" }}>
                {rp.subtitle}{" "}
                <strong style={{ opacity: 1 }}>{sourceName}</strong>
              </p>
            )}
          </div>
          <button
            onClick={closeRelationPicker}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(255,255,255,0.2)",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Relationship cards grid */}
        <div
          style={{
            padding: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "10px",
          }}
        >
          {RELATIONSHIP_ORDER.map((relType) => {
            const meta = RELATIONSHIP_META[relType];
            const relT = t.familyTree.relationships[relType];
            const isWideCard = relType === "vo_chong";
            const positionHint = relT.positionHint;

            return (
              <button
                key={relType}
                onClick={() => selectRelationType(relType)}
                style={{
                  gridColumn: isWideCard ? "1 / -1" : undefined,
                  display: "flex",
                  flexDirection: isWideCard ? "row" : "column",
                  alignItems: isWideCard ? "center" : "flex-start",
                  gap: isWideCard ? "12px" : "8px",
                  padding: "12px",
                  borderRadius: "var(--radius-lg)",
                  border: `2px solid ${meta.borderColor}`,
                  background: meta.bgColor,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-2px)";
                  el.style.boxShadow = `0 6px 16px ${meta.color}22`;
                  el.style.borderColor = meta.color;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "";
                  el.style.boxShadow = "";
                  el.style.borderColor = meta.borderColor;
                }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: isWideCard ? "36px" : "32px",
                    height: isWideCard ? "36px" : "32px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${meta.color}, ${meta.color}99)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: isWideCard ? "18px" : "16px" }}>
                    {relType === "cha" ? "👨" : relType === "me" ? "👩" : relType === "con" ? "🧒"
                      : relType === "anh" ? "👦" : relType === "chi" ? "👧" : relType === "em" ? "🧒"
                      : "💑"}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: isWideCard ? "15px" : "14px",
                      color: meta.color,
                      lineHeight: 1.2,
                    }}
                  >
                    {relT.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      marginTop: "2px",
                      lineHeight: 1.3,
                    }}
                  >
                    {relT.description}
                  </div>
                </div>

                {/* Position hint badge */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "var(--radius-full)",
                    background: `${meta.color}18`,
                    color: meta.color,
                    flexShrink: 0,
                    marginTop: isWideCard ? 0 : "auto",
                  }}
                >
                  {POSITION_ICONS[positionHint.charAt(0)]}
                  {positionHint.split(" ").slice(1).join(" ")}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div
          style={{
            padding: "10px 16px 14px",
            textAlign: "center",
            fontSize: "12px",
            color: "var(--color-text-muted)",
          }}
        >
          {rp.footer}
        </div>
      </div>
    </>
  );
}
