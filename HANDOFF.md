# Handoff — Giants of the World

Session-continuity notes for picking this project back up. `README.md` /
`SETUP.md` / `DEMO.md` describe the product and one-time setup; this file is
about *where things stand* and *how work happens here*. It's a snapshot as of
2026-07-31 — treat anything below as probably-still-true, not gospel; verify
against the code before relying on specifics (file paths, test counts).

## Current state

The original four-sprint feature spec (Email Capture → Compare Tool →
Gamification → Map Enhancements) is **fully shipped**, plus two rounds of
polish and a content addition on top. In build order:

1. **Email Capture** — Resend-backed newsletter, footer + detail-page forms.
2. **Compare Tool** (`/compare`) — pick two giants, scale chart, shared-data
   table, Shared Threads (via the motifs system), "Download as image" export.
3. **Gamification** — `/my-codex` (Codex Completion %, per-culture breakdown),
   Personal Collection (= existing favourites, not a new concept), Motif
   Seals (computed live from shared motifs among favourites, not persisted),
   Comparisons-Made counter. No badges/levels/streaks/leaderboards — the spec
   explicitly ruled those out.
4. **Map Enhancements** — motif connection lines (multi-select, one
   preselected by default, muted per-motif colors + legend), a density/"Mist"
   overlay, My Journey export. **Era/timeline filter was explicitly deferred**
   — it needs a new researched field across all 57+ entries, a
   factual-accuracy risk unlike the atmospheric one-liners added elsewhere,
   and the user chose to skip it rather than rush it. Still open if anyone
   wants to pick it up — see "Open items" below.
5. **Custom analytics events** — five `track()` calls on the premium features
   above, via a hand-rolled `src/lib/track.ts` wrapper (see "Gotchas").
