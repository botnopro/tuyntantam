import "server-only";
import { and, asc, count, desc, eq, gte, ilike, isNotNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";
import { properties, type Property } from "@/lib/db/schema";
import type { PropertyFilters } from "@/lib/validation/property";
import { TAGS } from "./cache";

export type PropertyCard = Pick<
  Property,
  | "id"
  | "slug"
  | "title"
  | "listingType"
  | "propertyType"
  | "price"
  | "priceNote"
  | "area"
  | "bedrooms"
  | "bathrooms"
  | "address"
  | "district"
  | "city"
  | "summary"
  | "images"
  | "featured"
  | "lat"
  | "lng"
  | "publishedAt"
>;

const cardColumns = {
  id: properties.id,
  slug: properties.slug,
  title: properties.title,
  listingType: properties.listingType,
  propertyType: properties.propertyType,
  price: properties.price,
  priceNote: properties.priceNote,
  area: properties.area,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  address: properties.address,
  district: properties.district,
  city: properties.city,
  summary: properties.summary,
  images: properties.images,
  featured: properties.featured,
  lat: properties.lat,
  lng: properties.lng,
  publishedAt: properties.publishedAt,
};

const isPublished = eq(properties.status, "published");

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export function buildPropertyWhere(f: Partial<PropertyFilters>): SQL {
  const where: SQL[] = [isPublished];
  if (f.q) {
    const term = `%${escapeLike(f.q)}%`;
    where.push(
      or(
        ilike(properties.title, term),
        ilike(properties.address, term),
        ilike(properties.district, term),
        ilike(properties.summary, term),
      )!,
    );
  }
  if (f.listingType) where.push(eq(properties.listingType, f.listingType));
  if (f.type) where.push(eq(properties.propertyType, f.type));
  if (f.district) where.push(eq(properties.district, f.district));
  if (f.minPrice != null) where.push(gte(properties.price, f.minPrice));
  if (f.maxPrice != null) where.push(lte(properties.price, f.maxPrice));
  if (f.minArea != null) where.push(gte(properties.area, f.minArea));
  if (f.maxArea != null) where.push(lte(properties.area, f.maxArea));
  if (f.bedrooms != null) where.push(gte(properties.bedrooms, f.bedrooms));
  if (f.bathrooms != null) where.push(gte(properties.bathrooms, f.bathrooms));
  if (f.amenities?.length) where.push(sql`${properties.amenities} @> ${sql.param(f.amenities)}::text[]`);
  if (f.featured) where.push(eq(properties.featured, true));
  return and(...where)!;
}

function orderBy(sort: PropertyFilters["sort"]) {
  switch (sort) {
    case "price-asc":
      return [sql`${properties.price} asc nulls last`, desc(properties.publishedAt)];
    case "price-desc":
      return [sql`${properties.price} desc nulls last`, desc(properties.publishedAt)];
    case "area-desc":
      return [sql`${properties.area} desc nulls last`, desc(properties.publishedAt)];
    case "featured":
      return [desc(properties.featured), desc(properties.publishedAt)];
    default:
      return [desc(properties.publishedAt), desc(properties.createdAt)];
  }
}

export async function searchProperties(filters: PropertyFilters) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  const db = getDb();
  const where = buildPropertyWhere(filters);
  const [[counted], items] = await Promise.all([
    db.select({ total: count() }).from(properties).where(where),
    db
      .select(cardColumns)
      .from(properties)
      .where(where)
      .orderBy(...orderBy(filters.sort))
      .limit(filters.limit)
      .offset((filters.page - 1) * filters.limit),
  ]);
  const total = counted?.total ?? 0;
  return { items, total, page: filters.page, limit: filters.limit, pages: Math.max(1, Math.ceil(total / filters.limit)) };
}

/** Số tin đang hiển thị — quyết định bật/tắt các khu vực phụ thuộc tin BĐS. */
export async function publishedPropertyCount(): Promise<number> {
  "use cache: remote";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  const [{ total }] = (await getDb().select({ total: count() }).from(properties).where(isPublished)) as [{ total: number }];
  return total;
}

export async function featuredProperties(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  return getDb()
    .select(cardColumns)
    .from(properties)
    .where(isPublished)
    .orderBy(desc(properties.featured), desc(properties.publishedAt))
    .limit(limit);
}

export async function latestProperties(listingType: "RENT" | "SALE", limit = 8) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  return getDb()
    .select(cardColumns)
    .from(properties)
    .where(and(isPublished, eq(properties.listingType, listingType)))
    .orderBy(desc(properties.publishedAt))
    .limit(limit);
}

export async function getPropertyBySlug(slug: string) {
  "use cache: remote";
  cacheLife("hours");
  cacheTag(TAGS.properties, TAGS.property(slug));
  const [row] = await getDb()
    .select()
    .from(properties)
    .where(and(eq(properties.slug, slug), isPublished))
    .limit(1);
  return row ?? null;
}

export async function similarProperties(p: Pick<Property, "id" | "propertyType" | "district" | "listingType">, limit = 3) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  return getDb()
    .select(cardColumns)
    .from(properties)
    .where(and(isPublished, ne(properties.id, p.id), eq(properties.listingType, p.listingType)))
    .orderBy(
      sql`(${properties.propertyType} = ${p.propertyType})::int + (${properties.district} is not distinct from ${p.district})::int desc`,
      desc(properties.publishedAt),
    )
    .limit(limit);
}

export async function propertiesBySlugs(slugs: string[]) {
  if (!slugs.length) return [];
  return getDb()
    .select({
      ...cardColumns,
      amenities: properties.amenities,
      floors: properties.floors,
      direction: properties.direction,
      furnishing: properties.furnishing,
    })
    .from(properties)
    .where(and(isPublished, sql`${properties.slug} in ${slugs}`))
    .limit(10);
}

/** Giá trị lọc lấy từ dữ liệu thật (quận, loại hình, tiện ích đang có). */
export async function propertyFilterOptions() {
  "use cache: remote";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  const db = getDb();
  const districts = await db
    .selectDistinct({ district: properties.district })
    .from(properties)
    .where(and(isPublished, isNotNull(properties.district)))
    .orderBy(asc(properties.district));
  const types = await db
    .selectDistinct({ type: properties.propertyType })
    .from(properties)
    .where(isPublished)
    .orderBy(asc(properties.propertyType));
  const amenities = await db.execute<{ a: string }>(sql`
    select distinct unnest(amenities) as a from properties where status = 'published' order by a limit 60`);
  const hasGeo = await db
    .select({ n: count() })
    .from(properties)
    .where(and(isPublished, isNotNull(properties.lat), isNotNull(properties.lng)));
  return {
    districts: districts.map((d) => d.district!).filter(Boolean),
    types: types.map((t) => t.type),
    amenities: amenities.rows.map((r) => r.a),
    hasGeo: (hasGeo[0]?.n ?? 0) > 0,
  };
}

/** Khu vực (quận) có tin + ảnh đại diện — cho lưới "Khu vực" ở trang chủ. */
export async function districtsWithCounts(limit = 6) {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  const result = await getDb().execute<{ district: string; n: number; image: { src: string; alt: string | null } | null }>(sql`
    select district, count(*)::int as n, (array_agg(images->0 order by featured desc, published_at desc))[1] as image
    from properties where status = 'published' and district is not null
    group by district order by n desc limit ${limit}`);
  return result.rows;
}

export async function allPublishedPropertySlugs() {
  "use cache";
  cacheLife("hours");
  cacheTag(TAGS.properties);
  return getDb().select({ slug: properties.slug, updatedAt: properties.updatedAt }).from(properties).where(isPublished);
}
