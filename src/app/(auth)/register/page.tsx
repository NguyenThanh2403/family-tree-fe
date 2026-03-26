import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản Family Tree miễn phí để bắt đầu xây dựng cây gia phả cho dòng họ bạn.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
