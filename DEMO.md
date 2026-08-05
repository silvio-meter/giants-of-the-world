# Demo pitch: Giants of the World

**Link:** https://www.giantscodex.com

The homepage prints the live counts and computes them from the data. Read
them there rather than quoting a figure here that will age the moment an
entry is added or opened up.

---

## 30-second pitch (English)

> *Giants of the World* is a dark, atmospheric codex of giants from mythology, folklore, and modern legend, worldwide, not just Greece and Norse. Every entry opens free; the deeper account unlocks with a membership. Every entry names its actual sources, unverified modern legends are labelled as such, and a map shows where tradition places them.

**Hrvatski (kratko):**

> Web "codex" divova iz mitologije, folklora i modernih legendi diljem svijeta. Free pregled i uvod u priču; puni opisi iza membershipa. Tamni, mistični dizajn: više zabranjena knjiga nego baza podataka.

---

## What to click (2-minute tour)

1. **Home**: hero, fog, "Enter the Catalogue" and Random Giant
2. **Catalogue**: filter culture/type, open **Ymir** or **Ravana**
3. **Detail**: basic account and readable opening, sealed rest with the CTA
4. **Compare**: two giants side by side, and the traditions they share
5. **Map**: dark pins, plus motif connection lines between related giants
6. **Bones & Shadows**: claims, hoaxes and modern legends, each labelled
7. **Evidence**: how sources are treated. This is the credibility argument,
   and it is the page worth showing to a sceptical audience
8. **Pricing**: Monthly / **Yearly** / Lifetime

If there is time: **My Codex** (completion tracking) and the size comparison
in the sidebar of any entry.

---

## What to say about monetization

- Free is useful, not an empty blur. Every entry opens with real text.
- **Yearly at $49 is the offer to lead with.** It carries the Best Value
  badge and is the recommended plan. Lifetime at $129 exists for people who
  want it, but it is no longer the default pitch.
- Monthly at $4.99 is the low-commitment entry.
- Paid unlocks the full account, mystery notes, Scholarly Notes, full Compare
  data, motif connections on the map, My Journey, favourites, the size
  comparison, and first access to new giants.
- 14-day refund on every plan, Lifetime included.
- Modern legends are clearly **unverified** and stay that way.

### Payments mode (current show)

If the site shows a **"Safe demo, no real charges"** banner:

- Checkout is not taking real money for the show.
- Logged-in visitors can use **Demo unlock** on Pricing.
- For Stripe test cards (`4242...`), switch env to test keys (see below).

---

## One-liners for different audiences

| Audience | Line |
|----------|------|
| Friends | "Dark Wikipedia of giants with a membership twist." |
| Builders | "Next.js + Supabase auth + Stripe, freemium content gating." |
| Myth fans | "From Ymir to Kandahar: folklore first, hype second." |
| Investors (soft) | "Content site with a clear free/paid split and recurring-first pricing." |

---

## Do / Don't while demoing

**Do**

- Show free value first (the opening paragraph).
- Open the Evidence page, or the About disclaimer, on modern legends.
- Mention respectful handling of indigenous entries.

**Don't**

- Present modern military giants as fact.
- Promise PWA, Discord or PDF. They are listed as coming, not built.
- Use a real card on live Stripe if you only meant to demo.

---

## Stripe: safe show vs test vs live

| Mode | Env | Cards |
|------|-----|--------|
| **demo** | `NEXT_PUBLIC_PAYMENTS_MODE=demo` | No charge; Demo unlock API |
| **test** | `sk_test` + `pk_test` + test price IDs | `4242 4242 4242 4242` |
| **live** | `sk_live` + live price IDs | Real money |

Default for public show: **demo**.

---

## Share text (copy-paste)

```
Giants of the World: a dark codex of giants from myth, folklore and modern legend.
Every entry names its sources. Browse free, unlock the full account when you want to go deeper.
https://www.giantscodex.com
```
