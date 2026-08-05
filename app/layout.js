import { Geist, Geist_Mono } from "next/font/google";
import AppProviders from "@/providers/app-providers";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Post Mart - Premium Sneakers",
  description:
    "Discover the latest collection of shoes and footwear at Post Mart . Shop stylish sneakers, sports shoes, casual shoes, formal shoes, sandals and slippers for men, women and kids. Find comfortable, durable and trendy footwear at affordable prices with fast delivery across India.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-white text-black">

        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;
        n.push=n;
        n.loaded=!0;
        n.version='2.0';
        n.queue=[];
        t=b.createElement(e);
        t.async=!0;
        t.src=v;
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
        }(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
        fbq('track', 'PageView');
      `}
        </Script>

        <AppProviders>
          {children}
          <SpeedInsights />
          <Analytics />
        </AppProviders>
      </body>
    </html>
  );
}
