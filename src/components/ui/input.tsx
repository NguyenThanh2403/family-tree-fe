"use client";

import React, { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

const inputBaseStyle: React.CSSProperties = {
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
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, type, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: "relative" }}>
          {leftIcon && (
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
                display: "flex",
                alignItems: "center",
                pointerEvents: "none",
              }}
            >
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            className={cn("input-field", className)}
            style={{
              ...inputBaseStyle,
              paddingLeft: leftIcon ? "44px" : "16px",
              paddingRight: isPassword ? "44px" : "16px",
              borderColor: error ? "var(--color-error)" : "var(--color-border)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = error
                ? "var(--color-error)"
                : "var(--color-primary)";
              e.target.style.boxShadow = error
                ? "0 0 0 3px var(--color-error-light)"
                : "0 0 0 3px rgba(139, 94, 60, 0.1)";
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error
                ? "var(--color-error)"
                : "var(--color-border)";
              e.target.style.boxShadow = "none";
              props.onBlur?.(e);
            }}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "2px",
              }}
              tabIndex={-1}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <span
            style={{
              fontSize: "13px",
              color: "var(--color-error)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span
            style={{
              fontSize: "13px",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
