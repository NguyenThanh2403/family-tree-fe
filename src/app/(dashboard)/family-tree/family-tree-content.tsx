"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ReactFlowProvider } from "@xyflow/react";
import { Trees } from "lucide-react";

// Dynamically import the heavy canvas – avoids SSR issues with React Flow
const FamilyTreeViewer = dynamic(
  () =>
    import("@/components/features/family-tree/family-tree-canvas").then(
      (m) => m.FamilyTreeViewer
    ),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-muted)",
          gap: "12px",
          fontSize: "15px",
        }}
      >
        <Trees size={22} style={{ animation: "spin 1.2s linear infinite" }} />
        Đang tải cây gia phả…
      </div>
    ),
  }
);

export function FamilyTreeContent() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // Fills remaining viewport height: header(68) + page top/bottom padding(64) + footer approx(60)
        height: "calc(100vh - 68px - 64px - 60px)",
        minHeight: "500px",
        gap: "0",
      }}
    >
      {/* Page heading */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trees size={22} color="white" />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--color-text)",
                lineHeight: 1.2,
              }}
            >
              Cây Gia Phả
            </h1>
            <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Quản lý, thêm, sửa, xoá thành viên và khám phá dòng họ của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <ReactFlowProvider>
        <FamilyTreeViewer />
      </ReactFlowProvider>
    </div>
  );
}
