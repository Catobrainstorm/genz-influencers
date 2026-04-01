import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RSVP: PRESTIGIOUS 1000 | GEN-Z INFLUENCERS",
  description: "Official Induction Portal for the Smartan Culture Conference 2026. Claim your asset and finalize your RSVP.",
  metadataBase: new URL('https://genz-influencers.vercel.app'), // Replace with your actual Vercel URL
  icons: {
    icon: "/images/fav.png",
    shortcut: "/images/fav.png",
    apple: "/images/fav.png",
  },
  // --- SOCIAL PREVIEWS USING ONLY FAVICON ---
  openGraph: {
    title: "PRESTIGIOUS 1000 | GEN-Z INFLUENCERS",
    description: "The Annual Roster Induction. Secure your seat for SCC.26.",
    url: "https://genz-influencers.vercel.app",
    siteName: "Smartan House",
    images: [
      {
        url: "/images/fav.png", // Using your fav icon here
        width: 512,
        height: 512,
        alt: "Smartan House Icon",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary", // Changed from summary_large_image to summary since it's a square icon
    title: "PRESTIGIOUS 1000 | GEN-Z INFLUENCERS",
    description: "Official Induction Portal. Claim your asset and finalize your RSVP.",
    images: ["/images/fav.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#040F1A]">
        {children}
      </body>
    </html>
  );
}