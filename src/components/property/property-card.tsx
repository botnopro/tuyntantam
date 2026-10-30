import { ArrowUpRight, Bath, BedDouble, MapPin, Ruler } from "lucide-react";
import Image from "next/image";
import Link from "@/components/ui/link";
import { isDemoListing } from "@/lib/content/demo";
import { LISTING_TYPES, propertyTypeLabel } from "@/lib/content/property-options";
import { propertyPath } from "@/lib/content/routes";
import { formatArea, formatPrice } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { PropertyCard as PropertyCardData } from "@/server/properties";
import { CompareButton, FavoriteButton } from "./save-buttons";

export function SpecStrip({ p, className }: { p: Pick<PropertyCardData, "bedrooms" | "bathrooms" | "area">; className?: string }) {
  const specs = [
    p.bedrooms != null && { icon: BedDouble, value: p.bedrooms, unit: "PN", label: "phòng ngủ" },
    p.bathrooms != null && { icon: Bath, value: p.bathrooms, unit: "WC", label: "phòng tắm" },
    p.area != null && { icon: Ruler, value: formatArea(p.area), unit: "", label: "diện tích" },
  ].filter(Boolean) as { icon: typeof Bath; value: string | number; unit: string; label: string }[];
  if (!specs.length) return null;
  return (
    <ul className={cn("grid grid-cols-3 divide-x divide-border-subtle rounded-xs bg-surface-neutral px-1 py-2.5", className)}>
      {specs.map(({ icon: Icon, value, unit, label }) => (
        <li key={label} className="flex items-center justify-center gap-1.5 text-spec-num whitespace-nowrap text-on-surface" title={label}>
          <Icon className="size-4 text-primary" aria-hidden />
          <span>
            {value}
            {unit ? <span className="ml-0.5 text-body-sm font-normal text-on-surface-variant">{unit}</span> : null}
          </span>
          <span className="sr-only">{label}</span>
        </li>
      ))}
    </ul>
  );
}

export function ListingBadge({ type }: { type: "RENT" | "SALE" }) {
  return (
    <span className={cn("badge", type === "RENT" ? "bg-secondary text-white" : "bg-ink/85 text-white backdrop-blur-sm")}>
      {LISTING_TYPES[type]}
    </span>
  );
}

/** Card BĐS (Stitch c.5 + Houzez) — biến thể lưới và danh sách. */
export function PropertyCard({
  p,
  layout = "grid",
  priority = false,
}: {
  p: PropertyCardData;
  layout?: "grid" | "list";
  priority?: boolean;
}) {
  const price = formatPrice(p.price, p.listingType, p.priceNote);
  const [cover, hover] = p.images;
  const sizes = layout === "list" ? "(min-width: 768px) 320px, 100vw" : "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw";
  const coverImage = cover ? (
    <Image
      src={cover.src}
      alt={cover.alt ?? p.title}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
    />
  ) : null;
  const location = [p.district, p.city].filter(Boolean).join(", ");
  return (
    <article className={cn("group relative flex w-full card-lift flex-col overflow-hidden card", layout === "list" && "md:flex-row")}>
      <div
        className={cn(
          "relative aspect-[4/3] shrink-0 overflow-hidden bg-surface-container-high",
          layout === "list" && "md:aspect-auto md:min-h-[240px] md:w-2/5",
        )}
      >
        {coverImage}
        {/* Ảnh thứ hai hiện dần khi rê chuột (chỉ thiết bị có hover) */}
        {hover ? (
          <Image
            src={hover.src}
            alt=""
            fill
            sizes={sizes}
            className="hidden object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 [@media(hover:hover)]:block"
          />
        ) : null}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/45 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <ListingBadge type={p.listingType} />
          {p.featured ? <span className="badge bg-brand-strong text-white">Nổi bật</span> : null}
        </div>
        {isDemoListing(p.slug) ? (
          <span className="absolute right-3 bottom-3 badge bg-ink/70 text-white backdrop-blur-sm">Tin mẫu</span>
        ) : null}
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          <CompareButton slug={p.slug} title={p.title} />
          <FavoriteButton slug={p.slug} title={p.title} />
        </div>
        <div className="absolute bottom-3 left-3 rounded-xs bg-surface-card/90 px-3 py-1 backdrop-blur-md">
          <span className="text-price-display text-primary">{price.main}</span>
          {price.unit ? <span className="ml-1 text-body-sm font-medium text-on-surface-variant">{price.unit}</span> : null}
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col p-5", layout === "list" && "md:p-6")}>
        <p className="eyebrow">{propertyTypeLabel(p.propertyType)}</p>
        <h3 className="mt-1 text-headline-sm transition-colors group-hover:text-primary">
          <Link href={propertyPath(p.slug)} className="after:absolute after:inset-0">
            {p.title}
          </Link>
        </h3>
        {location || p.address ? (
          <p className="mt-1.5 flex items-start gap-1 text-body-sm text-on-surface-variant">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-outline" aria-hidden />
            <span className="line-clamp-1">{p.address ? `${p.address}${location ? `, ${location}` : ""}` : location}</span>
          </p>
        ) : null}
        {layout === "list" && p.summary ? <p className="mt-3 line-clamp-3 text-body-sm text-on-surface-variant">{p.summary}</p> : null}
        <div className="mt-auto flex items-end gap-3 pt-5">
          <SpecStrip p={p} className="flex-1" />
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-card text-primary shadow-xs transition-colors group-hover:bg-brand-strong group-hover:text-white"
            aria-hidden
          >
            <ArrowUpRight className="size-[18px]" />
          </span>
        </div>
      </div>
    </article>
  );
}
