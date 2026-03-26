"use client";

import React from "react";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "32px 24px",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
