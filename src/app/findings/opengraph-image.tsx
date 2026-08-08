import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { getAllFindings } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Bones & Shadows · Giants of the World";

export default function Image() {
  const findings = getAllFindings();
  const verified = findings.filter((f) => f.verified).length;
  const context = `${findings.length} claims examined · ${verified} with a known status`;

  return new ImageResponse(
    ogCard({
      eyebrow: "Evidence and rumor",
      title: "Bones & Shadows",
      context,
    }),
    size
  );
}
