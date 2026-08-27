# Monetization setup (Supabase + Stripe)

Follow these steps once. After that, deploy env vars on Vercel.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run `supabase/schema.sql`.
3. **Authentication → Providers**: enable Email.
4. **Authentication → URL configuration**:
   - Site URL: `https://www.giantscodex.com` (and `http://localhost:3000` for local)
   - Redirect URLs:  
     `http://localhost:3000/auth/callback`  
     `https://www.giantscodex.com/auth/callback`
5. **Project Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to client)

Optional: disable “Confirm email” under Auth → Providers → Email while testing.

Also run `supabase/favourites.sql`, `supabase/subscribers.sql`,
`supabase/subscribers_double_optin.sql`, `supabase/subscribers_one_seam.sql`
(unsubscribe tokens for One Seam), `supabase/subscribers_drip.sql`
(confirm drip columns; do not backfill), and `supabase/journey_marks.sql`
(My Journey marks for paid sync).

### One Seam (newsletter)

- List: **One Seam** - one seam per week, no digests, no product spam.
- From: defaults to `Giants Codex <seam@giantscodex.com>`. If that address is
  not verified in Resend yet, set
  `NEWSLETTER_FROM=Giants Codex <hello@giantscodex.com>`.
- Requires `RESEND_API_KEY`. Double opt-in: confirm link, then Email 1 of
  the 4-mail drip (new confirms only). Emails 2-4 go out via Vercel cron
  `GET /api/cron/drip` (set `CRON_SECRET`). Reply-To is hello@giantscodex.com.
- Admin: `/admin/subscribers` for emails in `LIFETIME_GRANT_EMAILS`.
  - Subscriber count + CSV export
  - **Issue 1 (Atlas)** draft: preview to yourself, full send only after typing
    `SEND ISSUE 1 TO ALL` (never auto-sends on deploy)
- Issue content lives in `src/lib/one-seam/issues.ts` (source of truth).

### Google Sign-In

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select a project  
2. **APIs & Services → OAuth consent screen** → External (or Internal) → fill app name  
3. **Credentials → Create credentials → OAuth client ID** → type **Web application**  
4. **Authorized JavaScript origins:**
   - `http://localhost:3000`
   - `https://www.giantscodex.com`
   - `https://giantscodex.com` (if apex is used)
5. **Authorized redirect URIs** (must match Supabase):
   - `https://rsalwrpwdwyiupeausbp.supabase.co/auth/v1/callback`
   - (replace project ref if your Supabase URL differs)
6. Copy **Client ID** + **Client secret**  
7. Supabase → **Authentication → Providers → Google** → Enable  
   - paste Client ID + secret → Save  
8. Supabase → **URL configuration** — allow:
   - `https://www.giantscodex.com/auth/callback`
   - `http://localhost:3000/auth/callback`

App UI: **Continue with Google** on `/login` and `/signup`.

## 2. Stripe products

In [Stripe Dashboard](https://dashboard.stripe.com) (start in **Test mode**):

| Plan     | Type           | Amount   | Env var                 |
|----------|----------------|----------|-------------------------|
| Monthly  | Recurring month| $4.99    | `STRIPE_PRICE_MONTHLY`  |
| Yearly   | Recurring year | $49      | `STRIPE_PRICE_YEARLY`   |
| Lifetime | One-time       | $129     | `STRIPE_PRICE_LIFETIME` |

Copy each **Price ID** (`price_...`).

Also copy:
- Secret key → `STRIPE_SECRET_KEY`
- Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (optional for now)

### Customer portal

**Settings → Billing → Customer portal** → enable for subscription cancel/update.

## 3. Webhook

### Local

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`.

### Production (Vercel)

**Developers → Webhooks → Add endpoint**

- URL: `https://www.giantscodex.com/api/webhook/stripe`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copy signing secret → `STRIPE_WEBHOOK_SECRET` on Vercel

## 3b. Resend (newsletter)

1. Create a project at [resend.com](https://resend.com).
2. **Domains** → add `giantscodex.com` → add the three DNS records it shows
   (DKIM TXT, SPF MX and TXT, all on the `send.` subdomain — this does not
   touch the root domain's existing mail setup) → wait for verification.
3. **API Keys** → create a key scoped to **Sending access only** → copy to
   `RESEND_API_KEY`. A broader key is never needed at runtime.
4. Run `supabase/subscribers.sql` if not already done in step 1.

## 4. Local env

```bash
cp .env.example .env.local
# fill all values
npm run dev
```

## 5. Vercel env

Project → Settings → Environment Variables → add the same keys from `.env.example`.

Redeploy after saving.

## 6. Test checklist

1. Sign up at `/signup`
2. Open `/pricing` → Choose Lifetime (or Monthly)
3. Pay with test card `4242 4242 4242 4242`
4. Webhook sets `profiles.plan`
5. Giant detail shows full account + mystery note
6. Header shows plan badge; **Manage billing** opens Stripe portal

## Flow

```
Sign up/in → Pricing → Stripe Checkout → webhook → profiles.plan
→ PlanProvider reads plan → FullDescription unlocks
```
