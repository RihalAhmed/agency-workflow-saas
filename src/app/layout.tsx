import type { Metadata } from "next";
import { Poppins, Alfa_Slab_One, Bakbak_One, Inter } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const alfaSlabOne = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alfa",
  display: "swap",
});

const bakbakOne = Bakbak_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bakbak",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Niche Landing-Page Generator",
  description: "High-converting, token-driven local business landing pages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${alfaSlabOne.variable} ${bakbakOne.variable} ${inter.variable} antialiased`}
    >
      <body className="min-h-screen bg-surface text-ink font-body">
        {children}
      </body>
    </html>
  );
}
