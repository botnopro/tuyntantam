import type { Metadata } from "next";
import Link from "@/components/ui/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/site/page-skeleton";
import { LeadForm } from "@/components/forms/lead-form";
import { ContactCard } from "@/components/site/contact-card";
import { PageHero } from "@/components/site/page-hero";
import { RichContent } from "@/components/site/rich-content";
import { extractLead } from "@/lib/content/html";
import { servicePath } from "@/lib/content/routes";
import { buildMetadata } from "@/lib/seo/metadata";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { getService, listServices } from "@/server/pages";

type Props = PageProps<"/dich-vu/[slug]">;

export async function generateStaticParams() {
  return (await listServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService((await params).slug);
  if (!s) return {};
  return buildMetadata({ title: s.title, description: s.summary, path: servicePath(s.slug) });
}

async function ServicePageContent({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const others = (await listServices()).filter((s) => s.slug !== service.slug);
  const { rest } = extractLead(sanitizeRichText(service.contentHtml));
  const viewing = service.slug === "dan-khach-xem-nha";

  return (
    <>
      <PageHero
        title={service.title}
        description={service.summary}
        crumbs={[
          { name: "Dịch vụ", href: "/dich-vu" },
          { name: service.title, href: servicePath(service.slug) },
        ]}
      />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="min-w-0 lg:col-span-8">
          {/* Trang gốc chưa có nội dung ("đang được cập nhật") → chỉ hiển thị phần mô tả dịch vụ ở hero */}
          {!service.isPlaceholder && rest.trim() ? <RichContent html={rest} sanitized /> : null}
          <section className="relative mt-2 overflow-hidden rounded-lg bg-surface-card p-6 shadow-form sm:p-8" aria-labelledby="svc-form">
            <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-primary-container" />
            <h2 id="svc-form" className="text-headline-md">
              {viewing ? "Đặt lịch dẫn xem nhà" : `Liên hệ: ${service.title}`}
            </h2>
            <LeadForm className="mt-6" variant={viewing ? "viewing" : "contact"} defaultInterest={viewing ? "thue-nha" : undefined} />
          </section>
        </div>
        <aside className="space-y-8 lg:col-span-4" aria-label="Thanh bên">
          <ContactCard />
          {others.length ? (
            <nav aria-label="Dịch vụ khác" className="rounded-lg bg-surface-card p-5 shadow-xs">
              <p className="font-sans text-subheading tracking-wider text-slate-dark uppercase">Dịch vụ khác</p>
              <ul className="mt-3 divide-y divide-border-subtle">
                {others.map((s) => (
                  <li key={s.slug}>
                    <Link href={servicePath(s.slug)} className="block py-2.5 text-body-md hover:text-primary">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </aside>
      </div>
    </>
  );
}

export default function ServicePage(props: Props) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ServicePageContent {...props} />
    </Suspense>
  );
}
