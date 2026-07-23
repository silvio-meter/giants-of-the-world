export type GiantType =
  | "primordial"
  | "race"
  | "individual"
  | "folklore"
  | "modern-legend"
  | "tall-tale";

export interface Giant {
  id: string;
  slug: string;
  name: string;
  alsoKnownAs: string[];
  culture: string;
  region: string;
  type: GiantType;
  height: string | null;
  shortDescription: string;
  fullDescription: string;
  mysteryNote: string;
  related: string[];
  coordinates: [number, number] | null;
  tags: string[];
  sources: string[];
  image: string;
  imageAlt: string;
}

export type FindingCategory = "claim" | "hoax" | "modern-legend" | "archaeological";

export interface Finding {
  id: string;
  title: string;
  category: FindingCategory;
  verified: boolean;
  summary: string;
  detail: string;
  relatedGiantSlug?: string;
  sources: string[];
  year?: string;
  location?: string;
}
