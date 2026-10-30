import { ApiError, json, readJson, route, zodDetails } from "@/lib/api/respond";
import { requireRole } from "@/lib/auth/guard";
import { uuidSchema } from "@/lib/validation/common";
import { postPatchSchema } from "@/lib/validation/post";
import { adminGetPost, deletePost, updatePost } from "@/server/admin/posts";

type P = { id: string };
const id = (params: P) => {
  const r = uuidSchema.safeParse(params.id);
  if (!r.success) throw new ApiError(404, "not_found", "Không tìm thấy bài viết");
  return r.data;
};

export const GET = route<P>({ role: "EDITOR" }, async (_req, { params }) => {
  const row = await adminGetPost(id(params));
  if (!row) throw new ApiError(404, "not_found", "Không tìm thấy bài viết");
  return json(row);
});

export const PATCH = route<P>({ role: "EDITOR" }, async (req, { params }) => {
  const parsed = postPatchSchema.safeParse(await readJson(req, 400_000));
  if (!parsed.success) throw new ApiError(400, "validation_error", "Dữ liệu không hợp lệ", zodDetails(parsed.error.issues));
  const row = await updatePost(id(params), parsed.data);
  if (!row) throw new ApiError(404, "not_found", "Không tìm thấy bài viết");
  return json(row);
});

export const DELETE = route<P>({ role: "EDITOR" }, async (_req, { params }) => {
  await requireRole("ADMIN");
  if (!(await deletePost(id(params)))) throw new ApiError(404, "not_found", "Không tìm thấy bài viết");
  return new Response(null, { status: 204 });
});
