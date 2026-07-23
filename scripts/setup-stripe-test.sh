#!/usr/bin/env bash
# Create Stripe TEST-mode products and write keys.
# Usage:
#   export STRIPE_SECRET_KEY=sk_test_...
#   export NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
#   ./scripts/setup-stripe-test.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${STRIPE_SECRET_KEY:-}" || "${STRIPE_SECRET_KEY}" != sk_test_* ]]; then
  echo "Set STRIPE_SECRET_KEY to a sk_test_… key (Stripe Dashboard → Test mode → API keys)."
  exit 1
fi
if [[ -z "${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:-}" || "${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}" != pk_test_* ]]; then
  echo "Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to a pk_test_… key."
  exit 1
fi

node << 'NODE'
const fs = require('fs');
const https = require('https');
const { URLSearchParams } = require('url');
const SK = process.env.STRIPE_SECRET_KEY;
const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

function stripe(method, path, data) {
  return new Promise((resolve, reject) => {
    const body = data ? new URLSearchParams(data).toString() : null;
    const req = https.request({
      hostname: 'api.stripe.com',
      path: `/v1${path}`,
      method,
      headers: {
        Authorization: 'Basic ' + Buffer.from(SK + ':').toString('base64'),
        ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        const json = JSON.parse(raw);
        if (json.error) reject(new Error(JSON.stringify(json.error)));
        else resolve(json);
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

(async () => {
  async function make(plan, name, amount, interval) {
    const prod = await stripe('POST', '/products', {
      name, description: 'Giants of the World test', 'metadata[app]': 'giants-of-the-world', 'metadata[plan]': plan,
    });
    const priceData = {
      product: prod.id, currency: 'usd', unit_amount: String(amount),
      'metadata[app]': 'giants-of-the-world', 'metadata[plan]': plan,
    };
    if (interval) priceData['recurring[interval]'] = interval;
    const price = await stripe('POST', '/prices', priceData);
    console.log(plan, price.id);
    return price.id;
  }
  const monthly = await make('monthly', 'GOTW Monthly (test)', 499, 'month');
  const yearly = await make('yearly', 'GOTW Yearly (test)', 3900, 'year');
  const lifetime = await make('lifetime', 'GOTW Lifetime (test)', 6900, null);
  const wh = await stripe('POST', '/webhook_endpoints', {
    url: 'https://giants-of-the-world.vercel.app/api/webhook/stripe',
    description: 'GOTW test mode',
    'enabled_events[0]': 'checkout.session.completed',
    'enabled_events[1]': 'customer.subscription.updated',
    'enabled_events[2]': 'customer.subscription.deleted',
  });
  const out = {
    NEXT_PUBLIC_PAYMENTS_MODE: 'test',
    STRIPE_SECRET_KEY: SK,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: PK,
    STRIPE_WEBHOOK_SECRET: wh.secret,
    STRIPE_PRICE_MONTHLY: monthly,
    STRIPE_PRICE_YEARLY: yearly,
    STRIPE_PRICE_LIFETIME: lifetime,
  };
  fs.writeFileSync('/tmp/gotw-stripe-test.json', JSON.stringify(out, null, 2));
  console.log('webhook', wh.id);
  console.log('Write these into .env.local and Vercel, then set NEXT_PUBLIC_PAYMENTS_MODE=test');
})().catch((e) => { console.error(e); process.exit(1); });
NODE

echo "Output: /tmp/gotw-stripe-test.json"
