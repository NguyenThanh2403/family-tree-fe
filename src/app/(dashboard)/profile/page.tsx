import type { Metadata } from "next";
import ProfileContent from "./profile-content";

export const metadata: Metadata = {
  title: "Quản lý tài khoản",
  description: "Quản lý thông tin cá nhân và cài đặt tài khoản Family Tree.",
};

export default function ProfilePage() {
  return <ProfileContent />;
}
