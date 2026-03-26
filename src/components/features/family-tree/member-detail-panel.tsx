"use client";

import React from "react";
import { X, Edit2, Trash2, GitBranch, UserRound, CalendarDays, MapPin, Briefcase } from "lucide-react";
import { useFamilyTreeStore, useActiveTree } from "@/core/stores/family-tree-store";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function MemberDetailPanel() {
  const { selectedNodeId, openEditModal, openRelationPicker, deleteMember, selectNode } =
    useFamilyTreeStore();
  const activeTree = useActiveTree();
  const { t } = useI18n();
  const dp = t.familyTree.detailPanel;

  if (!selectedNodeId || !activeTree) return null;

  const node = activeTree.nodes.find((n) => n.id === selectedNodeId);
  if (!node) return null;

  const { member } = node.data;

  const spouseName = member.spouseId
    ? activeTree.nodes.find((n) => n.id === member.spouseId)?.data.member.fullName
    : null;

  const children = activeTree.nodes.filter(
    (n) => n.data.member.parentId === member.id
  );

  const parentName = member.parentId
    ? activeTree.nodes.find((n) => n.id === member.parentId)?.data.member.fullName
    : null;

  function handleDelete() {
    if (confirm(`${dp.delete}: "${member.fullName}"?`)) {
      deleteMember(member.id);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 16,
        top: 16,
        zIndex: 10,
        width: "280px",
        background: "var(--color-bg-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)",
        border: "1px solid var(--color-border-light)",
        overflow: "hidden",
        animation: "slideInRight 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "white",
          position: "relative",
        }}
      >
        <button
          onClick={() => selectNode(null)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "var(--radius-sm)",
            color: "white",
            cursor: "pointer",
            width: "26px",
            height: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginBottom: "10px",
            border: "2px solid rgba(255,255,255,0.5)",
          }}
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <UserRound size={24} />
          )}
        </div>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "18px",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {member.fullName}
        </h3>
        <p style={{ fontSize: "13px", opacity: 0.85, marginTop: "4px" }}>
          {member.gender === "male" ? t.common.male : member.gender === "female" ? t.common.female : t.common.other} · {t.familyTree.memberNode.generation}{" "}
          {(member.generation ?? 0) + 1}
        </p>
      </div>

      {/* Details */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {(member.dateOfBirth || member.dateOfDeath) && (
          <DetailRow icon={<CalendarDays size={14} />} label={dp.birth}>
            {member.dateOfBirth ?? "?"} {member.dateOfDeath ? `— ${member.dateOfDeath}` : ""}
          </DetailRow>
        )}
        {member.placeOfBirth && (
          <DetailRow icon={<MapPin size={14} />} label={dp.place}>
            {member.placeOfBirth}
          </DetailRow>
        )}
        {member.occupation && (
          <DetailRow icon={<Briefcase size={14} />} label={dp.occupation}>
            {member.occupation}
          </DetailRow>
        )}
        {spouseName && (
          <DetailRow icon={<span style={{ fontSize: "14px" }}>💍</span>} label={dp.spouse}>
            {spouseName}
          </DetailRow>
        )}
        {parentName && (
          <DetailRow icon={<span style={{ fontSize: "14px" }}>👤</span>} label={dp.parent}>
            {parentName}
          </DetailRow>
        )}
        {children.length > 0 && (
          <DetailRow icon={<span style={{ fontSize: "14px" }}>👶</span>} label={`${children.length} ${dp.children}`}>
            {children.map((c) => c.data.member.fullName).join(", ")}
          </DetailRow>
        )}
        {member.bio && (
          <div
            style={{
              padding: "10px",
              background: "var(--color-bg-alt)",
              borderRadius: "var(--radius-md)",
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              lineHeight: 1.5,
            }}
          >
            {member.bio}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px 16px",
          borderTop: "1px solid var(--color-border-light)",
        }}
      >
        <Button size="sm" variant="outline" onClick={() => openRelationPicker(member.id)} style={{ flex: 1 }}>
          <GitBranch size={13} style={{ marginRight: "4px" }} />
          {dp.addRelation}
        </Button>
        <Button size="sm" onClick={() => openEditModal(member)} style={{ flex: 1 }}>
          <Edit2 size={13} style={{ marginRight: "4px" }} />
          {dp.edit}
        </Button>
        <button
          onClick={handleDelete}
          title={dp.delete}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-error)",
            background: "var(--color-error-light)",
            color: "var(--color-error)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
      <span
        style={{
          color: "var(--color-primary)",
          marginTop: "1px",
          flexShrink: 0,
          width: "18px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
      <div>
        <div style={{ fontSize: "11px", color: "var(--color-text-muted)", fontWeight: 600 }}>
          {label}
        </div>
        <div style={{ fontSize: "13px", color: "var(--color-text)", marginTop: "1px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
