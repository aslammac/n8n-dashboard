/**
 * Central site configuration — wordmark, nav, and external profiles.
 */

export const SITE = {
  name: "FlowStore",
  /**
   * Short, quotable description reused in metadata and structured data.
   * Keeps the "n8n" keyword for search intent; visible UI copy says "automations".
   */
  description:
    "FlowStore is a marketplace for automation workflows — search, preview them on an interactive canvas, and import ready-made n8n automations in seconds.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  /** Booking link for "Book a demo". TODO: point at real Cal.com / Calendly. */
  demoUrl: "https://cal.com/aslam-mac/30min",
  maker: {
    name: "@aslam_mac",
    linkedin: "https://www.linkedin.com/in/aslam-c/",
    github: "https://github.com/aslammac",
    medium: "https://aslammac.medium.com/",
  },
  /** Project source repo (footer "Company" column). */
  repo: "https://github.com/aslammac",
} as const;

/** Profiles surfaced in the footer and in `Organization.sameAs` JSON-LD. */
export const MAKER_PROFILES: { label: string; href: string }[] = [
  { label: "LinkedIn", href: SITE.maker.linkedin },
  { label: "GitHub", href: SITE.maker.github },
  { label: "Medium", href: SITE.maker.medium },
];

export const PRIMARY_NAV: { label: string; href: string }[] = [
  { label: "Workflows", href: "/workflows" },
  { label: "Pricing", href: "/coming-soon" },
];
