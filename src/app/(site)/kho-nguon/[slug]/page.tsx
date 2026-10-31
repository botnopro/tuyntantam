import { Bath, BedDouble, Building2, Check, Compass, Layers, MapPin, MessageCircle, Phone, Ruler, Sofa } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { SocialIcon } from "@/components/icons/social";
import { Gallery } from "@/components/property/gallery";
import { InquiryTabs } from "@/components/property/inquiry-tabs";
import { AddressMap } from "@/components/property/address-map";
import { ListingBadge, PropertyCard } from "@/components/property/property-card";
import { isDemoListing } from "@/lib/content/demo";
import { CompareButton, FavoriteButton } from "@/components/property/save-buttons";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd, listingJsonLd } from "@/components/site/json-ld";
import { RichContent } from "@/components/site/rich-content";
import { ShareButtons } from "@/components/site/share-buttons";
import { FURNISHING, propertyTypeLabel } from "@/lib/content/property-options";
import { propertyPath } from "@/lib/content/routes";
import { PLACEHOLDER_SLUG, slugParams } from "@/lib/content/static-params";
import { buildMetadata } from "@/lib/seo/metadata";
import { absoluteUrl } from "@/lib/seo/url";
import { safeVirtualTourUrl } from "@/lib/security/sanitize";
import { formatArea, formatDate, formatPrice, plainText, telHref } from "@/lib/utils/format";
import { allPublishedPropertySlugs, getPropertyBySlug, similarProperties } from "@/server/properties";
import { getSettings } from "@/server/settings";

type Props = PageProps<"/kho-nguon/[slug]">;

