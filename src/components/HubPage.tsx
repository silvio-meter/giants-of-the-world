import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/site";
import { type Hub, hubFindings, hubGroups, hubPath } from "@/lib/hubs";

export function hubMetadata(hub: Hub): Metadata {
  const path = hubPath(hub);
  const full = `${hub.title} · Giants of the World`;
  return {
    title: hub.title,
    description: hub.description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Giants of the World",
      url: path,
      title: full,
      description: hub.description,
    },
    twitter: {
      card: "summary_large_image",
      site: "@TheGiantsCodex",
      title: full,
      description: hub.description,
    },
  };
}

function crumbs(hub: Hub): { name: string; path: string }[] {
  const mid =
    hub.kind === "motifs"
      ? { name: "Motifs", path: "/motifs" }
      : { name: "Catalogue", path: "/giants" };
  return [{ name: "Home", path: "/" }, mid, { name: hub.h1, path: hubPath(hub) }];
}

export function HubPage({ hub }: { hub: Hub }) {
  const url = `${siteUrl}${hubPath(hub)}`;
  const groups = hubGroups(hub);
  const all = groups.flatMap((g) => g.giants);
  const findings = hubFindings(hub);
  const trail = crumbs(hub);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: hub.h1,
        description: hub.description,
        isPartOf: { "@type": "WebSite", url: siteUrl, name: "Giants of the World" },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: { "@id": `${url}#list` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: trail.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${siteUrl}${c.path === "/" ? "/" : c.path}`,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        itemListElement: all.map((g, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${siteUrl}/giants/${g.slug}`,
          name: g.name,
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-text-muted">
        <ol className="flex flex-wrap gap-1.5">
          {trail.map((c, i) => (
            <li key={c.path} className="flex gap-1.5">
              {i > 0 ? <span aria-hidden>/</span> : null}
              {i < trail.length - 1 ? (
                <Link href={c.path} className="hover:text-accent-gold">
                  {c.name}
                </Link>
              ) : (
                <span aria-current="page">{c.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <header className="mb-10">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl tracking-wide text-accent-gold sm:text-4xl">
          {hub.h1}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          {hub.intro}
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.label || "all"} className="mb-10">
          {group.label ? (
            <h2 className="mb-4 font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
              {group.label}
            </h2>
          ) : null}
          <ul className="grid gap-4 sm:grid-cols-2">
            {group.giants.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/giants/${g.slug}`}
                  className="block h-full rounded-lg border border-border bg-surface p-4 transition hover:border-accent-gold/50"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-[family-name:var(--font-cinzel)] text-accent-gold">
                      {g.name}
                    </span>
                    <span className="shrink-0 rounded border border-border px-2 py-0.5 text-[10px] tracking-wide text-text-muted uppercase">
                      {g.freeEntry ? "Free" : "Members"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-muted">{g.culture}</p>
                  {hub.notes?.[g.slug] ? (
                    <p className="mt-1 text-xs italic text-text-muted">
                      {hub.notes[g.slug]}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm leading-relaxed text-text-primary/90">
                    {g.shortDescription}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {findings.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-3 font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
            Findings
          </h2>
          <ul className="space-y-1.5 text-sm">
            {findings.map((f) => (
              <li key={f.slug}>
                <Link href={`/findings/${f.slug}`} className="text-accent-gold hover:underline">
                  {f.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-[family-name:var(--font-cinzel)] text-xs tracking-[0.25em] text-accent-gold uppercase">
          Read across
        </h2>
        <ul className="space-y-1.5 text-sm">
          {hub.related.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="text-accent-gold hover:underline">
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
