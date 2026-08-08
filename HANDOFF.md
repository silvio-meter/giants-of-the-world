# Handoff — Giants of the World

Session-continuity notes. `README.md` / `SETUP.md` / `DEMO.md` describe the
product and setup; this file is *where things stand* and *how work happens*.
Snapshot as of **2026-08-08** — verify against the code before relying on
counts or paths.

## Current state

Live on **giantscodex.com**, `main` continuous-deployed via Vercel.

### Shipped product surface

| Area | Status |
| ---- | ------ |
| Catalogue, detail pages, free/paid split | Live |
| Email capture (double opt-in, Resend) | Live |
| Compare, size chart, shared motifs | Live |
| Map + motif lines + density + My Journey | Live |
| Near (distance ranking) | Live |
| My Codex + favourites + discoveries | Live |
| Chain of custody (subset of entries) | Live |
| Scholarly Notes (subset; gated independently of freeEntry) | Live |
| Evidence page, privacy/terms, refund copy | Live |
| Per-giant OG / Twitter 1200×630 cards | Live |
| Umami + light `track()` events | Live |

### Data snapshot (do not hardcode elsewhere)

Compute, do not quote stale numbers from prose:

```bash
node -e 'const g=require("./src/data/giants.json");const p=require("./src/data/giants.public.json");console.log(g.length,"entries,",g.filter(x=>x.freeEntry).length,"free,",g.filter(x=>x.scholarlyNotes).length,"scholarly,",g.filter(x=>x.chain).length,"chains")'
```

As of this handoff: **84** entries, **16** free (12 curated doorways plus
restrained short entries that must stay free), **32** with scholarly notes,
chains on a minority. Every entry has **≥2** `related` links and a dedicated
share card.

### Free set

**Curated doorways:** `ymir`, `nephilim`, `goliath`, `atlas`, `polyphemus`,
`ravana`, `oni`, `tsul-kalu`, `si-te-cah`, `jentilak`, `fomorians`, `budj-bim`.

**Restrained (must stay free):** `murkupang`, `thardid-jimbo`, `chinny-kinik`,
`giant-of-the-forest` — short by admission; never put behind the paywall.

Keep free a minority. SEO funnel, not half the codex.

### Pricing honesty

`/pricing` lists Scholarly Notes as **partial coverage** (not “on every
entry”). Discord and PWA are **not** listed as coming features until they
exist. Do not re-add them as marketing promises.

## How work happens

- **Every code change through a git worktree** — branch, commit, push, PR,
  green CI, squash merge. Do not push straight to `main`.
- The assistant **merges its own PRs** once CI is green (`gh pr merge --squash`).
- **`npm run verify`** before merge; production path also needs
  `npm run build` + `BASE=… npm run test:bundle` and `test:seo` (CI does this).
- Edit **`src/data/giants.json` only** for content; then `npm run build:data`.
  If free previews of paid entries change, run
  `node scripts/update-free-preview-snapshot.mjs`.
- `docs/expansion/` is **gitignored** research material — never track it.

## Architecture patterns worth knowing

- **LORE_FIELDS** in `scripts/build-data.mjs` — anything paywalled must be
  listed there and excluded from `GiantCardData` in `format.ts`.
- Bundle guards grep built chunks for lore strings — import catalog types
  from `@/lib/format` in client components, never `@/lib/giants`.
- Scholarly Notes and chains use **standalone** client sections + API checks,
  not a rework of `LockedLore`.
- Map filters and Near list re-check plan **server-side**.
- `metadataBase` + per-slug `opengraph-image.tsx` / `twitter-image.tsx` own
  the share cards; do not set `openGraph.images` back to catalogue JPGs on
  entry pages (X will regress).

## P2 status (UX polish)

- Catalogue: free / scholarly / chain toggles, sort, Scholarly+Chain badges on cards.
- Entry: Compare chips vs related (`/compare?a=&b=`).
- Map: curated Tours (one-eye, body-cosmogony, flood-survivor, pre-people).
- Near: free tease shows nearest clear + blurred remainder + unlock CTA.
- Account: codex progress bar, comparisons, favourites count, deep links.
- Era/timeline filter still deferred (needs methodology).

## P1 status (2026-08-08)

**Shipped in product:**

- `/welcome` onboarding (three steps); signup defaults here; Stripe success
  lands on `/welcome?paid=1`.
- Newsletter **welcome email** after double opt-in confirm (Ymir, Evidence,
  Pricing with UTM).
- Findings expanded to ~18 labelled items (hoax / claim / archaeological).

**Blocked on research packets (do not invent):**

- Scholarly Notes toward 90%+ of the catalogue.
- New chains of custody for free entries still missing them (atlas, oni,
  fomorians, jentilak, budj-bim, restrained shorts).
- Geographic import wave (Africa, Levant, SE Asia, Andes, Siberia) including
  art and sourced prose.

## Open items (later)

- Research packets for scholarly / chains / geography above.
- Era/timeline filter on the map — deferred until methodology exists.
- i18n UI shell (HR) without translating all lore.
- PWA / Discord — only when real, never as “coming” on the price card.
- `sharp` dependency bump (low priority).
- Clean up old local worktrees after merges.

## Gotchas (still true)

- `@vercel/analytics` `track()` can drop if called before mount — use
  `@/lib/track`.
- Native `<select>` on Android is an OS sheet — use `FilterSelect`.
- Bash in some agent sandboxes cannot read `~/Desktop` (TCC).
- Never `npm audit fix --force` (tries to downgrade Next).

## Verify before claiming done

1. `npm run verify`
2. After content: `npm run build:data` + free-preview snapshot if previews moved
3. After UI that touches bundles: production build + `test:bundle` / `test:seo`
4. Spot production: free entry full text, paid entry locked, Twitter card URL
   returns 1200×630 PNG
