import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteLeadAction } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { AdminHeader } from "@/components/admin/shell";
import { requireRole } from "@/lib/auth/guard";
import { LEAD_INTERESTS } from "@/lib/content/lead-options";
import { propertyPath } from "@/lib/content/routes";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { uuidSchema } from "@/lib/validation/common";
import { getLead, LEAD_TYPE_LABEL } from "@/server/leads";
import { LeadUpdateForm } from "./lead-update-form";

export const metadata = { title: "Chi tiết liên hệ" };

export default async function LeadDetail(props: PageProps<"/admin/khach-lien-he/[id]">) {
  const user = await requireRole("EDITOR");
  const id = uuidSchema.safeParse((await props.params).id);
  const row = id.success ? await getLead(id.data) : null;
  if (!row) notFound();
  const l = row.lead;
  const info: [string, React.ReactNode][] = [
    ["Loại", LEAD_TYPE_LABEL[l.type]],
    ["Nhu cầu", l.interest ? LEAD_INTERESTS[l.interest as keyof typeof LEAD_INTERESTS] : null],
    [
      "Bất động sản",
      row.propertySlug ? (
        <Link href={propertyPath(row.propertySlug)} target="_blank" className="text-primary underline">
          {row.propertyTitle}
        </Link>
      ) : null,
    ],
    ["Ngày xem", l.preferredDate ? `${formatDate(l.preferredDate)} ${l.preferredTime ?? ""}` : null],
    ["Hình thức xem", l.tourType === "video" ? "Video call" : l.tourType === "in-person" ? "Trực tiếp" : null],
    ["Ký gửi", l.details?.consignmentType === "SALE" ? "Gửi bán" : l.details?.consignmentType === "RENT" ? "Cho thuê" : null],
    ["Địa chỉ BĐS", l.details?.propertyAddress],
    ["Giá mong muốn", l.details?.expectedPrice],
    ["Trang gửi", l.sourcePage],
    ["Thời gian", formatDateTime(l.createdAt)],
    ["Xử lý lúc", l.handledAt ? formatDateTime(l.handledAt) : null],
  ];

  return (
    <>
      <AdminHeader
        title={l.name}
        actions={
          <Link href="/admin/khach-lien-he" className="btn-ghost border border-border-subtle py-2">
            Quay lại danh sách
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-5 rounded-lg border border-border-subtle bg-surface-card p-5 lg:col-span-2">
          <div className="flex flex-wrap gap-2">
            {l.phone ? (
              <a href={`tel:${l.phone}`} className="btn-primary py-2">
                <Phone className="size-4" aria-hidden /> {l.phone}
              </a>
            ) : null}
            {l.email ? (
              <a href={`mailto:${l.email}`} className="btn-ghost border border-border-subtle py-2 normal-case">
                <Mail className="size-4" aria-hidden /> {l.email}
              </a>
            ) : null}
          </div>
          {l.message ? (
            <div>
              <h2 className="mb-1 text-[13px] font-bold text-on-surface-variant uppercase">Lời nhắn</h2>
              <p className="rounded-sm bg-surface-neutral p-4 whitespace-pre-line">{l.message}</p>
            </div>
          ) : null}
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {info
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[12px] font-semibold text-on-surface-variant uppercase">{k}</dt>
                  <dd className="text-[14px]">{v}</dd>
                </div>
              ))}
          </dl>
        </section>
        <div className="space-y-4">
          <LeadUpdateForm id={l.id} status={l.status} note={l.adminNote} />
          {user.role === "ADMIN" ? (
            <form action={deleteLeadAction}>
              <input type="hidden" name="id" value={l.id} />
              <ConfirmSubmit message="Xoá vĩnh viễn liên hệ này?">Xoá liên hệ</ConfirmSubmit>
            </form>
          ) : null}
        </div>
      </div>
    </>
  );
}
