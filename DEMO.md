# Demo pitch — Giants of the World

**Link:** https://giants-of-the-world.vercel.app

---

## 30-second pitch (English)

> *Giants of the World* is a dark, atmospheric codex of giants from mythology, folklore, and modern legend — worldwide, not just Greece and Norse. You can browse every entry for free; the deeper account unlocks with a membership. Lifetime-first pricing, careful labelling of unverified modern legends, and a map of where tradition places them.

**Hrvatski (kratko):**

> Web “codex” divova iz mitologije, folklora i modernih legendi diljem svijeta. Free pregled + uvod u priču; puni opisi iza membershipa. Tamni, mistični dizajn — više zabranjena knjiga nego baza podataka.

---

## What to click (2-minute tour)

1. **Home** — hero, fog, “Enter the Catalogue” / Random Giant  
2. **Catalogue** — filter culture/type; open **Ymir** or **Ravana**  
3. **Detail** — basic account + readable opening; sealed rest + Lifetime CTA  
4. **Map** — dark pins  
5. **Bones & Shadows** — claims / hoaxes / modern legends labelled  
6. **Pricing** — Monthly / Yearly / **Lifetime** hero  
7. **Sign up** (optional) — then demo unlock or test/live checkout  

---

## What to say about monetization

- Free is useful (not empty blur).  
- Paid = full history + mystery notes (+ size comparison).  
- **Lifetime $69** is the main offer; yearly/monthly for lower commitment.  
- Modern legends are clearly **unverified**.  

### Payments mode (current show)

If the site shows a **“Safe demo — no real charges”** banner:

- Checkout is not taking real money for the show.  
- Logged-in visitors can use **Demo unlock** on Pricing.  
- For Stripe test cards (`4242…`), switch env to test keys (see below).

---

## One-liners for different audiences

| Audience | Line |
|----------|------|
| Friends | “Dark Wikipedia of giants with a membership twist.” |
| Builders | “Next.js + Supabase auth + Stripe, freemium content gating.” |
| Myth fans | “From Ymir to Kandahar — folklore first, hype second.” |
| Investors (soft) | “Content site with clear free/paid and Lifetime-first AOV.” |

---

## Do / Don’t while demoing

**Do**

- Show free value first (opening paragraph).  
- Open About disclaimer on modern legends.  
- Mention respectful handling of indigenous entries.  

**Don’t**

- Present modern military giants as fact.  
- Promise Deep Dive / PWA / PDF unless you built them.  
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
Giants of the World — a dark codex of giants from myth, folklore & modern legend.
Browse free. Unlock the full account when you want to go deeper.
https://giants-of-the-world.vercel.app
```
