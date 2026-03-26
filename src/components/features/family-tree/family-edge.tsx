"use client";

import React, { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  getStraightPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";

type FamilyEdgeType = Edge<{ relationLabel?: string }>;

export const FamilyEdge = memo(function FamilyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
  markerEnd,
}: EdgeProps<FamilyEdgeType>) {
  const isSpouse = (data as { relationLabel?: string } | undefined)?.relationLabel === "vợ/chồng";
  const relationLabel = (data as { relationLabel?: string } | undefined)?.relationLabel;

  const [edgePath, labelX, labelY] = isSpouse
    ? getStraightPath({ sourceX, sourceY, targetX, targetY })
    : getSmoothStepPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        borderRadius: 10,
      });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: isSpouse ? "#EC4899" : "var(--color-primary)",
          strokeWidth: isSpouse ? 1.5 : 2,
          strokeDasharray: isSpouse ? "6,4" : undefined,
          ...(style as React.CSSProperties | undefined),
        }}
      />
      {relationLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "var(--radius-full)",
              background: isSpouse ? "#FDF2F8" : "var(--color-bg-alt)",
              color: isSpouse ? "#DB2777" : "var(--color-primary)",
              border: `1px solid ${isSpouse ? "#FBCFE8" : "var(--color-border)"}`,
              whiteSpace: "nowrap",
            }}
            className="nodrag nopan"
          >
            {relationLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
