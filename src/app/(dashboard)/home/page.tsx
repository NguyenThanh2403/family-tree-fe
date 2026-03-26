import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Trang chủ Family Tree — Quản lý gia phả và kết nối dòng họ.",
};

export default function HomePage() {
  return <HomeContent />;
}
