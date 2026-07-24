import type { Metadata } from "next";
import Link from "next/link";
import { refundDays, supportEmail } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for Giants of the World.",
  alternates: { canonical: "/terms" },
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
        <p className="mt-2 text-sm text-text-muted">Last updated: 24 July 2026</p>
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
            4. Refunds
          </h2>
          <p className="mt-2">
            <strong className="text-text-primary/90">
              {refundDays} days, no questions asked.
            </strong>{" "}
            If the codex is not what you hoped for, email{" "}
            <a
              href={`mailto:${supportEmail}?subject=Refund%20request`}
              className="text-accent-gold hover:underline"
            >
              {supportEmail}
            </a>{" "}
            within {refundDays} days of your purchase and we will refund it in
            full. This applies to every plan, Lifetime included. You do not have
            to give a reason.
          </p>
          <p className="mt-2">
            Refunds go back to the original payment method through Stripe and
            usually appear within five to ten business days. Paid access ends
            when the refund is issued.
          </p>
          <p className="mt-2">
            You can cancel a recurring plan at any time from the billing portal.
            Cancelling stops future charges and keeps your access until the end
            of the period you have already paid for. Nothing here limits any
            statutory rights you have as a consumer, including the right of
            withdrawal for EU customers.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            5. Content and disclaimers
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
            6. Intellectual property
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
            7. Acceptable use
          </h2>
          <p className="mt-2">
            Do not attack the Service, reverse-engineer payment flows, harvest
            data at scale, or use the site for unlawful purposes. We may rate-
            limit or block abusive traffic.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            8. Availability
          </h2>
          <p className="mt-2">
            The Service is provided &quot;as is.&quot; We aim for reliability but do not
            guarantee uninterrupted access. Features may change as the codex
            grows.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            9. Contact
          </h2>
          <p className="mt-2">
            Questions about these terms, refunds, or your account:{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-accent-gold hover:underline"
            >
              {supportEmail}
            </a>
            . We aim to reply within a few days.
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
