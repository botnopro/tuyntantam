import { connection } from "next/server";
import { json, route } from "@/lib/api/respond";
import { issueFormToken } from "@/lib/security/request";

/** GET /api/v1/form-token — token có ký HMAC + thời điểm phát, form gửi kèm khi submit. */
export const GET = route({ rateLimit: { limit: 30, windowSec: 60, bucket: "form-token" } }, async () => {
  await connection();
  return json({ token: issueFormToken() }, { headers: { "Cache-Control": "no-store" } });
});
