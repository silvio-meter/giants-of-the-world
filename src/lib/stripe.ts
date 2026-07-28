import Stripe from "stripe";
import { siteUrl } from "./site";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }
  return stripe;
}

export function getSiteUrl(): string {
  return siteUrl;
}

/**
 * The billing portal configuration to open.
 *
 * The account carries more than one — an older, unbranded default left over
 * from a previous project, and ours with the codex headline and links. Which
 * one is "default" is a Dashboard setting the API cannot change, so pick ours
 * explicitly rather than trusting it.
 *
 * Resolved once per process; falls back to the account default if the lookup
 * fails, since a plain portal beats no portal.
 */
let portalConfigId: string | null | undefined;

export async function getPortalConfiguration(): Promise<string | undefined> {
  if (portalConfigId !== undefined) return portalConfigId ?? undefined;
  try {
    const { data } = await getStripe().billingPortal.configurations.list({
      limit: 20,
      active: true,
    });
    const ours = data.find(
      (c) => c.business_profile?.headline === "Giants of the World"
    );
    portalConfigId = ours?.id ?? null;
  } catch (err) {
    console.error("portal configuration lookup", err);
    portalConfigId = null;
  }
  return portalConfigId ?? undefined;
}
