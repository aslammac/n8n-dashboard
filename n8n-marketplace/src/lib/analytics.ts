/**
 * Thin PostHog wrapper. Every call is a no-op until `posthog-js` has been
 * initialised in `PostHogProvider` (which only happens when
 * `NEXT_PUBLIC_POSTHOG_KEY` is set), so components can call `track()` freely
 * without guarding for "analytics disabled" in dev.
 */

import type { PostHog } from "posthog-js";

export const EVENTS = {
  searchPerformed: "search_performed",
  searchZeroResults: "search_zero_results",
  workflowCardClick: "workflow_card_click",
  workflowDetailView: "workflow_detail_view",
  downloadClick: "download_click",
  signupCompleted: "signup_completed",
  loginCompleted: "login_completed",
  logout: "logout",
  themeToggled: "theme_toggled",
  faqOpened: "faq_opened",
  ctaClicked: "cta_clicked",
  apiError: "api_error",
} as const;

type EventName = (typeof EVENTS)[keyof typeof EVENTS];

function client(): PostHog | null {
  if (typeof window === "undefined") return null;
  const ph = (window as unknown as { posthog?: PostHog }).posthog;
  return ph && ph.__loaded ? ph : null;
}

export function track(event: EventName, properties?: Record<string, unknown>) {
  client()?.capture(event, properties);
}

export function identify(
  id: string,
  properties?: Record<string, unknown>,
) {
  client()?.identify(id, properties);
}

export function resetAnalytics() {
  client()?.reset();
}
