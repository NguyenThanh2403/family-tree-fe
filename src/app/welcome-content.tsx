"use client";

import React from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { TreePine, Users, Shield, Globe, ChevronRight, Sparkles } from "lucide-react";

const FEATURE_ICONS = [
  <TreePine size={28} key="tree" />,
  <Users size={28} key="users" />,
  <Shield size={28} key="shield" />,
  <Globe size={28} key="globe" />,
];

const STAT_NUMBERS = ["10,000+", "50,000+", "100+", "99.9%"];

export default function WelcomeContent() {
  const { t } = useI18n();

  const statsData = [
    { number: STAT_NUMBERS[0], label: t.welcome.stats.families },
    { number: STAT_NUMBERS[1], label: t.welcome.stats.members },
    { number: STAT_NUMBERS[2], label: t.welcome.stats.clans },
    { number: STAT_NUMBERS[3], label: t.welcome.stats.uptime },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "80px 24px 100px",
            background: "linear-gradient(180deg, var(--color-bg) 0%, var(--color-bg-alt) 100%)",
          }}
        >
          {/* Decorative bg circles */}
          <div
            style={{
              position: "absolute",
              top: "-120px",
              right: "-80px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139,94,60,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-100px",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Badge */}
            <div
              className="animate-fade-in-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                background: "rgba(139, 94, 60, 0.08)",
                border: "1px solid rgba(139, 94, 60, 0.15)",
                marginBottom: "28px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--color-primary)",
              }}
            >
              <Sparkles size={16} />
              {t.welcome.badge}
            </div>

            <h1
              className="animate-fade-in-up"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 6vw, 64px)",
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: "24px",
                color: "var(--color-text)",
                maxWidth: "800px",
                animationDelay: "0.1s",
              }}
            >
              {t.welcome.heroTitle}{" "}
              <span className="text-gradient">{t.welcome.heroTitleHighlight}</span>
            </h1>

            <p
              className="animate-fade-in-up"
              style={{
                fontSize: "clamp(16px, 2.5vw, 20px)",
                color: "var(--color-text-secondary)",
                maxWidth: "600px",
                lineHeight: 1.7,
                marginBottom: "40px",
                animationDelay: "0.2s",
              }}
            >
              {t.welcome.heroSubtitle}
            </p>

            <div
              className="animate-fade-in-up"
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
                animationDelay: "0.3s",
              }}
            >
              <Link href={ROUTES.REGISTER}>
                <Button size="lg">
                  {t.welcome.ctaRegister}
                  <ChevronRight size={18} />
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN}>
                <Button variant="outline" size="lg">
                  {t.welcome.ctaLogin}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section
          style={{
            padding: "0 24px",
            marginTop: "-50px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className="glass animate-fade-in-up"
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              borderRadius: "var(--radius-xl)",
              padding: "32px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "24px",
              boxShadow: "var(--shadow-xl)",
              animationDelay: "0.4s",
            }}
          >
            {statsData.map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                  }}
                  className="text-gradient"
                >
                  {stat.number}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-muted)",
                    marginTop: "4px",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section
          style={{
            padding: "100px 24px",
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 4vw, 42px)",
                fontWeight: 700,
                marginBottom: "16px",
                color: "var(--color-text)",
              }}
            >
              {t.welcome.featuresTitle}
            </h2>
            <p
              style={{
                fontSize: "17px",
                color: "var(--color-text-secondary)",
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              {t.welcome.heroSubtitle}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "28px",
            }}
          >
            {t.welcome.features.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-fade-in-up"
                style={{
                  padding: "32px 28px",
                  borderRadius: "var(--radius-lg)",
                  backgroundColor: "var(--color-bg-card)",
                  border: "1px solid var(--color-border-light)",
                  boxShadow: "var(--shadow-sm)",
                  transition: "all var(--transition-base)",
                  cursor: "default",
                  animationDelay: `${i * 0.1}s`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  e.currentTarget.style.borderColor = "var(--color-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  e.currentTarget.style.borderColor = "var(--color-border-light)";
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "var(--radius-md)",
                    background: "linear-gradient(135deg, rgba(139,94,60,0.1), rgba(201,169,110,0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-primary)",
                    marginBottom: "20px",
                  }}
                >
                  {FEATURE_ICONS[i]}
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "10px",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.7,
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            padding: "80px 24px",
            background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(26px, 4vw, 38px)",
                fontWeight: 700,
                color: "white",
                marginBottom: "16px",
              }}
            >
              {t.welcome.ctaSection.title}
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.8)",
                marginBottom: "32px",
                lineHeight: 1.7,
              }}
            >
              {t.welcome.ctaSection.subtitle}
            </p>
            <Link href={ROUTES.REGISTER}>
              <Button variant="secondary" size="lg">
                {t.welcome.ctaSection.button}
                <ChevronRight size={18} />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
