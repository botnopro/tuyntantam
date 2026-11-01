import { ArrowRight, BriefcaseBusiness, GraduationCap, MapPin, Phone, Search, Users, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/ui/link";
import { PostCard } from "@/components/blog/post-card";
import { LeadForm } from "@/components/forms/lead-form";
import { SOCIAL_BUTTON, SocialIcon } from "@/components/icons/social";
import { PropertyCarousel, type CarouselSlide } from "@/components/property/property-carousel";
import { PropertyCard } from "@/components/property/property-card";
import { HeroSearch } from "@/components/property/hero-search";
import { SectionHeader } from "@/components/site/section-header";
import { Testimonials } from "@/components/site/testimonials";
import { AREA_IMAGES } from "@/lib/content/demo";
import { LISTING_TYPES } from "@/lib/content/property-options";
import { buildMetadata } from "@/lib/seo/metadata";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { cn } from "@/lib/utils/cn";
import { telHref } from "@/lib/utils/format";
import { latestPosts } from "@/server/posts";
import {
  districtsWithCounts,
  featuredProperties,
  latestProperties,
  propertyFilterOptions,
  publishedPropertyCount,
} from "@/server/properties";
import { getSettings } from "@/server/settings";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSettings("site");
  return { ...buildMetadata({ title: site.seo.title, description: site.seo.description, path: "/" }), title: { absolute: site.seo.title } };
}

const SERVICE_ICONS: Record<string, typeof Users> = {
  "fas-user-tie": BriefcaseBusiness,
  "fas-user-friends": Users,
  "fas-users": GraduationCap,
  "fas-users-cog": Wrench,
};

