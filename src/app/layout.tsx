import type { Metadata, Viewport } from "next";
import { Outfit, Cinzel } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "JainYatra India - Find Nearby Jain Temples & Facilities",
  description: "Discover nearby Jain temples, dharamshalas, bhojanshalas, and facilities across India. Get real-time distances, navigation, and community updates.",
  keywords: "Jain temples, Jain discovery, Dharamshala, Bhojanshala, Jain travel India, Digambar, Shwetambar",
  authors: [{ name: "JainYatra India Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${outfit.variable} ${cinzel.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-background text-foreground animate-fade-in">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
