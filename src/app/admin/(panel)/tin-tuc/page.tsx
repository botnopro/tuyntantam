import { Plus } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { AdminHeader } from "@/components/admin/shell";
import { buildQuery } from "@/components/site/pagination";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { adminListPosts } from "@/server/admin/posts";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Blog" };

const STATUS = { draft: "Nháp", published: "Đã đăng", archived: "Lưu trữ" } as const;
const schema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["draft", "published", "archived"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export default async function AdminPosts(props: PageProps<"/admin/tin-tuc">) {
  await requireAdminPage();
  const sp = await props.searchParams;
  const f = schema.parse({ q: sp.q || undefined, status: sp.status || undefined, page: sp.page });
  const r = await adminListPosts({ ...f, limit: 20 });
  return (
    <>
      <AdminHeader
        title="Blog"
        description={`${r.total} bài viết`}
        actions={
          <Link href="/admin/tin-tuc/moi" className="btn-primary py-2">
            <Plus className="size-4" aria-hidden /> Viết bài mới
          </Link>
        }
      />
      <form className="mb-5 flex flex-wrap gap-2 rounded-lg border border-border-subtle bg-surface-card p-3">
        <input
          name="q"
          defaultValue={f.q}
          placeholder="Tìm tiêu đề…"
          aria-label="Tìm kiếm"
          className="min-w-48 flex-1 rounded-sm border border-border-subtle px-3 py-2 text-[14px]"
        />
        <select
          name="status"
          defaultValue={f.status ?? ""}
          aria-label="Trạng thái"
          className="rounded-sm border border-border-subtle px-2 py-2 text-[14px]"
        >
          <option value="">Mọi trạng thái</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary py-2">
          Lọc
        </button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
        <table className="w-full min-w-[640px] text-[14px]">
          <thead className="bg-surface-neutral text-left text-[12px] text-on-surface-variant uppercase">
            <tr>
              <th className="p-3">Bài viết</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày đăng</th>
              <th className="p-3">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {r.items.map((p) => (
              <tr key={p.id}>
                <td className="p-3">
                  <Link href={`/admin/tin-tuc/${p.id}`} className="font-semibold text-primary hover:underline">
                    {p.title}
                  </Link>
                  {p.featured ? (
                    <span className="ml-2 rounded-xs bg-brand-subtle px-1.5 text-[11px] font-bold text-on-primary-container">Nổi bật</span>
                  ) : null}
                  {p.source === "import" ? (
                    <span className="ml-2 text-[12px] text-on-surface-variant">(nhập từ tuyntantam.com)</span>
                  ) : null}
                </td>
                <td className="p-3">
                  <span
                    className={cn(
                      "rounded-xs px-2 py-0.5 text-[12px] font-bold",
                      p.status === "published" ? "bg-success-container text-success" : "bg-surface-container text-on-surface-variant",
                    )}
                  >
                    {STATUS[p.status]}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-on-surface-variant">{p.publishedAt ? formatDateTime(p.publishedAt) : "—"}</td>
                <td className="p-3 whitespace-nowrap text-on-surface-variant">{formatDateTime(p.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.pages > 1 ? (
        <nav className="mt-4 flex gap-2" aria-label="Phân trang">
          {Array.from({ length: r.pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={buildQuery("/admin/tin-tuc", { ...f, page: n })}
              aria-current={n === r.page ? "page" : undefined}
              className={cn(
                "grid size-9 place-items-center rounded-xs text-[13px]",
                n === r.page ? "bg-brand-strong text-white" : "bg-surface-card",
              )}
            >
              {n}
            </Link>
          ))}
        </nav>
      ) : null}
    </>
  );
}
