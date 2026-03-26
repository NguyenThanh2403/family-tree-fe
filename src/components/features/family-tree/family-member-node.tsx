"use client";

import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { UserRound, Edit2, Trash2, GitBranch } from "lucide-react";
import type { FamilyNodeData } from "@/core/stores/family-tree-store";
import { useFamilyTreeStore } from "@/core/stores/family-tree-store";
import { useI18n } from "@/lib/i18n";

// ── Gender palette ──
const genderColors = {
  male: { bg: "#EFF6FF", border: "#3B82F6", badge: "#2563EB", text: "#1E40AF" },
  female: { bg: "#FFF0F6", border: "#EC4899", badge: "#DB2777", text: "#9D174D" },
  other: { bg: "#F5F3FF", border: "#8B5CF6", badge: "#7C3AED", text: "#5B21B6" },
};

export const FamilyMemberNode = memo(function FamilyMemberNode({
  data,
  selected,
}: NodeProps & { data: FamilyNodeData }) {
  const { member } = data;
  const { openEditModal, openRelationPicker, deleteMember, selectNode } = useFamilyTreeStore();
  const { t } = useI18n();
  const mn = t.familyTree.memberNode;
  const colors = genderColors[member.gender] ?? genderColors.other;

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    openEditModal(member);
  }

  function handleAddRelation(e: React.MouseEvent) {
    e.stopPropagation();
    openRelationPicker(member.id);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm(mn.deleteConfirm.replace("$name", member.fullName))) {
      deleteMember(member.id);
      selectNode(null);
    }
  }

  const isDeceased = !!member.dateOfDeath;

  return (
    <div
      onClick={() => selectNode(member.id)}
      style={{
        background: colors.bg,
        border: `2px solid ${selected ? colors.badge : colors.border}`,
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
        minWidth: "180px",
        maxWidth: "230px",
        boxShadow: selected
          ? `0 0 0 3px ${colors.badge}33, var(--shadow-lg)`
          : "var(--shadow-md)",
        transition: "all 0.2s ease",
        cursor: "pointer",
        opacity: isDeceased ? 0.8 : 1,
        position: "relative",
      }}
    >
      {/* Handle — top (receives parent edge) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: colors.badge,
          border: "2px solid white",
        }}
      />

      {/* Avatar + name row */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.border}, ${colors.badge})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <UserRound size={20} color="white" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "14px",
              color: colors.text,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {member.fullName}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--color-text-muted)",
              marginTop: "2px",
            }}
          >
            {member.gender === "male" ? t.common.male : member.gender === "female" ? t.common.female : t.common.other}
            {member.dateOfBirth ? ` · ${member.dateOfBirth.slice(0, 4)}` : ""}
            {isDeceased && ` – ${member.dateOfDeath!.slice(0, 4)}`}
          </div>
        </div>
      </div>

      {/* Generation badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "var(--radius-full)",
            background: colors.badge,
            color: "white",
          }}
        >
          {mn.generation} {(member.generation ?? 0) + 1}
        </span>
        {isDeceased && (
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-text-muted)",
              color: "white",
            }}
          >
            {mn.deceased}
          </span>
        )}
        {member.occupation && (
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-bg-alt)",
              color: "var(--color-text-secondary)",
              maxWidth: "100px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={member.occupation}
          >
            {member.occupation}
          </span>
        )}
      </div>

      {/* Action buttons — show on hover / when selected */}
      {selected && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginTop: "10px",
            borderTop: `1px solid ${colors.border}`,
            paddingTop: "8px",
            justifyContent: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <NodeActionBtn title={mn.addRelation} color="#16A34A" onClick={handleAddRelation}>
            <GitBranch size={13} />
          </NodeActionBtn>
          <NodeActionBtn title={mn.editMember} color="#2563EB" onClick={handleEdit}>
            <Edit2 size={13} />
          </NodeActionBtn>
          <NodeActionBtn title={mn.deleteMember} color="#DC2626" onClick={handleDelete}>
            <Trash2 size={13} />
          </NodeActionBtn>
        </div>
      )}

      {/* Handle — bottom (sends child edges) */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: colors.badge,
          border: "2px solid white",
        }}
      />

      {/* Spouse handle — right */}
      <Handle
        type="source"
        id="spouse-source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          background: "#EC4899",
          border: "2px solid white",
          top: "50%",
        }}
      />
      <Handle
        type="target"
        id="spouse-target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          background: "#EC4899",
          border: "2px solid white",
          top: "50%",
        }}
      />
    </div>
  );
});

// ── Small icon button ──
function NodeActionBtn({
  children,
  title,
  color,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  color: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "26px",
        height: "26px",
        borderRadius: "var(--radius-sm)",
        background: `${color}18`,
        border: `1px solid ${color}44`,
        color,
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = `${color}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = `${color}18`;
      }}
    >
      {children}
    </button>
  );
}
