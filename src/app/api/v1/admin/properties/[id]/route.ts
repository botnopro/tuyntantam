import { ApiError, json, readJson, route, zodDetails } from "@/lib/api/respond";
import { requireRole } from "@/lib/auth/guard";
import { uuidSchema } from "@/lib/validation/common";
import { propertyPatchSchema } from "@/lib/validation/property";
import { adminGetProperty, deleteProperty, updateProperty } from "@/server/admin/properties";

type P = { id: string };
const id = (params: P) => {
  const r = uuidSchema.safeParse(params.id);
  if (!r.success) throw new ApiError(404, "not_found", "Không tìm thấy bất động sản");
  return r.data;
};

export const GET = route<P>({ role: "EDITOR" }, async (_req, { params }) => {
  const row = await adminGetProperty(id(params));
  if (!row) throw new ApiError(404, "not_found", "Không tìm thấy bất động sản");
  return json(row);
});

export const PATCH = route<P>({ role: "EDITOR" }, async (req, { params }) => {
  const parsed = propertyPatchSchema.safeParse(await readJson(req));
  if (!parsed.success) throw new ApiError(400, "validation_error", "Dữ liệu không hợp lệ", zodDetails(parsed.error.issues));
  const row = await updateProperty(id(params), parsed.data);
  if (!row) throw new ApiError(404, "not_found", "Không tìm thấy bất động sản");
  return json(row);
});

/** Xoá chỉ dành cho ADMIN. */
export const DELETE = route<P>({ role: "EDITOR" }, async (_req, { params }) => {
  await requireRole("ADMIN");
  if (!(await deleteProperty(id(params)))) throw new ApiError(404, "not_found", "Không tìm thấy bất động sản");
  return new Response(null, { status: 204 });
});
