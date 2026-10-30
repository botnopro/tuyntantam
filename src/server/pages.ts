import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";
import { pages, services } from "@/lib/db/schema";
import { TAGS } from "./cache";

export async function getPage(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.pages, TAGS.page(slug));
  const [row] = await getDb().select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return row ?? null;
}

export async function listServices() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.services);
  return getDb().select().from(services).orderBy(asc(services.sortOrder));
}

export async function getService(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.services);
  const [row] = await getDb().select().from(services).where(eq(services.slug, slug)).limit(1);
  return row ?? null;
}

export async function allPageSlugs() {
  "use cache";
  cacheLife("days");
  cacheTag(TAGS.pages);
  return getDb().select({ slug: pages.slug, updatedAt: pages.updatedAt }).from(pages);
}
