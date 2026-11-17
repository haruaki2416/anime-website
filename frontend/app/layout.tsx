import type { Metadata } from "next";
import "./globals.css";
import Header from "./layout/header";
import Footer from "./layout/footer";
import NextTopLoader from "nextjs-toploader";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import StoreProvider from "./lib/redux/StoreProvider";
import LoadingPageContainer from "./components/LoadingContainer";
import GoogleAnalytics from "./googleAnalytics";

export const metadata: Metadata = {
  title: "AniProject",
  description: "Discover anime and manga, explore trending titles, and manage your personal watchlist.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <Script src="/register-sw.js" />
      <GoogleAnalytics />
      <body>
        <Analytics />
        <StoreProvider>
          <Header />
          <NextTopLoader color="var(--brand-color)" showSpinner={false} />
          {children || <LoadingPageContainer />}
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
