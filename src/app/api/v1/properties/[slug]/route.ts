import { ApiError, json, PUBLIC_READ_LIMIT, route } from "@/lib/api/respond";
import { slugSchema } from "@/lib/validation/common";
import { getPropertyBySlug } from "@/server/properties";

/** GET /api/v1/properties/:slug */
export const GET = route<{ slug: string }>({ rateLimit: PUBLIC_READ_LIMIT }, async (_req, { params }) => {
  const slug = slugSchema.safeParse(params.slug);
  const property = slug.success ? await getPropertyBySlug(slug.data) : null;
  if (!property) throw new ApiError(404, "not_found", "Không tìm thấy bất động sản");
  const { source: _source, status: _status, ...publicFields } = property;
  return json(publicFields);
});
