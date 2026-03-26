import type { Metadata } from "next";
import WelcomeContent from "./welcome-content";

export const metadata: Metadata = {
  title: "Family Tree — Kết nối Dòng họ, Gìn giữ Truyền thống",
  description:
    "Ứng dụng quản lý gia phả hiện đại. Xây dựng cây gia phả, lưu giữ lịch sử dòng họ và kết nối các thế hệ trong gia đình Việt Nam.",
};

export default function WelcomePage() {
  return <WelcomeContent />;
}
