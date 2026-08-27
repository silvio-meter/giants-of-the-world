import { isFolkloreNoCheckout } from "./paywall-copy";

/**
 * Relative-path helpers for in-content checkout.
 * Used by the checkout API and by client gold-wall code. No server-only imports.
 */

const ORIGIN = "https://giantscodex.invalid";

export const CHECKOUT_QUERY = "checkout";
export const CHECKOUT_MONTHLY = "monthly";

/** Reject open redirects. Query strings on a same-origin path are allowed. */
export function safeRelativeNext(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/pricing";
  }
  if (value.includes("://") || value.includes("\\")) {
    return "/pricing";
  }
  return value;
}

export function withSearchParam(path: string, key: string, value: string): string {
  const url = new URL(safeRelativeNext(path), ORIGIN);
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function withoutSearchParams(path: string, keys: string[]): string {
  const url = new URL(safeRelativeNext(path), ORIGIN);
  for (const key of keys) url.searchParams.delete(key);
  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
}

/** Content path Stripe should return to: drop flow params, keep a=&b= / focus=. */
export function contentPathFrom(path: string): string {
  return withoutSearchParams(path, [
    CHECKOUT_QUERY,
    "paid",
    "canceled",
    "session_id",
    "plan",
  ]);
}

export function loginUrlForCheckout(returnTo: string, plan = CHECKOUT_MONTHLY): string {
  const next = withSearchParam(safeRelativeNext(returnTo), CHECKOUT_QUERY, plan);
  return `/login?next=${encodeURIComponent(next)}`;
}

export function isFolkloreCheckoutPath(path: string): boolean {
  const url = new URL(safeRelativeNext(path), ORIGIN);
  const match = url.pathname.match(/^\/giants\/([^/]+)\/?$/);
  if (match && isFolkloreNoCheckout(match[1])) return true;
  const focus = url.searchParams.get("focus");
  if (focus && isFolkloreNoCheckout(focus)) return true;
  return false;
}

/**
 * Stripe success/cancel URLs.
 * `{CHECKOUT_SESSION_ID}` must stay unencoded so Stripe can substitute it.
 */
export function stripeReturnUrls(
  site: string,
  nextPath: string,
  plan: string
): { success_url: string; cancel_url: string } {
  const content = contentPathFrom(nextPath);
  const success = withSearchParam(withSearchParam(content, "paid", "1"), "plan", plan);
  const cancel = withSearchParam(content, "canceled", "1");
  const sep = success.includes("?") ? "&" : "?";
  return {
    success_url: `${site}${success}${sep}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}${cancel}`,
  };
}
