import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "h2",
  "h3",
  "h4",
  "p",
  "br",
  "hr",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "a",
  "blockquote",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "video",
  "source",
];

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** id heading chỉ giữ dạng slug (không thể trùng thuộc tính DOM như __proto__) — chống DOM clobbering. */
function headingWithSafeId(tagName: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag {
  const { id } = attribs;
  const attrs: sanitizeHtml.Attributes = id && /^[a-z0-9][a-z0-9-]{0,79}$/.test(id) ? { id } : {};
  return { tagName, attribs: attrs };
}

/** Làm sạch rich text (bài viết, mô tả BĐS, trang) theo whitelist — dùng khi lưu và khi render. */
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      video: ["src", "controls", "preload", "width", "height", "poster"],
      source: ["src", "type"],
      // marker vị trí form trong nội dung import (thay bằng form lead khi render)
      p: ["data-form"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      // id chỉ cho heading (anchor mục lục), giới hạn ký tự để tránh DOM clobbering
      h2: ["id"],
      h3: ["id"],
      h4: ["id"],
    },
    allowedSchemes: ["https", "http", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"], video: ["https"], source: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?tuyntantam\.com/i.test(href);
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" }
            : { href: attribs.href, ...(attribs.title ? { title: attribs.title } : {}) },
        };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
      h2: headingWithSafeId,
      h3: headingWithSafeId,
      h4: headingWithSafeId,
      video: (tagName, attribs) => ({ tagName, attribs: { ...attribs, controls: "", preload: "none" } }),
    },
    exclusiveFilter: (frame) =>
      (frame.tag === "p" || frame.tag === "li") && !frame.text.trim() && !frame.mediaChildren.length && !frame.attribs["data-form"],
  });
}

/**
 * Văn bản thuần (không HTML) — cho form công khai. Bỏ toàn bộ thẻ rồi giải mã entity
 * (React tự escape khi hiển thị, nên lưu văn bản gốc thay vì "&amp;").
 */
export function stripTags(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {}, disallowedTagsMode: "discard" })
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

export function isYoutubeId(id: string): boolean {
  return YOUTUBE_ID.test(id);
}

export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (YOUTUBE_ID.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (!/(^|\.)youtube(-nocookie)?\.com$|^youtu\.be$/.test(url.hostname)) return null;
    const id = url.hostname === "youtu.be" ? url.pathname.slice(1) : (url.searchParams.get("v") ?? url.pathname.split("/").pop() ?? "");
    return YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

const TOUR_HOSTS = ["my.matterport.com", "kuula.co"];

export function safeVirtualTourUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    return url.protocol === "https:" && TOUR_HOSTS.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
