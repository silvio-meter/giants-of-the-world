# Handoff — Giants of the World

Session-continuity notes. `README.md` / `SETUP.md` / `DEMO.md` describe the
product and setup; this file is *where things stand* and *how work happens*.
Snapshot as of **2026-08-11** (post-#73 handling, #74 nav) — verify against
the code before relying on counts or paths.

## Current state

Live on **giantscodex.com**, `main` continuous-deployed via Vercel.

**Recent main tips:**

| PR | What |
| -- | ---- |
| #74 | Desktop nav: account links moved into UserMenu |
| #73 | Editorial `handling` on all 84 giants (lore-only) |
| #72 | Prior HANDOFF refresh |
| #71 | One Seam Issue 1 (Atlas) admin send |
| #70 | One Seam list, welcome, unsubscribe |
| #69 | Freemium tighten + My Journey marks |
| #66–#68 | Section + map X/OG cards; footer email hide on entry |

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
| **Editorial handling** (`publishable`, living, distortions, take, cite) | Live — **lore only**, all 84 |
| Evidence page, privacy/terms, refund copy | Live |
| Per-giant OG / Twitter 1200×630 cards | Live |
| Section cards: `/map`, `/motifs`, `/findings`, `/compare`, `/near` | Live (`twitter-image` + page meta) |
| **One Seam** newsletter (double opt-in, Resend) | Live |
| One Seam Issue 1 (Atlas) content + admin send | Live — first blast sent |
| Header: product bar + account dropdown | Live (#74) |
| Umami + light `track()` events | Live |
| TikTok | Removed from social + short redirects |

### Data snapshot (do not hardcode elsewhere)

Compute, do not quote stale numbers from prose:

```bash
node -e 'const g=require("./src/data/giants.json");console.log(g.length,"entries,",g.filter(x=>x.freeEntry).length,"free,",g.filter(x=>x.scholarlyNotes).length,"scholarly,",g.filter(x=>x.chain).length,"chains,",g.filter(x=>x.handling).length,"handling")'
```

As of this handoff: **84** entries, **16** free (12 curated doorways plus
restrained short entries that must stay free), **32** with scholarly notes,
**18** with chains, **84** with `handling`. Every entry has **≥2** `related`
links and a dedicated share card.

One handling entry is `publishable: false`: **`dzunukwa`** (Kwakwaka'wakw —
do not invent fiction from her name/masks as generic monster material).

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

### Editorial handling (lore-only)

- Shape on master: `handling: { publishable, living, distortions, take, cite }`.
- In **`LORE_FIELDS`** (`scripts/build-data.mjs`) — present in
  `giants.lore.json`, **never** in `giants.public.json` / client catalogue.
- Types: `GiantHandling` in `types.ts`; available on `getGiantLore(slug)`.
- No public UI yet — data is for writers/ops and future gated tooling.
- Source packets lived in local `handling_out/` (not tracked in git).
- Em dashes in handling prose were normalized to commas for verify-copy.

### My Journey marks

- Three toggles per entry: *This unsettled me*, *I was taught another version*,
  *I still keep a rule from this*.
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
  phrase send.

### Navigation

**Desktop primary bar (product only):**

`Catalogue · Compare · Near · Map · Motifs · Findings · Pricing · Random · [Sign in | plan badge]`

**Account routes** (signed-in) live under **UserMenu** (`LIFETIME` / Account
dropdown): Account, My Journey, Favourites, My Codex, Sign out.

**Mobile drawer:** same product links + *Your codex* group when signed in.

Do **not** put Journey / Favourites / My Codex back in the desktop row —
they wrap (“My Journey” on two lines) on ordinary widths.

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
- Local `handling_out/` is a source packet, not committed.
- User-facing strings: **no em dash** (U+2014); verify-copy enforces this
  (including data files / lore JSON).

## Architecture patterns worth knowing

- **LORE_FIELDS** in `scripts/build-data.mjs` — paywalled **and** internal
  editorial fields (`handling`, chain body, scholarly, fullDescription, …)
  must be listed there so they never enter `giants.public.json`.
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
- **Post-P2:** freemium tighten, My Journey marks, One Seam, handling data,
  desktop nav cleanup (#74).

Era/timeline filter still deferred (needs methodology).

## Open items (priority order)

1. **Distribution** - X, Instagram, YouTube, Pinterest with UTM
   (`utm_source` + `utm_medium=post` or `bio`). Pinterest is the heaviest
   published channel; do not omit it. Discord shares use only
   `utm_source=discord&utm_medium=post` (see `UTM.md`). No new code required.
2. **One Seam Issue 2** — new draft in `issues.ts`, admin preview, owner
   approve, then list send. Weekly when there is a seam; no filler.
3. **Research packets (do not invent):**
   - Scholarly Notes toward 90%+ of the catalogue.
   - Chains for free entries still thin (atlas, oni, fomorians, jentilak,
     budj-bim, restrained shorts).
   - Geographic import wave (Africa, Levant, SE Asia, Andes, Siberia) with
     art and sourced prose.
4. Optional: surface `handling` for paid writers/admin (not public catalogue).
5. Respect `publishable: false` / living-culture notes when writing new prose
   or marketing (especially `dzunukwa`).
6. Era/timeline filter on the map — deferred until methodology exists.
7. i18n UI shell (HR) without translating all lore.
8. PWA / Discord — only when real, never as “coming” on the price card.
9. Clean up old local worktrees after merges.
10. Confirm Supabase migrations applied in production:
    - `journey_marks.sql`
    - `subscribers_one_seam.sql` (unsubscribe columns)

## Ops checklist (newsletter / marks)

| Item | Where |
| ---- | ----- |
| Resend API key | `RESEND_API_KEY` on Vercel |
| From address | `NEWSLETTER_FROM` or default seam@ |
| Grant admin emails | `LIFETIME_GRANT_EMAILS` |
| Subscriber admin UI | `/admin/subscribers` |
| UTM scheme | `UTM.md` (`x` / `instagram` / `youtube` / `pinterest` + `post` or `bio`; `discord` only with `post`) |

## Gotchas (still true)

- `@vercel/analytics` `track()` can drop if called before mount — use
  `@/lib/track`.
- Native `<select>` on Android is an OS sheet — use `FilterSelect`.
- Bash in some agent sandboxes cannot read `~/Desktop` (TCC).
- Never `npm audit fix --force` (tries to downgrade Next).
- Footer newsletter is **hidden** on `/giants/[slug]` (`FooterEmailBand`) so
  it does not stack under the entry form on mobile.
- Full One Seam list send is gated; do not auto-send on deploy.
- Desktop nav must stay short; account links belong in `UserMenu`.

## Verify before claiming done

1. `npm run verify`
2. After content: `npm run build:data` + free-preview snapshot if previews moved
3. After handling or lore fields: confirm `handling` absent from
   `giants.public.json` and present in `giants.lore.json`
4. After UI that touches bundles: production build + `test:bundle` / `test:seo`
5. Spot production: free showcase full text; non-showcase opening + locks;
   paid unlock; Twitter card URL returns 1200×630 PNG; One Seam confirm +
   welcome; journey marks session vs paid sync; signed-in desktop nav one row
