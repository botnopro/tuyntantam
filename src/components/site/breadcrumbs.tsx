import { ChevronRight } from "lucide-react";
import Link from "@/components/ui/link";
import { breadcrumbJsonLd, JsonLd } from "./json-ld";

export type Crumb = { name: string; href: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Trang chủ", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-2">
        <ol className="flex flex-wrap items-center gap-1.5 font-sans text-label-caps tracking-wider text-on-surface-variant uppercase">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {i > 0 ? <ChevronRight className="size-3.5 text-outline" aria-hidden /> : null}
                {last ? (
                  <span aria-current="page" className="line-clamp-1 text-primary">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-primary">
                    {c.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(all)} />
    </>
  );
}
