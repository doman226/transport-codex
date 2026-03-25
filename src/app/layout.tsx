import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const headingFont = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-heading",
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Transport Codex - Kalkulator wyceny",
  description: "MVP kalkulatora kosztów transportu elementów stalowych"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
