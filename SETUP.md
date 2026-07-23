# Monetization setup (Supabase + Stripe)

Follow these steps once. After that, deploy env vars on Vercel.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run `supabase/schema.sql`.
3. **Authentication → Providers**: enable Email.
4. **Authentication → URL configuration**:
   - Site URL: `https://giants-of-the-world.vercel.app` (and `http://localhost:3000` for local)
   - Redirect URLs:  
     `http://localhost:3000/auth/callback`  
     `https://giants-of-the-world.vercel.app/auth/callback`
5. **Project Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never expose to client)

Optional: disable “Confirm email” under Auth → Providers → Email while testing.

## 2. Stripe products

In [Stripe Dashboard](https://dashboard.stripe.com) (start in **Test mode**):

| Plan     | Type           | Amount   | Env var                 |
|----------|----------------|----------|-------------------------|
| Monthly  | Recurring month| $4.99    | `STRIPE_PRICE_MONTHLY`  |
| Yearly   | Recurring year | $39      | `STRIPE_PRICE_YEARLY`   |
| Lifetime | One-time       | $69      | `STRIPE_PRICE_LIFETIME` |

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

- URL: `https://giants-of-the-world.vercel.app/api/webhook/stripe`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Copy signing secret → `STRIPE_WEBHOOK_SECRET` on Vercel

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
