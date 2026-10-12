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
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProsFlow — Turn any prospect's website into a client-winning pitch",
  description:
    "Audit your prospect's site, get a personalised sales script, and share a branded report page — all in three steps. Built for marketing agency owners and freelancers.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
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
