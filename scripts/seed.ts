/**
 * Nạp nội dung từ data/*.json (crawl tuyntantam.com) vào database.
 * - Upsert theo slug; chỉ ghi đè bản ghi có source = 'import' (không đụng nội dung admin đã tạo).
 * - Tạo admin đầu tiên từ ADMIN_EMAIL / ADMIN_PASSWORD nếu chưa có user nào.
 * Chạy: npm run db:seed
 */
import { config } from "dotenv";
config({ path: [".env.local", ".env"], quiet: true });

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { categories, pages, postCategories, posts, services, siteSettings, users } from "@/lib/db/schema";
import { hashPassword, PASSWORD_MIN } from "@/lib/auth/password";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { mapLegacyHref } from "@/lib/content/routes";
import { plainText } from "@/lib/utils/format";
import type { AgentSettings, DonateSettings, HomeSettings, ImageRef, SettingsMap, SiteSettings, SocialLink } from "@/lib/content/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
const load = (name: string): any => JSON.parse(readFileSync(join(process.cwd(), "data", `${name}.json`), "utf8"));

const site = load("site");
const home = load("home");
const agent = load("agent");
const pagesData: any[] = load("pages");
const servicesData: any[] = load("services");
const postsData: any[] = load("posts");
const categoriesData: any[] = load("categories");
const tagsData: any[] = load("tags");

const postSlugs = new Set<string>(postsData.map((p) => p.slug));
const tagNames = new Map<string, string>(tagsData.map((t) => [t.slug, t.name]));

function img(ref: any, fallbackAlt: string | null = null): ImageRef | null {
  if (!ref?.src) return null;
  return { src: ref.src, alt: ref.alt ?? fallbackAlt, width: ref.width ?? null, height: ref.height ?? null };
}

/** Sanitize + viết lại link nội bộ WordPress sang route mới. */
function cleanHtml(html: string | null | undefined): string {
  const rewritten = (html ?? "").replace(/href="([^"]+)"/g, (_m, href: string) => `href="${mapLegacyHref(href, postSlugs)}"`);
  return sanitizeRichText(rewritten);
}

const text = (html: string) => plainText(html);

