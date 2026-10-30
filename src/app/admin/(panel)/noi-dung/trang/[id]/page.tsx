import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/shell";
import { uuidSchema } from "@/lib/validation/common";
import { adminGetPage } from "@/server/admin/content";
import { PageForm } from "../../content-form";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Sửa trang" };

export default async function EditPage(props: PageProps<"/admin/noi-dung/trang/[id]">) {
  await requireAdminPage();
  const id = uuidSchema.safeParse((await props.params).id);
  const page = id.success ? await adminGetPage(id.data) : null;
  if (!page) notFound();
  return (
    <>
      <AdminHeader title={`Trang: ${page.title}`} description={`Đường dẫn: /${page.slug}`} />
      <PageForm page={page} />
    </>
  );
}
