import { slugify } from "@/lib/utils/format";

export type TocItem = { id: string; text: string; level: 2 | 3 };

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();

/** Gắn id cho h2/h3 (chưa có id) và trả về mục lục. HTML đầu vào đã được sanitize. */
export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/g, (match, lvl: string, attrs = "", inner: string) => {
    const text = decode(inner);
    if (!text) return match;
    const existing = /\sid="([^"]+)"/.exec(attrs)?.[1];
    let id = existing ?? (slugify(text).slice(0, 60) || `muc-${toc.length + 1}`);
    if (!existing) {
      let n = 2;
      const base = id;
      while (used.has(id)) id = `${base}-${n++}`;
    }
    used.add(id);
    toc.push({ id, text, level: Number(lvl) as 2 | 3 });
    return existing ? match : `<h${lvl} id="${id}"${attrs}>${inner}</h${lvl}>`;
  });
  return { html: out, toc };
}

/**
 * Trang import từ WordPress mở đầu bằng <h2>Tiêu đề</h2><p>Câu dẫn</p> (khối hero Elementor).
 * Tách ra để dùng làm hero, phần còn lại là nội dung.
 */
export function extractLead(html: string): { heading: string | null; lead: string | null; rest: string } {
  const m = /^\s*<h2[^>]*>([\s\S]*?)<\/h2>\s*(?:<p>([\s\S]*?)<\/p>)?/.exec(html);
  if (!m) return { heading: null, lead: null, rest: html };
  const lead = m[2] && !/<(a|img)\b/.test(m[2]) ? decode(m[2]) : null;
  const consumed = lead ? m[0] : m[0].replace(/<p>[\s\S]*$/, "");
  return { heading: decode(m[1]!), lead, rest: html.slice(consumed.length) };
}

/** Các đoạn văn thuần trong HTML (bỏ thẻ). */
export function paragraphs(html: string): string[] {
  return [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => decode(m[1]!)).filter(Boolean);
}

/** Link đầu tiên trong HTML. */
export function firstLink(html: string): { href: string; text: string } | null {
  const m = /<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(html);
  return m ? { href: m[1]!, text: decode(m[2]!) } : null;
}

export type HtmlSegment = { kind: "html"; html: string } | { kind: "form"; formId: string };

/** Tách HTML theo marker <p data-form="ID"></p> do bước import chèn vào vị trí form gốc. */
export function splitFormMarkers(html: string): HtmlSegment[] {
  const parts: HtmlSegment[] = [];
  const re = /<p data-form="([a-z0-9-]+)"><\/p>/g;
  let last = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (m.index > last) parts.push({ kind: "html", html: html.slice(last, m.index) });
    parts.push({ kind: "form", formId: m[1]! });
    last = m.index + m[0].length;
  }
  if (last < html.length) parts.push({ kind: "html", html: html.slice(last) });
  return parts.filter((p) => p.kind === "form" || p.html.trim());
}
