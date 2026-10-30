import { route } from "@/lib/api/respond";
import { leadListSchema } from "@/lib/validation/lead";
import { exportLeadsCsv } from "@/server/leads";

/** GET /api/v1/admin/leads/export?status=&type= — tải CSV (UTF-8 BOM, mở được bằng Excel). */
export const GET = route({ role: "EDITOR" }, async (req) => {
  const { status, type } = leadListSchema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const csv = await exportLeadsCsv({ status, type });
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="khach-lien-he-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
});
