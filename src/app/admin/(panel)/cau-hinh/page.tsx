import { AdminHeader } from "@/components/admin/shell";
import { requireAdminPage } from "@/lib/auth/guard";
import { getSettings } from "@/server/settings";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Cấu hình site" };

export default async function SettingsPage() {
  await requireAdminPage("ADMIN");
  const site = await getSettings("site");
  return (
    <>
      <AdminHeader title="Cấu hình site" description="Thông tin liên hệ, mạng xã hội, cộng đồng và SEO dùng trên toàn website." />
      <SettingsForm initial={site} />
    </>
  );
}