export async function generateStaticParams() {
  return slugParams((await allPublishedPropertySlugs()).map((p) => p.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPropertyBySlug((await params).slug);
  if (!p) return {};
  return buildMetadata({
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.summary || plainText(p.descriptionHtml ?? "", 160),
    path: propertyPath(p.slug),
    image: p.images[0]?.src,
  });
}

async function PropertyPageContent({ params }: Props) {
  const { slug } = await params;
  const p = slug === PLACEHOLDER_SLUG ? null : await getPropertyBySlug(slug);
  if (!p) notFound();
  const [site, similar] = await Promise.all([getSettings("site"), similarProperties(p)]);
  const price = formatPrice(p.price, p.listingType, p.priceNote);
  const location = [p.address, p.ward, p.district, p.city].filter(Boolean).join(", ");
  const tour = safeVirtualTourUrl(p.virtualTourUrl);
  const c = site.contacts;

  const overview = [
    { icon: Building2, label: "Loại hình", value: propertyTypeLabel(p.propertyType) },
    p.bedrooms != null && { icon: BedDouble, label: "Phòng ngủ", value: String(p.bedrooms) },
    p.bathrooms != null && { icon: Bath, label: "Phòng tắm", value: String(p.bathrooms) },
    p.area != null && { icon: Ruler, label: "Diện tích", value: formatArea(p.area)! },
    p.floors != null && { icon: Layers, label: "Số tầng", value: String(p.floors) },
    p.direction && { icon: Compass, label: "Hướng", value: p.direction },
    p.furnishing && { icon: Sofa, label: "Nội thất", value: FURNISHING[p.furnishing as keyof typeof FURNISHING] ?? p.furnishing },
  ].filter(Boolean) as { icon: typeof Bath; label: string; value: string }[];

  const sections = [
    { id: "tong-quan", label: "Tổng quan" },
    p.descriptionHtml && { id: "mo-ta", label: "Mô tả" },
    p.amenities.length && { id: "tien-ich", label: "Tiện ích" },
    (p.videoYoutubeId || tour) && { id: "video", label: "Video" },
    location && { id: "vi-tri", label: "Vị trí" },
  ].filter(Boolean) as { id: string; label: string }[];

  return (
    <>
      <div className="bg-surface-warm">
        <div className="container-page pt-8 pb-8">
          <Breadcrumbs
            items={[
              { name: "Kho nguồn", href: "/kho-nguon" },
              { name: p.title, href: propertyPath(p.slug) },
            ]}
          />
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <ListingBadge type={p.listingType} />
                {p.featured ? <span className="badge bg-brand-strong text-white">Nổi bật</span> : null}
              </div>
              <h1 className="text-headline-lg-mobile lg:text-headline-lg">{p.title}</h1>
              {location ? (
                <p className="mt-2 flex items-start gap-1.5 text-body-md text-on-surface-variant">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  {location}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <p>
                <span className="font-sans text-[30px] leading-none font-extrabold text-primary">{price.main}</span>
                {price.unit ? <span className="ml-1 text-body-md text-on-surface-variant">{price.unit}</span> : null}
              </p>
              <div className="flex gap-2">
                <CompareButton slug={p.slug} title={p.title} withLabel className="shadow-xs" />
                <FavoriteButton slug={p.slug} title={p.title} className="shadow-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page pt-6">
        {isDemoListing(p.slug) ? (
          <p className="mb-4 rounded-sm bg-surface-muted px-4 py-2.5 text-body-sm text-on-surface-variant" role="note">
            Đây là <strong className="text-slate-dark">tin mẫu</strong> để minh hoạ giao diện, không phải bất động sản đang cho thuê/bán.
          </p>
        ) : null}
        <Gallery images={p.images} title={p.title} />
      </div>

      {sections.length > 2 ? (
        <nav
          aria-label="Mục trong trang"
          className="sticky top-20 z-30 mt-6 border-y border-border-subtle bg-surface-card/95 backdrop-blur"
        >
          <ul className="container-page flex gap-1 overflow-x-auto py-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-xs px-3 py-2 font-sans text-subheading tracking-wider whitespace-nowrap text-on-surface-variant uppercase hover:bg-surface-container-low hover:text-on-surface"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="container-page grid gap-10 py-10 pb-28 lg:grid-cols-12 lg:gap-12 lg:pb-16">
        <div className="min-w-0 space-y-12 lg:col-span-8">
          <section id="tong-quan" className="scroll-mt-36" aria-labelledby="h-overview">
            <h2 id="h-overview" className="text-headline-md">
              Tổng quan
            </h2>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {overview.map((o) => (
                <div key={o.label} className="rounded-sm bg-surface-neutral p-4">
                  <dt className="flex items-center gap-2 text-label-caps tracking-wider text-on-surface-variant uppercase">
                    <o.icon className="size-4 shrink-0 text-primary" aria-hidden />
                    {o.label}
                  </dt>
                  <dd className="mt-1 pl-6 text-spec-num text-slate-dark">{o.value}</dd>
                </div>
              ))}
            </dl>
            {p.summary ? <p className="mt-6 text-body-lg text-on-surface-variant">{p.summary}</p> : null}
            {p.publishedAt ? <p className="mt-3 text-body-sm text-on-surface-variant">Cập nhật: {formatDate(p.updatedAt)}</p> : null}
          </section>

          {p.descriptionHtml ? (
            <section id="mo-ta" className="scroll-mt-36" aria-labelledby="h-desc">
              <h2 id="h-desc" className="mb-5 text-headline-md">
                Mô tả
              </h2>
              <RichContent html={p.descriptionHtml} className="max-w-none" />
            </section>
          ) : null}

          {p.amenities.length ? (
            <section id="tien-ich" className="scroll-mt-36" aria-labelledby="h-amen">
              <h2 id="h-amen" className="mb-5 text-headline-md">
                Tiện ích
              </h2>
              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                {p.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-2 text-body-md">
                    <Check className="size-4 text-primary" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {p.videoYoutubeId || tour ? (
            <section id="video" className="scroll-mt-36 space-y-6" aria-labelledby="h-video">
              <h2 id="h-video" className="text-headline-md">
                Video & tour 360°
              </h2>
              {p.videoYoutubeId ? (
                <div className="aspect-video overflow-hidden rounded-lg bg-ink">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(p.videoYoutubeId)}`}
                    title={`Video ${p.title}`}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                  />
                </div>
              ) : null}
              {tour ? (
                <div className="aspect-video overflow-hidden rounded-lg bg-ink">
                  <iframe src={tour} title={`Tour 360° ${p.title}`} loading="lazy" allowFullScreen className="size-full" />
                </div>
              ) : null}
            </section>
          ) : null}

          {location ? (
            <section id="vi-tri" className="scroll-mt-36" aria-labelledby="h-map">
              <h2 id="h-map" className="mb-5 text-headline-md">
                Vị trí
              </h2>
              <AddressMap address={location} />
            </section>
          ) : null}

          <div className="border-t border-border-subtle pt-6">
            <ShareButtons url={absoluteUrl(propertyPath(p.slug))} title={p.title} />
          </div>
        </div>

        <aside className="lg:col-span-4" aria-label="Liên hệ">
          <div className="space-y-6 lg:sticky lg:top-36">
            <InquiryTabs slug={p.slug} title={p.title} />
            <div className="grid grid-cols-2 gap-2">
              <a href={telHref(c.phone)} className="btn-ghost">
                <Phone className="size-4" aria-hidden /> Gọi
              </a>
              {c.zalo ? (
                <a href={c.zalo} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                  <SocialIcon platform="zalo" className="size-5 text-zalo" /> Zalo
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {similar.length ? (
        <section className="bg-surface-warm section-y" aria-labelledby="similar-h">
          <div className="container-page">
            <h2 id="similar-h" className="mb-8 text-headline-lg-mobile lg:text-headline-lg">
              Bất động sản tương tự
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => (
                <PropertyCard key={s.id} p={s} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Thanh liên hệ dính đáy trên mobile (Houzez mobile-property-contact) */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-2 border-t border-border-subtle bg-surface-card p-3 lg:hidden print:hidden"
        data-mobile-contact
      >
        <a href={telHref(c.phone)} className="btn-primary px-2 py-3">
          <Phone className="size-4" aria-hidden /> Gọi
        </a>
        {c.zalo ? (
          <a href={c.zalo} target="_blank" rel="noopener noreferrer" className="btn-ghost border border-border-subtle px-2 py-3">
            <SocialIcon platform="zalo" className="size-5 text-zalo" /> Zalo
          </a>
        ) : (
          <span />
        )}
        <a href="#lien-he-bds" className="btn-ghost border border-border-subtle px-2 py-3">
          <MessageCircle className="size-4" aria-hidden /> Hẹn xem
        </a>
      </div>

      <JsonLd data={listingJsonLd(p)} />
    </>
  );
}

export default function PropertyPage(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PropertyPageContent {...props} />
    </Suspense>
  );
}
