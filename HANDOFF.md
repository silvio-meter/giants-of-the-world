# Handoff — Giants of the World

Session-continuity notes. `README.md` / `SETUP.md` / `DEMO.md` describe the
product and setup; this file is *where things stand* and *how work happens*.
Snapshot as of **2026-08-11** — verify against the code before relying on
counts or paths.

## Current state

Live on **giantscodex.com**, `main` continuous-deployed via Vercel.
Recent main tips: freemium + My Journey marks (#69), One Seam list (#70),
Issue 1 Atlas send tooling (#71), section X cards (#66–#68).

### Shipped product surface

| Area | Status |
| ---- | ------ |
| Catalogue, detail pages, free/paid split | Live (tightened 2026-08-10) |
| Compare, size chart, shared motifs | Live (paid depth) |
| Map + motif lines + density + tours | Live |
| Near (distance ranking) | Live |
| My Codex + favourites + discoveries | Live |
| **My Journey marks** (3 private toggles / entry) | Live — `/journey` |
| Chain of custody (subset of entries) | Live |
| Scholarly Notes (subset; gated independently of freeEntry) | Live |
| Evidence page, privacy/terms, refund copy | Live |
| Per-giant OG / Twitter 1200×630 cards | Live |
| Section cards: `/map`, `/motifs`, `/findings`, `/compare`, `/near` | Live (need `twitter-image` + page meta) |
| **One Seam** newsletter (double opt-in, Resend) | Live |
| One Seam Issue 1 (Atlas) content + admin send | Live — first blast sent |
| Umami + light `track()` events | Live |
| TikTok | Removed from social + short redirects |

### Data snapshot (do not hardcode elsewhere)

Compute, do not quote stale numbers from prose:

```bash
node -e 'const g=require("./src/data/giants.json");console.log(g.length,"entries,",g.filter(x=>x.freeEntry).length,"free,",g.filter(x=>x.scholarlyNotes).length,"scholarly,",g.filter(x=>x.chain).length,"chains")'
```

As of this handoff: **84** entries, **16** free (12 curated doorways plus
restrained short entries that must stay free), **32** with scholarly notes,
**18** with chains. Every entry has **≥2** `related` links and a dedicated
share card.

### Free set

**Curated doorways:** `ymir`, `nephilim`, `goliath`, `atlas`, `polyphemus`,
`ravana`, `oni`, `tsul-kalu`, `si-te-cah`, `jentilak`, `fomorians`, `budj-bim`.

**Restrained (must stay free):** `murkupang`, `thardid-jimbo`, `chinny-kinik`,
`giant-of-the-forest` — short by admission; never put behind the paywall.

Keep free a minority. SEO funnel, not half the codex.

### Freemium rules (product truth)

**Showcase `freeEntry`:** full account text static (still open). Scholarly and
chain rungs remain paid even on free entries.

**Non-showcase (logged out or free plan):**

- Visible: name, subtitle/hero, basic account, **opening account** (first
  block), motif **names only**, one-line disputed teaser, first source title,
  membership CTA.
- Locked: full story / origins / disputed, remaining sources, mystery,
  scholarly, chain rungs, motif graph links, Compare depth, size tool,
  favourites sync, My Journey mark **sync** (session marks still work).

**Paywall copy** (shared via `src/lib/paywall-copy.ts`):

- “The first account is free. / The seams, the sources, and your marks open
  with membership.”
- Button: `Unlock with Lifetime - $129` (plain hyphen; verify-copy bans em dash)
- Secondary: “See monthly & yearly”
- Fade label: “Continue the entry”

**Pricing** (`/pricing`): Free vs Paid bullets match the gates above.
Lifetime stays **$129**. No Discord/PWA “coming soon”.

### My Journey marks

- Three toggles per entry (not freeform primary): *This unsettled me*,
  *I was taught another version*, *I still keep a rule from this*.
- Placement: bottom of entry, before Related (`JourneyMarks`).
- Free: **sessionStorage** only + “Sign in to keep your marks.”
- Paid: sync via `/api/marks` → table `journey_marks`; optional note ≤280;
  export JSON/CSV on `/journey`.
- Empty state copy is fixed in `JourneyPageClient`.
- Supabase: run `supabase/journey_marks.sql` if not already applied.

### One Seam (newsletter)

- List name **One Seam**; from **Giants Codex**
  (`NEWSLETTER_FROM` or default `Giants Codex <seam@giantscodex.com>`).
- Promise: one crack in a giant story, once a week. No digests / product spam.
- Signup UI: footer (hidden on `/giants/[slug]` to avoid double form),
  entry bottom, journey empty state.
- Double opt-in Resend → confirm → welcome (not Issue 1).
- Sources stored as `footer` | `entry` | `journey`.
- Unsubscribe: token + `/subscribe/unsubscribe`.
- SQL: `supabase/subscribers.sql`, `subscribers_double_optin.sql`,
  `subscribers_one_seam.sql`.
- Admin (emails in `LIFETIME_GRANT_EMAILS` only): `/admin/subscribers`
  — count, CSV, Issue 1 preview, full send only with phrase
  `SEND ISSUE 1 TO ALL`.
- Issue content source of truth: `src/lib/one-seam/issues.ts`.
- **Issue 1 (Atlas)** already sent once to the live list (3 confirmed at
  first blast). Next issue = new draft in code, then preview, then confirm
  phrase send (or `scripts/send-one-seam-issue-01.mjs`-style one-shot).

### Share cards (X / OG)

X prefers `twitter:image`. Without a segment `twitter-image.tsx`, the root
`featured.jpg` wins even when `opengraph-image` is correct.

Present: giants `[slug]`, catalogue, map, motifs, findings, compare, near.
When adding a section card: both files + page `openGraph`/`twitter` title
and description (file-based images do not carry title/description).

### Pricing honesty

`/pricing` lists what free and paid actually unlock. Scholarly Notes =
partial catalogue. Do not invent “coming” features on the price card.

## How work happens

- Prefer a **feature branch**, PR, green CI, squash merge. Do not push
  straight to `main`.
- The assistant **merges its own PRs** once CI is green (`gh pr merge --squash`).
- **`npm run verify`** before merge; production path also needs
  `npm run build` + `BASE=… npm run test:bundle` and `test:seo` (CI does this).
- Edit **`src/data/giants.json` only** for content; then `npm run build:data`.
  If free previews of paid entries change, run
  `node scripts/update-free-preview-snapshot.mjs`.
- `docs/expansion/` is **gitignored** research material — never track it.
- User-facing strings: **no em dash** (U+2014); verify-copy enforces this.

## Architecture patterns worth knowing

- **LORE_FIELDS** in `scripts/build-data.mjs` — anything paywalled must be
  listed there and excluded from `GiantCardData` in `format.ts`.
- Bundle guards grep built chunks for lore strings — import catalog types
  from `@/lib/format` in client components, never `@/lib/giants`.
- Scholarly Notes and chains use **standalone** client sections + API checks,
  not a rework of `LockedLore`.
- Map filters and Near list re-check plan **server-side**.
- Entry pages are **prerendered**; paid lore only via `/api/lore/[slug]`.
- Free disputed teaser: `getFirstSentence` on the server — never ship full
  disputed into free HTML.
- `metadataBase` + file-based `opengraph-image` / `twitter-image` own the
  share cards; do not set `openGraph.images` back to catalogue JPGs on
  entry pages (X will regress).
- Newsletter consent text lives in `src/lib/newsletter.ts` and is stored
  per row at submit time.

## P0–P2 status (product polish)

All shipped to main:

- **P0:** nav, pricing honesty, free funnel, related density.
- **P1:** `/welcome`, welcome mail path (later rebranded into One Seam),
  findings expansion.
- **P2:** catalogue layers, map tours, near tease, account hub.

Era/timeline filter still deferred (needs methodology).

## Open items (priority order)

1. **Distribution** — X + Reddit + IG with UTM (`utm_source` + `utm_medium=post`);
   use live OG cards (atlas, map, motifs). No new code required.
2. **One Seam Issue 2** — new draft in `issues.ts`, admin preview, owner
   approve, then list send. Weekly when there is a seam; no filler.
3. **Research packets (do not invent):**
   - Scholarly Notes toward 90%+ of the catalogue.
   - Chains for free entries still thin (atlas, oni, fomorians, jentilak,
     budj-bim, restrained shorts).
   - Geographic import wave (Africa, Levant, SE Asia, Andes, Siberia) with
     art and sourced prose.
4. Era/timeline filter on the map — deferred until methodology exists.
5. i18n UI shell (HR) without translating all lore.
6. PWA / Discord — only when real, never as “coming” on the price card.
7. Clean up old local worktrees after merges.
8. Confirm Supabase migrations applied in production:
   - `journey_marks.sql`
   - `subscribers_one_seam.sql` (unsubscribe columns)

## Ops checklist (newsletter / marks)

| Item | Where |
| ---- | ----- |
| Resend API key | `RESEND_API_KEY` on Vercel |
| From address | `NEWSLETTER_FROM` or default seam@ |
| Grant admin emails | `LIFETIME_GRANT_EMAILS` |
| Subscriber admin UI | `/admin/subscribers` |
| UTM scheme | `UTM.md` (`x` / `instagram` / `reddit` + `post` or `bio`) |

## Gotchas (still true)

- `@vercel/analytics` `track()` can drop if called before mount — use
  `@/lib/track`.
- Native `<select>` on Android is an OS sheet — use `FilterSelect`.
- Bash in some agent sandboxes cannot read `~/Desktop` (TCC).
- Never `npm audit fix --force` (tries to downgrade Next).
- Footer newsletter is **hidden** on `/giants/[slug]` (`FooterEmailBand`) so
  it does not stack under the entry form on mobile.
- Full One Seam list send is gated; do not auto-send on deploy.

## Verify before claiming done

1. `npm run verify`
2. After content: `npm run build:data` + free-preview snapshot if previews moved
3. After UI that touches bundles: production build + `test:bundle` / `test:seo`
4. Spot production: free showcase full text; non-showcase opening + locks;
   paid unlock; Twitter card URL returns 1200×630 PNG; One Seam confirm +
   welcome; journey marks session vs paid sync
