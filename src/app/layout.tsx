import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/utils/theme";
import { siteUrl } from "@/lib/seo/url";
import "./globals.css";

// Be Vietnam Pro không có bản variable → nạp đúng các độ đậm token dùng
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Tuyn Tận Tâm", template: "%s | Tuyn Tận Tâm" },
  applicationName: "Tuyn Tận Tâm",
  openGraph: { type: "website", locale: "vi_VN", siteName: "Tuyn Tận Tâm" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/images/site/favicon.png", apple: "/images/site/favicon.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1219" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
