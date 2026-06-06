import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "I Ching Oracle",
  description: "Consult the ancient Oracle of Change",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={vazirmatn.variable}>
      <body className="min-h-screen bg-oracle-bg text-oracle-text antialiased">
        {children}
      </body>
    </html>
  );
}
