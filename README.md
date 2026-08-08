# Giants of the World

A dark, atmospheric web codex of giants from mythology, folklore, and modern legend.
Live at [giantscodex.com](https://www.giantscodex.com).

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** + CSS design tokens
- **Leaflet** + CartoDB Dark Matter tiles
- Local JSON data (`src/data/giants.json`, motifs, findings, glossary)
- **Supabase** (auth + profiles) + **Stripe** (subscriptions + lifetime)
- **Umami** + **Vercel Analytics** (light event tracking)

## Develop

```bash
npm install
cp .env.example .env.local   # see SETUP.md for Supabase + Stripe
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Payments setup:** see [SETUP.md](./SETUP.md). Demo notes: [DEMO.md](./DEMO.md). Session continuity: [HANDOFF.md](./HANDOFF.md).

## Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Development server                                |
| `npm run build`      | Production build                                  |
| `npm start`          | Serve production build                            |
| `npm run build:data` | Regenerate public + lore files from the master    |
| `npm test`           | Data, copy, entitlement, and unit guards          |
| `npm run typecheck`  | `tsc --noEmit`                                    |
| `npm run verify`     | lint + typecheck + tests (what CI runs first)     |
| `npm run test:bundle`| Bundle-size guards (needs a prior `npm run build`)|
| `npm run test:seo`   | SEO + Twitter-card guards (needs a running server)|

## Pages

| Route              | Purpose                                              |
| ------------------ | ---------------------------------------------------- |
| `/`                | Hero, free doorway strip, product tools              |
| `/giants`          | Filterable catalogue (culture, type, region, search) |
| `/giants/[slug]`   | Entry: free preview or full lore, chain, scholarly   |
| `/giants/random`   | Server redirect to a random entry                    |
| `/compare`         | Two giants: scale, fate, shared motifs               |
| `/near`            | Giants by distance from a point you choose           |
| `/map`             | Dark map, motif connection lines, density            |
| `/motifs`          | Controlled motif vocabulary and carriers             |
| `/findings`        | Bones & Shadows (claims / hoaxes / legends)          |
| `/evidence`        | How sources are treated                              |
| `/my-codex`        | Completion tracking and motif seals (signed-in)      |
| `/favourites`      | Saved giants, synced (paid)                          |
| `/pricing`         | Monthly / Yearly / Lifetime                          |
| `/about`           | About + modern-legend disclaimer                     |
| `/login` `/signup` | Auth                                                 |
| `/forgot-password` | Request a recovery link                              |
| `/reset-password`  | Set a new password from that link                    |
| `/account`         | Plan, billing portal, delete account                 |
| `/welcome`         | Post-signup / post-checkout three-step onboarding    |

## Data

`src/data/giants.json` is the **only** file you edit for entries. Two files are generated from it:

```
src/data/giants.json            master — edit this
  ├─> src/data/giants.public.json   catalog; safe for the client
  └─> src/data/giants.lore.json     paid lore; server-only
```

After any edit run `npm run build:data` and commit all three. `npm test` fails
if they drift apart, if a slug has no lore, if a `related` id does not resolve,
if an image is missing — and if lore ever leaks into the public file. CI runs
the same check.

Image paths follow `/images/giants/{slug}.jpg`. An entry may set `"image": ""`,
in which case `ImagePlaceholder` renders silhouette and mist. `npm test`
rejects two entries sharing the same file.

### Tags and motifs

- **`tags`** — free-form keywords for catalogue search and JSON-LD `keywords`.
- **`motifs`** — controlled vocabulary in `src/data/motifs.json`. Drives
  `/motifs`, map connection lines, Compare Shared Threads, and Motif Seals.
  Every motif groups at least two entries.

### Free entries

An entry with `"freeEntry": true` is fully open: lore in the static HTML,
`isAccessibleForFree` in JSON-LD, Free badge in the catalogue. These are the
SEO funnel — keep them a **curated minority** of high-recognition entries.
Everything else ships the opening paragraph and loads the rest through
`/api/lore/[slug]` after a server-side plan check.

If you change free previews for paid entries, regenerate the freeze:

```bash
node scripts/update-free-preview-snapshot.mjs
```

### Premium layers (independent gates)

| Layer | Gate | Notes |
| ----- | ---- | ----- |
| Full account + mystery note | `canViewFullDescription` | Bypassed when `freeEntry` |
| Scholarly Notes | `canViewScholarlyNotes` | Stays locked even on free entries |
| Chain of custody | `canViewChain` | Claim/verdict free; ladder paid |
| Map filters, Near list, Favourites | plan checks | Server-enforced, not only UI |

## Paywall

Giant pages are statically prerendered and CDN-cached — no per-user content
in the HTML:

- **Open entry** — full lore in the static page, indexable.
- **Paywalled entry** — opening paragraph + CTA; `LockedLore` /
  `ScholarlyNotesSection` / `ChainOfCustody` fetch through server-checked APIs.
- Share cards: per-slug `opengraph-image` + `twitter-image` (1200×630 PNG).

## Deploy

Vercel-ready. Connect the repo and deploy. Base build needs no env vars;
auth, Stripe, and analytics need the keys in [SETUP.md](./SETUP.md).

Work style for this repo: every change goes through a **git worktree**, PR,
green CI, then squash merge. See [HANDOFF.md](./HANDOFF.md).
