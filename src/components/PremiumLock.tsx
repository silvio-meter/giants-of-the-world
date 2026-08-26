import Link from "next/link";
import { IN_CONTENT_CHECKOUT_PLAN, PAYWALL_COPY } from "@/lib/paywall-copy";
import { CheckoutButton } from "./CheckoutButton";

/**
 * Gated-section UI.
 *
 * variant "entry" | "compare": the one gold wall on that page, monthly checkout.
 * variant "later": no button, no prices. Sources/scholarly and extra compare
 * locks use this so a page never stacks multiple buy asks.
 */
export function PremiumLock({
  variant,
  next,
  laterText,
  className = "",
}: {
  variant: "entry" | "compare" | "later";
  /** Login return path for the monthly checkout button. */
  next?: string;
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

  const copy = variant === "compare" ? PAYWALL_COPY.compare : PAYWALL_COPY.entry;

  return (
    <div
      className={`rounded-lg border border-accent-gold/35 bg-background/80 px-4 py-4 text-center sm:px-5 sm:py-5 ${className}`}
    >
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
