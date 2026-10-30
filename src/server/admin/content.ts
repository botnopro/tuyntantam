import "server-only";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { pages, services } from "@/lib/db/schema";
import { sanitizeRichText, stripTags } from "@/lib/security/sanitize";
import { invalidate, TAGS } from "../cache";

const nullableText = (max: number) =>
  z.preprocess((v) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v), z.string().trim().max(max).nullable());

export const pageInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  contentHtml: z.string().max(200_000),
  seoTitle: nullableText(70),
  seoDescription: nullableText(170),
});

export const serviceInputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  summary: nullableText(600),
  contentHtml: z.string().max(100_000),
});

export async function adminListPages() {
  return getDb()
    .select({ id: pages.id, slug: pages.slug, title: pages.title, updatedAt: pages.updatedAt, isPlaceholder: pages.isPlaceholder })
    .from(pages)
    .orderBy(asc(pages.slug));
}

export async function adminGetPage(id: string) {
  const [row] = await getDb().select().from(pages).where(eq(pages.id, id)).limit(1);
  return row ?? null;
}

export async function updatePage(id: string, input: z.output<typeof pageInputSchema>) {
  const [row] = await getDb()
    .update(pages)
    .set({
      title: stripTags(input.title),
      contentHtml: sanitizeRichText(input.contentHtml),
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      isPlaceholder: false,
      source: "admin",
    })
    .where(eq(pages.id, id))
    .returning();
  if (row) invalidate(TAGS.pages, TAGS.page(row.slug));
  return row ?? null;
}

export async function adminListServices() {
  return getDb().select().from(services).orderBy(asc(services.sortOrder));
}

export async function adminGetService(id: string) {
  const [row] = await getDb().select().from(services).where(eq(services.id, id)).limit(1);
  return row ?? null;
}

export async function updateService(id: string, input: z.output<typeof serviceInputSchema>) {
  const html = sanitizeRichText(input.contentHtml);
  const [row] = await getDb()
    .update(services)
    .set({
      title: stripTags(input.title),
      summary: input.summary ? stripTags(input.summary) : null,
      contentHtml: html,
      isPlaceholder: /Nội dung đang được cập nhật/.test(html),
      source: "admin",
    })
    .where(eq(services.id, id))
    .returning();
  if (row) invalidate(TAGS.services);
  return row ?? null;
}
