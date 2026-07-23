/**
 * Payments mode:
 * - live: real Stripe charges (sk_live)
 * - test: Stripe test mode (sk_test) + card 4242…
 * - demo: no charges; logged-in users can unlock via /api/demo/unlock
 */

export type PaymentsMode = "live" | "test" | "demo";

export function getPaymentsMode(): PaymentsMode {
  const explicit = process.env.NEXT_PUBLIC_PAYMENTS_MODE?.toLowerCase();
  if (explicit === "demo" || explicit === "test" || explicit === "live") {
    return explicit;
  }
  const sk = process.env.STRIPE_SECRET_KEY ?? "";
  if (sk.startsWith("sk_test")) return "test";
  if (sk.startsWith("sk_live")) return "live";
  return "demo";
}

export function paymentsModeLabel(mode: PaymentsMode): string {
  switch (mode) {
    case "demo":
      return "Safe demo - no real charges";
    case "test":
      return "Stripe test mode";
    default:
      return "Live payments";
  }
}
