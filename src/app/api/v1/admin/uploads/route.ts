import { ApiError, json, route } from "@/lib/api/respond";
import { saveImage, UPLOAD_MAX_BYTES, UPLOAD_MAX_FILES } from "@/server/admin/uploads";

/** POST /api/v1/admin/uploads — multipart, trường "files" (tối đa 20 ảnh, mỗi ảnh ≤ 5 MB). */
export const POST = route({ role: "EDITOR", rateLimit: { limit: 60, windowSec: 600, bucket: "upload" } }, async (req, { user }) => {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (!len) throw new ApiError(411, "length_required", "Thiếu Content-Length");
  if (len > UPLOAD_MAX_BYTES * UPLOAD_MAX_FILES + 100_000) throw new ApiError(413, "payload_too_large", "Dữ liệu tải lên quá lớn");
  const form = await req.formData().catch(() => null);
  if (!form) throw new ApiError(400, "invalid_form", "Yêu cầu phải là multipart/form-data");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (!files.length) throw new ApiError(400, "no_files", "Chưa chọn ảnh");
  if (files.length > UPLOAD_MAX_FILES) throw new ApiError(400, "too_many_files", `Tối đa ${UPLOAD_MAX_FILES} ảnh mỗi lần`);
  const results = [];
  for (const file of files) results.push(await saveImage(file, user!.id));
  return json(results, { status: 201 });
});