function excerptOf(s: string | null | undefined, max = 180): string | null {
  if (!s) return null;
  const t = text(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

/* ---------- Cấu hình site ---------- */
function buildSettings(): SettingsMap {
  const contacts = site.contacts;
  const socials: SocialLink[] = (site.socials as any[])
    // Telegram trên site gốc chỉ trỏ tới web.telegram.org chung, không phải tài khoản → bỏ
    .filter((s) => s.platform !== "telegram")
    .map((s) => ({ platform: s.platform, url: s.url, label: s.label }));
  const sections: any[] = home.sections;
  const sec = (type: string) => sections.find((s) => s.type === type);
  const legacyPartners = (home.legacy?.sections as any[] | undefined)?.find((s) => s.type === "partners");

  const groups: any[] = load("property-sources").groups ?? [];
  const groupUrl = (re: RegExp) => groups.find((g) => re.test(g.url))?.url ?? null;

  const siteSettings: SiteSettings = {
    name: site.name,
    tagline: site.tagline,
    description: site.description,
    logo: img(site.logo, site.name)!,
    logoFooter: img(site.logoFooter, site.name),
    contacts: {
      phone: contacts.phone,
      phoneDisplay: contacts.phoneDisplay,
      phoneE164: contacts.phoneE164,
      emails: contacts.emails,
      primaryEmail: contacts.emails.includes("contact@tuyntantam.com") ? "contact@tuyntantam.com" : contacts.emails[0],
      zalo: contacts.zalo ?? null,
      address: contacts.address ?? null,
      area: contacts.mapLocation ?? null,
    },
    socials,
    community: site.community ? { text: site.community.text, url: site.community.url, buttonLabel: site.community.buttonLabel } : null,
    propertySources: { rentGroupUrl: groupUrl(/nguonthue/), saleGroupUrl: groupUrl(/nguonban/) },
    footerDonate: site.donate
      ? {
          text: site.donate.footerText,
          url: "/ung-ho",
          buttonImage: img(site.donate.buyMeACoffee?.image, "Buy me a coffee"),
        }
      : null,
    copyright: site.footer?.copyright ?? `Copyright © tuyntantam.com`,
    seo: {
      title: `${site.name} – ${site.tagline}`,
      description: excerptOf(`${sec("hero")?.heading ?? ""} ${sec("hero")?.text ?? ""}`, 160) ?? site.description,
      ogImage: null,
    },
  };

  const about = sec("about");
  const homeSettings: HomeSettings = {
    hero: {
      heading: sec("hero")?.heading ?? site.name,
      text: sec("hero")?.text ?? "",
      image: img(sec("hero")?.images?.[0], "Tuyn Tận Tâm"),
      socialsLabel: sec("hero")?.socialsLabel ?? "",
    },
    about: {
      heading: about?.heading ?? "",
      html: cleanHtml(agent.aboutTeaser?.html ?? ""),
      stats: ((about?.items ?? []) as any[])
        .filter((i) => i.kind === "stat" && Number(i.value) > 0)
        .map((i) => ({ label: i.label, value: Number(i.value), suffix: i.suffix ?? "", display: i.display })),
    },
    contact: {
      heading: sec("contact-form")?.heading ?? "",
      submitLabel: (load("forms") as any[]).find((f) => f.id === "home-contact")?.submitText ?? "Gửi",
    },
    services: {
      heading: sec("services")?.heading ?? "",
      items: ((sec("services")?.items ?? []) as any[]).map((i) => ({ title: i.title, text: i.text, icon: i.icon ?? "" })),
    },
    testimonials: {
      heading: sec("testimonials")?.heading ?? "",
      items: ((sec("testimonials")?.items ?? []) as any[]).map((t) => ({
        quote: t.quote,
        name: t.name,
        role: t.role,
        avatar: img(t.avatar, t.name),
      })),
    },
    posts: { heading: sec("latest-posts")?.heading ?? "" },
    community: sec("community-cta")
      ? {
          heading: sec("community-cta").heading,
          ctaLabel: sec("community-cta").ctas?.[0]?.label ?? site.community?.buttonLabel,
          url: sec("community-cta").ctas?.[0]?.href ?? site.community?.url,
        }
      : null,
    partners: {
      heading: legacyPartners?.heading ?? "",
      items: ((legacyPartners?.images ?? []) as any[]).map((p) => ({
        name: p.nameFromImage ?? p.alt ?? "",
        logo: { src: p.src, alt: p.nameFromImage ?? p.alt ?? null },
      })),
    },
  };

  const gioiThieu = pagesData.find((p) => p.slug === "gioi-thieu");
  const agentSettings: AgentSettings = {
    name: agent.name,
    alias: agent.alias,
    title: agent.title,
    shortBio: agent.shortBio,
    avatar: img(agent.gravatar, agent.alias),
    portrait: img(agent.avatar, agent.alias) ?? img(gioiThieu?.images?.[0], agent.alias),
    pageIntro: agent.pageIntro,
    story: (agent.story as any[]).map((s) => ({ heading: s.heading, html: cleanHtml(s.html) })),
  };

  const d = site.donate ?? {};
  const donate: DonateSettings = {
    intro: d.intro ?? "",
    buyMeACoffee: d.buyMeACoffee ? { url: d.buyMeACoffee.url, image: img(d.buyMeACoffee.image, "Buy me a coffee") } : null,
    paypal: d.paypal ? { url: d.paypal.url, image: img(d.paypal.image, "PayPal") } : null,
    momo: d.momo?.qrImage ? { qrImage: img(d.momo.qrImage, "Mã QR Momo") } : null,
    bank: d.bank
      ? {
          bankName: d.bank.bankName,
          accountNumber: d.bank.accountNumber,
          accountName: d.bank.accountName,
          qrImage: img(d.bank.qrImage, "Mã QR chuyển khoản"),
        }
      : null,
  };

  return { site: siteSettings, home: homeSettings, agent: agentSettings, donate };
}

/* ---------- Trang tĩnh ---------- */
// slug WP → slug mới; trang không có trong map thì bỏ qua (trang chủ cũ, bảo trì, blog rỗng, dịch vụ con → bảng services)
const PAGE_SLUGS: Record<string, string> = {
  "gioi-thieu": "gioi-thieu",
  "moi-gioi": "moi-gioi",
  "dau-tu": "dau-tu",
  "dich-vu": "dich-vu",
  // chỉ làm nguồn mô tả SEO cho /kho-nguon (route riêng), không phục vụ qua template chung
  "kho-nguon": "kho-nguon",
  "lien-he-hop-tac": "lien-he",
  donate: "ung-ho",
  "cuong-phat-land-tuyen-dung": "cuong-phat-land-tuyen-dung",
};

function seoTitle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.replace(/\s*-\s*Tuyn Tận Tâm.*$/, "").trim();
  return t || null;
}

async function main() {
  const db = getDb();
  const started = Date.now();

  // Cấu hình: chỉ ghi khi chưa có (admin có thể đã sửa); --force-settings để ghi đè
  const force = process.argv.includes("--force-settings");
  const settings = buildSettings();
  for (const [key, value] of Object.entries(settings)) {
    if (force) {
      await db.insert(siteSettings).values({ key, value }).onConflictDoUpdate({ target: siteSettings.key, set: { value } });
    } else {
      await db.insert(siteSettings).values({ key, value }).onConflictDoNothing();
    }
  }
  console.log(`✓ site_settings: ${Object.keys(settings).join(", ")}${force ? " (ghi đè)" : ""}`);

  // Trang
  let pageCount = 0;
  for (const p of pagesData) {
    const slug = PAGE_SLUGS[p.slug];
    if (!slug) continue;
    const row = {
      slug,
      title: p.title,
      excerpt: excerptOf(p.excerpt ?? p.html),
      contentHtml: cleanHtml(p.html),
      images: (p.images as any[]).map((i) => img(i)).filter(Boolean) as ImageRef[],
      isPlaceholder: p.status === "placeholder",
      seoTitle: seoTitle(p.seo?.title),
      seoDescription: excerptOf(p.html, 160),
      ogImage: null,
      source: "import" as const,
      sourceUrl: p.sourceUrl,
    };
    await db
      .insert(pages)
      .values(row)
      .onConflictDoUpdate({ target: pages.slug, set: row, setWhere: eq(pages.source, "import") });
    pageCount++;
  }
  console.log(`✓ pages: ${pageCount}`);

  // Dịch vụ
  let order = 0;
  for (const s of servicesData) {
    const row = {
      slug: s.slug,
      title: s.title,
      summary: s.summary ?? null,
      contentHtml: cleanHtml(s.html),
      image: img(s.image),
      icon: null,
      isPlaceholder: s.status === "placeholder",
      sortOrder: order++,
      source: "import" as const,
      sourceUrl: s.sourceUrl,
    };
    await db
      .insert(services)
      .values(row)
      .onConflictDoUpdate({ target: services.slug, set: row, setWhere: eq(services.source, "import") });
  }
  console.log(`✓ services: ${servicesData.length}`);

  // Chuyên mục (cha trước con)
  const sortedCats = [...categoriesData].sort((a, b) => (a.parent ? 1 : 0) - (b.parent ? 1 : 0));
  for (const [i, c] of sortedCats.entries()) {
    const parentSlug = c.parent ? (categoriesData.find((x) => x.wpId === c.parent || x.slug === c.parent)?.slug ?? null) : null;
    const row = { slug: c.slug, name: c.name, description: c.description || null, parentSlug, sortOrder: i };
    await db.insert(categories).values(row).onConflictDoUpdate({ target: categories.slug, set: row });
  }
  const catRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  const catId = new Map(catRows.map((c) => [c.slug, c.id]));
  console.log(`✓ categories: ${categoriesData.length}`);

  // Bài viết
  for (const p of postsData) {
    const row = {
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt ? excerptOf(p.excerpt, 220) : excerptOf(p.html, 220),
      contentHtml: cleanHtml(p.html),
      coverImage: img(p.coverImage, p.title),
      tags: (p.tags as string[]).map((t) => tagNames.get(t) ?? t),
      authorName: p.author?.name ?? null,
      status: "published" as const,
      featured: false,
      readingMinutes: Math.max(1, Number(p.readingMinutes) || 1),
      seoTitle: seoTitle(p.seo?.title),
      seoDescription: p.seo?.description ? excerptOf(p.seo.description, 160) : null,
      source: "import" as const,
      sourceUrl: p.sourceUrl,
      publishedAt: new Date(p.publishedAtGmt ? `${p.publishedAtGmt}Z` : p.publishedAt),
      updatedAt: new Date(p.modifiedAt),
    };
    const [saved] = await db
      .insert(posts)
      .values(row)
      .onConflictDoUpdate({ target: posts.slug, set: row, setWhere: eq(posts.source, "import") })
      .returning({ id: posts.id });
    if (saved) {
      await db.delete(postCategories).where(eq(postCategories.postId, saved.id));
      const links = (p.categories as string[]).map((slug) => catId.get(slug)).filter(Boolean) as string[];
      if (links.length) await db.insert(postCategories).values(links.map((categoryId) => ({ postId: saved.id, categoryId })));
    }
  }
  // Bài mới nhất làm bài nổi bật nếu chưa có bài nổi bật nào
  await db.execute(sql`
    UPDATE posts SET featured = true
    WHERE id = (SELECT id FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT 1)
      AND NOT EXISTS (SELECT 1 FROM posts WHERE featured = true)
  `);
  console.log(`✓ posts: ${postsData.length}`);

  // Admin đầu tiên
  const [{ count }] = (await db.select({ count: sql<number>`count(*)::int` }).from(users)) as [{ count: number }];
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (count === 0) {
    if (!email || password.length < PASSWORD_MIN) {
      console.warn(`! Chưa có admin. Đặt ADMIN_EMAIL và ADMIN_PASSWORD (>= ${PASSWORD_MIN} ký tự) rồi chạy lại seed.`);
    } else {
      await db.insert(users).values({
        email,
        name: process.env.ADMIN_NAME?.trim() || "Quản trị viên",
        passwordHash: await hashPassword(password),
        role: "ADMIN",
      });
      console.log(`✓ admin: ${email}`);
    }
  } else {
    console.log(`• users: đã có ${count} tài khoản, bỏ qua tạo admin`);
  }

  console.log(`Hoàn tất sau ${((Date.now() - started) / 1000).toFixed(1)}s`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed thất bại:", err instanceof Error ? err.message : err);
  process.exit(1);
});
