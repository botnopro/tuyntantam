import { json, route } from "@/lib/api/respond";

/** GET /api/v1/auth/me — thông tin người dùng đang đăng nhập. */
export const GET = route({ role: "EDITOR" }, async (_req, { user }) => json(user));
