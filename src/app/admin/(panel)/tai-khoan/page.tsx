import { deleteUserAction } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { AdminHeader } from "@/components/admin/shell";
import { requireAdminPage } from "@/lib/auth/guard";
import { formatDateTime } from "@/lib/utils/format";
import { listUsers } from "@/server/admin/users";
import { ChangePasswordForm, CreateUserForm } from "./account-forms";

export const metadata = { title: "Tài khoản" };

export default async function AccountPage() {
  const me = await requireAdminPage("EDITOR");
  const users = me.role === "ADMIN" ? await listUsers() : [];
  return (
    <>
      <AdminHeader title="Tài khoản" description={`Đăng nhập với ${me.email}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChangePasswordForm />
        {me.role === "ADMIN" ? <CreateUserForm /> : null}
      </div>
      {users.length ? (
        <section className="mt-6 overflow-x-auto rounded-lg border border-border-subtle bg-surface-card">
          <table className="w-full min-w-[560px] text-[14px]">
            <thead className="bg-surface-neutral text-left text-[12px] text-on-surface-variant uppercase">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Đăng nhập gần nhất</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3">
                    <span className="font-semibold">{u.name}</span>
                    <span className="block text-[13px] text-on-surface-variant">{u.email}</span>
                  </td>
                  <td className="p-3">{u.role === "ADMIN" ? "Quản trị viên" : "Biên tập viên"}</td>
                  <td className="p-3 text-on-surface-variant">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}</td>
                  <td className="p-3 text-right">
                    {u.id !== me.id ? (
                      <form action={deleteUserAction} className="inline-block">
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmSubmit message={`Xoá tài khoản ${u.email}?`} />
                      </form>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </>
  );
}
