import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen bg-oracle-bg text-oracle-text antialiased">
        {children}
      </body>
    </html>
  );
}
