"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { ImageRef } from "@/lib/content/types";

type UploadResult = { ok: true; url: string; width: number | null; height: number | null } | { ok: false; name: string; message: string };

// Vercel chặn body request > 4,5 MB → ảnh lớn được thu nhỏ trên trình duyệt trước khi gửi
const MAX_SEND_BYTES = 4 * 1024 * 1024;
const MAX_SIDE = 2560;

async function shrinkImage(file: File): Promise<File> {
  if (file.size <= MAX_SEND_BYTES) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    const ctx = canvas.getContext("2d")!;
    // JPEG không có kênh alpha: lót nền trắng để vùng trong suốt của PNG/WebP không thành màu đen
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    for (const quality of [0.85, 0.75, 0.6]) {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality));
      if (blob && blob.size <= MAX_SEND_BYTES) return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
    }
  } catch {
    // Trình duyệt không đọc được ảnh → gửi bản gốc, server sẽ báo lỗi cụ thể
  }
  return file;
}

/** Gửi từng ảnh một request (giữ mỗi request dưới giới hạn body của Vercel). */
export async function uploadFiles(files: FileList | File[]): Promise<{ images: ImageRef[]; errors: string[] }> {
  const images: ImageRef[] = [];
  const errors: string[] = [];
  for (const original of Array.from(files)) {
    const fd = new FormData();
    fd.append("files", await shrinkImage(original));
    const res = await fetch("/api/v1/admin/uploads", { method: "POST", body: fd }).catch(() => null);
    const body = (await res?.json().catch(() => null)) as { data?: UploadResult[]; error?: { message: string } } | null;
    if (!res?.ok || !body?.data) {
      const fallback = res?.status === 413 ? "Ảnh quá lớn" : "Tải ảnh thất bại";
      errors.push(`${original.name}: ${body?.error?.message ?? fallback}`);
      continue;
    }
    for (const r of body.data) {
      if (r.ok) images.push({ src: r.url, alt: null, width: r.width, height: r.height });
      else errors.push(`${r.name}: ${r.message}`);
    }
  }
  return { images, errors };
}

/** Quản lý danh sách ảnh (upload, alt, sắp xếp, xoá) — giá trị gửi qua input ẩn dạng JSON. */
export function ImageUploader({ name, initial = [], multiple = true }: { name: string; initial?: ImageRef[]; multiple?: boolean }) {
  const [images, setImages] = useState<ImageRef[]>(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const r = await uploadFiles(files);
    setImages((prev) => (multiple ? [...prev, ...r.images] : r.images.slice(0, 1)));
    setErrors(r.errors);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const move = (i: number, d: number) =>
    setImages((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={`${img.src}-${i}`} className="overflow-hidden rounded-sm border border-border-subtle bg-surface-neutral">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.src} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-1.5 p-2">
              <input
                value={img.alt ?? ""}
                onChange={(e) => setImages((prev) => prev.map((x, k) => (k === i ? { ...x, alt: e.target.value || null } : x)))}
                placeholder="Mô tả ảnh (alt)"
                aria-label={`Mô tả ảnh ${i + 1}`}
                className="w-full rounded-xs border border-border-subtle px-2 py-1 text-[12px]"
              />
              <div className="flex justify-between">
                <span className="text-[11px] text-on-surface-variant">{i === 0 ? "Ảnh đại diện" : `#${i + 1}`}</span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    className="cursor-pointer rounded-xs p-1 hover:bg-surface-card"
                    aria-label="Lên trước"
                  >
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    className="cursor-pointer rounded-xs p-1 hover:bg-surface-card"
                    aria-label="Ra sau"
                  >
                    <ArrowRight className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, k) => k !== i))}
                    className="cursor-pointer rounded-xs p-1 text-error hover:bg-surface-card"
                    aria-label="Xoá ảnh"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              </div>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
            className="grid aspect-[4/3] w-full cursor-pointer place-items-center rounded-sm border-2 border-dashed border-border-subtle text-on-surface-variant hover:border-primary hover:text-primary"
          >
            <span className="flex flex-col items-center gap-1 text-[13px]">
              {busy ? <Loader2 className="size-6 animate-spin" aria-hidden /> : <ImagePlus className="size-6" aria-hidden />}
              {busy ? "Đang tải…" : "Thêm ảnh"}
            </span>
          </button>
        </li>
      </ul>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        hidden
        onChange={(e) => onPick(e.target.files)}
      />
      <p className="mt-2 text-[12px] text-on-surface-variant">JPG, PNG, WebP, AVIF — ảnh trên 4 MB được tự thu nhỏ trước khi tải lên.</p>
      {errors.length ? (
        <ul className="mt-2 text-[12px] text-error" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
