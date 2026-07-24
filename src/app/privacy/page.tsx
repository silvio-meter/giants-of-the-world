import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Giants of the World.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <p className="font-[family-name:var(--font-cinzel)] text-[10px] tracking-[0.35em] text-accent-gold/70 uppercase">
          Legal
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: 23 July 2026</p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-text-muted">
        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            1. Who we are
          </h2>
          <p className="mt-2">
            This policy describes how Giants of the World (&quot;we&quot;, &quot;the
            Service&quot;) handles personal data when you visit the site, create an
            account, or purchase access.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            2. Data we collect
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong className="text-text-primary/90">Account:</strong> email
              and authentication identifiers (via Supabase Auth).
            </li>
            <li>
              <strong className="text-text-primary/90">Billing:</strong>{" "}
              payment status, Stripe customer and subscription IDs, plan type.
              Card details are handled by Stripe - we do not store full card
              numbers.
            </li>
            <li>
              <strong className="text-text-primary/90">Usage:</strong> basic
              technical logs (e.g. errors, server requests) needed to run and
              secure the Service.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            3. Why we use it
          </h2>
          <p className="mt-2">
            To provide accounts, unlock paid content, process payments, prevent
            abuse, and improve reliability. We do not sell your personal data.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            4. Processors
          </h2>
          <p className="mt-2">
            We use trusted processors:{" "}
            <strong className="text-text-primary/90">Supabase</strong>{" "}
            (authentication and database),{" "}
            <strong className="text-text-primary/90">Stripe</strong>{" "}
            (payments), and{" "}
            <strong className="text-text-primary/90">Vercel</strong>{" "}
            (hosting). Each processes data under their own policies as needed
            to deliver the Service.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            5. Retention
          </h2>
          <p className="mt-2">
            Account and plan data are kept while your account is active and as
            required for legal or accounting records. You may request account
            deletion; residual billing records may remain where the law
            requires.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            6. Your choices
          </h2>
          <p className="mt-2">
            You can update account email via auth flows, manage billing through
            the Stripe customer portal when available, and request access or
            deletion of account data by contacting the maintainer. Depending on
            your region (e.g. GDPR/CCPA), additional rights may apply.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            7. Cookies and storage
          </h2>
          <p className="mt-2">
            We use essential cookies/local storage for sessions (auth) and
            similar technical needs. We do not run third-party advertising
            trackers in the current version.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            8. Children
          </h2>
          <p className="mt-2">
            The Service is not directed at children under 16. If you believe a
            child has registered, contact us to remove the account.
          </p>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cinzel)] text-xs tracking-[0.2em] text-accent-gold uppercase">
            9. Changes
          </h2>
          <p className="mt-2">
            We may update this policy; the &quot;Last updated&quot; date will change.
            Material changes may be noted on the site.
          </p>
        </section>

        <p className="pt-4">
          <Link href="/terms" className="text-accent-gold hover:underline">
            Terms of Use
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
