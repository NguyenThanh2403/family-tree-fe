"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/core/stores/auth-store";
import { useI18n } from "@/lib/i18n";
import { Button, Input } from "@/components/ui";
import { Mail, Lock } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Mock login — replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      login({
        id: "1",
        email: data.email,
        fullName: "Nguyễn Văn A",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      router.push(ROUTES.HOME);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "36px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "32px",
            fontWeight: 800,
            color: "var(--color-text)",
            marginBottom: "8px",
          }}
        >
          {t.auth.login.title}
        </h1>
        <p style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}>
          {t.auth.login.subtitle}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <Input
          label={t.auth.login.emailLabel}
          type="email"
          placeholder={t.auth.login.emailPlaceholder}
          leftIcon={<Mail size={18} />}
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label={t.auth.login.passwordLabel}
          type="password"
          placeholder={t.auth.login.passwordPlaceholder}
          leftIcon={<Lock size={18} />}
          error={errors.password?.message}
          {...register("password")}
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link
            href="#"
            style={{
              fontSize: "13px",
              color: "var(--color-primary)",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            {t.auth.login.forgotPassword}
          </Link>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
          {t.auth.login.submitBtn}
        </Button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          margin: "28px 0",
        }}
      >
        <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
        <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>{t.common.or}</span>
        <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
      </div>

      {/* Social Login Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "12px",
            borderRadius: "var(--radius-md)",
            border: "2px solid var(--color-border)",
            background: "var(--color-bg-card)",
            color: "var(--color-text)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            transition: "all var(--transition-fast)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {t.auth.login.googleBtn}
        </button>
      </div>

      {/* Register Link */}
      <p
        style={{
          textAlign: "center",
          marginTop: "28px",
          fontSize: "14px",
          color: "var(--color-text-secondary)",
        }}
      >
        {t.auth.login.noAccount}{" "}
        <Link
          href={ROUTES.REGISTER}
          style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
        >
          {t.auth.login.registerLink}
        </Link>
      </p>
    </div>
  );
}

