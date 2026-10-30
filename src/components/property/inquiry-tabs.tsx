"use client";

import { useState } from "react";
import { LeadForm } from "@/components/forms/lead-form";
import { cn } from "@/lib/utils/cn";

/** Sidebar tab "Đặt lịch xem / Hỏi thông tin" (Houzez property detail). */
export function InquiryTabs({ slug, title }: { slug: string; title: string }) {
  const [tab, setTab] = useState<"viewing" | "inquiry">("viewing");
  const tabs = [
    { key: "viewing", label: "Đặt lịch xem" },
    { key: "inquiry", label: "Hỏi thông tin" },
  ] as const;
  return (
    <section
      id="lien-he-bds"
      className="relative scroll-mt-28 overflow-hidden rounded-lg bg-surface-card shadow-form"
      aria-label="Liên hệ về bất động sản này"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-primary-container" />
      <div role="tablist" className="grid grid-cols-2 border-b border-border-subtle pt-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            id={`tab-${t.key}`}
            aria-selected={tab === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => setTab(t.key)}
            className={cn(
              "cursor-pointer py-3.5 font-sans text-subheading tracking-wider uppercase transition-colors",
              tab === t.key ? "border-b-2 border-primary-container text-primary" : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-6" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        <LeadForm key={tab} variant={tab} propertySlug={slug} propertyTitle={title} showInterest={false} compact />
      </div>
    </section>
  );
}
