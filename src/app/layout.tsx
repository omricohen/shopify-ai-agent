import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";
import { PagesProvider } from "@/lib/pages-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shopify AI Command Center",
  description:
    "AI-powered Shopify store management with intelligent analytics, generative UI, and natural language queries.",
  openGraph: {
    title: "Shopify AI Command Center",
    description:
      "AI-powered Shopify store management with intelligent analytics and generative UI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <StoreProvider>
          <PagesProvider>{children}</PagesProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
