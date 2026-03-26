"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Trash2,
  AlignCenter,
  Download,
  Trees,
  Plus,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useFamilyTreeStore, useActiveTree } from "@/core/stores/family-tree-store";
import { Button } from "@/components/ui/button";
import { autoLayout } from "./auto-layout";
import { useI18n } from "@/lib/i18n";

export function FamilyTreeToolbar() {
  const { openAddModal, deleteTree, activeTreeId, trees, setActiveTree, createTree } =
    useFamilyTreeStore();
  const activeTree = useActiveTree();
  const { fitView, setNodes } = useReactFlow();
  const [treeMenuOpen, setTreeMenuOpen] = useState(false);
  const { t } = useI18n();
  const tb = t.familyTree.toolbar;

  function handleFitView() {
    fitView({ padding: 0.15, duration: 400 });
  }

  function handleAutoLayout() {
    if (!activeTree) return;
    const { nodes: laid, edges } = autoLayout(activeTree.nodes, activeTree.edges);
    setNodes(laid);
  }

  function handleExportPng() {
    const svgEl = document.querySelector<SVGElement>(".react-flow__renderer svg");
    if (!svgEl) return;
    const canvas = document.createElement("canvas");
    const bbox = svgEl.getBoundingClientRect();
    canvas.width = bbox.width * 2;
    canvas.height = bbox.height * 2;
    const ctx = canvas.getContext("2d")!;
    const data = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#FDFAF6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.download = `${activeTree?.name ?? "gia-pha"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  }

  function handleNewTree() {
    const name = prompt(tb.newTreePrompt);
    if (name?.trim()) createTree(name.trim());
    setTreeMenuOpen(false);
  }

  function handleDeleteTree() {
    if (activeTreeId && confirm(tb.deleteConfirm.replace("$name", activeTree?.name ?? ""))) {
      deleteTree(activeTreeId);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        background: "var(--color-bg-card)",
        borderBottom: "1px solid var(--color-border-light)",
        flexWrap: "wrap",
      }}
    >
      {/* Tree selector */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setTreeMenuOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 14px",
            borderRadius: "var(--radius-md)",
            border: "2px solid var(--color-border)",
            background: "var(--color-bg-alt)",
            color: "var(--color-text)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            maxWidth: "220px",
          }}
        >
          <Trees size={16} color="var(--color-primary)" />
          <span
            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "140px" }}
          >
            {activeTree?.name ?? tb.selectTreePlaceholder}
          </span>
          <ChevronDown size={14} />
        </button>

        {treeMenuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 200,
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-xl)",
              minWidth: "220px",
              overflow: "hidden",
            }}
          >
            {trees.map((tree) => (
              <button
                key={tree.id}
                onClick={() => {
                  setActiveTree(tree.id);
                  setTreeMenuOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  fontSize: "14px",
                  background:
                    tree.id === activeTreeId ? "var(--color-bg-alt)" : "transparent",
                  color:
                    tree.id === activeTreeId
                      ? "var(--color-primary)"
                      : "var(--color-text)",
                  fontWeight: tree.id === activeTreeId ? 700 : 400,
                  cursor: "pointer",
                  borderBottom: "1px solid var(--color-border-light)",
                  border: "none",
                }}
              >
                {tree.name}
              </button>
            ))}
            <button
              onClick={handleNewTree}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "10px 16px",
                fontSize: "14px",
                color: "var(--color-accent)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              {tb.newTree}
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: "1px", height: "28px", background: "var(--color-border)" }} />

      {/* Add root member */}
      <Button size="sm" variant="primary" onClick={() => openAddModal()}>
        <UserPlus size={15} style={{ marginRight: "6px" }} />
        {tb.addMember}
      </Button>

      {/* Divider */}
      <div style={{ width: "1px", height: "28px", background: "var(--color-border)" }} />

      {/* Auto-layout */}
      <ToolbarIconBtn title={tb.autoLayout} onClick={handleAutoLayout}>
        <LayoutGrid size={16} />
        <span style={{ fontSize: "13px" }}>{tb.autoLayout}</span>
      </ToolbarIconBtn>

      {/* Fit view */}
      <ToolbarIconBtn title={tb.fitView} onClick={handleFitView}>
        <AlignCenter size={16} />
        <span style={{ fontSize: "13px" }}>{tb.fitView}</span>
      </ToolbarIconBtn>

      {/* Export */}
      <ToolbarIconBtn title={tb.exportPng} onClick={handleExportPng}>
        <Download size={16} />
        <span style={{ fontSize: "13px" }}>{tb.exportPng}</span>
      </ToolbarIconBtn>

      {/* Delete tree */}
      <div style={{ marginLeft: "auto" }}>
        <ToolbarIconBtn title={tb.deleteTree} onClick={handleDeleteTree} danger>
          <Trash2 size={15} />
          <span style={{ fontSize: "13px" }}>{tb.deleteTree}</span>
        </ToolbarIconBtn>
      </div>
    </div>
  );
}

function ToolbarIconBtn({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        padding: "7px 12px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${danger ? "var(--color-error)" : "var(--color-border)"}`,
        background: danger ? "var(--color-error-light)" : "var(--color-bg-alt)",
        color: danger ? "var(--color-error)" : "var(--color-text-secondary)",
        cursor: "pointer",
        transition: "all 0.15s",
        fontSize: "13px",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}
