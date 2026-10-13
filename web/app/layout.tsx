import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tiltless | Find why you lose on Hyperliquid",
  description: "A read-only Hyperliquid wallet autopsy for fee drag, tilt, funding bleed, and trading behavior.",
  openGraph: {
    title: "Tiltless | Find why you lose on Hyperliquid",
    description: "Your PnL shows what happened. Tiltless shows why.",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Tiltless Hyperliquid trading coach" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-brand-bg text-white font-sans selection:bg-brand-mint/30 selection:text-brand-mint`}
      >
        <Providers>
          <div className="fixed inset-0 pointer-events-none z-50 bg-noise opacity-[0.03] mix-blend-overlay"></div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
