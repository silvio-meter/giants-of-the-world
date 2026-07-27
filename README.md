# Giants of the World

A dark, atmospheric web codex of giants from mythology, folklore, and modern legend.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Tailwind CSS** + CSS design tokens
- **Framer Motion** (entrance animations)
- **Leaflet** + CartoDB Dark Matter tiles
- Local JSON data (`src/data/giants.json`, `src/data/findings.json`)
- **Supabase** (auth + profiles) + **Stripe** (subscriptions + lifetime)

## Develop

```bash
npm install
cp .env.example .env.local   # see SETUP.md for Supabase + Stripe
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Payments setup:** see [SETUP.md](./SETUP.md).

## Scripts

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Development server                           |
| `npm run build`     | Production build                             |
| `npm start`         | Serve production build                       |
| `npm run build:data`| Regenerate the two data files from the master |
| `npm test`          | Data guard + entitlement unit tests          |
| `npm run typecheck` | `tsc --noEmit`                               |
| `npm run verify`    | lint + typecheck + tests (what CI runs)      |

## Pages

| Route              | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `/`                | Hero home + Random Giant                     |
| `/giants`          | Filterable catalogue                         |
| `/giants/[slug]`   | Detail (mystery note, related, sources)      |
| `/map`             | Dark world map with pins                     |
| `/findings`        | Bones & Shadows (claims / hoaxes / legends)  |
| `/about`           | About + modern-legend disclaimer             |
| `/pricing`         | Monthly / Yearly / Lifetime                  |
| `/login` `/signup` | Auth                                         |
| `/forgot-password` | Request a recovery link                      |
| `/reset-password`  | Set a new password from that link            |
| `/giants/random`   | Server-side redirect to a random entry       |

## Data

`src/data/giants.json` is the **only** file you edit. Two files are generated from it:

```
src/data/giants.json            master — edit this
  ├─> src/data/giants.public.json   catalog; safe for the client
  └─> src/data/giants.lore.json     paid lore; server-only
```

After any edit run `npm run build:data` and commit all three. `npm test` fails
if they drift apart, if a slug has no lore, if a `related` id does not resolve,
if an image is missing — and if lore ever leaks into the public file. CI runs
the same check, so a broken entry cannot reach production as a 404.

Image paths follow `/images/giants/{slug}.jpg`. An entry may set `"image": ""`,
in which case `ImagePlaceholder` renders its silhouette and mist — the right
state for an entry whose art is not ready. `npm test` rejects two entries
sharing the same file, because that means one of them is showing another
giant's picture.


### Tags and motifs

Two vocabularies, doing different jobs:

- **`tags`** — free-form keywords (`edda`, `sicily`, `frost`). They feed
  catalogue search and the JSON-LD `keywords`, and show as chips on the entry.
  Fine-grained on purpose; 140 of the 172 match a single giant.
- **`motifs`** — a controlled vocabulary in `src/data/motifs.json`, drawn from
  a fixed list and validated by `npm test`. These drive `/motifs` and the map
  filter, and every one groups at least two entries.

The map used to filter by tag, which meant a 172-option dropdown where most
choices returned one pin. It filters by motif now.

### Free entries

An entry with `"freeEntry": true` is fully open: its lore renders inside the
static page, it is marked `isAccessibleForFree` in the JSON-LD, and it carries a
"Free" badge in the catalogue. These are the pages search engines can actually
rank, so they are the funnel — keep them to a curated handful of
high-recognition giants. Everything else ships only its opening paragraph and
loads the rest through `/api/lore/[slug]` after a server-side plan check.

## Paywall

The giant pages are statically prerendered and CDN-cached, so they can never
contain per-user content:

- **Open entry** — lore is in the static HTML, indexable.
- **Paywalled entry** — HTML holds the opening paragraph plus the CTA.
  `LockedLore` fetches the rest from `/api/lore/[slug]`, which re-checks the
  plan server-side. `giants.lore.json` is `server-only` and never reaches a
  client bundle.

## Deploy

Vercel-ready: connect the repo and deploy. No environment variables required for the base build.
