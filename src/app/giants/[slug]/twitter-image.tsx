import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

/**
 * Same card as opengraph-image. X reads twitter:image preferentially; without
 * this file it can fall back to the root layout's featured.jpg even when
 * og:image is correct for the entry.
 *
 * Route segment config (runtime/size/contentType) cannot be re-exported — Next
 * needs those as static local bindings — so they are declared here and the
 * renderer is shared.
 */
export const runtime = "nodejs";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export {
  default,
  generateStaticParams,
  generateImageMetadata,
} from "./opengraph-image";
