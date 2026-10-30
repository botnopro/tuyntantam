import { json, route } from "@/lib/api/respond";
import { destroySession } from "@/lib/auth/session";

/** POST /api/v1/auth/logout */
export const POST = route({}, async () => {
  await destroySession();
  return json({ ok: true });
});
