import { ApiError, json, readJson, route, zodDetails } from "@/lib/api/respond";
import { requireRole } from "@/lib/auth/guard";
import type { SettingsMap } from "@/lib/content/types";
import { looseSettingsSchema, SETTINGS_KEYS, siteSettingsSchema } from "@/lib/validation/settings";
import { getSettings, saveSettings } from "@/server/settings";

type P = { key: string };
const key = (params: P) => {
  if (!SETTINGS_KEYS.includes(params.key as (typeof SETTINGS_KEYS)[number])) throw new ApiError(404, "not_found", "Không có cấu hình này");
  return params.key as keyof SettingsMap;
};

export const GET = route<P>({ role: "EDITOR" }, async (_req, { params }) => json(await getSettings(key(params))));

/** PUT — chỉ ADMIN. Cấu hình "site" được kiểm tra chặt theo schema. */
export const PUT = route<P>({ role: "EDITOR" }, async (req, { params }) => {
  await requireRole("ADMIN");
  const k = key(params);
  const body = await readJson(req, 300_000);
  const parsed = k === "site" ? siteSettingsSchema.safeParse(body) : looseSettingsSchema.safeParse(body);
  if (!parsed.success) throw new ApiError(400, "validation_error", "Dữ liệu không hợp lệ", zodDetails(parsed.error.issues));
  await saveSettings(k, parsed.data as SettingsMap[typeof k]);
  return json(await getSettings(k));
});
