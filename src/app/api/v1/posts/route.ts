import { json, PUBLIC_READ_LIMIT, route } from "@/lib/api/respond";
import { flattenParams } from "@/lib/validation/common";
import { postFilterSchema } from "@/lib/validation/post";
import { listPosts } from "@/server/posts";

/** GET /api/v1/posts?q=&category=&tag=&page=&limit= */
export const GET = route({ rateLimit: PUBLIC_READ_LIMIT }, async (req) => {
  const filters = postFilterSchema.parse(flattenParams(new URL(req.url).searchParams));
  const result = await listPosts(filters);
  return json(result.items, { meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
});
