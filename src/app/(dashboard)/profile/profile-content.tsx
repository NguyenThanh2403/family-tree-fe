"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, type ProfileFormData } from "@/lib/schemas";
import { useAuthStore } from "@/core/stores/auth-store";
import { useI18n } from "@/lib/i18n";
import { Button, Input } from "@/components/ui";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Save,
  Shield,
  Bell,
  Palette,
} from "lucide-react";

export default function ProfileContent() {
  const { user } = useAuthStore();
  const { t } = useI18n();

  const tabs = [
    { id: "profile", label: t.profile.tabs.profile, icon: <User size={18} /> },
    { id: "security", label: t.profile.tabs.security, icon: <Shield size={18} /> },
    { id: "notifications", label: t.profile.tabs.notifications, icon: <Bell size={18} /> },
    { id: "appearance", label: t.profile.tabs.appearance, icon: <Palette size={18} /> },
  ];
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth || "",
      address: user?.address || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(26px, 3.5vw, 34px)",
          fontWeight: 800,
          color: "var(--color-text)",
          marginBottom: "32px",
        }}
      >
        {t.profile.title}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: "32px",
        }}
        className="profile-grid"
      >
        {/* Sidebar Tabs */}
        <div>
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              position: "sticky",
              top: "100px",
            }}
            className="profile-tabs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background:
                    activeTab === tab.id
                      ? "rgba(139, 94, 60, 0.08)"
                      : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--color-primary)"
                      : "var(--color-text-secondary)",
                  fontSize: "14px",
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "all var(--transition-fast)",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border-light)",
            boxShadow: "var(--shadow-sm)",
            padding: "36px",
          }}
        >
          {activeTab === "profile" && (
            <div>
              {/* Avatar Section */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginBottom: "36px",
                  paddingBottom: "28px",
                  borderBottom: "1px solid var(--color-border-light)",
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "88px",
                      height: "88px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "32px",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {user?.fullName?.charAt(0) || "U"}
                  </div>
                  <button
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-bg-card)",
                      border: "2px solid var(--color-border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {user?.fullName || t.common.noInfo}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
                    {user?.email || "email@example.com"}
                  </p>
                </div>
              </div>

              {/* Profile Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "20px",
                }}
              >
                <Input
                  label={t.profile.profileTab.fullNameLabel}
                  placeholder={t.profile.profileTab.fullNameLabel}
                  leftIcon={<User size={18} />}
                  error={errors.fullName?.message}
                  {...register("fullName")}
                />

                <Input
                  label={t.profile.profileTab.phoneLabel}
                  placeholder="0912 345 678"
                  leftIcon={<Phone size={18} />}
                  error={errors.phone?.message}
                  {...register("phone")}
                />

                <Input
                  label={t.profile.profileTab.dobLabel}
                  type="date"
                  leftIcon={<Calendar size={18} />}
                  {...register("dateOfBirth")}
                />

                <Input
                  label={t.profile.profileTab.addressLabel}
                  placeholder={t.profile.profileTab.addressLabel}
                  leftIcon={<MapPin size={18} />}
                  {...register("address")}
                />

                <div style={{ gridColumn: "1 / -1" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      marginBottom: "6px",
                    }}
                  >
                    {t.profile.profileTab.bioLabel}
                  </label>
                  <textarea
                    placeholder={t.profile.profileTab.bioPlaceholder}
                    {...register("bio")}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      fontSize: "15px",
                      fontFamily: "var(--font-sans)",
                      backgroundColor: "var(--color-bg)",
                      color: "var(--color-text)",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      transition: "all var(--transition-fast)",
                      outline: "none",
                      resize: "vertical",
                      minHeight: "100px",
                    }}
                  />
                  {errors.bio && (
                    <span style={{ fontSize: "13px", color: "var(--color-error)" }}>
                      {errors.bio.message}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginTop: "8px",
                  }}
                >
                  <Button type="submit" isLoading={isSubmitting}>
                    <Save size={16} />
                    {t.profile.profileTab.saveBtn}
                  </Button>
                  {saved && (
                    <span
                      className="animate-fade-in"
                      style={{
                        fontSize: "14px",
                        color: "var(--color-success)",
                        fontWeight: 500,
                      }}
                    >
                      ✓ {t.profile.profileTab.savedMsg}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text)",
                  marginBottom: "24px",
                }}
              >
                {t.profile.tabs.security}
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border-light)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
                    {t.profile.securityTab.changePasswordTitle}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                    {t.profile.securityTab.currentPasswordLabel}
                  </p>
                  <Button variant="outline" size="sm">
                    {t.profile.securityTab.savePasswordBtn}
                  </Button>
                </div>
                <div
                  style={{
                    padding: "24px",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--color-border-light)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)", marginBottom: "8px" }}>
                    {t.profile.securityTab.twoFactorTitle}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
                    {t.profile.securityTab.twoFactorDesc}
                  </p>
                  <Button variant="outline" size="sm">
                    {t.profile.securityTab.enableBtn}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text)",
                  marginBottom: "24px",
                }}
              >
                {t.profile.tabs.notifications}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { title: t.profile.notificationsTab.newMember, desc: t.profile.notificationsTab.emailTitle },
                  { title: t.profile.notificationsTab.treeUpdate, desc: t.profile.notificationsTab.treeUpdate },
                  { title: t.profile.notificationsTab.invitation, desc: t.profile.notificationsTab.invitation },
                  { title: t.profile.notificationsTab.newsletter, desc: t.profile.notificationsTab.newsletter },
                ].map((item) => (
                  <div
                    key={item.title}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "20px 24px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--color-border-light)",
                      backgroundColor: "var(--color-bg)",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)", marginBottom: "4px" }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                        {item.desc}
                      </p>
                    </div>
                    <label
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: "44px",
                        height: "24px",
                        flexShrink: 0,
                      }}
                    >
                      <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                      <span
                        style={{
                          position: "absolute",
                          cursor: "pointer",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: "var(--color-primary)",
                          borderRadius: "var(--radius-full)",
                          transition: "var(--transition-fast)",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            height: "18px",
                            width: "18px",
                            left: "22px",
                            bottom: "3px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            transition: "var(--transition-fast)",
                          }}
                        />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text)",
                  marginBottom: "24px",
                }}
              >
                {t.profile.tabs.appearance}
              </h2>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {[
                  { label: t.profile.appearanceTab.light, bg: "#FDFAF6", text: "#2C1810", border: "#E8DDD0" },
                  { label: t.profile.appearanceTab.dark, bg: "#1A1210", text: "#F5EFE6", border: "#3D3230" },
                  { label: t.profile.appearanceTab.system, bg: "linear-gradient(135deg, #FDFAF6 50%, #1A1210 50%)", text: "#2C1810", border: "#E8DDD0" },
                ].map((theme) => (
                  <button
                    key={theme.label}
                    style={{
                      padding: "20px",
                      borderRadius: "var(--radius-lg)",
                      border: `2px solid ${theme.border}`,
                      background: theme.bg,
                      cursor: "pointer",
                      width: "120px",
                      textAlign: "center",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: theme.text,
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {theme.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-tabs {
            flex-direction: row !important;
            overflow-x: auto;
            gap: 0 !important;
            padding-bottom: 4px;
          }
          .profile-tabs button {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}
