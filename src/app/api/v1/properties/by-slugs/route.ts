import { z } from "zod";
import { json, PUBLIC_READ_LIMIT, route } from "@/lib/api/respond";
import { slugSchema } from "@/lib/validation/common";
import { propertiesBySlugs } from "@/server/properties";

const schema = z.array(slugSchema).max(10);

/** GET /api/v1/properties/by-slugs?slugs=a,b — dữ liệu cho trang Yêu thích / So sánh (lưu ở trình duyệt). */
export const GET = route({ rateLimit: PUBLIC_READ_LIMIT }, async (req) => {
  const raw = new URL(req.url).searchParams.get("slugs") ?? "";
  const slugs = schema.parse(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return json(await propertiesBySlugs(slugs));
});
