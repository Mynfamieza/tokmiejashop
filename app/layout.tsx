import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartProvider } from "@/components/cart/cart-provider";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

function resolveSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  try {
    return new URL(configured || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

const siteDescription =
  "Good Food, Made for Every Day. Explore something delicious from TokMieja.";

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: "TokMieja - Official Online Store",
    template: "%s | TokMieja",
  },
  description: siteDescription,
  applicationName: "TokMieja Shop",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "TokMieja Shop",
    title: "TokMieja - Official Online Store",
    description: siteDescription,
    locale: "en_MY",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "TokMieja - Official Online Store",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: "#8a2420",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream-50 text-cocoa-900">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
