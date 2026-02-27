import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8b416", // Yellow theme color
};

export const metadata: Metadata = {
  title: "Pix - Bulk Image Processing & Shopify Upload Tool",
  description: "Effortlessly process and upload product images to Shopify. Features include bulk compression, effects, resizing, PDF to image conversion, and metadata editing.",
  keywords: "image processing, shopify upload, bulk image compression, image effects, image resizing, pdf to image, metadata editor",
  authors: [{ name: "Pix" }],
  openGraph: {
    title: "Pix - Bulk Image Processing & Shopify Upload Tool",
    description: "Effortlessly process and upload product images to Shopify. Features include bulk compression, effects, resizing, and more.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pix - Bulk Image Processing & Shopify Upload Tool",
    description: "Effortlessly process and upload product images to Shopify. Features include bulk compression, effects, resizing, and more.",
  },
};


const miso = localFont({
  src: [{ path: "../fonts/VAG-Regular2.otf", weight: "400" }],
  variable: "--font-miso",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${miso.variable} ${poppins.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
