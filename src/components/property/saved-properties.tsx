"use client";

import { X } from "lucide-react";
import Link from "@/components/ui/link";
import { useEffect, useState } from "react";
import { EmptyStateClient } from "@/components/site/empty-state-client";
import { FURNISHING, LISTING_TYPES, propertyTypeLabel } from "@/lib/content/property-options";
import { propertyPath } from "@/lib/content/routes";
import { formatArea, formatPrice } from "@/lib/utils/format";
import type { ImageRef } from "@/lib/content/types";
import { useSavedList } from "./saved-store";

type Item = {
  slug: string;
  title: string;
  listingType: "RENT" | "SALE";
  propertyType: string;
  price: number | null;
  priceNote: string | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  district: string | null;
  address: string | null;
  images: ImageRef[];
  amenities: string[];
  floors: number | null;
  direction: string | null;
  furnishing: string | null;
};

function useItems(slugs: string[]) {
  const [loaded, setLoaded] = useState<{ key: string; items: Item[] } | null>(null);
  const key = slugs.join(",");
  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    fetch(`/api/v1/properties/by-slugs?slugs=${encodeURIComponent(key)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d: { data: Item[] }) => setLoaded({ key, items: d.data }))
      .catch(() => {});
    return () => ctrl.abort();
  }, [key]);
  // Danh sách rỗng → không cần gọi API; dữ liệu cũ của key khác → đang tải
  if (!key) return [];
  return loaded?.key === key ? loaded.items : null;
}

export function FavoritesList() {
  const fav = useSavedList("tt-favorites");
  const items = useItems(fav.list);
  if (items === null) return <div className="h-64 animate-pulse rounded-lg bg-surface-container-low" aria-busy="true" />;
  if (!items.length)
    return (
      <EmptyStateClient
        title="Chưa có bất động sản yêu thích"
        description="Bấm biểu tượng trái tim trên tin đăng để lưu lại và xem sau. Danh sách được lưu trên trình duyệt này."
        action={{ href: "/kho-nguon", label: "Xem kho nguồn" }}
      />
    );
  return (
    <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => {
        const price = formatPrice(p.price, p.listingType, p.priceNote);
        return (
          <li key={p.slug} className="relative flex gap-4 card p-4">
            {p.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.images[0].src} alt="" className="size-24 shrink-0 rounded-sm object-cover" loading="lazy" />
            ) : null}
            <div className="min-w-0">
              <Link
                href={propertyPath(p.slug)}
                className="line-clamp-2 font-display text-[17px] font-semibold text-slate-dark hover:text-primary"
              >
                {p.title}
              </Link>
              <p className="mt-1 text-spec-num text-primary">
                {price.main}
                {price.unit}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fav.toggle(p.slug)}
              className="absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-low"
              aria-label={`Bỏ yêu thích ${p.title}`}
            >
              <X className="size-4" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function CompareTable() {
  const cmp = useSavedList("tt-compare");
  const items = useItems(cmp.list);
  if (items === null) return <div className="h-64 animate-pulse rounded-lg bg-surface-container-low" aria-busy="true" />;
  if (!items.length)
    return (
      <EmptyStateClient
        title="Chưa chọn bất động sản để so sánh"
        description="Bấm nút so sánh trên tin đăng (tối đa 4 tin) để đặt cạnh nhau."
        action={{ href: "/kho-nguon", label: "Xem kho nguồn" }}
      />
    );

  const allAmenities = [...new Set(items.flatMap((i) => i.amenities))].sort();
  const rows: [string, (p: Item) => React.ReactNode][] = [
    [
      "Giá",
      (p) => {
        const pr = formatPrice(p.price, p.listingType, p.priceNote);
        return (
          <strong className="text-primary">
            {pr.main}
            {pr.unit}
          </strong>
        );
      },
    ],
    ["Hình thức", (p) => LISTING_TYPES[p.listingType]],
    ["Loại hình", (p) => propertyTypeLabel(p.propertyType)],
    ["Khu vực", (p) => p.district ?? "—"],
    ["Địa chỉ", (p) => p.address ?? "—"],
    ["Diện tích", (p) => formatArea(p.area) ?? "—"],
    ["Phòng ngủ", (p) => p.bedrooms ?? "—"],
    ["Phòng tắm", (p) => p.bathrooms ?? "—"],
    ["Số tầng", (p) => p.floors ?? "—"],
    ["Hướng", (p) => p.direction ?? "—"],
    ["Nội thất", (p) => (p.furnishing ? (FURNISHING[p.furnishing as keyof typeof FURNISHING] ?? p.furnishing) : "—")],
    ...allAmenities.map((a) => [a, (p: Item) => (p.amenities.includes(a) ? "✓" : "—")] as [string, (p: Item) => React.ReactNode]),
  ];

  return (
    <div className="overflow-x-auto rounded-lg bg-surface-card shadow-card">
      <table className="w-full min-w-[640px] border-collapse text-body-md">
        <caption className="sr-only">So sánh bất động sản</caption>
        <thead>
          <tr>
            <th scope="col" className="w-40 bg-surface-warm p-4 text-left text-label-caps tracking-wider text-on-surface-variant uppercase">
              Tiêu chí
            </th>
            {items.map((p) => (
              <th key={p.slug} scope="col" className="p-4 text-left align-top">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0].src} alt="" className="mb-3 aspect-[4/3] w-full rounded-sm object-cover" loading="lazy" />
                ) : null}
                <Link href={propertyPath(p.slug)} className="font-display text-[17px] font-semibold text-slate-dark hover:text-primary">
                  {p.title}
                </Link>
                <button
                  type="button"
                  onClick={() => cmp.toggle(p.slug)}
                  className="mt-2 block cursor-pointer text-body-sm text-on-surface-variant underline hover:text-error"
                >
                  Bỏ khỏi so sánh
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, render]) => (
            <tr key={label} className="border-t border-border-subtle">
              <th scope="row" className="bg-surface-warm p-4 text-left font-semibold text-slate-dark">
                {label}
              </th>
              {items.map((p) => (
                <td key={p.slug} className="p-4">
                  {render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
