import { z } from "zod";
import { ApiError, json, readJson, route, zodDetails } from "@/lib/api/respond";
import { postInputSchema } from "@/lib/validation/post";
import { adminListPosts, createPost } from "@/server/admin/posts";

const listSchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["draft", "published", "archived"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
});

export const GET = route({ role: "EDITOR" }, async (req) => {
  const r = await adminListPosts(listSchema.parse(Object.fromEntries(new URL(req.url).searchParams)));
  return json(r.items, { meta: { total: r.total, page: r.page, limit: r.limit, pages: r.pages } });
});

export const POST = route({ role: "EDITOR" }, async (req) => {
  const parsed = postInputSchema.safeParse(await readJson(req, 400_000));
  if (!parsed.success) throw new ApiError(400, "validation_error", "Dữ liệu không hợp lệ", zodDetails(parsed.error.issues));
  return json(await createPost(parsed.data), { status: 201 });
});
