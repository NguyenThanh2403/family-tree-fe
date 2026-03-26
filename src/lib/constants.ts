/**
 * Application-wide constants.
 * Centralized configuration for easy maintenance and cross-platform portability.
 */

export const APP_NAME = "Family Tree";
export const APP_DESCRIPTION =
  "Ứng dụng quản lý gia phả, kết nối dòng họ và lưu giữ giá trị truyền thống gia đình Việt Nam.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const ROUTES = {
  HOME: "/",
  WELCOME: "/welcome",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  FAMILY_TREE: "/family-tree",
} as const;

export const SEO = {
  DEFAULT_TITLE: `${APP_NAME} — Quản lý Gia Phả Dòng Họ`,
  TITLE_TEMPLATE: `%s | ${APP_NAME}`,
  DEFAULT_DESCRIPTION: APP_DESCRIPTION,
  DEFAULT_KEYWORDS: [
    "gia phả",
    "dòng họ",
    "quản lý gia đình",
    "cây gia phả",
    "family tree",
    "phả hệ",
    "truyền thống gia đình",
    "Việt Nam",
  ],
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
} as const;
