import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import InstallPWA from "@/components/ui/InstallPWA";

const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "تطبيق صحتي",
  description: "المنصة الطبية المتكاملة",
  // ✅ PWA Settings
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  icons: {
    icon: "/icon-192x192.png", // تأكد من وضع الصور في public
    apple: "/icon-192x192.png",
  }
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
