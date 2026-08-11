import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { getAllGiants } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "About · Giants of the World";

export default function Image() {
  const n = getAllGiants().length;
  return new ImageResponse(
    ogCard({
      eyebrow: "The project",
      title: "About",
      context: `A sourced codex of ${n} giants. Open carefully.`,
    }),
    size
  );
}
