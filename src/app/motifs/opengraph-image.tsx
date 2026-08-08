import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { getAllMotifs, crossCulturalMotifs } from "@/lib/motifs";
import { getCultures } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Motifs · Giants of the World";

export default function Image() {
  const total = getAllMotifs().length;
  const cross = crossCulturalMotifs().length;
  const context = `${total} motifs · ${cross} cross cultures · ${getCultures().length} traditions`;

  return new ImageResponse(
    ogCard({
      eyebrow: "Recurrence",
      title: "Motifs",
      context,
    }),
    size
  );
}
