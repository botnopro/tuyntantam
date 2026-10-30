import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogIndex, BlogIndexSkeleton } from "@/components/blog/blog-index";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo/metadata";
import { flattenParams } from "@/lib/validation/common";
import { postFilterSchema } from "@/lib/validation/post";
import { getSettings } from "@/server/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [site, home] = await Promise.all([getSettings("site"), getSettings("home")]);
  return buildMetadata({ title: home.posts.heading || "Blog", description: site.tagline, path: "/blog" });
}

export default async function BlogPage(props: PageProps<"/blog">) {
  const [site, home] = await Promise.all([getSettings("site"), getSettings("home")]);
  return (
    <>
      <PageHero title={home.posts.heading || "Blog"} description={site.tagline} crumbs={[{ name: "Blog", href: "/blog" }]} tone="plain" />
      <Suspense fallback={<BlogIndexSkeleton />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/blog">, "searchParams">) {
  const filters = postFilterSchema.parse(flattenParams(await searchParams));
  return <BlogIndex filters={filters} basePath="/blog" showFeatured={!filters.q && filters.page === 1} />;
}
