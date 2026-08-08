import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getAllGiants, getGiantBySlug } from "@/lib/giants";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

/**
 * Per-entry share card (1200×630). Twitter/X and Discord often fail or fall
 * back to the site-wide image when only a raw catalogue JPG is referenced in
 * metadata; a generated opengraph-image route gives them a fixed-size PNG at a
 * stable absolute URL Next emits into the tags.
 */
export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateStaticParams() {
  return getAllGiants().map((g) => ({ slug: g.slug }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const giant = getGiantBySlug(slug);
  return [
    {
      id: "card",
      alt: giant?.imageAlt || giant?.name || "Giants of the World",
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

const BG = "#0d1117";
const GOLD = "#c9a227";
const TEXT = "#e6edf3";
const MUTED = "#8b949e";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
  id: string;
}) {
  const { slug } = await params;
  const giant = getGiantBySlug(slug);
  if (!giant) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: BG,
            color: GOLD,
            fontSize: 48,
          }}
        >
          Giants of the World
        </div>
      ),
      { ...size }
    );
  }

  const nameSize =
    giant.name.length > 32 ? 44 : giant.name.length > 22 ? 54 : giant.name.length > 14 ? 64 : 72;
  // Wide letter-spacing on a long culture string wraps into a wall of caps;
  // tighten tracking when the line is long (e.g. "German / Silesian / Czech").
  const cultureSize = giant.culture.length > 28 ? 14 : 18;
  const cultureTracking = giant.culture.length > 28 ? 3 : 6;

  // Data URL keeps the photo in the card without a network fetch during
  // ImageResponse render (build-time and request-time both work offline).
  let photoSrc: string | null = null;
  if (giant.image) {
    try {
      const rel = giant.image.replace(/^\//, "");
      const bytes = await readFile(join(process.cwd(), "public", rel));
      const ext = rel.toLowerCase().endsWith(".png") ? "png" : "jpeg";
      photoSrc = `data:image/${ext};base64,${bytes.toString("base64")}`;
    } catch {
      photoSrc = null;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BG,
        }}
      >
        <div
          style={{
            width: "58%",
            height: "100%",
            display: "flex",
            overflow: "hidden",
            background: "#121820",
          }}
        >
          {photoSrc ? (
            <img
              src={photoSrc}
              alt=""
              width={700}
              height={630}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: MUTED,
                fontSize: 28,
              }}
            >
              No image
            </div>
          )}
        </div>

        <div
          style={{
            width: "42%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 48px",
            borderLeft: `3px solid ${GOLD}`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: cultureSize,
                letterSpacing: cultureTracking,
                textTransform: "uppercase",
                color: GOLD,
                opacity: 0.85,
              }}
            >
              {giant.culture}
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: nameSize,
                lineHeight: 1.1,
                letterSpacing: -1,
                color: GOLD,
              }}
            >
              {giant.name}
            </div>
            <div
              style={{
                marginTop: 28,
                height: 3,
                width: 120,
                background: GOLD,
              }}
            />
            <div
              style={{
                marginTop: 24,
                fontSize: 26,
                lineHeight: 1.35,
                color: TEXT,
              }}
            >
              {truncate(giant.shortDescription, 110)}
            </div>
          </div>

          {/*
            Stacked, not side-by-side: the right column is only ~42% of 1200px
            with padding, and uppercase + letter-spacing made "Giants of the
            World" and "giantscodex.com" collide (see Rübezahl card).
          */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 16,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            <span>Giants of the World</span>
            <span style={{ color: GOLD, opacity: 0.8 }}>giantscodex.com</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trim()}...`;
}
