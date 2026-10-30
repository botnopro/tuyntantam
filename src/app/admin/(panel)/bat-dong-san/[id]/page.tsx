import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePropertyAction } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { AdminHeader } from "@/components/admin/shell";
import { requireRole } from "@/lib/auth/guard";
import { propertyPath } from "@/lib/content/routes";
import { uuidSchema } from "@/lib/validation/common";
import { adminGetProperty } from "@/server/admin/properties";
import { PropertyForm } from "../property-form";

export const metadata = { title: "Sửa tin" };

export default async function EditProperty(props: PageProps<"/admin/bat-dong-san/[id]">) {
  const user = await requireRole("EDITOR");
  const id = uuidSchema.safeParse((await props.params).id);
  const p = id.success ? await adminGetProperty(id.data) : null;
  if (!p) notFound();
  return (
    <>
      <AdminHeader
        title={p.title}
        actions={
          <>
            {p.status === "published" ? (
              <Link href={propertyPath(p.slug)} target="_blank" className="btn-ghost border border-border-subtle py-2">
                <ExternalLink className="size-4" aria-hidden /> Xem trên web
              </Link>
            ) : null}
            {user.role === "ADMIN" ? (
              <form action={deletePropertyAction}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmSubmit message="Xoá vĩnh viễn tin này?">Xoá</ConfirmSubmit>
              </form>
            ) : null}
          </>
        }
      />
      <PropertyForm property={p} />
    </>
  );
}
