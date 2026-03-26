"use client";

import React from "react";
import Link from "next/link";
import { TreePine } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left Decorative Panel — Hidden on mobile */}
      <div
        className="auth-left-panel"
        style={{
          flex: "0 0 45%",
          background: "linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-secondary) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative patterns */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "5%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "20%",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          <div
            className="animate-float"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "var(--radius-xl)",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 32px",
              color: "white",
            }}
          >
            <TreePine size={40} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "36px",
              fontWeight: 800,
              color: "white",
              marginBottom: "16px",
              lineHeight: 1.2,
            }}
          >
            Family Tree
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.75)",
              maxWidth: "320px",
              lineHeight: 1.7,
            }}
          >
            {t.auth.decorativePanel.subtitle}
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 24px",
          backgroundColor: "var(--color-bg)",
          overflowY: "auto",
        }}
      >
        {/* Mobile Logo — Visible only on mobile */}
        <Link
          href="/"
          className="auth-mobile-logo"
          style={{
            display: "none",
            alignItems: "center",
            gap: "10px",
            marginBottom: "40px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <TreePine size={22} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              fontWeight: 700,
              color: "var(--color-text)",
            }}
          >
            Family Tree
          </span>
        </Link>

        <div
          className="animate-scale-in"
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          {children}
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .auth-left-panel {
            display: none !important;
          }
          .auth-mobile-logo {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
