import type { MetadataRoute } from "next";
import { isDemoListing } from "@/lib/content/demo";
import { categoryPath, postPath, propertyPath, servicePath } from "@/lib/content/routes";
import { absoluteUrl } from "@/lib/seo/url";
import { allPageSlugs, listServices } from "@/server/pages";
import { allPublishedPostSlugs, listCategories } from "@/server/posts";
import { allPublishedPropertySlugs } from "@/server/properties";

// kho-nguon, nguon-bds-*: trang cũ đã bỏ (/kho-nguon nay là danh sách BĐS); landing tuyển dụng còn tiêu đề mẫu chưa sửa ở site gốc
const SKIP_PAGES = new Set(["kho-nguon", "nguon-bds-thue", "nguon-bds-ban", "cuong-phat-land-tuyen-dung"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, services, posts, categories, properties] = await Promise.all([
    allPageSlugs(),
    listServices(),
    allPublishedPostSlugs(),
    listCategories(),
    allPublishedPropertySlugs(),
  ]);
  const latestPost = posts[0]?.updatedAt;
  return [
    { url: absoluteUrl("/"), lastModified: latestPost, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), lastModified: latestPost, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/kho-nguon"), changeFrequency: "daily", priority: 0.9 },
    ...pages
      .filter((p) => !SKIP_PAGES.has(p.slug))
      .map((p) => ({ url: absoluteUrl(`/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...services.map((s) => ({
      url: absoluteUrl(servicePath(s.slug)),
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...posts.map((p) => ({
      url: absoluteUrl(postPath(p.slug)),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...categories
      .filter((c) => c.count > 0)
      .map((c) => ({ url: absoluteUrl(categoryPath(c.slug)), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...properties
      .filter((p) => !isDemoListing(p.slug))
      .map((p) => ({
        url: absoluteUrl(propertyPath(p.slug)),
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
