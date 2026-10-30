import type { Metadata } from "next";
import { LeadForm } from "@/components/forms/lead-form";
import { PageHero } from "@/components/site/page-hero";
import { ServiceGrid } from "@/components/site/service-grid";
import { extractLead } from "@/lib/content/html";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPage, listServices } from "@/server/pages";
import { getSettings } from "@/server/settings";

async function intro() {
  const page = await getPage("dich-vu");
  return page ? extractLead(page.contentHtml) : { heading: null, lead: null, rest: "" };
}

export async function generateMetadata(): Promise<Metadata> {
  const { heading, lead } = await intro();
  return buildMetadata({ title: heading ?? "Dịch vụ", description: lead, path: "/dich-vu" });
}

export default async function ServicesPage() {
  const [{ heading, lead }, services, home] = await Promise.all([intro(), listServices(), getSettings("home")]);
  return (
    <>
      <PageHero title={heading ?? "Dịch vụ"} description={lead} crumbs={[{ name: "Dịch vụ", href: "/dich-vu" }]} />
      <section className="bg-surface-card section-y">
        <div className="container-page">
          <ServiceGrid services={services} />
        </div>
      </section>
      <section className="bg-surface-neutral section-y" aria-labelledby="svc-contact">
        <div className="container-page grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="svc-contact" className="text-headline-lg-mobile lg:text-headline-lg">
              {home.contact.heading}
            </h2>
          </div>
          <div className="rounded-lg bg-surface-card p-6 shadow-form sm:p-8 lg:col-span-7">
            <LeadForm submitLabel={home.contact.submitLabel} />
          </div>
        </div>
      </section>
    </>
  );
}
