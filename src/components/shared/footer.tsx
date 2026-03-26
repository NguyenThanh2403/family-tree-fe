"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { TreePine, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border-light)",
        backgroundColor: "var(--color-bg-alt)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "48px 24px 24px",
        }}
      >
        {/* Footer Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "40px",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <TreePine size={20} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--color-text)",
                }}
              >
                Family Tree
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                maxWidth: "280px",
              }}
            >
              {t.footer.brand.tagline}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text)",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t.footer.navigation.title}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { href: ROUTES.WELCOME, label: t.footer.navigation.intro },
                { href: ROUTES.LOGIN, label: t.footer.navigation.login },
                { href: ROUTES.REGISTER, label: t.footer.navigation.register },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                    textDecoration: "none",
                    transition: "color var(--transition-fast)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text)",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontFamily: "var(--font-sans)",
              }}
            >
              {t.footer.contact.title}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                {t.footer.contact.email}
              </span>
              <span style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
                {t.footer.contact.hours}
              </span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: "1px solid var(--color-border-light)",
            paddingTop: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            fontSize: "13px",
            color: "var(--color-text-muted)",
          }}
        >
          © {currentYear} Family Tree. {t.footer.madeWith}
          <Heart size={14} style={{ color: "var(--color-error)" }} fill="var(--color-error)" />
          {t.footer.forFamilies}
        </div>
      </div>
    </footer>
  );
}


