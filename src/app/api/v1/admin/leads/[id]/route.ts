import { ApiError, json, readJson, route, zodDetails } from "@/lib/api/respond";
import { requireRole } from "@/lib/auth/guard";
import { uuidSchema } from "@/lib/validation/common";
import { leadUpdateSchema } from "@/lib/validation/lead";
import { deleteLead, getLead, updateLead } from "@/server/leads";

type P = { id: string };
const id = (params: P) => {
  const r = uuidSchema.safeParse(params.id);
  if (!r.success) throw new ApiError(404, "not_found", "Không tìm thấy khách liên hệ");
  return r.data;
};

export const GET = route<P>({ role: "EDITOR" }, async (_req, { params }) => {
  const row = await getLead(id(params));
  if (!row) throw new ApiError(404, "not_found", "Không tìm thấy khách liên hệ");
  return json({ ...row.lead, ipHash: undefined, property: row.propertySlug ? { slug: row.propertySlug, title: row.propertyTitle } : null });
});

/** PATCH — đổi trạng thái (NEW/IN_PROGRESS/DONE/SPAM), ghi chú. */
export const PATCH = route<P>({ role: "EDITOR" }, async (req, { params, user }) => {
  const parsed = leadUpdateSchema.safeParse(await readJson(req, 5_000));
  if (!parsed.success) throw new ApiError(400, "validation_error", "Dữ liệu không hợp lệ", zodDetails(parsed.error.issues));
  const row = await updateLead(id(params), parsed.data, user!.id);
  if (!row) throw new ApiError(404, "not_found", "Không tìm thấy khách liên hệ");
  return json({ ...row, ipHash: undefined });
});

export const DELETE = route<P>({ role: "EDITOR" }, async (_req, { params }) => {
  await requireRole("ADMIN");
  if (!(await deleteLead(id(params)))) throw new ApiError(404, "not_found", "Không tìm thấy khách liên hệ");
  return new Response(null, { status: 204 });
});
