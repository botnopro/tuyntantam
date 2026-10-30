import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { uuidSchema } from "@/lib/validation/common";
import { adminGetService } from "@/server/admin/content";
import { ServiceForm } from "../../content-form";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Sửa dịch vụ" };

export default async function EditService(props: PageProps<"/admin/noi-dung/dich-vu/[id]">) {
  await requireAdminPage();
  const id = uuidSchema.safeParse((await props.params).id);
  const service = id.success ? await adminGetService(id.data) : null;
  if (!service) notFound();
  return (
    <>
      <AdminHeader title={`Dịch vụ: ${service.title}`} description={`Đường dẫn: /dich-vu/${service.slug}`} />
      <ServiceForm service={service} />
    </>
  );
}
