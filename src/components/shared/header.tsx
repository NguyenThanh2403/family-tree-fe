"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/core/stores/auth-store";
import { useI18n, SUPPORTED_LOCALES } from "@/lib/i18n";
import { Menu, X, TreePine, User, LogOut, Home } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t, locale, setLocale } = useI18n();

  const navLinks = isAuthenticated
    ? [
        { href: ROUTES.HOME, label: t.nav.home, icon: <Home size={18} /> },
        { href: ROUTES.FAMILY_TREE, label: t.nav.familyTree, icon: <TreePine size={18} /> },
        { href: ROUTES.PROFILE, label: t.nav.account, icon: <User size={18} /> },
      ]
    : [
        { href: ROUTES.WELCOME, label: t.nav.intro, icon: null },
        { href: ROUTES.LOGIN, label: t.nav.login, icon: null },
        { href: ROUTES.REGISTER, label: t.nav.register, icon: null },
      ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid var(--color-border-light)",
      }}
      className="glass"
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href={isAuthenticated ? ROUTES.HOME : ROUTES.WELCOME}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
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
              letterSpacing: "-0.02em",
            }}
          >
            Family Tree
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: 500,
                color: pathname === link.href ? "var(--color-primary)" : "var(--color-text-secondary)",
                background: pathname === link.href ? "rgba(139, 94, 60, 0.08)" : "transparent",
                transition: "all var(--transition-fast)",
                textDecoration: "none",
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={logout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--color-text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                transition: "all var(--transition-fast)",
              }}
            >
              <LogOut size={18} />
              {t.nav.logout}
            </button>
          )}

          {/* Language switcher */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              marginLeft: "8px",
              padding: "3px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-alt)",
            }}
          >
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => setLocale(loc.code)}
                title={loc.label}
                aria-label={loc.label}
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  background: locale === loc.code ? "var(--color-primary)" : "transparent",
                  color: locale === loc.code ? "white" : "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {loc.code.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          style={{
            display: "none",
            padding: "8px",
            background: "none",
            border: "none",
            color: "var(--color-text)",
            cursor: "pointer",
          }}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav
          className="mobile-nav"
          style={{
            display: "none",
            flexDirection: "column",
            padding: "8px 24px 16px",
            borderTop: "1px solid var(--color-border-light)",
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 8px",
                borderRadius: "var(--radius-sm)",
                fontSize: "15px",
                fontWeight: 500,
                color: pathname === link.href ? "var(--color-primary)" : "var(--color-text-secondary)",
                textDecoration: "none",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 8px",
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--color-error)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                width: "100%",
              }}
            >
              <LogOut size={18} />
              {t.nav.logout}
            </button>
          )}

          {/* Mobile language switcher */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              padding: "12px 8px 4px",
            }}
          >
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc.code}
                onClick={() => {
                  setLocale(loc.code);
                  setMobileMenuOpen(false);
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-sm)",
                  border: `1.5px solid ${locale === loc.code ? "var(--color-primary)" : "var(--color-border)"}`,
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: locale === loc.code ? "var(--color-primary)" : "transparent",
                  color: locale === loc.code ? "white" : "var(--color-text-secondary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {loc.flag} {loc.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .mobile-nav {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
}

