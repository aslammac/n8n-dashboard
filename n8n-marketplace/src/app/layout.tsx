import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import VerificationBanner from "@/components/VerificationBanner";
import NotificationWrapper from "@/components/NotificationWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "n8n Marketplace | Discover & Share Automation Workflows",
  description: "The premier marketplace for n8n automation workflows. Discover, share, and deploy powerful automations for Slack, Google Sheets, AI, and more.",
  keywords: ["n8n", "automation", "workflow", "marketplace", "low-code", "integration"],
  openGraph: {
    title: "n8n Marketplace",
    description: "Discover & Share Automation Workflows",
    type: "website",
    siteName: "n8n Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "n8n Marketplace",
    description: "Discover & Share Automation Workflows",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://cdn.jsdelivr.net/npm/@webcomponents/webcomponentsjs@2.0.0/webcomponents-loader.js" 
          strategy="beforeInteractive" 
        />
        <Script 
          src="https://www.unpkg.com/lit@2.0.0-rc.2/polyfill-support.js" 
          strategy="beforeInteractive" 
        />
        <Script 
          src="https://cdn.jsdelivr.net/npm/@n8n_io/n8n-demo-component/n8n-demo.bundled.js" 
          type="module" 
          strategy="afterInteractive" 
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <NotificationWrapper>
            <VerificationBanner />
            {children}
          </NotificationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
