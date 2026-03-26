"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, UserRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFamilyTreeStore, useActiveTree, RELATIONSHIP_META } from "@/core/stores/family-tree-store";
import type { FamilyMember } from "@/types";
import { useI18n } from "@/lib/i18n";

// ── Validation schema is built inside component for i18n error messages ──

type MemberFormValues = {
  fullName: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string;
  dateOfDeath?: string;
  placeOfBirth?: string;
  occupation?: string;
  bio?: string;
  avatarUrl?: string;
  spouseId?: string;
};

export function MemberModal() {
  const {
    isModalOpen, modalMode, editingMember,
    addRelationType, relationPickerSourceId,
    closeModal, addMember, updateMember,
  } = useFamilyTreeStore();
  const activeTree = useActiveTree();
  const { t } = useI18n();
  const mm = t.familyTree.memberModal;

  const relMeta = addRelationType ? RELATIONSHIP_META[addRelationType] : null;

  const memberSchema = React.useMemo(() => z.object({
    fullName: z.string().min(2, mm.nameError),
    gender: z.enum(["male", "female", "other"]),
    dateOfBirth: z.string().optional(),
    dateOfDeath: z.string().optional(),
    placeOfBirth: z.string().optional(),
    occupation: z.string().optional(),
    bio: z.string().optional(),
    avatarUrl: z.string().url(mm.avatarUrlError).optional().or(z.literal("")),
    spouseId: z.string().optional(),
  }), [mm.nameError, mm.avatarUrlError]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: { gender: relMeta?.defaultGender ?? "male" },
  });

  // Pre-fill form when editing, or pre-fill gender from relationship type when adding
  useEffect(() => {
    if (modalMode === "edit" && editingMember) {
      reset({
        fullName: editingMember.fullName,
        gender: editingMember.gender,
        dateOfBirth: editingMember.dateOfBirth ?? "",
        dateOfDeath: editingMember.dateOfDeath ?? "",
        placeOfBirth: editingMember.placeOfBirth ?? "",
        occupation: editingMember.occupation ?? "",
        bio: editingMember.bio ?? "",
        avatarUrl: editingMember.avatarUrl ?? "",
        spouseId: editingMember.spouseId ?? "",
      });
    } else {
      reset({ gender: relMeta?.defaultGender ?? "other" });
    }
  }, [modalMode, editingMember, addRelationType, reset]);

  if (!isModalOpen) return null;

  function onSubmit(values: MemberFormValues) {
    const payload: Omit<FamilyMember, "id" | "generation"> = {
      fullName: values.fullName,
      gender: values.gender,
      dateOfBirth: values.dateOfBirth || undefined,
      dateOfDeath: values.dateOfDeath || undefined,
      placeOfBirth: values.placeOfBirth || undefined,
      occupation: values.occupation || undefined,
      bio: values.bio || undefined,
      avatarUrl: values.avatarUrl || undefined,
      // spouseId only used in edit mode; in add mode it's managed by store
      spouseId: modalMode === "edit" ? (values.spouseId || undefined) : undefined,
    };

    if (modalMode === "edit" && editingMember) {
      updateMember(editingMember.id, payload);
    } else {
      addMember(payload);
    }
  }

  // Members available for spouse selection (only in edit mode)
  const otherMembers =
    modalMode === "edit"
      ? activeTree?.nodes
          .map((n) => n.data.member)
          .filter((m) => (editingMember ? m.id !== editingMember.id : true)) ?? []
      : [];

  // Source node name for relationship context
  const sourceName = relationPickerSourceId
    ? activeTree?.nodes.find((n) => n.id === relationPickerSourceId)?.data.member.fullName
    : null;

  const modalTitle = modalMode === "edit"
    ? mm.editTitle
    : relMeta
    ? `${mm.addTitle} ${t.familyTree.relationships[addRelationType!].label}`
    : mm.addTitle;

  const modalSubtitle = sourceName && relMeta
    ? `${relMeta.label} của: ${sourceName}`
    : null;

  const tintColor = relMeta?.color ?? "var(--color-primary)";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeModal}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(44, 24, 16, 0.4)",
          zIndex: 1000,
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Modal panel */}
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
          width: "min(520px, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "scaleIn 0.2s ease",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--color-border-light)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "var(--radius-md)",
                background: relMeta
                  ? `linear-gradient(135deg, ${relMeta.color}, ${relMeta.color}99)`
                  : "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserRound size={18} color="white" />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--color-text)",
                }}
              >
                {modalTitle}
              </h2>
              {modalSubtitle && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    background: `${tintColor}18`,
                    color: tintColor,
                    border: `1px solid ${tintColor}33`,
                  }}
                >
                  {modalSubtitle}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={closeModal}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-alt)",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Full name */}
            <Input
              label={mm.nameLabel + " *"}
              placeholder={mm.namePlaceholder}
              error={errors.fullName?.message}
              {...register("fullName")}
            />

            {/* Gender */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                {mm.genderLabel} *
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                {(["male", "female", "other"] as const).map((g) => (
                  <label
                    key={g}
                    style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                  >
                    <input type="radio" value={g} {...register("gender")} />
                    <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                      {g === "male" ? t.common.male : g === "female" ? t.common.female : t.common.other}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label={mm.dobLabel}
                type="date"
                error={errors.dateOfBirth?.message}
                {...register("dateOfBirth")}
              />
              <Input
                label={mm.dodLabel}
                type="date"
                error={errors.dateOfDeath?.message}
                {...register("dateOfDeath")}
              />
            </div>

            {/* Place */}
            <Input
              label={mm.pobLabel}
              placeholder={mm.pobPlaceholder}
              error={errors.placeOfBirth?.message}
              {...register("placeOfBirth")}
            />

            {/* Occupation */}
            <Input
              label={mm.occupationLabel}
              placeholder={mm.occupationPlaceholder}
              error={errors.occupation?.message}
              {...register("occupation")}
            />

            {/* Spouse — only visible in edit mode */}
            {modalMode === "edit" && otherMembers.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {mm.spouseLabel}
                </label>
                <select
                  {...register("spouseId")}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "14px",
                    fontFamily: "var(--font-sans)",
                    background: "var(--color-bg)",
                    color: "var(--color-text)",
                    border: "2px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    outline: "none",
                  }}
                >
                  <option value="">{mm.spousePlaceholder}</option>
                  {otherMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Avatar URL */}
            <Input
              label={mm.avatarUrlLabel}
              placeholder="https://..."
              error={errors.avatarUrl?.message}
              {...register("avatarUrl")}
            />

            {/* Bio */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                }}
              >
                {mm.bioLabel}
              </label>
              <textarea
                {...register("bio")}
                placeholder={mm.bioPlaceholder}
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  background: "var(--color-bg)",
                  color: "var(--color-text)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  outline: "none",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end",
              marginTop: "24px",
              borderTop: "1px solid var(--color-border-light)",
              paddingTop: "16px",
            }}
          >
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>
              {t.common.cancel}
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              <Save size={15} style={{ marginRight: "6px" }} />
              {modalMode === "edit" ? mm.submitEdit : mm.submitAdd}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
