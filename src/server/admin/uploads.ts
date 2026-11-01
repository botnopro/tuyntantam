import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { getDb } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { env } from "@/lib/env";

/** Thư mục lưu ảnh khi không dùng Vercel Blob (Docker: mount volume vào đây). */
export const uploadDir = () => process.env.UPLOAD_DIR || join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads");

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MAX_FILES = 20;

type Kind = { mime: string; ext: string };

/** Nhận diện ảnh theo magic bytes — không tin Content-Type/đuôi file. SVG bị từ chối (XSS). */
export function sniffImage(buf: Uint8Array): Kind | null {
  const b = (i: number) => buf[i] ?? -1;
  if (b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47) return { mime: "image/png", ext: "png" };
  const ascii = (from: number, to: number) => String.fromCharCode(...buf.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (ascii(4, 8) === "ftyp" && /^(avif|avis)$/.test(ascii(8, 12))) return { mime: "image/avif", ext: "avif" };
  return null;
}

/** Kích thước ảnh (JPEG/PNG/WebP) đọc từ header, để next/image có width/height. */
function dimensions(buf: Uint8Array, mime: string): { width: number; height: number } | null {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  try {
    if (mime === "image/png") return { width: dv.getUint32(16), height: dv.getUint32(20) };
    if (mime === "image/webp") {
      const chunk = String.fromCharCode(...buf.slice(12, 16));
      if (chunk === "VP8X") return { width: 1 + (dv.getUint32(24, true) & 0xffffff), height: 1 + (dv.getUint32(27, true) & 0xffffff) };
      if (chunk === "VP8 ") return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
      if (chunk === "VP8L") {
        const bits = dv.getUint32(21, true);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
    }
    if (mime === "image/jpeg") {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) return null;
        const marker = buf[i + 1]!;
        const len = dv.getUint16(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
        }
        i += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export type UploadResult =
  { ok: true; url: string; width: number | null; height: number | null } | { ok: false; name: string; message: string };

/**
 * Có Vercel Blob khi có token đọc-ghi, hoặc store gắn kiểu mới (Vercel chỉ cấp BLOB_STORE_ID + OIDC,
 * không có BLOB_READ_WRITE_TOKEN) — khi đó SDK tự lấy thông tin xác thực từ biến môi trường.
 */
export const blobEnabled = () => Boolean(env().BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

/** Ghi lên Blob: store public → URL CDN; store private → phục vụ qua /uploads/... (route đọc lại bằng `get`). */
async function putBlob(key: string, buf: Uint8Array, mime: string): Promise<string> {
  const opts = { contentType: mime, token: env().BLOB_READ_WRITE_TOKEN, addRandomSuffix: false };
  try {
    return (await put(key, Buffer.from(buf), { ...opts, access: "public" })).url;
  } catch (err) {
    if (!/private/i.test(err instanceof Error ? err.message : "")) throw err;
    await put(key, Buffer.from(buf), { ...opts, access: "private" });
    return `/${key}`;
  }
}

export async function saveImage(file: File, userId: string): Promise<UploadResult> {
  if (file.size > UPLOAD_MAX_BYTES) return { ok: false, name: file.name, message: "Ảnh vượt quá 5 MB" };
  const buf = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(buf);
  if (!kind) return { ok: false, name: file.name, message: "Chỉ nhận ảnh JPG, PNG, WebP hoặc AVIF" };
  const dims = dimensions(buf, kind.mime);
  const now = new Date();
  const key = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${randomUUID()}.${kind.ext}`;

  let url: string;
  try {
    if (blobEnabled()) {
      url = await putBlob(key, buf, kind.mime);
    } else {
      if (process.env.VERCEL) {
        return {
          ok: false,
          name: file.name,
          message: "Chưa gắn Vercel Blob cho dự án (Vercel → Storage → Blob → Connect) nên chưa lưu được ảnh",
        };
      }
      const rel = key.replace(/^uploads\//, "").split("/");
      await mkdir(join(/*turbopackIgnore: true*/ uploadDir(), ...rel.slice(0, -1)), { recursive: true });
      await writeFile(join(/*turbopackIgnore: true*/ uploadDir(), ...rel), buf);
      url = `/${key}`;
    }
  } catch (err) {
    // Lỗi lưu trữ (Blob hết hạn mức, sai quyền, đĩa đầy…) → báo rõ cho admin thay vì lỗi 500 chung chung
    console.error("[upload] lưu ảnh thất bại", err);
    return { ok: false, name: file.name, message: `Không lưu được ảnh: ${err instanceof Error ? err.message : "lỗi không xác định"}` };
  }
  await getDb()
    .insert(media)
    .values({ url, mime: kind.mime, bytes: file.size, width: dims?.width ?? null, height: dims?.height ?? null, uploadedBy: userId });
  return { ok: true, url, width: dims?.width ?? null, height: dims?.height ?? null };
}
