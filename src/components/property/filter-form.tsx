import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import Link from "@/components/ui/link";
import { LISTING_TYPES, propertyTypeLabel } from "@/lib/content/property-options";
import type { PropertyFilters } from "@/lib/validation/property";
import { cn } from "@/lib/utils/cn";
import { AutoSubmitForm } from "./auto-submit-form";

type Options = { districts: string[]; types: string[]; amenities: string[] };

/**
 * Bộ lọc BĐS — GET form tự áp dụng khi đổi giá trị (không có nút "Lọc").
 * Mobile: thu gọn sau nút "Bộ lọc (n)" (checkbox + CSS, không cần JS, không nhảy layout); mở sẵn khi đang lọc.
 * Giá nhập theo triệu đồng cho dễ dùng.
 */
export function FilterForm({ filters, options, view }: { filters: PropertyFilters; options: Options; view: string }) {
  const million = (v?: number) => (v != null ? String(v / 1e6) : "");
  const cell = "flex flex-col rounded-xs bg-surface-neutral px-3 py-1.5";
  const label = "text-label-caps tracking-wider text-on-surface-variant uppercase";
  const input = "w-full bg-transparent py-1 text-[15px] text-on-surface focus:outline-none";
  const active = [filters.q, filters.listingType, filters.type, filters.district, filters.bedrooms, filters.minPrice, filters.maxPrice].filter(
    (v) => v != null && v !== "",
  ).length;

  return (
    <AutoSubmitForm action="/kho-nguon" className="relative z-30 bg-surface-card shadow-float" role="search" aria-label="Lọc bất động sản">
      {view !== "grid" ? <input type="hidden" name="view" value={view} /> : null}
      <div className="container-page py-4 lg:py-5">
        {/* Không có name → không gửi đi, AutoSubmitForm bỏ qua */}
        <input id="f-toggle" type="checkbox" defaultChecked={active > 0} aria-controls="f-fields" className="peer sr-only" />
        <label
          htmlFor="f-toggle"
          className="flex min-h-11 cursor-pointer items-center justify-between font-sans text-subheading tracking-wider uppercase peer-checked:[&>svg]:rotate-180 peer-focus-visible:outline-2 peer-focus-visible:outline-primary lg:hidden"
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" aria-hidden /> Bộ lọc
            {active > 0 ? <span className="rounded-full bg-brand-strong px-2 text-[12px] text-white">{active}</span> : null}
          </span>
          <ChevronDown className="size-5 text-on-surface-variant transition-transform" aria-hidden />
        </label>
        <div id="f-fields" className="mt-4 hidden gap-3 peer-checked:grid sm:grid-cols-2 lg:mt-0 lg:grid lg:grid-cols-12 lg:items-stretch">
          <div className={cn(cell, "sm:col-span-2 lg:col-span-3")}>
            <label htmlFor="f-q" className={label}>
              Từ khoá
            </label>
            <input
              id="f-q"
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="Tên, địa chỉ, khu vực…"
              maxLength={100}
              className={input}
            />
          </div>
          <fieldset className={cn(cell, "justify-center lg:col-span-3")}>
            <legend className="sr-only">Hình thức</legend>
            <span className={label} aria-hidden>
              Hình thức
            </span>
            <div className="mt-1 flex gap-1">
              {[["", "Tất cả"], ...Object.entries(LISTING_TYPES)].map(([value, text]) => (
                <label
                  key={value}
                  className="cursor-pointer rounded-xs bg-surface-container px-2.5 py-1 text-[12px] font-bold whitespace-nowrap text-on-surface-variant uppercase has-[:checked]:bg-brand-strong has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
                >
                  <input
                    type="radio"
                    name="listingType"
                    value={value}
                    defaultChecked={(filters.listingType ?? "") === value}
                    className="sr-only"
                  />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>
          <div className={cn(cell, "lg:col-span-2")}>
            <label htmlFor="f-type" className={label}>
              Loại hình
            </label>
            <select id="f-type" name="type" defaultValue={filters.type ?? ""} className={cn(input, "cursor-pointer")}>
              <option value="">Tất cả</option>
              {options.types.map((t) => (
                <option key={t} value={t}>
                  {propertyTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <div className={cn(cell, "lg:col-span-2")}>
            <label htmlFor="f-district" className={label}>
              Khu vực
            </label>
            <select id="f-district" name="district" defaultValue={filters.district ?? ""} className={cn(input, "cursor-pointer")}>
              <option value="">Tất cả</option>
              {options.districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className={cn(cell, "lg:col-span-2")}>
            <label htmlFor="f-bed" className={label}>
              Phòng ngủ
            </label>
            <select id="f-bed" name="bedrooms" defaultValue={filters.bedrooms ?? ""} className={cn(input, "cursor-pointer")}>
              <option value="">Bất kỳ</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  Từ {n}
                </option>
              ))}
            </select>
          </div>
          <div className={cn(cell, "lg:col-span-3")}>
            <label htmlFor="f-minp" className={label}>
              Giá từ (triệu)
            </label>
            <input
              id="f-minp"
              name="minPriceM"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              defaultValue={million(filters.minPrice)}
              className={input}
            />
          </div>
          <div className={cn(cell, "lg:col-span-3")}>
            <label htmlFor="f-maxp" className={label}>
              Giá đến (triệu)
            </label>
            <input
              id="f-maxp"
              name="maxPriceM"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              defaultValue={million(filters.maxPrice)}
              className={input}
            />
          </div>

          <div className="flex items-stretch sm:col-span-2 lg:col-span-2">
            <Link
              href={view === "grid" ? "/kho-nguon" : `/kho-nguon?view=${view}`}
              scroll={false}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xs border border-border-subtle px-3 py-2.5 font-sans text-subheading tracking-wider text-on-surface-variant uppercase transition-colors hover:bg-surface-neutral hover:text-primary"
            >
              <RotateCcw className="size-4" aria-hidden />
              Xoá lọc
            </Link>
          </div>
        </div>
      </div>
    </AutoSubmitForm>
  );
}
