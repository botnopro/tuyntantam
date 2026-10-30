import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { BlogIndex, BlogIndexSkeleton } from "@/components/blog/blog-index";
import { PageHero } from "@/components/site/page-hero";
import { categoryPath } from "@/lib/content/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { flattenParams } from "@/lib/validation/common";
import { postFilterSchema } from "@/lib/validation/post";
import { listCategories } from "@/server/posts";

type Props = PageProps<"/blog/danh-muc/[slug]">;

export async function generateStaticParams() {
  return (await listCategories()).map((c) => ({ slug: c.slug }));
}

async function findCategory(slug: string) {
  return (await listCategories()).find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await findCategory(slug);
  if (!cat) return {};
  return buildMetadata({ title: cat.name, description: cat.description, path: categoryPath(cat.slug) });
}

async function CategoryContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const cat = await findCategory(slug);
  if (!cat) notFound();
  return (
    <>
      <PageHero
        title={cat.name}
        description={cat.description}
        crumbs={[
          { name: "Blog", href: "/blog" },
          { name: cat.name, href: categoryPath(cat.slug) },
        ]}
        tone="plain"
      />
      <Suspense fallback={<BlogIndexSkeleton />}>
        <Results slug={cat.slug} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Results({ slug, searchParams }: { slug: string; searchParams: Props["searchParams"] }) {
  const filters = postFilterSchema.parse({ ...flattenParams(await searchParams), category: slug });
  return <BlogIndex filters={filters} basePath={categoryPath(slug)} showFeatured={false} />;
}

export default function CategoryPage(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryContent {...props} />
    </Suspense>
  );
}
