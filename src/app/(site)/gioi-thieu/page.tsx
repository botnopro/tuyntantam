import { ArrowRight, Mail, MapPin, Phone, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/ui/link";
import { PostCard } from "@/components/blog/post-card";
import { LeadForm } from "@/components/forms/lead-form";
import { SOCIAL_BUTTON, SocialIcon } from "@/components/icons/social";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd, personJsonLd } from "@/components/site/json-ld";
import { RichContent } from "@/components/site/rich-content";
import { SectionHeader } from "@/components/site/section-header";
import { ServiceGrid } from "@/components/site/service-grid";
import { Testimonials } from "@/components/site/testimonials";
import { buildMetadata } from "@/lib/seo/metadata";
import { cn } from "@/lib/utils/cn";
import { telHref } from "@/lib/utils/format";
import { getPage, listServices } from "@/server/pages";
import { latestPosts } from "@/server/posts";
import { getSettings } from "@/server/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [agent, page] = await Promise.all([getSettings("agent"), getPage("gioi-thieu")]);
  return buildMetadata({
    title: page?.seoTitle || "Giới thiệu",
    description: agent.pageIntro.text || agent.shortBio,
    path: "/gioi-thieu",
    image: agent.portrait?.src,
  });
}

export default async function AboutPage() {
  const [site, home, agent, services, posts] = await Promise.all([
    getSettings("site"),
    getSettings("home"),
    getSettings("agent"),
    listServices(),
    latestPosts(4),
  ]);
  const c = site.contacts;
  const experience = home.about.stats[0];
  const [greeting, vision, ...journey] = agent.story;

  return (
    <>
      {/* Hero kiểu trang cá nhân môi giới (Houzez): chữ bên trái, chân dung tách nền bên phải, đáy cong */}
      <section className="relative isolate overflow-hidden bg-surface-container-low">
        <div className="container-page grid gap-10 pt-8 lg:min-h-[620px] lg:grid-cols-12 lg:gap-6 lg:pt-10">
          <div className="pb-4 lg:col-span-7 lg:self-center lg:pb-28">
            <Breadcrumbs items={[{ name: "Giới thiệu", href: "/gioi-thieu" }]} />
            <h1>
              <span className="block font-display text-[48px] leading-[1.1] font-light tracking-tight text-slate-dark sm:text-[64px] lg:text-[80px]">
                {agent.alias}
              </span>
              <span className="mt-4 block font-sans text-subheading tracking-[0.25em] text-primary uppercase">{agent.title}</span>
            </h1>
            <p className="mt-6 max-w-xl text-body-lg text-on-surface-variant">{agent.pageIntro.text}</p>

            <ul className="mt-8 space-y-3 text-body-md text-on-surface">
              {c.area ? (
                <li className="flex items-center gap-3">
                  <MapPin className="size-5 shrink-0 text-primary" aria-hidden />
                  {c.area}
                </li>
              ) : null}
              <li>
                <a href={telHref(c.phone)} className="inline-flex items-center gap-3 hover:text-primary">
                  <Phone className="size-5 shrink-0 text-primary" aria-hidden />
                  {c.phoneDisplay}
                </a>
              </li>
              {c.emails[0] ? (
                <li>
                  <a href={`mailto:${c.emails[0]}`} className="inline-flex items-center gap-3 break-all hover:text-primary">
                    <Mail className="size-5 shrink-0 text-primary" aria-hidden />
                    {c.emails[0]}
                  </a>
                </li>
              ) : null}
            </ul>

            {site.socials.length ? (
              <div className="mt-8">
                <p className="text-label-caps tracking-[0.25em] text-on-surface-variant uppercase">{home.hero.socialsLabel}</p>
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {site.socials.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className={cn(
                          "grid size-11 place-items-center rounded-full border border-border-subtle bg-surface-card transition-colors",
                          SOCIAL_BUTTON[s.platform] ?? "text-on-surface-variant hover:text-primary",
                        )}
                      >
                        <SocialIcon platform={s.platform} className="size-[18px]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#about-contact" className="btn-primary px-6 py-4">
                {home.contact.submitLabel}
              </a>
              <Link href="/dich-vu" className="btn-ghost px-6 py-4">
                Dịch vụ của Tuyn
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>

          {agent.portrait ? (
            <div className="relative mx-auto w-full max-w-xs self-end sm:max-w-sm lg:col-span-5 lg:max-w-none">
              <div aria-hidden className="absolute inset-x-[8%] top-[18%] bottom-0 -z-10 rounded-t-full bg-brand-subtle" />
              <Image
                src={agent.portrait.src}
                alt={`${agent.alias} — ${agent.title}`}
                width={400}
                height={650}
                priority
                sizes="(min-width: 1024px) 400px, 320px"
                className="mx-auto h-auto w-full max-w-[400px]"
              />
              {experience ? (
                <div className="absolute bottom-24 -left-4 hidden items-center gap-3 rounded-sm bg-surface-card p-4 shadow-xl lg:flex">
                  <span className="grid size-11 place-items-center rounded-sm bg-brand-subtle text-primary">
                    <Star className="size-5 fill-current" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-sans text-[22px] leading-none font-bold text-slate-dark">{experience.display}</span>
                    <span className="mt-1 block text-body-sm text-on-surface-variant">{experience.label}</span>
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        {/* Đường cong đáy, cùng màu nền section kế tiếp */}
        <svg
          aria-hidden
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          className="absolute inset-x-0 -bottom-px h-8 w-full fill-surface-card lg:h-14"
        >
          <path d="M0 60V28C240 4 480 -4 720 14s480 36 720 10v36z" />
        </svg>
      </section>

      {/* Số liệu */}
      {home.about.stats.length ? (
        <section className="bg-surface-card py-12 lg:py-16" aria-label="Số liệu">
          <dl className="container-page grid gap-6 sm:grid-cols-3">
            {home.about.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse rounded-sm bg-surface-warm p-6 shadow-xs">
                <dt className="mt-2 text-[17px] font-semibold text-slate-dark">{s.label}</dt>
                <dd className="font-sans text-[40px] leading-none font-extrabold text-primary">{s.display}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* Lời chào + Tầm nhìn */}
      {greeting || vision ? (
        <section className="bg-surface-neutral section-y">
          <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-16">
            {[greeting, vision].filter(Boolean).map((s) => (
              <div key={s!.heading}>
                <h2 className="mb-6 text-headline-lg-mobile lg:text-headline-lg">{s!.heading}</h2>
                <RichContent
                  html={s!.html}
                  className="text-body-md [&_img]:max-h-96 [&_img]:w-full [&_img]:object-cover [&_img]:object-top"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Hành trình */}
      {journey.map((s) => (
        <section key={s.heading} className="bg-surface-card section-y">
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-8 text-headline-lg-mobile lg:text-headline-lg">{s.heading}</h2>
              <RichContent html={s.html} className="max-w-none" />
            </div>
          </div>
        </section>
      ))}

      {/* Dịch vụ */}
      {services.length ? (
        <section className="bg-surface-card section-y">
          <div className="container-page">
            <SectionHeader title="Dịch vụ" link={{ href: "/dich-vu", label: "Xem chi tiết" }} />
            <ServiceGrid services={services} />
          </div>
        </section>
      ) : null}

      <Testimonials heading={home.testimonials.heading} items={home.testimonials.items} tone="strong" />

      {/* Liên hệ */}
      <section className="bg-surface-card section-y" aria-labelledby="about-contact">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <h2 id="about-contact" className="text-headline-lg-mobile lg:text-headline-lg">
              {home.contact.heading}
            </h2>
            <ul className="mt-8 space-y-4">
              <li className="flex gap-4 rounded-sm bg-surface-warm p-5">
                <Phone className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-display text-[17px] font-semibold text-slate-dark">Điện thoại</p>
                  <a href={telHref(c.phone)} className="text-body-md text-on-surface-variant hover:text-primary">
                    {c.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex gap-4 rounded-sm bg-surface-warm p-5">
                <Mail className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-display text-[17px] font-semibold text-slate-dark">Email</p>
                  {c.emails.map((e) => (
                    <a key={e} href={`mailto:${e}`} className="block text-body-md break-all text-on-surface-variant hover:text-primary">
                      {e}
                    </a>
                  ))}
                </div>
              </li>
              {c.area ? (
                <li className="flex gap-4 rounded-sm bg-surface-warm p-5">
                  <MapPin className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="font-display text-[17px] font-semibold text-slate-dark">Khu vực</p>
                    <p className="text-body-md text-on-surface-variant">{c.area}</p>
                  </div>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-surface-warm p-6 shadow-float sm:p-10">
              <LeadForm submitLabel={home.contact.submitLabel} />
            </div>
          </div>
        </div>
      </section>

      {posts.length ? (
        <section className="bg-surface-warm section-y">
          <div className="container-page">
            <SectionHeader title={home.posts.heading} link={{ href: "/blog", label: "Xem tất cả" }} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <JsonLd data={personJsonLd(agent, site)} />
    </>
  );
}
