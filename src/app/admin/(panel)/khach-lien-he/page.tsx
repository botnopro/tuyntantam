import { Download } from "lucide-react";
import Link from "next/link";
import { quickLeadStatusAction } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/shell";
import { buildQuery } from "@/components/site/pagination";
import { LEAD_INTERESTS } from "@/lib/content/lead-options";
import { formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { leadListSchema } from "@/lib/validation/lead";
import { LEAD_TYPE_LABEL, listLeads } from "@/server/leads";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Khách liên hệ" };

const STATUS_LABEL = { NEW: "Mới", IN_PROGRESS: "Đang xử lý", DONE: "Đã xử lý", SPAM: "Spam" } as const;
const STATUS_CLS = {
  NEW: "bg-brand-strong text-white",
  IN_PROGRESS: "bg-secondary text-white",
  DONE: "bg-success-container text-success",
  SPAM: "bg-surface-container text-on-surface-variant",
} as const;

export default async function LeadsPage(props: PageProps<"/admin/khach-lien-he">) {
  await requireAdminPage();
  const sp = await props.searchParams;
  const f = leadListSchema.parse(Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
  const r = await listLeads(f);
  const exportHref = buildQuery("/api/v1/admin/leads/export", { status: f.status, type: f.type });

  return (
    <>
      <AdminHeader
        title="Khách liên hệ"
        description={`${r.total} kết quả`}
        actions={
          <a href={exportHref} className="btn-ghost border border-border-subtle py-2">
            <Download className="size-4" aria-hidden /> Xuất CSV
          </a>
        }
      />
      <form className="mb-5 flex flex-wrap gap-2 rounded-lg border border-border-subtle bg-surface-card p-3">
        <input
          name="q"
          defaultValue={f.q}
          placeholder="Tìm tên, SĐT, email…"
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
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={f.type ?? ""}
          aria-label="Loại"
          className="rounded-sm border border-border-subtle px-2 py-2 text-[14px]"
        >
          <option value="">Mọi loại</option>
          {Object.entries(LEAD_TYPE_LABEL).map(([k, v]) => (
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
        <table className="w-full min-w-[760px] text-[14px]">
          <thead className="bg-surface-neutral text-left text-[12px] text-on-surface-variant uppercase">
            <tr>
              <th className="p-3">Thời gian</th>
              <th className="p-3">Khách</th>
              <th className="p-3">Loại / nhu cầu</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Đổi nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {r.items.map(({ lead: l, propertyTitle }) => (
              <tr key={l.id} className="align-top">
                <td className="p-3 whitespace-nowrap text-on-surface-variant">{formatDateTime(l.createdAt)}</td>
                <td className="p-3">
                  <Link href={`/admin/khach-lien-he/${l.id}`} className="font-semibold text-primary hover:underline">
                    {l.name}
                  </Link>
                  <div className="text-[13px] text-on-surface-variant">{[l.phone, l.email].filter(Boolean).join(" · ")}</div>
                </td>
                <td className="p-3">
                  {LEAD_TYPE_LABEL[l.type]}
                  <div className="text-[13px] text-on-surface-variant">
                    {l.interest ? LEAD_INTERESTS[l.interest as keyof typeof LEAD_INTERESTS] : (propertyTitle ?? "")}
                  </div>
                </td>
                <td className="p-3">
                  <span className={cn("rounded-xs px-2 py-0.5 text-[12px] font-bold", STATUS_CLS[l.status])}>{STATUS_LABEL[l.status]}</span>
                </td>
                <td className="p-3">
                  <form action={quickLeadStatusAction} className="flex gap-1">
                    <input type="hidden" name="id" value={l.id} />
                    {(["IN_PROGRESS", "DONE", "SPAM"] as const)
                      .filter((s) => s !== l.status)
                      .map((s) => (
                        <button
                          key={s}
                          type="submit"
                          name="status"
                          value={s}
                          className="cursor-pointer rounded-xs border border-border-subtle px-2 py-1 text-[12px] hover:bg-surface-neutral"
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                  </form>
                </td>
              </tr>
            ))}
            {!r.items.length ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                  Chưa có khách liên hệ phù hợp.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {r.pages > 1 ? (
        <nav className="mt-4 flex gap-2" aria-label="Phân trang">
          {Array.from({ length: r.pages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={buildQuery("/admin/khach-lien-he", { ...f, page: n })}
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
