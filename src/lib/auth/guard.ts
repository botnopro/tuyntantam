import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "./session";

export type Role = SessionUser["role"];

const RANK: Record<Role, number> = { EDITOR: 1, ADMIN: 2 };

export function hasRole(user: SessionUser | null, role: Role): user is SessionUser {
  return !!user && RANK[user.role] >= RANK[role];
}

export class AuthError extends Error {
  constructor(public status: 401 | 403) {
    super(status === 401 ? "Bạn cần đăng nhập" : "Bạn không có quyền thực hiện thao tác này");
  }
}

/** Dùng trong API route / Server Action: ném AuthError (401/403). */
export async function requireRole(role: Role = "EDITOR"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError(401);
  if (!hasRole(user, role)) throw new AuthError(403);
  return user;
}

/** Dùng trong trang /admin: chuyển về trang đăng nhập nếu chưa có phiên. */
export async function requireAdminPage(role: Role = "EDITOR"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/admin/dang-nhap");
  if (!hasRole(user, role)) redirect("/admin?loi=quyen");
  return user;
}
