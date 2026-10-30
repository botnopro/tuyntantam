import { Quote, Star } from "lucide-react";
import Image from "next/image";
import type { Testimonial } from "@/lib/content/types";

export function Testimonials({ heading, items, tone = "light" }: { heading: string; items: Testimonial[]; tone?: "light" | "strong" }) {
  if (!items.length) return null;
  return (
    <section
      className={tone === "strong" ? "bg-brand-subtle section-y" : "bg-brand-subtle/40 section-y"}
      aria-labelledby="testimonials-heading"
    >
      <div className="container-page">
        <div className="mx-auto mb-10 max-w-2xl text-center lg:mb-14">
          <div className="mb-3 flex justify-center gap-1 text-gold-accent" role="img" aria-label="Đánh giá 5 trên 5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className="size-5 fill-current" aria-hidden />
            ))}
          </div>
          <h2 id="testimonials-heading" className="text-headline-lg-mobile lg:text-headline-lg">
            {heading}
          </h2>
        </div>
        <ul className="grid gap-8 md:grid-cols-3">
          {items.map((t) => (
            <li key={t.name} className="flex flex-col rounded-lg bg-surface-card p-7 shadow-xs">
              <Quote className="size-7 text-primary-fixed-dim" aria-hidden />
              <blockquote className="mt-3 flex-1 text-body-md leading-relaxed text-on-surface italic">“{t.quote}”</blockquote>
              <div className="mt-6 flex items-center gap-3">
                {t.avatar ? <Image src={t.avatar.src} alt="" width={48} height={48} className="size-12 rounded-md object-cover" /> : null}
                <div>
                  <p className="font-display text-[17px] leading-tight font-semibold text-slate-dark">{t.name}</p>
                  <p className="mt-0.5 eyebrow">{t.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
