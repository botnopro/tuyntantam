import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { uploadDir } from "@/server/admin/uploads";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

/** Phục vụ ảnh upload lưu trên đĩa (khi không dùng Vercel Blob). Chặn path traversal. */
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path } = await ctx.params;
  if (!path.every((seg) => /^[a-zA-Z0-9._-]+$/.test(seg) && seg !== ".." && seg !== ".")) {
    return new Response("Not found", { status: 404 });
  }
  const ext = path.at(-1)?.split(".").pop()?.toLowerCase() ?? "";
  const type = TYPES[ext];
  const root = resolve(/*turbopackIgnore: true*/ uploadDir());
  const file = resolve(join(/*turbopackIgnore: true*/ root, ...path));
  if (!type || !file.startsWith(root + sep)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