6. **Content**: added Surtr (Norse, Ymir's structural-opposite pairing via a
   new `first-and-last` motif) and a new **Scholarly Notes** section
   (etymology/comparative-myth commentary, gated *independently* of an
   entry's own `freeEntry` flag — see "Architecture patterns" below).

Also fixed along the way: native `<select>` dropdowns opened as a white sheet
on Android in light mode (no CSS fix exists for that — replaced with a DOM
listbox, `src/components/FilterSelect.tsx`), and a real dropped-event bug in
the analytics wrapper (see "Gotchas").

**Everything above is merged to `main` and live on production**
(giantscodex.com). No open PRs, no known regressions, `npm run verify` and
the bundle/SEO guards were green as of the last change.

## How work happens in this repo (established this session)

- **Every code change goes through a git worktree**, even small ones —
  `EnterWorktree`, do the work, commit, push, PR, wait for CI, merge, then
  `ExitWorktree`, pull `main`, delete the remote branch. Don't edit the
  shared checkout directly.
- **The assistant merges its own PRs now.** This was explicitly reversed
  mid-session (user: *"mijenjamo pravilo. ti radiš merge"*) — earlier
  sessions had the opposite rule. Mark draft PRs ready (`gh pr ready`) then
  `gh pr merge --squash` once CI is green. Still never force-push, never
  push straight to `main`, never merge without CI passing.
- **`npm run verify`** (lint + typecheck + tests) plus a **live production
  build** check before every merge: `npm run build`, start it
  (`PORT=<free-port> npm start`), then `BASE=http://localhost:<port> npm run
  test:bundle` and `test:seo`. The bundle guards specifically need a real
  build on disk; they skip themselves otherwise (`REQUIRE_BUILD=1` in CI
  turns that skip into a hard failure).
- **Test data / fake accounts**: the `.env.local` service-role key can create
  and delete disposable Supabase test users directly
  (`supabase.auth.admin.createUser` / `deleteUser`), useful for testing paid
  features without a real Stripe checkout. Always clean these up (delete the
  user, delete any rows they created) once done — several examples of this
  pattern exist in recent commit messages if you need the exact script shape.
- **Browser verification**: `mcp__claude-in-chrome__*` tools work but the
  extension disconnects sometimes — if `tabs_context_mcp` fails, that's not
  your bug, just note it and fall back to server-side verification
  (`window.va`/`window.vaq` inspection via `javascript_tool`, direct
  `curl`/`grep` against built HTML and `.next/static/chunks`, etc.). Several
  paywall/analytics checks in this session were verified that way instead of
  a live click-through — acceptable, but say so explicitly rather than
  implying a browser test happened when it didn't.
- **This environment cannot read `~/Desktop`** (or presumably other
  TCC-protected macOS folders) — confirmed `EPERM` even with the Bash
  sandbox disabled, a real OS-level permission the harness doesn't have. If
  a task references a file there, ask the user to `cp` it into the repo
  themselves (they have Desktop access; this session doesn't) — don't spend
  time trying to route around it.

## Architecture patterns worth knowing before extending

- **`src/data/giants.json` is the only file to hand-edit.**
  `npm run build:data` splits it into `giants.public.json` (client-safe) and
  `giants.lore.json` (server-only paid content) via the `LORE_FIELDS`
  allowlist in `scripts/build-data.mjs`. Forgetting to run this after an edit
  fails `npm test` ("generated files are in sync with the master").
- **Bundle-size discipline is enforced by tests, not convention.** Client
  components must import from `@/lib/format` (slim `GiantCardData` type,
  `Omit<Giant, "fullDescription" | "mysteryNote" | "scholarlyNotes" |
  "scholarlySources">`) rather than `@/lib/giants` (pulls the whole ~55KB
  catalog) or `@/lib/motifs` (imports the catalog transitively). New lore
  fields need to be (a) added to `LORE_FIELDS`, (b) excluded from
  `GiantCardData` in `format.ts`, (c) given a public boolean flag if a static
  page needs to know "does this exist" without seeing the content (see
  `hasScholarlyNotes` — computed at build time, safe for the client). The
  guard tests are `scripts/verify-bundle.test.mjs` — they grep the actual
  built `.next/static/chunks/*.js` for distinctive strings and fail loudly if
  server-only content shows up there.
- **Heavy client libraries (html2canvas, ~200KB) load via dynamic `import()`
  inside the click handler that needs them**, never at module scope. A
  bundle guard test asserts the chunk containing it is absent from every
  route's rendered `<script>` tags — add new routes that use it to that
  test's page list (`scripts/verify-bundle.test.mjs`).
- **Gating patterns, in increasing order of how unusual they are:**
  - Most premium content: `canViewFullDescription(plan)` /
    `canUseFavourites(plan)` / etc. in `src/lib/access.ts`, all currently
    identical bodies (`isPaidPlan(plan)`) but kept as separately-named
    functions for semantic clarity and future flexibility.
  - **Giant detail pages are statically prerendered** (`generateStaticParams`,
    no per-request auth check) — the page ships only the free preview;
    `LockedLore.tsx` (client component) fetches the rest from
    `/api/lore/[slug]` after mount, which re-checks the plan server-side.
    This is *why* the page can be CDN-cached despite having paywalled
    content — don't add a server-side plan check directly in
    `giants/[slug]/page.tsx`, it would de-optimize every giant page, not
    just the paywalled ones.
  - **Scholarly Notes is gated independently of `freeEntry`** — it has to
    stay locked even on Ymir, whose main account text is free. Reusing
    `canViewFullDescription`'s gate would have inherited its
    freeEntry-bypass. It's a second, separate check
    (`canViewScholarlyNotes`) computed independently in `/api/lore/[slug]`,
    rendered via its own standalone client component
    (`ScholarlyNotesSection.tsx`) that doesn't touch `LockedLore` at all.
    If you add a third differently-gated thing, follow this shape rather
    than trying to unify it with the existing two — the whole point was
    keeping revenue-critical, shipped code (`LockedLore`) untouched.
  - **Map filters and My Journey are enforced server-side even though the
    UI hides the controls too** — `map/page.tsx` ignores query params like
    `?culture=` unless `canUseMapFilters(plan)` passes server-side, because
    early on a free visitor could apply filters by typing the URL directly.
    `/api/journey` re-checks the plan the same way `/api/favourites` does.
  - **Comparisons-Made and other "vanity but abusable" counters** go through
    the **service-role Supabase client**, never a user-editable RLS policy —
    same reasoning as `profiles.plan`: a client-writable counter is
    trivially inflatable from devtools. See
    `supabase/comparisons_made.sql`'s explicit `revoke execute .. from
    anon, authenticated` on its increment function.
- **The motifs system (`src/data/motifs.json` + `src/lib/motifs.ts`) is the
  one cross-cultural tagging layer, reused everywhere** — Compare's Shared
  Threads, the map's connection lines, Motif Seals, the `/motifs` page
  itself. `sharedMotifsAmong(slugs)` generalizes the original
  `sharedMotifs(a, b)` to N giants; `sharedMotifs` is now just
  `sharedMotifsAmong([a, b])`. When two entries need a "these are linked"
  relationship, prefer tagging them with a (possibly new) motif over adding
  a bespoke field — that's what made Ymir/Surtr's pairing show up in Compare
  automatically, free.
- **Any new Supabase table**: one `.sql` file per feature in `supabase/`
  (never a migrations tool — hand-run once in the Supabase SQL editor,
  idempotent `if not exists`/`or replace` so re-running is safe), RLS
  enabled, and a written-down decision about whether it's user-owned
  (regular `createClient()`, RLS policies keyed on `auth.uid()`) or
  service-role-only (zero RLS policies, all access through an API route).
  `favourites.sql` and `subscribers.sql` are the two reference shapes.

## Gotchas discovered this session (don't rediscover these the hard way)

- **`@vercel/analytics`'s `track()` silently no-ops if called before
  `<Analytics/>`'s own mount effect has run** — no error, no queue, the
  event is just gone. Worse, `<Analytics/>` wraps itself in `<Suspense>`
  internally (it calls `useSearchParams()`), so on a fresh page load it can
  hydrate in a materially *later React commit* than the rest of the page,
  not just later in the same one. A plain `setTimeout(0)` defer isn't
  enough. Fixed with a short poll for `window.va` to actually exist
  (`src/lib/track.ts`, 50ms interval, 4s cap, then gives up). Import `track`
  from `@/lib/track` everywhere, not `@vercel/analytics` directly — verified
  by reproducing the drop against a real production build (fresh load vs.
  client-side nav), not by reasoning about it.
- **A mobile `<select>`'s option list is a native OS dialog on Android
  Chrome, not page content** — `color-scheme: dark` (on `:root`, on the
  control, and the `<meta>` tag) does nothing for it. There's no CSS fix.
  `FilterSelect.tsx` is now a DOM listbox for this reason, not a native
  `<select>`. If a bug report says "the dropdown is white on my phone,"
  it's almost certainly this pattern recurring somewhere new — check
  whether the component in question still uses a real `<select>`.
- **Keyboard-nav "active row" highlighting via `onMouseEnter` breaks itself**
  when the list scrolls under a resting cursor — arrowing far enough drags
  the mouse-hover state back to wherever the pointer physically sits, and
  Enter commits the wrong option. Use `onMouseMove` instead (only fires on
  actual pointer movement). Bit `FilterSelect.tsx` once already; worth
  remembering for any future custom listbox/menu.
- **`npm audit` flags 3 "high" vulnerabilities**, all inside Next's own
  vendored dependency tree (a bundled `postcss` under
  `next/node_modules/postcss`, and `sharp` for image optimization). Real
  risk is low — postcss's issue is build-time source-map handling, and
  `sharp` only ever processes this repo's own static `/public` images, never
  user uploads. `npm audit fix --force` will try to *downgrade Next to 9.x*,
  which is not the right fix. If it's worth doing anything, it's bumping
  `sharp` directly (0.34.5 installed → 0.35.3 patched exists) without
  touching Next.
- **This environment's Bash tool cannot read `~/Desktop`** (see above) —
  don't waste a turn rediscovering this; ask the user to copy files in.

## Data snapshot (as of the last content change)

58 giants (was 57; Surtr added), 14 free entries, 31 cultures, 28 motifs (was
27; `first-and-last` added), all 58 have map coordinates. `npm test` is
42 tests as of the last merge — if it's a different number, something
changed since this was written; trust the code.

## Open items

- **Era/timeline filter** for the map — explicitly deferred, not started.
  Needs a methodology decision first (how to classify 58 entries by rough
  period without overclaiming precision) before any code.
- **`README.md`'s page table is stale** — doesn't list `/compare`,
  `/my-codex`, `/favourites` even though they've existed for a while. Not
  urgent, but worth a pass if someone's touching docs anyway.
- **`sharp` dependency bump** (see Gotchas) — low priority, not blocking
  anything, but a clean small PR if anyone wants a quick win.
- Nothing else outstanding: no open PRs, no TODO/FIXME comments in `src/`
  (checked explicitly), working tree clean, all guards green as of the last
  merge.
