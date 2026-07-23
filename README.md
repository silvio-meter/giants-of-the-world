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

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm start`    | Serve production build   |

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

## Data

All giant content lives in `src/data/giants.json`. Do not hard-code entries in components.

Image paths follow `/images/giants/{slug}.jpg`. Until final art arrives, the `ImagePlaceholder` component renders silhouettes with animated mist (no broken-image icons).

## Deploy

Vercel-ready: connect the repo and deploy. No environment variables required for the base build.
