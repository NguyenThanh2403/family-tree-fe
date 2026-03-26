import type { Metadata } from "next";
import { FamilyTreeContent } from "./family-tree-content";

export const metadata: Metadata = {
  title: "Cây Gia Phả",
  description:
    "Quản lý và khám phá cây gia phả dòng họ của bạn. Thêm, sửa, xoá thành viên và xem trực quan toàn bộ phả hệ.",
};

export default function FamilyTreePage() {
  return <FamilyTreeContent />;
}
