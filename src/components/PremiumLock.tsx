import Link from "next/link";
import { IN_CONTENT_CHECKOUT_PLAN, PAYWALL_COPY } from "@/lib/paywall-copy";
import { MEMBERSHIP_SALES_OPEN } from "@/lib/membership";
import { CheckoutButton } from "./CheckoutButton";
import { LockViewEvent } from "./LockViewEvent";

/**
 * Gated-section UI.
 *
 * variant "entry" | "compare" | "map": the one wall on that page. While
 * membership sales are open it is the gold wall with the monthly checkout;
 * while they are closed (MEMBERSHIP_SALES_OPEN false, 11 Nov 2026) it is a
 * plain note with no button, no price and no /pricing link.
 * variant "later": no button, no prices. Sources/scholarly and extra compare
 * locks use this so a page never stacks multiple buy asks.
 */
export function PremiumLock({
  variant,
  next,
  slug,
  laterText,
  className = "",
}: {
  variant: "entry" | "compare" | "map" | "later";
  /** Login return path for the monthly checkout button. */
  next?: string;
  /** Catalogue slug, entry walls only; travels with the lock_view event. */
  slug?: string;
  laterText?: string;
  className?: string;
}) {
  if (variant === "later") {
    return (
      <div
        className={`rounded-lg border border-accent-gold/25 bg-background/50 px-4 py-3 text-center ${className}`}
      >
        <p className="text-sm text-text-muted">
          {laterText ?? PAYWALL_COPY.later}
        </p>
      </div>
    );
  }

  const event = (
    <LockViewEvent
      surface={variant}
      slug={variant === "entry" ? slug : undefined}
    />
  );

  if (!MEMBERSHIP_SALES_OPEN) {
    return (
      <div
        className={`rounded-lg border border-border bg-background/80 px-4 py-4 text-center sm:px-5 sm:py-5 ${className}`}
      >
        {event}
        <p className="text-sm text-text-muted">{PAYWALL_COPY.closed[variant]}</p>
        {variant === "entry" ? (
          <p className="mt-1.5 text-sm">
            <Link href="/evidence" className="text-accent-gold hover:underline">
              How this archive treats evidence
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  const copy =
    variant === "compare"
      ? PAYWALL_COPY.compare
      : variant === "map"
        ? PAYWALL_COPY.map
        : PAYWALL_COPY.entry;

  return (
    <div
      className={`rounded-lg border border-accent-gold/35 bg-background/80 px-4 py-4 text-center sm:px-5 sm:py-5 ${className}`}
    >
      {event}
      <p className="font-[family-name:var(--font-cinzel)] text-sm tracking-wide text-accent-gold">
        {copy.headline}
      </p>
      <p className="mt-1.5 text-sm text-text-muted">{copy.body}</p>
      <CheckoutButton plan={IN_CONTENT_CHECKOUT_PLAN} next={next} className="mt-4">
        {copy.button}
      </CheckoutButton>
      <p className="mt-2.5 text-xs text-text-muted">
        <Link href="/pricing" className="text-accent-gold hover:underline">
          {PAYWALL_COPY.secondary}
        </Link>
      </p>
    </div>
  );
}
