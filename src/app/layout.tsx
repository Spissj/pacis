import type { Metadata } from "next";
import { EB_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const ebGaramond = EB_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Paci's Cakes - Repostería Artesanal y Taller Digital",
  description: "Diseños exclusivos de tortas personalizadas y repostería artesanal premium hecha con amor en Bogotá, Colombia.",
  keywords: ["Paci's Cakes", "pastelería bogota", "tortas personalizadas", "repostería artesanal", "pastelería premium", "cupcakes", "galletas"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${ebGaramond.variable} ${dmSans.variable} scroll-smooth`}
    >
      <body className="antialiased bg-surface-bright text-on-surface">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
