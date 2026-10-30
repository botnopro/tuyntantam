import { z } from "zod";
import { apiError, json, readJson, route } from "@/lib/api/respond";
import { clientIp } from "@/lib/security/request";
import { login } from "@/server/admin/users";

const schema = z.object({ email: z.string().trim().max(200), password: z.string().min(1).max(200) });

/** POST /api/v1/auth/login — tạo phiên (cookie HttpOnly). */
export const POST = route({}, async (req) => {
  const body = schema.safeParse(await readJson(req, 2_000));
  if (!body.success) return apiError(400, "validation_error", "Thiếu email hoặc mật khẩu");
  const result = await login(body.data.email, body.data.password, clientIp(req.headers), req.headers.get("user-agent"));
  if (!result.ok) return apiError(401, "invalid_credentials", result.message);
  return json({ ok: true });
});
