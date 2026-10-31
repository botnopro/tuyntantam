import { ArrowLeft, ArrowRight, CalendarDays, Clock, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { PostCard } from "@/components/blog/post-card";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { LeadForm } from "@/components/forms/lead-form";
import { AuthorBox } from "@/components/site/author-box";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { articleJsonLd, JsonLd } from "@/components/site/json-ld";
import { RichContent } from "@/components/site/rich-content";
import { ShareButtons } from "@/components/site/share-buttons";
import { withHeadingIds } from "@/lib/content/html";
import { categoryPath, postPath, tagPath } from "@/lib/content/routes";
import { slugParams } from "@/lib/content/static-params";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/url";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { formatDate, plainText } from "@/lib/utils/format";
import { allPublishedPostSlugs, getAdjacentPosts, getPostBySlug, getRelatedPosts } from "@/server/posts";
import { getSettings } from "@/server/settings";

type Props = PageProps<"/blog/[slug]">;

export async function generateStaticParams() {
  return slugParams((await allPublishedPostSlugs()).map((p) => p.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt || plainText(post.contentHtml, 160),
    path: postPath(post.slug),
    image: post.coverImage?.src,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

async function PostPageContent({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  if (!post) notFound();
  const [site, adjacent, related] = await Promise.all([
    getSettings("site"),
    post.publishedAt ? getAdjacentPosts(post.publishedAt) : Promise.resolve({ prev: null, next: null }),
    getRelatedPosts(
      post.id,
      post.categories.map((c) => c.slug),
    ),
  ]);
  const { html, toc } = withHeadingIds(sanitizeRichText(post.contentHtml));
  const cat = post.categories[0];

  return (
    <article>
      <header className="bg-surface-warm">
        <div className="container-page pt-10 pb-10 lg:pt-14">
          <Breadcrumbs
            items={[
              { name: "Blog", href: "/blog" },
              ...(cat ? [{ name: cat.name, href: categoryPath(cat.slug) }] : []),
              { name: post.title, href: postPath(post.slug) },
            ]}
          />
          <div className="max-w-4xl">
            {post.categories.length ? (
              <ul className="mb-4 flex flex-wrap gap-2">
                {post.categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={categoryPath(c.slug)} className="badge bg-secondary text-white hover:bg-secondary-deep">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <h1 className="text-headline-xl-mobile lg:text-headline-xl">{post.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-body-sm text-on-surface-variant">
              {post.authorName ? (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-4 text-primary" aria-hidden />
                  {post.authorName}
                </span>
              ) : null}
              {post.publishedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-primary" aria-hidden />
                  <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-primary" aria-hidden />
                {post.readingMinutes} phút đọc
              </span>
            </div>
          </div>
        </div>
      </header>

      {post.coverImage ? (
        <div className="container-page -mb-4 pt-8">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-container-high shadow-card lg:aspect-[21/9]">
            <Image
              src={post.coverImage.src}
              alt={post.coverImage.alt ?? post.title}
              fill
              priority
              sizes="(min-width: 1280px) 1232px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-8">
          <RichContent html={html} sanitized />

          {post.tags.length ? (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Chủ đề">
              {post.tags.map((t) => (
                <li key={t}>
                  <Link
                    href={tagPath(encodeURIComponent(t))}
                    className="inline-block rounded-xs bg-surface-container-low px-3 py-1.5 text-[13px] font-semibold text-slate-dark hover:bg-brand-subtle hover:text-primary"
                  >
                    #{t}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 border-t border-border-subtle pt-6">
            <ShareButtons url={absoluteUrl(postPath(post.slug))} title={post.title} />
          </div>

          <div className="mt-10">
            <AuthorBox />
          </div>

          {adjacent.prev || adjacent.next ? (
            <nav aria-label="Bài trước và bài sau" className="mt-10 grid gap-4 sm:grid-cols-2">
              {adjacent.prev ? (
                <Link href={postPath(adjacent.prev.slug)} className="group rounded-lg bg-surface-card p-5 shadow-xs hover:shadow-md">
                  <span className="inline-flex items-center gap-1 eyebrow">
                    <ArrowLeft className="size-3.5" aria-hidden /> Bài trước
                  </span>
                  <span className="mt-2 line-clamp-2 block font-display text-[17px] font-semibold text-slate-dark group-hover:text-primary">
                    {adjacent.prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {adjacent.next ? (
                <Link
                  href={postPath(adjacent.next.slug)}
                  className="group rounded-lg bg-surface-card p-5 text-right shadow-xs hover:shadow-md"
                >
                  <span className="inline-flex items-center gap-1 eyebrow">
                    Bài sau <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                  <span className="mt-2 line-clamp-2 block font-display text-[17px] font-semibold text-slate-dark group-hover:text-primary">
                    {adjacent.next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>

        <aside className="lg:col-span-4" aria-label="Thanh bên">
          <div className="space-y-8 lg:sticky lg:top-28">
            <TableOfContents items={toc} />
            <section className="relative overflow-hidden rounded-lg bg-surface-card p-6 shadow-form">
              <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-primary-container" />
              <h2 className="text-headline-sm">Liên hệ với Tuyn</h2>
              <LeadForm className="mt-5" compact submitLabel="Gửi cho Tuyn" />
            </section>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="bg-surface-warm section-y" aria-labelledby="related-heading">
          <div className="container-page">
            <h2 id="related-heading" className="mb-8 text-headline-lg-mobile lg:text-headline-lg">
              Bài viết liên quan
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd data={articleJsonLd(post, site)} />
    </article>
  );
}

export default function PostPage(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PostPageContent {...props} />
    </Suspense>
  );
}
