"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CarouselSlide = { key: string; tabs: string[]; node: ReactNode };

/**
 * Carousel BĐS kiểu Houzez: tab lọc (khu vực / hình thức) + dải thẻ cuộn ngang có snap, nút trước/sau.
 * Không có JS vẫn cuộn được bằng tay; thẻ do server render (children).
 */
export function PropertyCarousel({
  tabs,
  slides,
  label,
}: {
  tabs: { id: string; label: string }[];
  slides: CarouselSlide[];
  label: string;
}) {
  const [active, setActive] = useState(tabs[0]?.id ?? "all");
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const shown = active === "all" ? slides : slides.filter((s) => s.tabs.includes(active));

  const syncEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    syncEdges();
    el.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      el.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
  }, [active, syncEdges]);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        {tabs.length > 1 ? (
          <div role="tablist" aria-label={label} className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active === t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-full px-4 py-2 text-body-sm font-semibold whitespace-nowrap transition-colors",
                  active === t.id
                    ? "bg-ink text-white"
                    : "bg-surface-muted text-on-surface-variant hover:bg-brand-subtle hover:text-primary",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label="Xem tin trước"
            className="btn-icon disabled:opacity-40"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label="Xem tin tiếp"
            className="btn-icon disabled:opacity-40"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>
      <div key={active} className="fade-in">
        <ul
          ref={trackRef}
          className="-mx-5 flex snap-x snap-mandatory scroll-px-5 [scrollbar-width:none] gap-6 overflow-x-auto px-5 pt-1 pb-6 md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:scroll-px-0 lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {shown.map((s) => (
            <li
              key={s.key}
              className="flex w-[82%] shrink-0 snap-start sm:w-[calc((100%-24px)/2)] lg:w-[calc((100%-48px)/3)] xl:w-[calc((100%-72px)/4)]"
            >
              {s.node}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
