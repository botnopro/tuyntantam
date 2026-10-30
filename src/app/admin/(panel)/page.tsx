import { count, eq } from "drizzle-orm";
import { Building2, FileText, Inbox } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/shell";
import { getDb } from "@/lib/db";
import { leads, posts, properties } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/utils/format";
import { LEAD_TYPE_LABEL, listLeads } from "@/server/leads";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Tổng quan" };

async function stat(q: Promise<{ n: number }[]>) {
  return (await q)[0]?.n ?? 0;
}

export default async function AdminHome() {
  await requireAdminPage();
  const db = getDb();
  const [newLeads, totalLeads, publishedProps, draftProps, publishedPosts, recent] = await Promise.all([
    stat(db.select({ n: count() }).from(leads).where(eq(leads.status, "NEW"))),
    stat(db.select({ n: count() }).from(leads)),
    stat(db.select({ n: count() }).from(properties).where(eq(properties.status, "published"))),
    stat(db.select({ n: count() }).from(properties).where(eq(properties.status, "draft"))),
    stat(db.select({ n: count() }).from(posts).where(eq(posts.status, "published"))),
    listLeads({ page: 1, limit: 8 }),
  ]);

  const cards = [
    {
      href: "/admin/khach-lien-he?status=NEW",
      label: "Khách mới chưa xử lý",
      value: newLeads,
      sub: `${totalLeads} lượt liên hệ`,
      icon: Inbox,
    },
    { href: "/admin/bat-dong-san", label: "BĐS đang hiển thị", value: publishedProps, sub: `${draftProps} bản nháp`, icon: Building2 },
    { href: "/admin/tin-tuc", label: "Bài viết đã đăng", value: publishedPosts, sub: "Quản lý blog", icon: FileText },
  ];

  return (
    <>
      <AdminHeader title="Tổng quan" />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="rounded-lg border border-border-subtle bg-surface-card p-5 hover:shadow-md">
            <c.icon className="size-5 text-primary" aria-hidden />
            <p className="mt-3 font-sans text-[32px] leading-none font-extrabold text-slate-dark">{c.value}</p>
            <p className="mt-1 text-[14px] font-semibold">{c.label}</p>
            <p className="text-[13px] text-on-surface-variant">{c.sub}</p>
          </Link>
        ))}
      </div>
      {publishedProps === 0 ? (
        <p className="mt-6 rounded-lg border border-border-subtle bg-brand-subtle p-4 text-[14px] text-on-primary-container">
          Website chưa có tin BĐS nào đang hiển thị nên các khu vực danh sách, bộ lọc, bản đồ, yêu thích, so sánh đang ẩn.{" "}
          <Link href="/admin/bat-dong-san/moi" className="font-semibold underline">
            Đăng tin đầu tiên
          </Link>{" "}
          để bật chúng.
        </p>
      ) : null}
      <section className="mt-8 rounded-lg border border-border-subtle bg-surface-card">
        <div className="flex items-center justify-between border-b border-border-subtle p-4">
          <h2 className="font-sans text-[15px] font-bold">Liên hệ gần đây</h2>
          <Link href="/admin/khach-lien-he" className="text-[13px] font-semibold text-primary">
            Xem tất cả
          </Link>
        </div>
        {recent.items.length ? (
          <ul className="divide-y divide-border-subtle">
            {recent.items.map(({ lead }) => (
              <li key={lead.id}>
                <Link
                  href={`/admin/khach-lien-he/${lead.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-surface-neutral"
                >
                  <span>
                    <span className="font-semibold">{lead.name}</span>{" "}
                    <span className="text-[13px] text-on-surface-variant">· {LEAD_TYPE_LABEL[lead.type]}</span>
                  </span>
                  <span className="text-[13px] text-on-surface-variant">
                    {lead.status === "NEW" ? (
                      <span className="mr-2 rounded-xs bg-brand-strong px-1.5 py-0.5 text-[11px] font-bold text-white">Mới</span>
                    ) : null}
                    {formatDateTime(lead.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-4 text-[14px] text-on-surface-variant">Chưa có khách liên hệ.</p>
        )}
      </section>
    </>
  );
}
