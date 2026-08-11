import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "How this archive treats evidence · Giants of the World";

export default function Image() {
  return new ImageResponse(
    ogCard({
      eyebrow: "Method",
      title: "Evidence",
      context: "Sources named. Claims labelled. Mystery is not proof.",
    }),
    size
  );
}
