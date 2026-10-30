import { ApiError, json, PUBLIC_READ_LIMIT, route } from "@/lib/api/respond";
import { slugSchema } from "@/lib/validation/common";
import { getPostBySlug } from "@/server/posts";

/** GET /api/v1/posts/:slug */
export const GET = route<{ slug: string }>({ rateLimit: PUBLIC_READ_LIMIT }, async (_req, { params }) => {
  const slug = slugSchema.safeParse(params.slug);
  const post = slug.success ? await getPostBySlug(slug.data) : null;
  if (!post) throw new ApiError(404, "not_found", "Không tìm thấy bài viết");
  const { source: _source, status: _status, sourceUrl: _sourceUrl, ...publicFields } = post;
  return json(publicFields);
});
