import { BedDouble, Building2, MapPin, Search, Tag } from "lucide-react";
import { LISTING_TYPES, propertyTypeLabel } from "@/lib/content/property-options";

/** Thanh tìm kiếm nổi (Stitch c.4) — GET form tới /kho-nguon, không cần JS. Giá trị lấy từ dữ liệu thật. */
export function QuickSearch({ districts, types }: { districts: string[]; types: string[] }) {
  const cell = "flex flex-col rounded-sm bg-surface-container-low px-3 py-1.5";
  const label = "mb-0.5 flex items-center gap-1 text-label-caps tracking-wider text-on-surface-variant uppercase";
  const select = "w-full cursor-pointer bg-transparent py-1 text-[15px] font-semibold text-on-surface focus:outline-none";
  return (
    <form
      action="/kho-nguon"
      role="search"
      className="grid grid-cols-2 gap-2 rounded-lg bg-surface-card p-3 shadow-float sm:gap-3 lg:grid-cols-5 lg:p-4"
    >
      <div className={cell}>
        <label htmlFor="qs-listing" className={label}>
          <Tag className="size-3 text-primary" aria-hidden /> Hình thức
        </label>
        <select id="qs-listing" name="listingType" className={select} defaultValue="">
          <option value="">Tất cả</option>
          {Object.entries(LISTING_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className={cell}>
        <label htmlFor="qs-district" className={label}>
          <MapPin className="size-3 text-primary" aria-hidden /> Khu vực
        </label>
        <select id="qs-district" name="district" className={select} defaultValue="">
          <option value="">Tất cả khu vực</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
      <div className={cell}>
        <label htmlFor="qs-type" className={label}>
          <Building2 className="size-3 text-primary" aria-hidden /> Loại hình
        </label>
        <select id="qs-type" name="type" className={select} defaultValue="">
          <option value="">Tất cả loại hình</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {propertyTypeLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div className={cell}>
        <label htmlFor="qs-bed" className={label}>
          <BedDouble className="size-3 text-primary" aria-hidden /> Phòng ngủ
        </label>
        <select id="qs-bed" name="bedrooms" className={select} defaultValue="">
          <option value="">Bất kỳ</option>
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              Từ {n} phòng
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="col-span-2 btn-primary min-h-[52px] w-full lg:col-span-1">
        <Search className="size-4" aria-hidden />
        Tìm kiếm
      </button>
    </form>
  );
}
