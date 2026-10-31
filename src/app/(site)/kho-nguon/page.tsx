import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadForm } from "@/components/forms/lead-form";
import { FilterForm } from "@/components/property/filter-form";
import { LazyMap } from "@/components/property/lazy-map";
import { PropertyCard } from "@/components/property/property-card";
import { ResultsToolbar } from "@/components/property/results-toolbar";
import { ContactCard } from "@/components/site/contact-card";
import { EmptyState } from "@/components/site/empty-state";
import { PageHero } from "@/components/site/page-hero";
import { buildQuery, Pagination } from "@/components/site/pagination";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatPrice } from "@/lib/utils/format";
import { flattenParams } from "@/lib/validation/common";
import { propertyFilterSchema, type PropertyFilters } from "@/lib/validation/property";
import { propertyFilterOptions, publishedPropertyCount, searchProperties } from "@/server/properties";
import { getPage } from "@/server/pages";
import { getSettings } from "@/server/settings";

export async function generateMetadata(): Promise<Metadata> {
  // Mô tả SEO lấy từ trang "Kho Nguồn" cũ của site gốc (admin sửa được)
  const page = await getPage("kho-nguon");
  return buildMetadata({ title: "Kho nguồn", description: page?.seoDescription, path: "/kho-nguon" });
}

type SP = Record<string, string | string[] | undefined>;

/** Chuẩn hoá query: giá nhập theo triệu (minPriceM/maxPriceM) → VND. */
function parseFilters(sp: SP): { filters: PropertyFilters; view: "grid" | "list" | "map" } {
  const flat = flattenParams(sp, ["amenities"]);
  const toVnd = (v: unknown) =>
    typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? String(Number(v) * 1e6) : undefined;
  const filters = propertyFilterSchema.parse({
    ...flat,
    minPrice: flat.minPrice ?? toVnd(flat.minPriceM),
    maxPrice: flat.maxPrice ?? toVnd(flat.maxPriceM),
  });
  const view = flat.view === "list" || flat.view === "map" ? flat.view : "grid";
  return { filters, view };
}

export default async function PropertiesPage(props: PageProps<"/kho-nguon">) {
  const total = await publishedPropertyCount();
  return (
    <>
      <PageHero title="Kho nguồn" crumbs={[{ name: "Kho nguồn", href: "/kho-nguon" }]} />
      {total === 0 ? (
        <NoListings />
      ) : (
        <Suspense fallback={<div className="container-page h-96 py-12" aria-busy="true" />}>
          <Listings searchParams={props.searchParams} />
        </Suspense>
      )}
    </>
  );
}

async function NoListings() {
  const site = await getSettings("site");
  const { rentGroupUrl, saleGroupUrl } = site.propertySources;
  return (
    <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
      <div className="lg:col-span-8">
        <EmptyState
          icon={<Building2 className="size-6" aria-hidden />}
          title="Danh sách đang được cập nhật"
          description="Tuyn đang tổng hợp nguồn nhà thuê và bán trong các nhóm Zalo. Bạn có thể xem nguồn ở đó, hoặc gửi nhu cầu để Tuyn tìm giúp."
          actions={[
            ...(rentGroupUrl ? [{ href: rentGroupUrl, label: "Nguồn BĐS thuê", external: true }] : []),
            ...(saleGroupUrl ? [{ href: saleGroupUrl, label: "Nguồn BĐS bán", external: true, variant: "ghost" as const }] : []),
          ]}
        />
      </div>
      <aside className="lg:col-span-4">
        <section className="relative overflow-hidden rounded-lg bg-surface-card p-6 shadow-form" aria-labelledby="need-heading">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-primary-container" />
          <h2 id="need-heading" className="text-headline-sm">
            Gửi nhu cầu thuê / mua
          </h2>
          <LeadForm className="mt-5" compact defaultInterest="thue-nha" />
        </section>
      </aside>
    </div>
  );
}

async function Listings({ searchParams }: Pick<PageProps<"/kho-nguon">, "searchParams">) {
  const { filters, view } = parseFilters(await searchParams);
  const [result, options] = await Promise.all([
    searchProperties(view === "map" ? { ...filters, limit: 50, page: 1 } : filters),
    propertyFilterOptions(),
  ]);
  const points = result.items
    .filter((p) => p.lat != null && p.lng != null)
    .map((p) => {
      const price = formatPrice(p.price, p.listingType, p.priceNote);
      return { slug: p.slug, title: p.title, lat: p.lat!, lng: p.lng!, price: `${price.main}${price.unit ?? ""}` };
    });

  return (
    <>
      <FilterForm filters={filters} options={options} view={view} />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14">
        <div className="min-w-0 lg:col-span-8">
          <ResultsToolbar total={result.total} sort={filters.sort} view={view} hasGeo={options.hasGeo} />
          <div className="mt-6">
            {result.items.length === 0 ? (
              <EmptyState
                title="Không có bất động sản phù hợp"
                description="Thử nới rộng bộ lọc (khu vực, khoảng giá) hoặc gửi nhu cầu để Tuyn tìm giúp."
                actions={[{ href: "/kho-nguon", label: "Xoá bộ lọc" }]}
              />
            ) : view === "map" ? (
              points.length ? (
                <LazyMap points={points} />
              ) : (
                <EmptyState
                  title="Chưa có vị trí trên bản đồ"
                  description="Các tin phù hợp chưa có toạ độ. Xem dạng lưới để thấy đầy đủ."
                  actions={[{ href: buildQuery("/kho-nguon", { view: "grid" }), label: "Xem dạng lưới" }]}
                />
              )
            ) : (
              <div className={view === "list" ? "grid gap-6" : "grid gap-5 md:grid-cols-2"}>
                <h2 className="sr-only">Kết quả tìm kiếm</h2>
                {result.items.map((p, i) => (
                  <PropertyCard key={p.id} p={p} layout={view === "list" ? "list" : "grid"} priority={i < 2} />
                ))}
              </div>
            )}
          </div>
          {view !== "map" ? (
            <div className="mt-10">
              <Pagination
                page={result.page}
                pages={result.pages}
                total={result.total}
                pageSize={result.limit}
                noun="bất động sản"
                hrefFor={(n) =>
                  buildQuery("/kho-nguon", {
                    ...Object.fromEntries(
                      Object.entries(filters)
                        .filter(([k]) => !["page", "limit"].includes(k))
                        .map(([k, v]) => [k, v as string]),
                    ),
                    sort: filters.sort === "newest" ? undefined : filters.sort,
                    view: view === "grid" ? undefined : view,
                    page: n,
                  })
                }
              />
            </div>
          ) : null}
        </div>
        <aside className="space-y-8 lg:col-span-4" aria-label="Thanh bên">
          <ContactCard />
          <section className="relative overflow-hidden rounded-lg bg-surface-card p-6 shadow-form" aria-labelledby="req-heading">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-primary-container" />
            <h2 id="req-heading" className="text-headline-sm">
              Nhờ Tuyn tìm nhà
            </h2>
            <LeadForm className="mt-5" compact defaultInterest="thue-nha" />
          </section>
        </aside>
      </div>
    </>
  );
}
