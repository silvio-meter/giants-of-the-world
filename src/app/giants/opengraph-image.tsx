import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { getAllGiants, getCultures } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Giants of the World · Giants of the World";

export default function Image() {
  const giants = getAllGiants();
  const free = giants.filter((g) => g.freeEntry).length;
  const context = `${giants.length} entries · ${getCultures().length} cultures · ${free} free`;

  return new ImageResponse(
    ogCard({
      eyebrow: "The catalogue",
      title: "Giants of the World",
      context,
    }),
    size
  );
}
