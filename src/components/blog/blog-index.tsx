import { Search, SearchX } from "lucide-react";
import Link from "@/components/ui/link";
import { EmptyState } from "@/components/site/empty-state";
import { buildQuery, Pagination } from "@/components/site/pagination";
import { categoryPath, tagPath } from "@/lib/content/routes";
import { cn } from "@/lib/utils/cn";
import type { PostFilters } from "@/lib/validation/post";
import { featuredPost, listCategories, listPosts, listTags } from "@/server/posts";
import { getSettings } from "@/server/settings";
import { FeaturedPost } from "./featured-post";
import { PostCard } from "./post-card";

/** Phần nội dung động của trang blog (đọc searchParams → nằm trong Suspense). */
export async function BlogIndex({ filters, basePath, showFeatured }: { filters: PostFilters; basePath: string; showFeatured: boolean }) {
  const [result, featured, categories, tags, site] = await Promise.all([
    listPosts(filters),
    showFeatured ? featuredPost() : Promise.resolve(null),
    listCategories(),
    listTags(),
    getSettings("site"),
  ]);
  const items = featured && showFeatured ? result.items.filter((p) => p.id !== featured.id) : result.items;
  const topCategories = categories.filter((c) => !c.parentSlug && c.count > 0);

  return (
    <>
      <div className="container-page">
        <nav aria-label="Chuyên mục" className="-mx-5 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
          <ul className="flex snap-x gap-2 md:flex-wrap">
            <li className="snap-start">
              <CategoryPill href="/blog" active={!filters.category && !filters.tag}>
                Tất cả
              </CategoryPill>
            </li>
            {topCategories.map((c) => (
              <li key={c.slug} className="snap-start">
                <CategoryPill href={categoryPath(c.slug)} active={filters.category === c.slug}>
                  {c.name}
                </CategoryPill>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {featured && showFeatured ? (
        <div className="container-page mt-8">
          <FeaturedPost post={featured} />
        </div>
      ) : null}

      <div className="container-page mt-10 grid gap-10 pb-16 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          {filters.q ? (
            <p className="mb-6 text-body-md text-on-surface-variant">
              Kết quả cho “<strong className="text-slate-dark">{filters.q}</strong>”: {result.total} bài viết
            </p>
          ) : null}
          {items.length ? (
            <div className="grid gap-8 md:grid-cols-2">
              {items.map((p, i) => (
                <PostCard key={p.id} post={p} priority={!showFeatured && i < 2} />
              ))}
            </div>
          ) : featured && showFeatured && result.total <= 1 ? null : (
            <EmptyState
              icon={<SearchX className="size-6" aria-hidden />}
              title="Chưa có bài viết phù hợp"
              description="Thử từ khoá khác hoặc xem tất cả bài viết của Tuyn."
              actions={[{ href: "/blog", label: "Xem tất cả bài viết" }]}
            />
          )}
          <div className="mt-10">
            <Pagination
              page={result.page}
              pages={result.pages}
              total={result.total}
              pageSize={result.limit}
              noun="bài viết"
              hrefFor={(n) => buildQuery(basePath, { q: filters.q, page: n })}
            />
          </div>
        </div>

        <aside className="space-y-8 lg:col-span-4" aria-label="Thanh bên">
          <form action="/blog" role="search" className="rounded-lg bg-surface-card p-5 shadow-xs">
            <label htmlFor="blog-q" className="label-field">
              Tìm bài viết
            </label>
            <div className="flex gap-2">
              <input
                id="blog-q"
                name="q"
                type="search"
                defaultValue={filters.q}
                placeholder="Nhập từ khoá…"
                className="field"
                maxLength={100}
              />
              <button type="submit" className="btn-primary px-3.5" aria-label="Tìm">
                <Search className="size-4" aria-hidden />
              </button>
            </div>
          </form>

          <section className="rounded-lg bg-surface-card p-5 shadow-xs" aria-labelledby="sb-cat">
            <h2 id="sb-cat" className="font-sans text-subheading tracking-wider text-slate-dark uppercase">
              Chuyên mục
            </h2>
            <ul className="mt-3 divide-y divide-border-subtle">
              {categories
                .filter((c) => c.count > 0)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={categoryPath(c.slug)}
                      className={cn(
                        "flex justify-between py-2.5 text-body-md hover:text-primary",
                        c.parentSlug && "pl-4",
                        filters.category === c.slug && "font-semibold text-primary",
                      )}
                    >
                      <span>{c.name}</span>
                      <span className="text-on-surface-variant">{c.count}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>

          {tags.length ? (
            <section className="rounded-lg bg-surface-card p-5 shadow-xs" aria-labelledby="sb-tag">
              <h2 id="sb-tag" className="font-sans text-subheading tracking-wider text-slate-dark uppercase">
                Chủ đề
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {tags.slice(0, 20).map((t) => (
                  <li key={t.tag}>
                    <Link
                      href={tagPath(encodeURIComponent(t.tag))}
                      className={cn(
                        "inline-block rounded-xs px-3 py-1.5 text-[13px] font-semibold transition-colors",
                        filters.tag === t.tag
                          ? "bg-brand-subtle text-primary"
                          : "bg-surface-container-low text-slate-dark hover:bg-brand-subtle hover:text-primary",
                      )}
                    >
                      {t.tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {site.community ? (
            <section className="rounded-lg bg-gradient-to-br from-brand-subtle to-surface-warm p-7 text-center shadow-card">
              <p className="font-display text-headline-sm text-slate-dark">{site.community.text}</p>
              <a href={site.community.url} target="_blank" rel="noopener noreferrer" className="mt-5 btn-primary w-full">
                {site.community.buttonLabel}
              </a>
            </section>
          ) : null}
        </aside>
      </div>
    </>
  );
}

function CategoryPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-xs px-5 font-sans text-subheading tracking-wider whitespace-nowrap uppercase transition-colors",
        active ? "bg-brand-strong text-white" : "bg-surface-container-low text-slate-dark hover:bg-surface-container",
      )}
    >
      {children}
    </Link>
  );
}

export function BlogIndexSkeleton() {
  return (
    <div className="container-page grid gap-8 pb-16 md:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Đang tải bài viết">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-80 animate-pulse card bg-surface-container-low" />
      ))}
    </div>
  );
}
