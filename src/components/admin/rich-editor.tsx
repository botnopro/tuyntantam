"use client";

import { Bold, Code2, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Unlink } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { uploadFiles } from "./image-uploader";

/**
 * Trình soạn thảo rich text gọn nhẹ (contentEditable + execCommand), không thêm thư viện.
 * HTML luôn được sanitize lại phía server trước khi lưu.
 */
export function RichEditor({ name, initial, minHeight = 360 }: { name: string; initial: string; minHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [html, setHtml] = useState(initial);
  const [source, setSource] = useState(false);

  useEffect(() => {
    if (ref.current && !source) ref.current.innerHTML = html;
    // chỉ đồng bộ khi chuyển chế độ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  const exec = (cmd: string, value?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, value);
    setHtml(ref.current?.innerHTML ?? "");
  };

  async function insertImage(files: FileList | null) {
    if (!files?.length) return;
    const { images, errors } = await uploadFiles(files);
    if (errors.length) alert(errors.join("\n"));
    images.forEach((img) => exec("insertHTML", `<figure><img src="${img.src}" alt=""></figure><p></p>`));
    if (fileRef.current) fileRef.current.value = "";
  }

  // Thanh công cụ: dữ liệu thuần; xử lý trong handler sự kiện (không đọc ref lúc render)
  const tools = [
    { id: "bold", icon: Bold, label: "Đậm" },
    { id: "italic", icon: Italic, label: "Nghiêng" },
    { id: "h2", icon: Heading2, label: "Tiêu đề H2" },
    { id: "h3", icon: Heading3, label: "Tiêu đề H3" },
    { id: "ul", icon: List, label: "Danh sách" },
    { id: "ol", icon: ListOrdered, label: "Danh sách số" },
    { id: "quote", icon: Quote, label: "Trích dẫn" },
    { id: "link", icon: Link2, label: "Chèn liên kết" },
    { id: "unlink", icon: Unlink, label: "Bỏ liên kết" },
    { id: "image", icon: ImagePlus, label: "Chèn ảnh" },
  ] as const;

  function runTool(id: (typeof tools)[number]["id"]) {
    switch (id) {
      case "bold":
        return exec("bold");
      case "italic":
        return exec("italic");
      case "h2":
        return exec("formatBlock", "<h2>");
      case "h3":
        return exec("formatBlock", "<h3>");
      case "ul":
        return exec("insertUnorderedList");
      case "ol":
        return exec("insertOrderedList");
      case "quote":
        return exec("formatBlock", "<blockquote>");
      case "unlink":
        return exec("unlink");
      case "image":
        return fileRef.current?.click();
      case "link": {
        const url = prompt("Địa chỉ liên kết (https://… hoặc /trang-noi-bo)");
        if (url && (/^https?:\/\//.test(url) || url.startsWith("/") || url.startsWith("mailto:") || url.startsWith("tel:")))
          exec("createLink", url);
      }
    }
  }

  return (
    <div className="overflow-hidden rounded-sm border border-border-subtle bg-surface-card">
      <input type="hidden" name={name} value={html} />
      <div
        className="flex flex-wrap items-center gap-0.5 border-b border-border-subtle bg-surface-neutral p-1.5"
        role="toolbar"
        aria-label="Định dạng"
      >
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => runTool(t.id)}
            disabled={source}
            title={t.label}
            aria-label={t.label}
            className="grid size-8 cursor-pointer place-items-center rounded-xs text-slate-dark hover:bg-surface-card disabled:opacity-40"
          >
            <t.icon className="size-4" aria-hidden />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSource((s) => !s)}
          aria-pressed={source}
          className={cn(
            "ml-auto inline-flex h-8 cursor-pointer items-center gap-1 rounded-xs px-2 text-[12px] font-semibold",
            source ? "bg-surface-card text-primary" : "text-slate-dark hover:bg-surface-card",
          )}
        >
          <Code2 className="size-4" aria-hidden /> HTML
        </button>
      </div>
      {source ? (
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          aria-label="Mã HTML"
          style={{ minHeight }}
          className="block w-full p-3 font-mono text-[13px] focus:outline-none"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Nội dung"
          onInput={() => setHtml(ref.current?.innerHTML ?? "")}
          style={{ minHeight }}
          className="prose-content max-w-none p-4 focus:outline-none"
        />
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        hidden
        onChange={(e) => insertImage(e.target.files)}
      />
    </div>
  );
}
