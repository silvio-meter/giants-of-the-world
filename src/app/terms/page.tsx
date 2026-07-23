import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Giants of the World.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Legal
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: 23 July 2026</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            1. The service
          </h2>
          <p className="mt-2">
            Giants of the World (&quot;the Service&quot;) is a web codex of giants from
            mythology, folklore, and modern legend. Free users may browse the
            catalogue and read opening accounts. Paid plans unlock fuller
            entries and premium features as described on the{" "}
            <Link href="/pricing" className="text-accent-gold hover:underline">
              Pricing
            </Link>{" "}
            page.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            2. Accounts
          </h2>
          <p className="mt-2">
            You are responsible for keeping your login credentials secure and
            for activity under your account. Provide accurate information when
            you register. We may suspend accounts that abuse the Service or
            attempt to circumvent payment.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            3. Subscriptions and payments
          </h2>
          <p className="mt-2">
            Paid access is offered as monthly, yearly, or lifetime purchase.
            Payments are processed by Stripe. Recurring plans renew until
            cancelled via the billing portal or your Stripe customer tools.
            Lifetime is a one-time purchase for ongoing access to paid content
            as offered at the time of purchase. Taxes may apply depending on
            your location.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            4. Content and disclaimers
          </h2>
          <p className="mt-2">
            Entries are for cultural, literary, and entertainment interest.
            Mythology and folklore are not scientific claims. Modern military
            and similar legends are{" "}
            <strong className="text-text-primary/90">
              unverified oral accounts
            </strong>{" "}
            and must not be treated as confirmed fact. See{" "}
            <Link href="/about" className="text-accent-gold hover:underline">
              About
            </Link>{" "}
            for more.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            5. Intellectual property
          </h2>
          <p className="mt-2">
            Site design, original wording, and arrangement of the codex are
            protected. Traditional stories belong to their cultures of origin;
            we do not claim ownership of public-domain myths or indigenous
            heritage. Do not scrape, resell, or republish paid content without
            permission.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            6. Acceptable use
          </h2>
          <p className="mt-2">
            Do not attack the Service, reverse-engineer payment flows, harvest
            data at scale, or use the site for unlawful purposes. We may rate-
            limit or block abusive traffic.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            7. Availability
          </h2>
          <p className="mt-2">
            The Service is provided &quot;as is.&quot; We aim for reliability but do not
            guarantee uninterrupted access. Features may change as the codex
            grows.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            8. Contact
          </h2>
          <p className="mt-2">
            Questions about these terms: use the contact channel you received
            with this demo, or the project maintainer listed on the repository
            or site footer when published.
          </p>
        </section>

        <p className="pt-4">
          <Link href="/privacy" className="text-accent-gold hover:underline">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/" className="text-accent-gold hover:underline">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
}