export default async function HomePage() {
  const [site, home, agent, posts, listingCount] = await Promise.all([
    getSettings("site"),
    getSettings("home"),
    getSettings("agent"),
    latestPosts(4),
    publishedPropertyCount(),
  ]);
  const hasListings = listingCount > 0;
  const [featured, latestRent, areas, filterOptions] = hasListings
    ? await Promise.all([featuredProperties(8), latestProperties("RENT", 8), districtsWithCounts(5), propertyFilterOptions()])
    : [[], [], [], null];

  // Tab theo khu vực có nhiều tin nhất (giống tab thành phố của Houzez)
  const topDistricts = areas.slice(0, 4).map((a) => a.district);
  const featuredSlides: CarouselSlide[] = featured.map((p, i) => ({
    key: p.id,
    tabs: [p.district ?? "", p.listingType],
    node: <PropertyCard p={p} priority={i === 0} />,
  }));
  const rentSlides: CarouselSlide[] = latestRent.map((p) => ({ key: p.id, tabs: [], node: <PropertyCard p={p} /> }));

  return (
    <>
      {/* 1. Hero kiểu trang cá nhân môi giới (Houzez): chữ + tìm kiếm bên trái, chân dung tách nền bên phải, đáy cong */}
      <section className="relative isolate overflow-hidden bg-surface-container-low">
        <div className="relative container-page lg:flex lg:min-h-[600px] lg:items-center">
          <div className="relative z-10 pt-12 pb-4 lg:w-[58%] lg:py-20 lg:pb-24">
            <h1>
              <span className="block font-display text-[44px] leading-[1.05] font-bold tracking-tight text-slate-dark sm:text-[60px] lg:text-[72px]">
                {agent.alias}
              </span>
              <span className="mt-4 block font-sans text-subheading tracking-[0.2em] text-primary uppercase">{agent.title}</span>
            </h1>
            <p className="mt-5 max-w-xl text-body-lg text-pretty text-on-surface-variant">{home.hero.text}</p>

            <div className="mt-9">
              {hasListings && filterOptions ? (
                <HeroSearch districts={filterOptions.districts} types={filterOptions.types} />
              ) : (
                <form action="/blog" role="search" className="flex gap-2 rounded-sm bg-surface-card p-2 shadow-float">
                  <label htmlFor="home-search" className="sr-only">
                    Tìm kiếm bài viết
                  </label>
                  <div className="flex flex-1 items-center gap-3 px-3">
                    <Search className="size-5 shrink-0 text-primary" aria-hidden />
                    <input
                      id="home-search"
                      name="q"
                      type="search"
                      placeholder="Tìm kiếm điều bạn muốn..."
                      className="h-12 w-full bg-transparent text-body-md placeholder:text-on-surface-variant/70 focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="btn-primary min-h-12 px-6">
                    <span className="hidden sm:inline">Tìm kiếm</span>
                    <Search className="size-4 sm:hidden" aria-label="Tìm kiếm" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body-md text-on-surface">
                {site.contacts.area ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="size-[18px] shrink-0 text-primary" aria-hidden />
                    {site.contacts.area}
                  </li>
                ) : null}
                <li>
                  <a href={telHref(site.contacts.phone)} className="inline-flex items-center gap-2 font-semibold hover:text-primary">
                    <Phone className="size-[18px] shrink-0 text-primary" aria-hidden />
                    {site.contacts.phoneDisplay}
                  </a>
                </li>
              </ul>
              {site.socials.length ? (
                <ul className="flex gap-2" aria-label={home.hero.socialsLabel}>
                  {site.socials.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className={cn(
                          "grid size-10 place-items-center rounded-full border border-border-subtle bg-surface-card transition-colors",
                          SOCIAL_BUTTON[s.platform] ?? "text-on-surface-variant hover:text-primary",
                        )}
                      >
                        <SocialIcon platform={s.platform} className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          {/* Chân dung toàn thân chạm đáy. Một ảnh duy nhất: mobile nằm dưới chữ, desktop neo bên phải */}
          {home.hero.image ? (
            <div className="pointer-events-none relative mx-auto h-[400px] max-w-sm sm:h-[460px] lg:absolute lg:inset-y-0 lg:right-0 lg:mx-0 lg:h-auto lg:w-[42%] lg:max-w-none">
              <Image
                src={home.hero.image.src}
                alt={`${agent.alias} — ${agent.title}`}
                width={400}
                height={650}
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 380px, 260px"
                className="absolute bottom-2 left-1/2 h-[96%] w-auto max-w-none -translate-x-1/2 drop-shadow-2xl"
              />
            </div>
          ) : null}
        </div>
        {/* Đường cong đáy, cùng màu nền section kế tiếp */}
        <svg
          aria-hidden
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className={cn("absolute inset-x-0 -bottom-px h-8 w-full lg:h-14", featuredSlides.length ? "fill-surface" : "fill-surface-warm")}
        >
          <path d="M0 60V28C240 4 480 -4 720 14s480 36 720 10v36z" />
        </svg>
      </section>

      {/* 2. BĐS nổi bật — carousel có tab khu vực */}
      {featuredSlides.length ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={`${listingCount} tin đang hiển thị`}
              title="Bất động sản nổi bật"
              link={{ href: "/kho-nguon", label: "Xem tất cả" }}
              className="reveal"
            />
            <div className="reveal">
              <PropertyCarousel
                label="Lọc theo khu vực"
                tabs={[
                  { id: "all", label: "Tất cả" },
                  ...topDistricts.map((d) => ({ id: d, label: d })),
                  ...(Object.keys(LISTING_TYPES) as ("RENT" | "SALE")[])
                    .filter((t) => featured.some((p) => p.listingType === t))
                    .map((t) => ({ id: t, label: LISTING_TYPES[t] })),
                ]}
                slides={featuredSlides}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* 3. Về Tuyn (Houzez "We help people buy, rent and sell") */}
      <section className={cn("bg-surface-warm section-y", !hasListings && "pt-16 lg:pt-24")}>
        <div className="container-page grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-7">
            <p className="mb-3 eyebrow-line">{home.about.heading}</p>
            <h2 className="text-headline-lg-mobile lg:text-headline-lg">{home.hero.heading}</h2>
            <div
              className="mt-5 space-y-4 text-body-md leading-relaxed text-on-surface-variant [&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-2 [&_a:hover]:underline"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(home.about.html) }}
            />
          </div>
          <div className="reveal lg:col-span-5">
            {home.about.stats.length ? (
              <dl className="grid grid-cols-3 gap-3">
                {home.about.stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse rounded-lg bg-surface-card p-4 text-center shadow-xs sm:p-5">
                    <dt className="mt-1 text-[12px] leading-tight font-semibold text-on-surface-variant sm:text-label-caps sm:tracking-wider sm:uppercase">
                      {s.label}
                    </dt>
                    <dd className="font-display text-[30px] leading-none font-bold text-primary sm:text-headline-lg">{s.display}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <div className="mt-8">
              <Link href="/gioi-thieu" className="btn-primary">
                Đọc hành trình của Tuyn
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Khám phá khu vực — lưới ảnh bento */}
      {areas.length ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader align="center" eyebrow="Khám phá" title="Tìm nhà theo khu vực" className="reveal" />
            <ul className="grid auto-rows-[220px] grid-cols-2 gap-4 md:auto-rows-[260px] md:grid-cols-4">
              {areas.map((a, i) => {
                const src = AREA_IMAGES[a.district] ?? a.image?.src;
                return (
                  <li key={a.district} className={cn("reveal", i === 0 && "col-span-2 row-span-2", i === 3 && "md:col-span-2")}>
                    <Link
                      href={`/kho-nguon?district=${encodeURIComponent(a.district)}`}
                      className="group relative flex h-full flex-col justify-end overflow-hidden rounded-lg bg-surface-container-high p-5 shadow-xs"
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                          className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-110"
                        />
                      ) : null}
                      <span aria-hidden className="absolute inset-0 overlay-bottom" />
                      <span className="relative text-label-caps tracking-wider text-brand-subtle uppercase">{a.n} tin đăng</span>
                      <span className={cn("relative font-display text-white", i === 0 ? "text-headline-lg" : "text-headline-sm")}>
                        {a.district}
                      </span>
                      <span className="relative mt-2 inline-flex items-center gap-1 text-body-sm font-semibold text-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100 motion-safe:translate-y-2 motion-safe:group-hover:translate-y-0">
                        Xem các tin <ArrowRight className="size-4" aria-hidden />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {/* 6. Tin cho thuê mới nhất */}
      {rentSlides.length ? (
        <section className="bg-surface-neutral section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={LISTING_TYPES.RENT}
              title="Tin cho thuê mới nhất"
              link={{ href: "/kho-nguon?listingType=RENT", label: "Xem tất cả" }}
              className="reveal"
            />
            <div className="reveal">
              <PropertyCarousel label="Tin cho thuê" tabs={[]} slides={rentSlides} />
            </div>
          </div>
        </section>
      ) : null}

      {/* 7. Dịch vụ */}
      {home.services.items.length ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader align="center" title={home.services.heading} className="reveal" />
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {home.services.items.map((s) => {
                const Icon = SERVICE_ICONS[s.icon] ?? BriefcaseBusiness;
                return (
                  <li key={s.title} className="reveal group card-lift rounded-lg bg-surface-card p-7 shadow-xs">
                    <span className="mb-5 grid size-12 place-items-center rounded-sm bg-brand-subtle text-primary transition-colors group-hover:bg-brand-strong group-hover:text-white">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <h3 className="text-headline-sm">{s.title}</h3>
                    <p className="mt-2 text-body-md leading-relaxed text-on-surface-variant">{s.text}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-10 text-center">
              <Link href="/dich-vu" className="btn-ghost">
                Xem các dịch vụ
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* 8. Cảm nhận khách hàng */}
      <Testimonials heading={home.testimonials.heading} items={home.testimonials.items} />

      {/* 9. Cộng đồng (CTA thật của site) */}
      {home.community ? (
        <section className="bg-ink py-10 text-white">
          <div className="reveal container-page flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <p className="max-w-2xl font-display text-headline-sm lg:text-headline-md">{home.community.heading}</p>
            <a
              href={home.community.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn shrink-0 rounded-sm bg-facebook px-5 py-3 text-white shadow-md hover:bg-facebook/90"
            >
              <SocialIcon platform="facebook" className="size-4" />
              {home.community.ctaLabel}
            </a>
          </div>
        </section>
      ) : null}

      {/* 10. Blog + form liên hệ */}
      <section className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          {posts.length ? (
            <div className="lg:col-span-8">
              <SectionHeader title={home.posts.heading} link={{ href: "/blog", label: "Xem tất cả" }} className="reveal" />
              <div className="grid gap-5 sm:grid-cols-2">
                {posts.map((p) => (
                  <div key={p.id} className="reveal">
                    <PostCard post={p} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className={cn("reveal", posts.length ? "lg:col-span-4" : "lg:col-span-6 lg:col-start-4")}>
            <div className="relative overflow-hidden rounded-lg bg-surface-card p-6 shadow-form sm:p-8 lg:sticky lg:top-28">
              <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-primary-container" />
              <h2 className="text-headline-md">{home.contact.heading}</h2>
              {site.contacts.area ? (
                <p className="mt-2 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  {site.contacts.area}
                </p>
              ) : null}
              <LeadForm
                className="mt-6"
                submitLabel={home.contact.submitLabel}
                labels={{ name: "Tên của bạn", phone: "Số điện thoại của bạn", message: "Lời nhắn của bạn" }}
                compact
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
