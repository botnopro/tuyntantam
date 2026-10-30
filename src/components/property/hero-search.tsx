import { BedDouble, Building2, MapPin, Search, Wallet } from "lucide-react";
import { LISTING_TYPES, propertyTypeLabel } from "@/lib/content/property-options";

const BUDGETS = [5_000_000, 10_000_000, 20_000_000, 50_000_000, 1_000_000_000, 5_000_000_000, 10_000_000_000];
const budgetLabel = (n: number) => (n >= 1e9 ? `Dưới ${n / 1e9} tỷ` : `Dưới ${n / 1e6} triệu`);

/**
 * Thanh tìm kiếm trên ảnh hero (Houzez): chip trạng thái + các ô chọn + nút tìm.
 * GET form tới /kho-nguon — chạy không cần JS; chip là radio thuần CSS.
 */
export function HeroSearch({ districts, types }: { districts: string[]; types: string[] }) {
  const cell = "flex min-w-0 flex-col rounded-sm bg-surface-container-low px-3 py-1.5";
  const label = "mb-0.5 flex items-center gap-1 text-label-caps tracking-wider text-on-surface-variant uppercase";
  const select = "w-full cursor-pointer truncate bg-transparent py-1 text-[15px] font-semibold text-on-surface focus:outline-none";
  const statuses: [string, string][] = [["", "Tất cả"], ...Object.entries(LISTING_TYPES)];
  return (
    <form action="/kho-nguon" role="search" aria-label="Tìm bất động sản">
      <fieldset className="mb-3 flex justify-center gap-2">
        <legend className="sr-only">Hình thức</legend>
        {statuses.map(([value, text]) => (
          <label
            key={value || "all"}
            className="cursor-pointer rounded-full bg-ink/55 px-5 py-2 font-sans text-subheading tracking-wider text-white uppercase backdrop-blur-md transition-colors hover:bg-ink/75 has-checked:bg-brand-strong has-focus-visible:outline-2 has-focus-visible:outline-white"
          >
            <input type="radio" name="listingType" value={value} defaultChecked={!value} className="sr-only" />
            {text}
          </label>
        ))}
      </fieldset>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-card/95 p-3 shadow-float backdrop-blur-md sm:gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto] lg:p-4">
        <div className={cell}>
          <label htmlFor="hs-type" className={label}>
            <Building2 className="size-3 text-primary" aria-hidden /> Loại hình
          </label>
          <select id="hs-type" name="type" className={select} defaultValue="">
            <option value="">Tất cả loại hình</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {propertyTypeLabel(t)}
              </option>
            ))}
          </select>
        </div>
        <div className={cell}>
          <label htmlFor="hs-district" className={label}>
            <MapPin className="size-3 text-primary" aria-hidden /> Khu vực
          </label>
          <select id="hs-district" name="district" className={select} defaultValue="">
            <option value="">Tất cả khu vực</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className={cell}>
          <label htmlFor="hs-bed" className={label}>
            <BedDouble className="size-3 text-primary" aria-hidden /> Phòng ngủ
          </label>
          <select id="hs-bed" name="bedrooms" className={select} defaultValue="">
            <option value="">Bất kỳ</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                Từ {n} phòng
              </option>
            ))}
          </select>
        </div>
        <div className={cell}>
          <label htmlFor="hs-price" className={label}>
            <Wallet className="size-3 text-primary" aria-hidden /> Ngân sách
          </label>
          <select id="hs-price" name="maxPrice" className={select} defaultValue="">
            <option value="">Bất kỳ</option>
            {BUDGETS.map((n) => (
              <option key={n} value={n}>
                {budgetLabel(n)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="col-span-2 btn-primary min-h-[52px] w-full px-8 lg:col-span-1">
          <Search className="size-4" aria-hidden />
          Tìm kiếm
        </button>
      </div>
    </form>
  );
}
