import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: `
    background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
    color: white;
    border: none;
    box-shadow: var(--shadow-md);
  `,
  secondary: `
    background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-light));
    color: var(--color-primary-dark);
    border: none;
    box-shadow: var(--shadow-sm);
  `,
  outline: `
    background: transparent;
    color: var(--color-primary);
    border: 2px solid var(--color-primary);
  `,
  ghost: `
    background: transparent;
    color: var(--color-text-secondary);
    border: none;
  `,
  danger: `
    background: linear-gradient(135deg, var(--color-error), #B91C1C);
    color: white;
    border: none;
    box-shadow: var(--shadow-sm);
  `,
};

const sizeStyles: Record<string, string> = {
  sm: "padding: 8px 16px; font-size: 13px; border-radius: var(--radius-sm);",
  md: "padding: 12px 24px; font-size: 15px; border-radius: var(--radius-md);",
  lg: "padding: 16px 32px; font-size: 17px; border-radius: var(--radius-md);",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn("btn", className)}
      disabled={disabled || isLoading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontWeight: 600,
        cursor: disabled || isLoading ? "not-allowed" : "pointer",
        opacity: disabled || isLoading ? 0.6 : 1,
        transition: "all var(--transition-fast)",
        width: fullWidth ? "100%" : "auto",
        fontFamily: "var(--font-sans)",
        letterSpacing: "0.01em",
        ...(Object.fromEntries(
          (variantStyles[variant] + sizeStyles[size])
            .split(";")
            .filter(Boolean)
            .map((s) => {
              const [k, ...v] = s.split(":");
              return [
                k
                  .trim()
                  .replace(/-([a-z])/g, (_, c) => c.toUpperCase()),
                v.join(":").trim(),
              ];
            })
        ) as React.CSSProperties),
      }}
      {...props}
    >
      {isLoading && (
        <svg
          style={{
            width: "16px",
            height: "16px",
            animation: "spin 1s linear infinite",
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="31"
            strokeDashoffset="10"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
