import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], display: "swap", adjustFontFallback: false });

export const metadata: Metadata = {
  title: "Lala System",
  description: "Salon Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-muted/10">
            <div className="container mx-auto p-4 md:p-8 pt-6">
              {children}
            </div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
