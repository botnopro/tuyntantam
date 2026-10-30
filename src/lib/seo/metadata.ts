import type { Metadata } from "next";

type MetaInput = {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  noindex?: boolean;
};

const clamp = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, "")}…`);

export function buildMetadata(m: MetaInput): Metadata {
  const description = m.description ? clamp(m.description.replace(/\s+/g, " ").trim(), 160) : undefined;
  const images = m.image ? [{ url: m.image }] : undefined;
  return {
    title: m.title,
    description,
    alternates: { canonical: m.path },
    robots: m.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: m.title,
      description,
      url: m.path,
      type: m.type ?? "website",
      locale: "vi_VN",
      siteName: "Tuyn Tận Tâm",
      images,
      ...(m.type === "article" ? { publishedTime: m.publishedTime?.toISOString(), modifiedTime: m.modifiedTime?.toISOString() } : {}),
    },
    twitter: { card: images ? "summary_large_image" : "summary", title: m.title, description, images: m.image ? [m.image] : undefined },
  };
}
