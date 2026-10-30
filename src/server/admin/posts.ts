import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, ne, or, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { categories, postCategories, posts, type Post } from "@/lib/db/schema";
import { sanitizeRichText, stripTags } from "@/lib/security/sanitize";
import { readingMinutes, slugify } from "@/lib/utils/format";
import type { PostInput } from "@/lib/validation/post";
import { invalidate, TAGS } from "../cache";

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const db = getDb();
  const root = slugify(base) || "bai-viet";
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`;
    const [hit] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(excludeId ? and(eq(posts.slug, candidate), ne(posts.id, excludeId)) : eq(posts.slug, candidate))
      .limit(1);
    if (!hit) return candidate;
  }
  throw new Error("Không tạo được slug duy nhất");
}

function normalize(input: Partial<PostInput>) {
  const out: Partial<typeof posts.$inferInsert> = {};
  if (input.title !== undefined) out.title = stripTags(input.title);
  if (input.excerpt !== undefined) out.excerpt = input.excerpt ? stripTags(input.excerpt) : null;
  if (input.contentHtml !== undefined) {
    out.contentHtml = sanitizeRichText(input.contentHtml);
    out.readingMinutes = readingMinutes(out.contentHtml);
  }
  if (input.coverImage !== undefined)
    out.coverImage = input.coverImage
      ? { src: input.coverImage.src, alt: input.coverImage.alt ? stripTags(input.coverImage.alt) : null }
      : null;
  if (input.tags !== undefined) out.tags = [...new Set(input.tags.map(stripTags).filter(Boolean))];
  if (input.authorName !== undefined) out.authorName = input.authorName ? stripTags(input.authorName) : null;
  if (input.status !== undefined) out.status = input.status;
  if (input.featured !== undefined) out.featured = input.featured;
  if (input.seoTitle !== undefined) out.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) out.seoDescription = input.seoDescription;
  if (input.publishedAt !== undefined) out.publishedAt = input.publishedAt;
  return out;
}

type Tx = Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0];

async function setCategories(postId: string, slugs: string[], db: Tx | ReturnType<typeof getDb> = getDb()) {
  await db.delete(postCategories).where(eq(postCategories.postId, postId));
  if (!slugs.length) return;
  const cats = await db.select({ id: categories.id }).from(categories).where(inArray(categories.slug, slugs));
  if (cats.length) await db.insert(postCategories).values(cats.map((c) => ({ postId, categoryId: c.id })));
}

export async function adminListPosts(f: { q?: string; status?: Post["status"]; page: number; limit: number }) {
  const db = getDb();
  const where: SQL[] = [];
  if (f.status) where.push(eq(posts.status, f.status));
  if (f.q) {
    const term = `%${f.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    where.push(or(ilike(posts.title, term), ilike(posts.excerpt, term))!);
  }
  const cond = where.length ? and(...where) : undefined;
  const [{ total }] = (await db.select({ total: count() }).from(posts).where(cond)) as [{ total: number }];
  const items = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      status: posts.status,
      featured: posts.featured,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      source: posts.source,
    })
    .from(posts)
    .where(cond)
    .orderBy(desc(posts.updatedAt))
    .limit(f.limit)
    .offset((f.page - 1) * f.limit);
  return { items, total, page: f.page, limit: f.limit, pages: Math.max(1, Math.ceil(total / f.limit)) };
}

export async function adminGetPost(id: string) {
  const db = getDb();
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!row) return null;
  const cats = await db
    .select({ slug: categories.slug })
    .from(postCategories)
    .innerJoin(categories, eq(categories.id, postCategories.categoryId))
    .where(eq(postCategories.postId, id));
  return { ...row, categorySlugs: cats.map((c) => c.slug) };
}

export async function allCategoriesForAdmin() {
  return getDb()
    .select({ slug: categories.slug, name: categories.name, parentSlug: categories.parentSlug })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
}

export async function createPost(input: PostInput) {
  const slug = await uniqueSlug(input.slug || input.title);
  const values = {
    ...normalize(input),
    title: stripTags(input.title),
    slug,
    source: "admin" as const,
    publishedAt: input.publishedAt ?? (input.status === "published" ? new Date() : null),
  };
  const row = await getDb().transaction(async (tx) => {
    const [created] = await tx.insert(posts).values(values).returning();
    await setCategories(created!.id, input.categorySlugs, tx);
    return created;
  });
  invalidate(TAGS.posts, TAGS.post(row!.slug));
  return row!;
}

export async function updatePost(id: string, input: Partial<PostInput>) {
  const current = await adminGetPost(id);
  if (!current) return null;
  const set = normalize(input);
  if (input.slug && input.slug !== current.slug) set.slug = await uniqueSlug(input.slug, id);
  if (input.status === "published" && !current.publishedAt && !input.publishedAt) set.publishedAt = new Date();
  set.source = "admin";
  const row = await getDb().transaction(async (tx) => {
    const [updated] = await tx.update(posts).set(set).where(eq(posts.id, id)).returning();
    if (input.categorySlugs) await setCategories(id, input.categorySlugs, tx);
    return updated;
  });
  invalidate(TAGS.posts, TAGS.post(current.slug), TAGS.post(row!.slug));
  return row ?? null;
}

export async function deletePost(id: string) {
  const [row] = await getDb().delete(posts).where(eq(posts.id, id)).returning({ slug: posts.slug });
  if (row) invalidate(TAGS.posts, TAGS.post(row.slug));
  return !!row;
}
