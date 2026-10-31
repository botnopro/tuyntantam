const TZ = "Asia/Ho_Chi_Minh";

const num = (n: number, digits = 1) => new Intl.NumberFormat("vi-VN", { maximumFractionDigits: digits }).format(n);

/** 12500000000 → "12,5 tỷ"; 25000000 → "25 triệu"; 800000 → "800 nghìn" */
export function formatVnd(amount: number | null | undefined): string | null {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  if (amount >= 1e9) return `${num(amount / 1e9, 2)} tỷ`;
  if (amount >= 1e6) return `${num(amount / 1e6, 1)} triệu`;
  if (amount >= 1e3) return `${num(amount / 1e3, 0)} nghìn`;
  return `${num(amount, 0)} đ`;
}

export function formatPrice(price: number | null, listingType: "RENT" | "SALE", priceNote?: string | null) {
  const main = formatVnd(price);
  if (!main) return { main: priceNote || "Thoả thuận", unit: null };
  return { main, unit: listingType === "RENT" ? "/tháng" : null };
}

export function formatArea(area: number | null | undefined): string | null {
  if (area == null || area <= 0) return null;
  return `${num(area, 1)} m²`;
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("vi-VN", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d));
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

export function isoDate(d: Date | string | null | undefined): string | undefined {
  return d ? new Date(d).toISOString() : undefined;
}

/** Bỏ dấu tiếng Việt, tạo slug kebab-case ASCII. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Giải mã thực thể HTML (&amp;, &#8211;…) — kết quả là chữ thuần, chỉ render dạng text (React tự escape). */
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] !== "#") return NAMED_ENTITIES[e.toLowerCase()] ?? m;
    const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : m;
  });
}

export function plainText(html: string, max?: number): string {
  const t = decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  if (!max || t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
