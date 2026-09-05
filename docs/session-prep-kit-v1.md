# Session Prep Kit v1 - Product spec

## Problem
Unlock currently sells "longer catalogue text." TTRPG / folklore-table readers need a clear GM tool: Session Prep.

## Goal
On paid giant pages, membership unlocks a one-page Prep card. Free narrative doors stay fully readable. Free giants unchanged.

## Data model (chosen)
Hybrid:
1. **Derived (always):** source shelf from existing `sources[]` (first 3–5 named strings as-is). Compare pair tease from `sessionPrep.compareSlug` if set, else first `related[]` slug that resolves, linking to existing Compare (`/compare` with the pair).
2. **Curated (pilots only):** optional lore-side `sessionPrep: { encounterSeeds: [string, string, string]; compareSlug?: string }` for three GM seeds grounded in motifs/story already on the entry. No invented plot that contradicts sources. No new lore fields beyond this optional block.
3. **Non-pilot paid giants:** still show Prep shell with source shelf + compare tease + pack teaser; encounter seeds section says membership includes full seeds as catalogue grows (or hide seeds row until curated - prefer hide empty seeds rather than filler).

Prefer putting `sessionPrep` in lore JSON (with fullDescription) so it never ships in the public client catalogue bundle.

## Pilots (paid, rich sources, strong Compare)
1. `tepegoz` - one-eye / outwitted; Compare tease → `polyphemus` (free door).
2. `humbaba` - guardian / Cedar Forest; Compare tease → `polyphemus` or `talos`.
3. `cailleach` - land-shaper; Compare tease → `jentilak` (free door).

Skip folklore-no-checkout slugs (`giant-of-kandahar`, `giant-of-kunar`).

## UI
### Paid giant page (after Sources / near Unlock)
**Session Prep** block:
- Title: Session Prep
- For members: one-page Prep card with 3 encounter seeds, Source shelf, Compare pair tease (link).
- For free visitors: locked preview of the card chrome + pack teaser "Full prep pack unlocks with membership" (honest; no fake inventory). Primary Unlock CTA sits with existing PremiumLock / LockedLore (do not stack a second checkout button if the page already has the gold wall).

### Unlock CTA copy (entry / paid giants + paywall surfaces using entry variant)
- Primary button: `Unlock session prep · $4.99/month` (keep monthly price from PLAN_PRICES; do not hardcode a different price).
- Headline/body may tilt toward session prep / table use while staying honest about catalogue depth. Secondary yearly/lifetime line unchanged.
- Compare and Map paywall variants: leave alone in v1 unless a one-line consistency tweak is trivial.

### Pricing `/pricing`
Add one membership includes bullet: Session Prep on paid giants (exact wording in Silvio voice, no em dash, no AI mentions).

## Out of scope
PDF packs, new Stripe SKUs, Trip mode, Evidence locker, One Seam permanent pages, Stripe price changes.

## Voice / hard rules
- English, solo Silvio / Giants Codex.
- Never use the em dash character.
- No AI/bot language in UI.
- Free `freeEntry` giants: no Prep paywall chrome that implies they are locked; free doors stay fully readable.
- Do not change Stripe prices.

## Success
- Spec committed in repo (this file or `docs/session-prep-kit-v1.md`).
- PR with Prep card + new Unlock CTA visible on at least one pilot (screenshots in PR).
- Free giants unchanged.
