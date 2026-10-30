import { AdminHeader } from "@/components/admin/shell";
import { PropertyForm } from "../property-form";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Đăng tin mới" };

export default async function NewProperty() {
  await requireAdminPage();
  return (
    <>
      <AdminHeader title="Đăng tin bất động sản" description="Chọn trạng thái “Hiển thị” để tin xuất hiện trên website." />
      <PropertyForm />
    </>
  );
}
