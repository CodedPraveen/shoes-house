import { Inter, Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-jewellery-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-jewellery-body",
  display: "swap",
});

export const metadata = {
  title: "AURUM Jewellery | Shoes House",
  description:
    "Discover imitation jewellery crafted for everyday luxury. Necklaces, earrings, rings, and bridal collections with anti-tarnish finish.",
  openGraph: {
    title: "AURUM Jewellery | Shoes House",
    description:
      "Everyday luxury jewellery — waterproof, hypoallergenic, and 18K gold plated.",
  },
};

export default function JewelleryLayout({ children }) {
  return (
    <div
      className={`${playfair.variable} ${inter.variable} bg-[#fcf8f9] font-[family-name:var(--font-jewellery-body)] text-[#1b1b1c] antialiased`}
    >
      {children}
    </div>
  );
} 