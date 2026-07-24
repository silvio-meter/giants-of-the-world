import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccount } from "@/components/DeleteAccount";
import { formatPlanLabel, isPaidPlan } from "@/lib/access";
import { getProfile } from "@/lib/profile";
import { refundDays, supportEmail } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/account");

  const paid = isPaidPlan(profile.plan);
  const comped = paid && !profile.stripe_customer_id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Your keys to the codex
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          Account
        </h1>
      </header>

      <div className="space-y-5">
        <section className="rounded-lg border border-border bg-surface p-5">
          <dl className="space-y-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <dt className="text-text-muted">Email</dt>
              <dd className="font-mono text-text-primary">{profile.email}</dd>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-3">
              <dt className="text-text-muted">Plan</dt>
              <dd className="text-text-primary">
                {formatPlanLabel(profile.plan)}
                {comped && (
                  <span className="ml-2 text-xs text-text-muted">
                    · complimentary
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {paid ? (
              <Link href="/favourites" className="text-accent-gold hover:underline">
                Your favourites →
              </Link>
            ) : (
              <Link href="/pricing" className="text-accent-gold hover:underline">
                Unlock the full codex →
              </Link>
            )}
            {profile.stripe_customer_id && (
              <Link href="/pricing" className="text-accent-gold hover:underline">
                Manage billing →
              </Link>
            )}
          </div>

          {comped && (
            <p className="mt-4 text-xs text-text-muted">
              This access was granted directly. There is no subscription and
              nothing will ever be charged.
            </p>
          )}
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
            Refunds and support
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            {refundDays} days, no questions asked, on every plan. Write to{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-accent-gold hover:underline"
            >
              {supportEmail}
            </a>{" "}
            for a refund, a copy of your data, or anything else. Full terms are
            in the{" "}
            <Link href="/terms" className="text-accent-gold hover:underline">
              Terms
            </Link>
            .
          </p>
        </section>

        <DeleteAccount email={profile.email ?? ""} />
      </div>
    </div>
  );
}
