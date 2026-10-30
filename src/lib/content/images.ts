import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Dim = { width: number; height: number };

// Kích thước ảnh import (đọc 1 lần lúc khởi động) — để gắn width/height chống CLS
const DIMENSIONS: Map<string, Dim> = (() => {
  try {
    const rows = JSON.parse(readFileSync(join(process.cwd(), "data", "media-manifest.json"), "utf8")) as {
      src?: string;
      width?: number;
      height?: number;
    }[];
    return new Map(rows.filter((r) => r.src && r.width && r.height).map((r) => [r.src!, { width: r.width!, height: r.height! }]));
  } catch {
    return new Map();
  }
})();

const WIDTHS = [640, 828, 1200] as const;
const optimizable = (src: string) =>
  (src.startsWith("/") && !src.startsWith("//")) || /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//.test(src);
const optimized = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&amp;w=${w}&amp;q=75`;

/**
 * Ảnh trong rich text (HTML đã sanitize) → qua bộ tối ưu ảnh của Next (AVIF/WebP, srcset theo bề rộng),
 * thêm width/height nếu biết để tránh xô lệch bố cục. Chỉ áp cho ảnh nội bộ / Vercel Blob.
 */
export function optimizeContentImages(html: string, sizes = "(min-width: 1024px) 760px, 100vw"): string {
  return html.replace(/<img\b([^>]*?)\bsrc="([^"]+)"([^>]*)>/g, (match, before: string, src: string, after: string) => {
    if (!optimizable(src)) return match;
    const attrs = `${before}${after}`;
    const dim = DIMENSIONS.get(src);
    const size = dim && !/\bwidth=/.test(attrs) ? ` width="${dim.width}" height="${dim.height}"` : "";
    const srcset = WIDTHS.map((w) => `${optimized(src, w)} ${w}w`).join(", ");
    return `<img${before}src="${optimized(src, 1200)}" srcset="${srcset}" sizes="${sizes}"${size} decoding="async"${after}>`;
  });
}
