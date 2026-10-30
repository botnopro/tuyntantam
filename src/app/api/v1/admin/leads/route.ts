import { json, route } from "@/lib/api/respond";
import { leadListSchema } from "@/lib/validation/lead";
import { listLeads } from "@/server/leads";

/** GET /api/v1/admin/leads?status=&type=&q=&page=&limit= */
export const GET = route({ role: "EDITOR" }, async (req) => {
  const r = await listLeads(leadListSchema.parse(Object.fromEntries(new URL(req.url).searchParams)));
  return json(
    r.items.map(({ lead, propertyTitle, propertySlug }) => ({
      ...lead,
      ipHash: undefined,
      property: propertySlug ? { slug: propertySlug, title: propertyTitle } : null,
    })),
    { meta: { total: r.total, page: r.page, limit: r.limit, pages: r.pages } },
  );
});
