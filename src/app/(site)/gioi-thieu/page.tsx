import { ArrowRight, BadgeCheck, Mail, MapPin, Phone, Star } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/ui/link";
import { PostCard } from "@/components/blog/post-card";
import { LeadForm } from "@/components/forms/lead-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd, personJsonLd } from "@/components/site/json-ld";
import { RichContent } from "@/components/site/rich-content";
import { SectionHeader } from "@/components/site/section-header";
import { ServiceGrid } from "@/components/site/service-grid";
import { Testimonials } from "@/components/site/testimonials";
import { buildMetadata } from "@/lib/seo/metadata";
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
      {/* Hero */}
      <section className="overflow-hidden bg-surface-warm">
        <div className="container-page grid items-center gap-12 pt-10 pb-16 lg:grid-cols-12 lg:pt-14 lg:pb-24">
          <div className="lg:col-span-7">
            <Breadcrumbs items={[{ name: "Giới thiệu", href: "/gioi-thieu" }]} />
            <h1 className="text-headline-xl-mobile lg:text-headline-xl">{agent.pageIntro.heading}</h1>
            <p className="mt-5 max-w-xl text-body-lg text-on-surface-variant">{agent.pageIntro.text}</p>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              <li className="inline-flex items-center gap-2 rounded-xs bg-surface-card px-4 py-2.5 text-body-sm shadow-xs">
                <BadgeCheck className="size-4 text-primary" aria-hidden />
                {agent.title}
              </li>
              {c.area ? (
                <li className="inline-flex items-center gap-2 rounded-xs bg-surface-card px-4 py-2.5 text-body-sm shadow-xs">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  {c.area}
                </li>
              ) : null}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={telHref(c.phone)} className="btn-primary px-6 py-4">
                <Phone className="size-4" aria-hidden />
                {c.phoneDisplay}
              </a>
              <Link href="/dich-vu" className="btn-ghost px-6 py-4">
                Dịch vụ của Tuyn
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          {agent.portrait ? (
            <div className="relative mx-auto w-full max-w-sm lg:col-span-5">
              <div aria-hidden className="absolute -inset-3 top-[10%] rotate-2 rounded-lg bg-brand-subtle sm:-inset-5 sm:top-[10%]" />
              <Image
                src={agent.portrait.src}
                alt={`${agent.alias} — ${agent.title}`}
                width={400}
                height={650}
                priority
                sizes="(min-width: 1024px) 380px, 80vw"
                className="relative mx-auto h-auto w-[85%]"
              />
              {experience ? (
                <div className="absolute bottom-4 left-0 flex items-center gap-3 rounded-sm bg-surface-card p-5 shadow-xl sm:-left-6">
                  <span className="grid size-12 place-items-center rounded-sm bg-brand-subtle text-primary">
                    <Star className="size-6 fill-current" aria-hidden />
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
