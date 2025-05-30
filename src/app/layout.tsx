import { PerformanceDashboard } from "@/components/dev/performance-dashboard";
import { Layout } from "@/components/layout";
import AppContextProvider from "@/contexts/appContext";
import { QueryProvider } from "@/providers/query-provider";
import clsx from "clsx";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Font files can be colocated inside of `app`
const rulik = localFont({
  src: "../fonts/RulikVF.woff2",
  variable: "--font-rulik",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://muybuen.coffee"),
  title: "Muy Buen Coffee",
  description: "Find buen coffee, make buen coffee.",
  openGraph: {
    images: "/images/og.png",
  },
  icons: [
    {
      rel: "icon",
      type: "image/png",
      url: "/favicon.png",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AppContextProvider>
        <html lang="en">
          <body
            className={clsx(inter.variable, rulik.variable, "min-h-screen")}
          >
            <Layout>{children}</Layout>
            {process.env.NODE_ENV === "development" && <PerformanceDashboard />}
          </body>
        </html>
      </AppContextProvider>
    </QueryProvider>
  );
}
