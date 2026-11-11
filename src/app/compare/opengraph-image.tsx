import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { getAllGiants } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Compare Giants · Giants of the World";

export default function Image() {
  const measured = getAllGiants().filter((g) => g.heightMeters).length;
  // Same rule as the charts: only heights a source states in a unit count.
  const context = `${measured} of ${getAllGiants().length} entries have a height stated in the sources`;

  return new ImageResponse(
    ogCard({
      eyebrow: "Side by side",
      title: "Compare Giants",
      context,
    }),
    size
  );
}
