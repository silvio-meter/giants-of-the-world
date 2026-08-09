import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { getGiantsWithCoordinates } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Giants Near You · Giants of the World";

export default function Image() {
  const located = getGiantsWithCoordinates().length;
  const context = `${located} located entries · position stays on your device`;

  return new ImageResponse(
    ogCard({
      eyebrow: "Proximity",
      title: "Near You",
      context,
    }),
    size
  );
}
