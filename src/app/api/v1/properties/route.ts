import { json, PUBLIC_READ_LIMIT, route } from "@/lib/api/respond";
import { flattenParams } from "@/lib/validation/common";
import { propertyFilterSchema } from "@/lib/validation/property";
import { searchProperties } from "@/server/properties";

/** GET /api/v1/properties — lọc, tìm kiếm, sắp xếp, phân trang tin BĐS đã đăng. */
export const GET = route({ rateLimit: PUBLIC_READ_LIMIT }, async (req) => {
  const params = flattenParams(new URL(req.url).searchParams, ["amenities"]);
  const filters = propertyFilterSchema.parse(params);
  const result = await searchProperties(filters);
  return json(result.items, {
    meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages, filters },
  });
});
