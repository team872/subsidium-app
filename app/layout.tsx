import type { Metadata } from "next";
import { Fugaz_One, Figtree } from "next/font/google";
import "./globals.css";

const fugaz = Fugaz_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SUBSIDIUM — Là où vos projets prennent vie",
  description: "Le mouvement citoyen de l'action.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${fugaz.variable} ${figtree.variable}`}>
      <body>{children}</body>
    </html>
  );
}
