import type { TocItem } from "@/lib/content/html";
import { cn } from "@/lib/utils/cn";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 3) return null;
  return (
    <nav aria-label="Mục lục" className="rounded-lg bg-surface-card p-5 shadow-xs">
      <p className="font-sans text-subheading tracking-wider text-slate-dark uppercase">Mục lục</p>
      <ol className="mt-3 space-y-2 border-l border-border-subtle">
        {items.map((t) => (
          <li key={t.id} className={cn(t.level === 3 && "pl-3")}>
            <a
              href={`#${t.id}`}
              className="-ml-px block border-l-2 border-transparent pl-3 text-[14px] leading-snug text-on-surface-variant hover:border-primary-container hover:text-primary"
            >
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
