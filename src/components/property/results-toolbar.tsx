"use client";

import { LayoutGrid, List, Map } from "lucide-react";
import Link from "@/components/ui/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/content/property-options";
import { cn } from "@/lib/utils/cn";

/** Toolbar kết quả (Stitch c.14/c.15): số tin, sắp xếp, chuyển lưới/danh sách/bản đồ. */
export function ResultsToolbar({ total, sort, view, hasGeo }: { total: number; sort: string; view: string; hasGeo: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefWith = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    sp.set(key, value);
    sp.delete("page");
    return `${pathname}?${sp.toString()}`;
  };

  const views = [
    { key: "grid", label: "Dạng lưới", Icon: LayoutGrid },
    { key: "list", label: "Dạng danh sách", Icon: List },
    ...(hasGeo ? [{ key: "map", label: "Bản đồ", Icon: Map }] : []),
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs bg-surface-warm px-3 py-2.5">
      <p className="text-[15px] font-semibold text-slate-dark" aria-live="polite">
        <span className="mr-1.5 text-label-caps font-bold tracking-wider text-on-surface-variant uppercase">Đang hiển thị</span>
        {total} bất động sản
      </p>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          Sắp xếp
          <select
            value={sort}
            onChange={(e) => router.push(hrefWith("sort", e.target.value), { scroll: false })}
            className="cursor-pointer rounded-xs bg-surface-card px-2 py-1.5 text-[14px] font-semibold text-slate-dark shadow-xs focus:outline-none"
          >
            {Object.entries(SORT_OPTIONS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-1" role="group" aria-label="Kiểu hiển thị">
          {views.map(({ key, label, Icon }) => (
            <Link
              key={key}
              href={hrefWith("view", key)}
              scroll={false}
              aria-label={label}
              aria-current={view === key ? "true" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-xs",
                view === key ? "bg-surface-card text-primary shadow-xs" : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              <Icon className="size-[18px]" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
