/**
 * Chuẩn hoá nội dung dán vào trình soạn thảo để GIỮ định dạng gốc (xuống dòng, đoạn, đậm/nghiêng,
 * danh sách, tiêu đề) mà vẫn chỉ dùng thẻ server cho phép (xem `sanitizeRichText`).
 * Nguồn hay gặp: Zalo/Facebook/Ghi chú (chữ thuần, mỗi ý một dòng), Word/Google Docs (HTML nhiều <div>/<span style>).
 */

const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s: string) => escapeText(s).replace(/"/g, "&quot;");

/** Chữ thuần → đoạn: dòng trống ngăn đoạn, xuống dòng đơn giữ bằng <br>. */
export function plainTextToHtml(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t ]*\n/)
    .map((para) =>
      para
        .split("\n")
        .map((line) => line.replace(/[ \t ]+$/, ""))
        .filter((line) => line.trim())
        .map(escapeText)
        .join("<br>"),
    )
    .filter((para) => para.replace(/<br>/g, "").trim())
    .map((para) => `<p>${para}</p>`)
    .join("");
}

const SKIP = new Set([
  "SCRIPT", "STYLE", "META", "LINK", "TITLE", "HEAD", "NOSCRIPT", "TEMPLATE", "IMG", "PICTURE", "SVG", "VIDEO",
  "AUDIO", "IFRAME", "OBJECT", "EMBED", "CANVAS", "BUTTON", "INPUT", "SELECT", "TEXTAREA",
]); // prettier-ignore
const HEADINGS: Record<string, string> = { H1: "h2", H2: "h2", H3: "h3", H4: "h3", H5: "h3", H6: "h3" };
const BLOCK =
  /^(P|DIV|SECTION|ARTICLE|HEADER|FOOTER|MAIN|ASIDE|NAV|FIGURE|FIGCAPTION|ADDRESS|DL|DT|DD|TABLE|THEAD|TBODY|TFOOT|TR|CENTER|FORM|FIELDSET|DETAILS|SUMMARY|PRE|BLOCKQUOTE)$/;

const hasText = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;|\s/g, "") !== "";

/** Định dạng chữ của 1 phần tử (thẻ hoặc style inline của Word/Google Docs). */
function inlineWrappers(el: Element): string[] {
  const tag = el.tagName;
  const style = (el.getAttribute("style") ?? "").toLowerCase();
  const out: string[] = [];
  const weight = /font-weight:\s*(\w+)/.exec(style)?.[1];
  const bold = weight ? weight === "bold" || weight === "bolder" || Number(weight) >= 600 : tag === "B" || tag === "STRONG";
  if (bold) out.push("strong");
  const fontStyle = /font-style:\s*(\w+)/.exec(style)?.[1];
  if (fontStyle ? fontStyle === "italic" : tag === "I" || tag === "EM") out.push("em");
  if (tag === "U" || /text-decoration[^;]*underline/.test(style)) out.push("u");
  const href = tag === "A" ? (el.getAttribute("href") ?? "").trim() : "";
  if (/^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(href)) out.push(`a href="${escapeAttr(href)}"`);
  return out;
}

/** HTML từ clipboard → chuỗi đoạn <p>/<h2>/<ul>… phẳng (không lồng khối), giữ đậm/nghiêng/gạch chân/link. */
export function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: string[] = [];
  const open: string[] = []; // thẻ inline đang mở: "strong", `a href="…"`…
  let line = "";
  let blockTag = "p";
  let list: string[] | null = null;
  let inLi = 0;

  const name = (t: string) => t.split(" ")[0];
  const endBlock = () => {
    const body =
      line.replace(/(<br>)+$/, "") +
      [...open]
        .reverse()
        .map((t) => `</${name(t)}>`)
        .join("");
    if (hasText(body)) {
      if (list) list.push(body);
      else out.push(`<${blockTag}>${body.trim()}</${blockTag}>`);
    }
    line = open.map((t) => `<${t}>`).join("");
  };
  const softBreak = () => {
    if (hasText(line) && !line.endsWith("<br>")) line += "<br>";
  };

  const walk = (node: Node, pre: boolean) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent ?? "";
        line += pre ? escapeText(t).replace(/\r?\n/g, "<br>") : escapeText(t.replace(/\s+/g, " "));
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as Element;
      const tag = el.tagName;
      if (SKIP.has(tag)) continue;
      const childPre = pre || tag === "PRE" || /white-space:\s*pre/i.test(el.getAttribute("style") ?? "");

      if (tag === "BR") line += "<br>";
      else if (tag === "HR") {
        if (inLi) softBreak();
        else endBlock();
      } else if (tag === "UL" || tag === "OL") {
        if (inLi || list) {
          softBreak();
          walk(el, childPre);
          continue;
        }
        endBlock();
        list = [];
        walk(el, childPre);
        endBlock();
        const items: string[] = list;
        list = null;
        if (items.length) out.push(`<${tag.toLowerCase()}>${items.map((i) => `<li>${i.trim()}</li>`).join("")}</${tag.toLowerCase()}>`);
      } else if (tag === "LI") {
        if (inLi) {
          softBreak();
          walk(el, childPre);
          continue;
        }
        endBlock();
        inLi++;
        walk(el, childPre);
        inLi--;
        endBlock();
      } else if (HEADINGS[tag] && !inLi && !list) {
        endBlock();
        blockTag = HEADINGS[tag];
        walk(el, childPre);
        endBlock();
        blockTag = "p";
      } else if (tag === "DIV" && !inLi && !list) {
        // App nhắn tin / trình soạn web: mỗi <div> là MỘT dòng (không phải đoạn) → <br>; <div> trống = dòng trống → sang đoạn mới
        if (hasText(el.innerHTML.replace(/<br\s*\/?>/gi, ""))) {
          softBreak();
          walk(el, childPre);
          softBreak();
        } else endBlock();
      } else if (BLOCK.test(tag) || HEADINGS[tag]) {
        if (inLi) {
          softBreak();
          walk(el, childPre);
          softBreak();
        } else {
          endBlock();
          walk(el, childPre);
          endBlock();
        }
      } else if (tag === "TD" || tag === "TH") {
        walk(el, childPre);
        line += " ";
      } else {
        const wrappers = inlineWrappers(el).filter((w) => !open.some((o) => name(o) === name(w)));
        for (const w of wrappers) {
          line += `<${w}>`;
          open.push(w);
        }
        walk(el, childPre);
        for (const w of wrappers.reverse()) {
          line += `</${name(w)}>`;
          open.pop();
        }
      }
    }
  };

  walk(doc.body, false);
  endBlock();
  // Bỏ cặp thẻ rỗng sinh ra khi tách khối giữa chừng một thẻ inline
  return out.join("").replace(/<(strong|em|u|a)(?: [^>]*)?>((?:\s|<br>)*)<\/\1>/g, "$2");
}

/**
 * Chọn cách dán: HTML khi giữ được cấu trúc dòng; nếu HTML làm mất xuống dòng (nhiều app nhắn tin
 * chép ra HTML không có thẻ khối) thì dùng chữ thuần.
 */
export function pastedToHtml(html: string, text: string): string {
  const fromText = plainTextToHtml(text);
  if (!html.trim()) return fromText;
  const fromHtml = cleanPastedHtml(html);
  const breaks = (s: string) => (s.match(/<br>|<\/(p|h2|h3|li)>/g) ?? []).length;
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).length;
  return hasText(fromHtml) && breaks(fromHtml) >= Math.ceil(lines / 2) ? fromHtml : fromText;
}
