import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import PostHogProvider from "@/components/analytics/PostHogProvider";
import VerificationBanner from "@/components/VerificationBanner";
import NotificationWrapper from "@/components/NotificationWrapper";
import { SITE } from "@/data/site";

// Applies the persisted theme before first paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});


const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FlowStore | Discover & Share n8n Automation Workflows",
    template: "%s | FlowStore",
  },
  description:
    "FlowStore is the #1 marketplace for n8n automation workflows. Browse, preview, and import production-ready n8n templates for Slack, Gmail, Google Sheets, AI agents, CRM integrations, and more.",
  keywords: [
    // Core brand & platform
    "n8n", "n8n marketplace", "n8n templates", "n8n workflows", "n8n automation",
    "n8n workflow templates", "n8n integrations", "n8n community", "n8n nodes",
    // Workflow/automation intent
    "workflow automation", "automation templates", "automation marketplace",
    "no-code automation", "low-code automation", "workflow builder",
    "business process automation", "BPA", "iPaaS", "workflow orchestration",
    // Popular app integrations
    "Slack automation", "Gmail automation", "Google Sheets automation",
    "Notion automation", "Airtable automation", "HubSpot automation",
    "Salesforce automation", "Discord automation", "Telegram bot",
    "WhatsApp automation", "OpenAI automation", "AI agent workflow",
    // Use-case keywords
    "lead generation automation", "data sync automation", "webhook automation",
    "API integration", "workflow template library", "ready-made automations",
    // Brand
    "FlowStore", "flowstore.io",
  ],
  authors: [{ name: "FlowStore" }],
  creator: "FlowStore",
  publisher: "FlowStore",
  category: "Technology",
  openGraph: {
    title: "FlowStore | n8n Workflow Marketplace",
    description:
      "Browse thousands of production-ready n8n automation workflows. Preview on an interactive canvas and import into n8n in one click.",
    type: "website",
    siteName: "FlowStore",
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowStore | n8n Workflow Marketplace",
    description:
      "Browse production-ready n8n automation workflows. Preview & import in one click.",
    creator: "@aslam_mac",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
      <body className="font-sans bg-bg text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: SITE.name,
                url: SITE.url,
                description: SITE.description,
                sameAs: [SITE.maker.linkedin, SITE.maker.github],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE.name,
                url: SITE.url,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${SITE.url}/workflows?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <PostHogProvider>
          <ThemeProvider>
            <AuthProvider>
              <NotificationWrapper>
                <VerificationBanner />
                {children}
              </NotificationWrapper>
            </AuthProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
