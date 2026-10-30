import { z } from "zod";
import { json, readJson, route, zodDetails, ApiError } from "@/lib/api/respond";
import { propertyInputSchema } from "@/lib/validation/property";
import { adminListProperties, createProperty } from "@/server/admin/properties";

const listSchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["draft", "published", "archived"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10000).catch(1),
  limit: z.coerce.number().int().min(1).max(100).catch(20),
});

/** GET /api/v1/admin/properties — danh sách (mọi trạng thái). */
export const GET = route({ role: "EDITOR" }, async (req) => {
  const f = listSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const r = await adminListProperties(f);
  return json(r.items, { meta: { total: r.total, page: r.page, limit: r.limit, pages: r.pages } });
});

/** POST /api/v1/admin/properties — tạo tin BĐS. */
export const POST = route({ role: "EDITOR" }, async (req) => {
  const parsed = propertyInputSchema.safeParse(await readJson(req));
  if (!parsed.success) throw new ApiError(400, "validation_error", "Dữ liệu không hợp lệ", zodDetails(parsed.error.issues));
  return json(await createProperty(parsed.data), { status: 201 });
});
