import "server-only";
import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import type { SettingsMap } from "@/lib/content/types";
import { invalidate, TAGS } from "./cache";

export async function getSettings<K extends keyof SettingsMap>(key: K): Promise<SettingsMap[K]> {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.settings);
  const [row] = await getDb().select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  if (!row) throw new Error(`Thiếu cấu hình "${key}" — hãy chạy npm run db:seed`);
  return row.value as SettingsMap[K];
}

export async function saveSettings<K extends keyof SettingsMap>(key: K, value: SettingsMap[K]): Promise<void> {
  await getDb().insert(siteSettings).values({ key, value }).onConflictDoUpdate({ target: siteSettings.key, set: { value } });
  invalidate(TAGS.settings);
}
