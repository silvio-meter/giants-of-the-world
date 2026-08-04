# UTM tagging scheme

Every outbound link that points back to giantscodex.com carries UTM
parameters, so Umami can attribute traffic by channel instead of lumping it
all under "referral" or, worse, "direct".

These links live on the platforms themselves, not in this repository. Nothing
in the codebase can set them. This file is the reference so the scheme stays
consistent when a link is added or changed by hand.

## The scheme

```
?utm_source=<platform>&utm_medium=<placement>
```

- `utm_source` is where the click came from: `x`, `instagram`, `youtube`,
  `pinterest`, `tiktok`.
- `utm_medium` is the kind of placement, not the platform again:
  - `bio` for a profile link
  - `post` for a link inside an individual post, pin or video description

Keep both values lowercase. A stray capital creates a second, separate row in
the dashboard for what is really the same channel.

`utm_campaign` is deliberately unused. It is worth adding only when there is a
specific push to measure that spans more than one channel. Adding it by habit
just produces columns nobody reads.

## Ready to paste

Profile and bio links. Use the short form: a profile prints the URL it links
to, and a raw UTM string reads as clutter next to a handle. Each of these
redirects to the tagged homepage, so attribution is identical.

| Platform  | Put this in the bio                  | It redirects to                                                    |
|-----------|--------------------------------------|--------------------------------------------------------------------|
| X         | `https://www.giantscodex.com/x`         | `/?utm_source=x&utm_medium=bio`         |
| Instagram | `https://www.giantscodex.com/instagram` | `/?utm_source=instagram&utm_medium=bio` |
| YouTube   | `https://www.giantscodex.com/youtube`   | `/?utm_source=youtube&utm_medium=bio`   |
| Pinterest | `https://www.giantscodex.com/pinterest` | `/?utm_source=pinterest&utm_medium=bio` |
| TikTok    | `https://www.giantscodex.com/tiktok`    | `/?utm_source=tiktok&utm_medium=bio`    |

The redirects are defined in `next.config.ts`. Adding a platform means adding
it to that list and to the disallow list in `src/app/robots.ts`.

Links inside a post, pin or video description point at the relevant entry
rather than the homepage, with `utm_medium=post`:

```
https://www.giantscodex.com/giants/ymir?utm_source=pinterest&utm_medium=post
https://www.giantscodex.com/giants/goliath?utm_source=youtube&utm_medium=post
```

## Two things worth knowing

Do not put UTM parameters on internal links between pages of the site. Doing
so restarts attribution mid-visit, and the original source of that visit is
lost.

A UTM-tagged URL is a distinct URL to anything that caches or previews by URL.
When sharing a link on X, that means the social card is fetched fresh for the
tagged version rather than reusing the untagged one already in their cache.
