import { ChevronDown, Search } from "lucide-react";
import { LISTING_TYPES, propertyTypeLabel } from "@/lib/content/property-options";

const BUDGETS = [5_000_000, 10_000_000, 20_000_000, 50_000_000, 1_000_000_000, 5_000_000_000, 10_000_000_000];
const budgetLabel = (n: number) => (n >= 1e9 ? `Dưới ${n / 1e9} tỷ` : `Dưới ${n / 1e6} triệu`);

/**
 * Thanh tìm kiếm ở hero trang chủ (Houzez): một hàng các ô chọn ngăn bằng vạch mảnh + nút tìm.
 * GET form tới /kho-nguon — chạy không cần JS. Mobile: lưới 2 cột, nút xuống hàng.
 */
export function HeroSearch({ districts, types }: { districts: string[]; types: string[] }) {
  const fields: { id: string; name: string; label: string; options: [string, string][] }[] = [
    { id: "hs-listing", name: "listingType", label: "Hình thức", options: [["", "Tất cả"], ...Object.entries(LISTING_TYPES)] },
    {
      id: "hs-type",
      name: "type",
      label: "Loại hình",
      options: [["", "Tất cả"], ...types.map((t): [string, string] => [t, propertyTypeLabel(t)])],
    },
    { id: "hs-district", name: "district", label: "Khu vực", options: [["", "Tất cả"], ...districts.map((d): [string, string] => [d, d])] },
    {
      id: "hs-price",
      name: "maxPrice",
      label: "Ngân sách",
      options: [["", "Bất kỳ"], ...BUDGETS.map((n): [string, string] => [String(n), budgetLabel(n)])],
    },
  ];
  return (
    <form
      action="/kho-nguon"
      role="search"
      aria-label="Tìm bất động sản"
      className="xl:flex xl:items-center xl:rounded-sm xl:bg-surface-card xl:p-2 xl:shadow-float"
    >
      {/* Mobile/tablet: các dòng gạch chân trên nền hero (không đóng khung); xl: một thanh trắng ngăn bằng vạch dọc */}
      <div className="grid grid-cols-2 gap-x-6 xl:flex xl:flex-1 xl:gap-0">
        {fields.map((f) => (
          <div
            key={f.id}
            className="relative min-w-0 border-b border-on-surface-variant/25 py-2.5 xl:flex-1 xl:border-b-0 xl:border-l xl:border-border-subtle xl:px-5 xl:py-1 xl:first:border-l-0"
          >
            <label htmlFor={f.id} className="block text-label-caps tracking-wider text-on-surface-variant uppercase">
              {f.label}
            </label>
            <select
              id={f.id}
              name={f.name}
              defaultValue=""
              className="mt-0.5 w-full cursor-pointer appearance-none truncate bg-transparent pr-5 text-[15px] font-semibold text-slate-dark focus:outline-none"
            >
              {f.options.map(([value, text]) => (
                <option key={value || "all"} value={value}>
                  {text}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-0 bottom-3.5 size-4 text-on-surface-variant xl:right-4 xl:bottom-2"
              aria-hidden
            />
          </div>
        ))}
      </div>
      <button type="submit" className="mt-5 btn-primary min-h-12 w-full px-8 xl:mt-0 xl:w-auto">
        <Search className="size-4" aria-hidden />
        Tìm kiếm
      </button>
    </form>
  );
}
