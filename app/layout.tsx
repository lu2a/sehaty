import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import InstallPWA from "@/components/ui/InstallPWA";

const cairo = Cairo({ subsets: ["arabic"] });

// 1. إعدادات الميتاداتا
export const metadata: Metadata = {
  title: "تطبيق صحتي",
  description: "المنصة الطبية المتكاملة",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png", // يفضل صورة 180x180 للآيفون لكن هذه ستعمل
  }
};

// 2. إعدادات العرض (Viewport) والألوان - يجب أن تكون منفصلة هنا
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
        {/* مكون التثبيت يظهر فوق كل شيء */}
        <InstallPWA />
      </body>
    </html>
  );
}
