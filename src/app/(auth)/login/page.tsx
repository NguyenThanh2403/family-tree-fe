import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào Family Tree để quản lý gia phả và kết nối dòng họ của bạn.",
};

export default function LoginPage() {
  return <LoginForm />;
}
