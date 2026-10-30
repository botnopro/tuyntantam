import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ContactCard } from "@/components/site/contact-card";
import { PageHero } from "@/components/site/page-hero";
import { RichContent } from "@/components/site/rich-content";
import { extractLead, withHeadingIds } from "@/lib/content/html";
import { buildMetadata } from "@/lib/seo/metadata";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { plainText } from "@/lib/utils/format";
import { allPageSlugs, getPage } from "@/server/pages";

type Props = PageProps<"/[slug]">;

// Trang có route riêng hoặc chỉ là nguồn dữ liệu — không phục vụ qua template chung
const RESERVED = new Set(["gioi-thieu", "dich-vu", "kho-nguon", "nguon-bds-thue", "nguon-bds-ban"]);

export async function generateStaticParams() {
  return (await allPageSlugs()).filter((p) => !RESERVED.has(p.slug)).map((p) => ({ slug: p.slug }));
}

async function load(slug: string) {
  if (RESERVED.has(slug)) return null;
  return getPage(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await load((await params).slug);
  if (!page) return {};
  const { heading } = extractLead(page.contentHtml);
  return buildMetadata({
    title: page.seoTitle || heading || page.title,
    description: page.seoDescription || plainText(page.contentHtml, 160),
    path: `/${page.slug}`,
    image: page.ogImage ?? page.images[0]?.src,
  });
}

/** Template trang nội dung chung (Môi giới, Đầu tư, Liên hệ & Hợp tác, Ủng hộ…). */
async function ContentPageContent({ params }: Props) {
  const page = await load((await params).slug);
  if (!page) notFound();
  const { heading, lead, rest } = extractLead(sanitizeRichText(page.contentHtml));
  const { html, toc } = withHeadingIds(rest);
  const title = heading ?? page.title;

  return (
    <>
      <PageHero title={title} description={lead} crumbs={[{ name: title, href: `/${page.slug}` }]} />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="min-w-0 lg:col-span-8">
          <RichContent html={html} sanitized />
        </div>
        <aside className="lg:col-span-4" aria-label="Thanh bên">
          <div className="space-y-8 lg:sticky lg:top-28">
            <TableOfContents items={toc} />
            <ContactCard />
          </div>
        </aside>
      </div>
    </>
  );
}

export default function ContentPage(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContentPageContent {...props} />
    </Suspense>
  );
}
