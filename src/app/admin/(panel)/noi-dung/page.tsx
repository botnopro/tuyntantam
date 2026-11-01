import Link from "next/link";
import { AdminHeader } from "@/components/admin/shell";
import { formatDateTime } from "@/lib/utils/format";
import { adminListPages, adminListServices } from "@/server/admin/content";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Trang & dịch vụ" };

export default async function ContentIndex() {
  await requireAdminPage();
  const [pages, services] = await Promise.all([adminListPages(), adminListServices()]);
  return (
    <>
      <AdminHeader title="Trang & dịch vụ" description="Nội dung các trang tĩnh (Giới thiệu, Môi giới, Đầu tư, Liên hệ…) và 4 dịch vụ." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border-subtle bg-surface-card">
          <h2 className="border-b border-border-subtle p-4 font-sans text-[15px] font-bold">Trang</h2>
          <ul className="divide-y divide-border-subtle">
            {pages.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/noi-dung/trang/${p.id}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-surface-neutral"
                >
                  <span>
                    <span className="font-semibold">{p.title}</span>
                    <span className="block text-[12px] text-on-surface-variant">/{p.slug}</span>
                  </span>
                  <span className="text-[12px] text-on-surface-variant">{formatDateTime(p.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-border-subtle bg-surface-card">
          <h2 className="border-b border-border-subtle p-4 font-sans text-[15px] font-bold">Dịch vụ</h2>
          <ul className="divide-y divide-border-subtle">
            {services.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/admin/noi-dung/dich-vu/${s.id}`}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-surface-neutral"
                >
                  <span className="font-semibold">{s.title}</span>
                  {s.isPlaceholder ? (
                    <span className="rounded-xs bg-brand-subtle px-2 py-0.5 text-[11px] font-bold text-primary">
                      Cần bổ sung nội dung
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
