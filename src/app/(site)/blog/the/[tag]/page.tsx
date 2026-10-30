import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogIndex, BlogIndexSkeleton } from "@/components/blog/blog-index";
import { PageHero } from "@/components/site/page-hero";
import { tagPath } from "@/lib/content/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { flattenParams } from "@/lib/validation/common";
import { postFilterSchema } from "@/lib/validation/post";

type Props = PageProps<"/blog/the/[tag]">;

const decodeTag = (raw: string) => {
  try {
    return decodeURIComponent(raw).slice(0, 140);
  } catch {
    return raw.slice(0, 140);
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = decodeTag((await params).tag);
  return buildMetadata({ title: `Chủ đề: ${tag}`, path: tagPath(encodeURIComponent(tag)), noindex: true });
}

export default function TagPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<BlogIndexSkeleton />}>
      <TagContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function TagContent({ params, searchParams }: Props) {
  const tag = decodeTag((await params).tag);
  const filters = postFilterSchema.parse({ ...flattenParams(await searchParams), tag });
  return (
    <>
      <PageHero
        title={`Chủ đề: ${tag}`}
        crumbs={[
          { name: "Blog", href: "/blog" },
          { name: tag, href: tagPath(encodeURIComponent(tag)) },
        ]}
        tone="plain"
      />
      <BlogIndex filters={filters} basePath={tagPath(encodeURIComponent(tag))} showFeatured={false} />
    </>
  );
}
