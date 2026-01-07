import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import InstallPWA from "@/components/ui/InstallPWA";

const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "صحتي AI",
  description: "منصة طبية ذكية للاستشارات الأسرية",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "صحتي AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
        <InstallPWA />
      </body>
    </html>
  );
}