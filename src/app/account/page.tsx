import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccount } from "@/components/DeleteAccount";
import {
  canUseFavourites,
  formatPlanLabel,
  isPaidPlan,
} from "@/lib/access";
import { fogBand, overallCompletion } from "@/lib/codex";
import { getComparisonsMade } from "@/lib/comparisons";
import { getDiscoveredSlugs } from "@/lib/discovery";
import { getFavouriteSlugs } from "@/lib/favourites-server";
import { getAllGiants } from "@/lib/giants";
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

  const allGiants = getAllGiants();
  const discoveredSlugs = await getDiscoveredSlugs(profile.id);
  const overall = overallCompletion(allGiants, discoveredSlugs);
  const band = fogBand(overall.percent);
  const comparisonsMade = await getComparisonsMade(profile.id);
  const favCount = canUseFavourites(profile.plan)
    ? (await getFavouriteSlugs(profile.id)).length
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/80 uppercase">
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
              <Link
                href="/favourites"
                className="text-accent-gold hover:underline"
              >
                Your favourites →
              </Link>
            ) : (
              <Link
                href="/pricing"
                className="text-accent-gold hover:underline"
              >
                Unlock the full codex →
              </Link>
            )}
            {profile.stripe_customer_id && (
              <Link
                href="/pricing"
                className="text-accent-gold hover:underline"
              >
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
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
              Codex progress
            </h2>
            <p className="font-mono text-sm text-text-muted">
              {overall.discovered} / {overall.total} · {overall.percent}%
            </p>
          </div>
          <p className="mt-1 text-[10px] tracking-wider text-text-muted uppercase">
            {band.label}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-gold/40 to-accent-gold transition-[width]"
              style={{ width: `${overall.percent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-text-muted">{band.description}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
            <div>
              <dt className="text-xs text-text-muted">Comparisons made</dt>
              <dd className="mt-0.5 font-mono text-text-primary">
                {comparisonsMade}
              </dd>
            </div>
            {favCount !== null && (
              <div>
                <dt className="text-xs text-text-muted">Favourites</dt>
                <dd className="mt-0.5 font-mono text-text-primary">
                  {favCount}
                </dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link
              href="/my-codex"
              className="text-accent-gold hover:underline"
            >
              Open My Codex →
            </Link>
            <Link href="/compare" className="text-accent-gold hover:underline">
              Compare giants →
            </Link>
            <Link href="/near" className="text-accent-gold hover:underline">
              Near you →
            </Link>
          </div>
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
