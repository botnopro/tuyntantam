import { apiError, json, readJson, route } from "@/lib/api/respond";
import { submitLead } from "@/server/leads";

/**
 * POST /api/v1/leads — khách gửi liên hệ / đặt lịch xem / ký gửi.
 * Chống spam: honeypot `website`, `formToken` (GET /api/v1/form-token), Turnstile (nếu bật), rate limit 5/10 phút/IP.
 */
export const POST = route({}, async (req) => {
  const body = await readJson(req, 20_000);
  const result = await submitLead(body, req.headers);
  if (!result.ok) {
    return apiError(result.status, result.status === 429 ? "rate_limited" : "validation_error", result.message, result.fieldErrors);
  }
  return json({ received: true }, { status: 201 });
});
