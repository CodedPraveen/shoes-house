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
  title: "Home | Post Mart",
  description:
    "Shoes & Footwear Online at Best Prices.",
  openGraph: {
    title: "Home Page | Post Mart",
    description:
      "Shop men's, women's and kids' shoes online at Post Mart. Explore sports shoes, casual shoes, sneakers, sandals and more with affordable prices and fast delivery across India.",
  },
};

export default function JewelleryLayout({ children }) {
  return (
    <div
      className={`${playfair.variable} ${inter.variable} bg-[#fcf8f9] font-(family-name:--font-jewellery-body) text-[#1b1b1c] antialiased`}
    >
      {children}
    </div>
  );
} 