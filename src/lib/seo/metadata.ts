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

/** Ảnh chia sẻ mặc định (logo + chức danh trong data/agent.json), sinh bằng scripts/og-image.mjs */
export const DEFAULT_OG_IMAGE = { url: "/images/site/og-default.png", width: 1200, height: 630, alt: "Tuyn Tận Tâm" };

const clamp = (s: string, max: number) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, "")}…`);

export function buildMetadata(m: MetaInput): Metadata {
  const description = m.description ? clamp(m.description.replace(/\s+/g, " ").trim(), 160) : undefined;
  const images = m.image ? [{ url: m.image }] : [DEFAULT_OG_IMAGE];
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
    twitter: { card: "summary_large_image", title: m.title, description, images: images.map((i) => i.url) },
  };
}
