import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireAdminPage } from "@/lib/auth/guard";
import { countNewLeads } from "@/server/leads";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-surface-neutral" aria-busy="true" />}>
      <Guarded>{children}</Guarded>
    </Suspense>
  );
}

/** Kiểm tra phiên ở server cho mọi trang quản trị (mỗi Server Action/API vẫn tự kiểm tra lại quyền). */
async function Guarded({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage("EDITOR");
  const newLeads = await countNewLeads();
  return (
    <AdminShell user={user} newLeads={newLeads}>
      {children}
    </AdminShell>
  );
}
