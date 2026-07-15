import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "WZPDCL - Power Distribution",
  description: "West Zone Power Distribution Company Limited",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-emerald-50 text-gray-800 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}