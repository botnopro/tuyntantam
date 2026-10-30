import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: "%s | Quản trị Tuyn Tận Tâm" },
  robots: { index: false, follow: false },
};

// Khu quản trị đọc phiên đăng nhập mỗi request → cho phép chặn (không cần static shell)
export const instant = false;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
