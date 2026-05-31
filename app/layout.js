import { Geist, Geist_Mono } from "next/font/google";
import AppProviders from "@/providers/app-providers";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AERÉ - Premium Sneakers",
  description:
    "Quiet luxury premium sneaker ecommerce — modern fashion, elevated design.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-white text-black">
        <AppProviders>
          {children}
          <SpeedInsights />
          <Analytics />
        </AppProviders>
      </body>
    </html>
  );
}
