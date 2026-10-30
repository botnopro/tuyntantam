import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "@/components/ui/link";
import { cn } from "@/lib/utils/cn";

type Props = {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  /** Tạo href cho trang n (giữ nguyên bộ lọc hiện tại) */
  hrefFor: (page: number) => string;
  noun: string;
};

function windowed(page: number, pages: number): (number | "…")[] {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1]! > 1) out.push("…");
    out.push(n);
  });
  return out;
}

/** Phân trang (Stitch c.12c): "Hiển thị x–y trên N", prev/next, số trang. */
export function Pagination({ page, pages, total, pageSize, hrefFor, noun }: Props) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const nav = "grid size-10 place-items-center rounded-xs text-sm font-bold transition-colors";
  return (
    <nav
      aria-label="Phân trang"
      className="flex flex-col items-center justify-between gap-4 rounded-lg bg-surface-card p-4 shadow-xs sm:flex-row sm:p-5"
    >
      <p className="text-body-sm text-on-surface-variant">
        Hiển thị{" "}
        <strong className="text-slate-dark">
          {from}–{to}
        </strong>{" "}
        trên {total} {noun}
      </p>
      {pages > 1 ? (
        <ul className="flex items-center gap-1.5">
          <li>
            {page > 1 ? (
              <Link
                href={hrefFor(page - 1)}
                className={cn(nav, "bg-surface-container-low hover:bg-surface-container")}
                aria-label="Trang trước"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className={cn(nav, "bg-surface-container-low text-outline")} aria-hidden>
                <ChevronLeft className="size-4" />
              </span>
            )}
          </li>
          {windowed(page, pages).map((n, i) =>
            n === "…" ? (
              <li key={`e${i}`} className="px-1 text-on-surface-variant" aria-hidden>
                …
              </li>
            ) : (
              <li key={n}>
                <Link
                  href={hrefFor(n)}
                  aria-current={n === page ? "page" : undefined}
                  aria-label={`Trang ${n}`}
                  className={cn(
                    nav,
                    n === page ? "bg-brand-strong text-white" : "bg-surface-card text-slate-dark shadow-xs hover:bg-surface-container",
                  )}
                >
                  {n}
                </Link>
              </li>
            ),
          )}
          <li>
            {page < pages ? (
              <Link
                href={hrefFor(page + 1)}
                className={cn(nav, "bg-surface-container-low hover:bg-surface-container")}
                aria-label="Trang sau"
              >
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className={cn(nav, "bg-surface-container-low text-outline")} aria-hidden>
                <ChevronRight className="size-4" />
              </span>
            )}
          </li>
        </ul>
      ) : null}
    </nav>
  );
}

/** Ghép query string, bỏ giá trị rỗng và page=1. */
export function buildQuery(base: string, params: Record<string, string | number | string[] | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "" || (k === "page" && Number(v) === 1)) continue;
    if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
    else sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}
