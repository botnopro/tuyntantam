import "server-only";
import { and, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { properties, type Property } from "@/lib/db/schema";
import { extractYoutubeId, safeVirtualTourUrl, sanitizeRichText, stripTags } from "@/lib/security/sanitize";
import { slugify } from "@/lib/utils/format";
import type { PropertyInput } from "@/lib/validation/property";
import { invalidate, TAGS } from "../cache";

export class ConflictError extends Error {}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const db = getDb();
  const root = slugify(base) || "bat-dong-san";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const [hit] = await db
      .select({ id: properties.id })
      .from(properties)
      .where(excludeId ? and(eq(properties.slug, candidate), ne(properties.id, excludeId)) : eq(properties.slug, candidate))
      .limit(1);
    if (!hit) return candidate;
  }
  throw new ConflictError("Không tạo được slug duy nhất");
}

function normalize(input: Partial<PropertyInput>) {
  const out: Partial<typeof properties.$inferInsert> = { ...input } as never;
  if (input.title !== undefined) out.title = stripTags(input.title);
  if (input.summary !== undefined) out.summary = input.summary ? stripTags(input.summary) : null;
  if (input.descriptionHtml !== undefined) out.descriptionHtml = input.descriptionHtml ? sanitizeRichText(input.descriptionHtml) : null;
  if (input.videoYoutubeId !== undefined) out.videoYoutubeId = input.videoYoutubeId ? extractYoutubeId(input.videoYoutubeId) : null;
  if (input.virtualTourUrl !== undefined) out.virtualTourUrl = safeVirtualTourUrl(input.virtualTourUrl);
  if (input.amenities !== undefined) out.amenities = [...new Set(input.amenities.map(stripTags).filter(Boolean))];
  if (input.images !== undefined) out.images = input.images.map((i) => ({ ...i, alt: i.alt ? stripTags(i.alt) : null }));
  delete (out as { slug?: string }).slug;
  return out;
}

function invalidateProperty(...slugs: (string | undefined)[]) {
  invalidate(TAGS.properties, ...slugs.filter(Boolean).map((s) => TAGS.property(s!)));
}

export async function adminListProperties(f: { q?: string; status?: Property["status"]; page: number; limit: number }) {
  const db = getDb();
  const where: SQL[] = [];
  if (f.status) where.push(eq(properties.status, f.status));
  if (f.q) {
    const term = `%${f.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    where.push(or(ilike(properties.title, term), ilike(properties.address, term), ilike(properties.district, term))!);
  }
  const cond = where.length ? and(...where) : undefined;
  const [{ total }] = (await db.select({ total: count() }).from(properties).where(cond)) as [{ total: number }];
  const items = await db
    .select()
    .from(properties)
    .where(cond)
    .orderBy(desc(properties.updatedAt))
    .limit(f.limit)
    .offset((f.page - 1) * f.limit);
  return { items, total, page: f.page, limit: f.limit, pages: Math.max(1, Math.ceil(total / f.limit)) };
}

export async function adminGetProperty(id: string) {
  const [row] = await getDb().select().from(properties).where(eq(properties.id, id)).limit(1);
  return row ?? null;
}

export async function createProperty(input: PropertyInput) {
  const slug = await uniqueSlug(input.slug || input.title);
  const values = {
    ...(normalize(input) as typeof properties.$inferInsert),
    slug,
    source: "admin" as const,
    publishedAt: input.status === "published" ? new Date() : null,
  };
  const [row] = await getDb().insert(properties).values(values).returning();
  invalidateProperty(row!.slug);
  return row!;
}

export async function updateProperty(id: string, input: Partial<PropertyInput>) {
  const current = await adminGetProperty(id);
  if (!current) return null;
  const set = normalize(input);
  if (input.slug && input.slug !== current.slug) set.slug = await uniqueSlug(input.slug, id);
  if (input.status === "published" && !current.publishedAt) set.publishedAt = new Date();
  // Bản ghi import mà admin sửa → chuyển thành admin (seed lại không ghi đè)
  set.source = "admin";
  const [row] = await getDb().update(properties).set(set).where(eq(properties.id, id)).returning();
  invalidateProperty(current.slug, row?.slug);
  return row ?? null;
}

export async function deleteProperty(id: string) {
  const [row] = await getDb().delete(properties).where(eq(properties.id, id)).returning({ slug: properties.slug });
  if (row) invalidateProperty(row.slug);
  return !!row;
}
