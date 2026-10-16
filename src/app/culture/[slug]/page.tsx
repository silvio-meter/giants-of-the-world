import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubPage, hubMetadata } from "@/components/HubPage";
import { getHub, hubsOfKind } from "@/lib/hubs";

export const dynamicParams = false;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return hubsOfKind("culture").map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hub = getHub("culture", slug);
  return hub ? hubMetadata(hub) : {};
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const hub = getHub("culture", slug);
  if (!hub) notFound();
  return <HubPage hub={hub} />;
}
