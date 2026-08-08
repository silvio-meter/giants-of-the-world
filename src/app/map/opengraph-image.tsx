import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { getGiantsWithCoordinates, getRegions } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "World Map · Giants of the World";

export default function Image() {
  const located = getGiantsWithCoordinates().length;
  const context = `${located} pins · ${getRegions().length} regions`;

  return new ImageResponse(
    ogCard({
      eyebrow: "Geography of the large",
      title: "World Map",
      context,
    }),
    size
  );
}
