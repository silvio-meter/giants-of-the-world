import { ImageResponse } from "next/og";
import { OG_SIZE, OG_CONTENT_TYPE, ogCard } from "@/lib/og";
import { PLAN_PRICES } from "@/lib/plans";
import { getAllGiants } from "@/lib/giants";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Pricing · Giants of the World";

export default function Image() {
  const free = getAllGiants().filter((g) => g.freeEntry).length;
  const context = `Opening accounts free (${free}). Lifetime ${PLAN_PRICES.lifetime.price}.`;

  return new ImageResponse(
    ogCard({
      eyebrow: "Membership",
      title: "Pricing",
      context,
    }),
    size
  );
}
