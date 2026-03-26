"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/core/stores/auth-store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import {
  TreePine,
  Users,
  Plus,
  TrendingUp,
  Clock,
  BookOpen,
  ChevronRight,
  Search,
} from "lucide-react";

const QUICK_ACTION_ICONS = [
  <Plus size={22} key="plus" />,
  <Users size={22} key="users" />,
  <Search size={22} key="search" />,
  <BookOpen size={22} key="book" />,
];

const QUICK_ACTION_STYLES = [
  { color: "var(--color-primary)", bg: "rgba(139, 94, 60, 0.08)" },
  { color: "var(--color-accent)", bg: "rgba(45, 106, 79, 0.08)" },
  { color: "var(--color-secondary)", bg: "rgba(201, 169, 110, 0.12)" },
  { color: "var(--color-primary-light)", bg: "rgba(184, 134, 90, 0.08)" },
];

const recentActivities = [
  { actionKey: "Nguyễn Văn B được thêm vào gia phả", time: "2 giờ trước" },
  { actionKey: "Cập nhật thông tin dòng họ Nguyễn", time: "5 giờ trước" },
  { actionKey: "Thêm 3 ảnh vào album gia đình", time: "1 ngày trước" },
  { actionKey: "Trần Thị C tham gia Family Tree", time: "2 ngày trước" },
];

export default function HomeContent() {
  const { user } = useAuthStore();
  const { t } = useI18n();

  const quickActions = t.home.quickActions.map((action, i) => ({
    ...action,
    icon: QUICK_ACTION_ICONS[i],
    ...QUICK_ACTION_STYLES[i],
  }));

  return (
    <div>
      {/* Welcome Banner */}
      <div
        className="animate-fade-in-up"
        style={{
          padding: "32px",
          borderRadius: "var(--radius-xl)",
          background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-20px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-40px",
            right: "100px",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 3.5vw, 32px)",
              fontWeight: 800,
              color: "white",
              marginBottom: "8px",
            }}
          >
            {t.home.welcomeTitle}, {user?.fullName || t.common.noInfo} 👋
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.8)", maxWidth: "500px" }}>
            {t.home.welcomeSubtitle}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {[
          { icon: <TreePine size={22} />, label: t.home.stats.trees, value: "2", color: "var(--color-primary)" },
          { icon: <Users size={22} />, label: t.home.stats.members, value: "24", color: "var(--color-accent)" },
          { icon: <TrendingUp size={22} />, label: t.home.stats.generations, value: "5", color: "var(--color-secondary)" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="animate-fade-in-up"
            style={{
              padding: "24px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border-light)",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              animationDelay: `${i * 0.1}s`,
              transition: "all var(--transition-fast)",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--radius-md)",
                background: `${stat.color}14`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: stat.color,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  color: "var(--color-text)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "28px",
        }}
        className="home-grid"
      >
        {/* Quick Actions */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "20px",
            }}
          >
            {t.home.quickActionsTitle}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {quickActions.map((action, i) => (
              <div
                key={action.title}
                className="animate-fade-in-up"
                style={{
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-bg-card)",
                  border: "1px solid var(--color-border-light)",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                  transition: "all var(--transition-base)",
                  animationDelay: `${i * 0.08}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--color-border-light)";
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    background: action.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: action.color,
                    marginBottom: "16px",
                  }}
                >
                  {action.icon}
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "6px",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {action.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  {action.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--color-text)",
              marginBottom: "20px",
            }}
          >
            {t.home.recentActivityTitle}
          </h2>
          <div
            style={{
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border-light)",
              boxShadow: "var(--shadow-sm)",
              overflow: "hidden",
            }}
          >
            {recentActivities.map((activity, i) => (
              <div
                key={i}
                style={{
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  borderBottom:
                    i < recentActivities.length - 1
                      ? "1px solid var(--color-border-light)"
                      : "none",
                  transition: "background var(--transition-fast)",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-bg-alt)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", color: "var(--color-text)", fontWeight: 500 }}>
                    {activity.actionKey}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    color: "var(--color-text-muted)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Clock size={12} />
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (min-width: 1024px) {
          .home-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
