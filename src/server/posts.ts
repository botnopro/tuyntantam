import "server-only";
import { and, asc, count, desc, eq, gt, ilike, lt, ne, or, sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";
import { categories, postCategories, posts, type Post } from "@/lib/db/schema";
import type { PostFilters } from "@/lib/validation/post";
import { TAGS } from "./cache";

export type PostCard = Pick<
  Post,
  "id" | "slug" | "title" | "excerpt" | "coverImage" | "publishedAt" | "readingMinutes" | "authorName" | "featured" | "tags"
> & { categories: { slug: string; name: string }[] };

const cardColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  publishedAt: posts.publishedAt,
  readingMinutes: posts.readingMinutes,
  authorName: posts.authorName,
  featured: posts.featured,
  tags: posts.tags,
};

const isPublished = and(eq(posts.status, "published"), sql`${posts.publishedAt} <= now()`)!;

async function attachCategories<T extends { id: string }>(rows: T[]): Promise<(T & { categories: { slug: string; name: string }[] })[]> {
  if (!rows.length) return [];
  const links = await getDb()
    .select({ postId: postCategories.postId, slug: categories.slug, name: categories.name })
    .from(postCategories)
    .innerJoin(categories, eq(categories.id, postCategories.categoryId))
    .where(sql`${postCategories.postId} in ${rows.map((r) => r.id)}`)
    .orderBy(asc(categories.sortOrder));
  return rows.map((r) => ({
    ...r,
    categories: links.filter((l) => l.postId === r.id).map(({ slug, name }) => ({ slug, name })),
  }));
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export async function listPosts(filters: PostFilters) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const db = getDb();
  const where: SQL[] = [isPublished];
  if (filters.q) {
    const term = `%${escapeLike(filters.q)}%`;
    // Không quét content_html (nặng, không có index) — tìm theo tiêu đề và mô tả
    where.push(or(ilike(posts.title, term), ilike(posts.excerpt, term))!);
  }
  if (filters.category) {
    // gồm cả chuyên mục con
    where.push(sql`exists (
      select 1 from post_categories pc join categories c on c.id = pc.category_id
      where pc.post_id = "posts"."id" and (c.slug = ${filters.category} or c.parent_slug = ${filters.category}))`);
  }
  if (filters.tag) where.push(sql`${filters.tag} = any(${posts.tags})`);
  const cond = and(...where);
  const [{ total }] = (await db.select({ total: count() }).from(posts).where(cond)) as [{ total: number }];
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .where(cond)
    .orderBy(desc(posts.publishedAt))
    .limit(filters.limit)
    .offset((filters.page - 1) * filters.limit);
  return {
    items: await attachCategories(rows),
    total,
    page: filters.page,
    limit: filters.limit,
    pages: Math.max(1, Math.ceil(total / filters.limit)),
  };
}

export async function latestPosts(limit = 4) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const rows = await getDb().select(cardColumns).from(posts).where(isPublished).orderBy(desc(posts.publishedAt)).limit(limit);
  return attachCategories(rows);
}

export async function featuredPost() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const [row] = await getDb()
    .select(cardColumns)
    .from(posts)
    .where(isPublished)
    .orderBy(desc(posts.featured), desc(posts.publishedAt))
    .limit(1);
  return row ? (await attachCategories([row]))[0]! : null;
}

export async function getPostBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts, TAGS.post(slug));
  const [row] = await getDb()
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), isPublished))
    .limit(1);
  if (!row) return null;
  const [withCats] = await attachCategories([row]);
  return withCats!;
}

export async function getAdjacentPosts(publishedAt: Date) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const db = getDb();
  const [prev] = await db
    .select({ slug: posts.slug, title: posts.title })
    .from(posts)
    .where(and(isPublished, lt(posts.publishedAt, publishedAt)))
    .orderBy(desc(posts.publishedAt))
    .limit(1);
  const [next] = await db
    .select({ slug: posts.slug, title: posts.title })
    .from(posts)
    .where(and(isPublished, gt(posts.publishedAt, publishedAt)))
    .orderBy(asc(posts.publishedAt))
    .limit(1);
  return { prev: prev ?? null, next: next ?? null };
}

export async function getRelatedPosts(postId: string, categorySlugs: string[], limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const db = getDb();
  const sameCat = categorySlugs.length
    ? sql`exists (select 1 from post_categories pc join categories c on c.id = pc.category_id
        where pc.post_id = "posts"."id" and c.slug in ${categorySlugs})`
    : sql`false`;
  const rows = await db
    .select(cardColumns)
    .from(posts)
    .where(and(isPublished, ne(posts.id, postId)))
    .orderBy(sql`${sameCat} desc`, desc(posts.publishedAt))
    .limit(limit);
  return attachCategories(rows);
}

export async function listCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts, TAGS.categories);
  const db = getDb();
  return db
    .select({
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      parentSlug: categories.parentSlug,
      count: sql<number>`(select count(*)::int from post_categories pc join posts p on p.id = pc.post_id
        where pc.category_id = "categories"."id" and p.status = 'published')`,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder));
}

export async function listTags() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  const result = await getDb().execute<{ tag: string; n: number }>(sql`
    select tag, count(*)::int as n from posts, unnest(tags) as tag
    where status = 'published' group by tag order by n desc, tag asc limit 30`);
  return result.rows;
}

export async function allPublishedPostSlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.posts);
  return getDb().select({ slug: posts.slug, updatedAt: posts.updatedAt }).from(posts).where(isPublished).orderBy(desc(posts.publishedAt));
}
