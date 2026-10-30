import type { Metadata } from "next";
import { CompareTable } from "@/components/property/saved-properties";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ title: "So sánh bất động sản", path: "/so-sanh", noindex: true });

export default function ComparePage() {
  return (
    <>
      <PageHero title="So sánh bất động sản" crumbs={[{ name: "So sánh", href: "/so-sanh" }]} tone="plain" />
      <div className="container-page py-12">
        <CompareTable />
      </div>
    </>
  );
}
