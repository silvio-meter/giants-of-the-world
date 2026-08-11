import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

/**
 * X prefers twitter:image. Without this file the root featured.jpg wins
 * even when opengraph-image is correct for /pricing.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Pricing · Giants of the World";

export { default } from "./opengraph-image";
