import { Building2, FileText, Home, Inbox, LogOut, Settings, UserCog, LayoutTemplate, ExternalLink } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import type { SessionUser } from "@/lib/auth/session";
import { AdminNavLink } from "./nav-link";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: Home, exact: true },
  { href: "/admin/khach-lien-he", label: "Khách liên hệ", icon: Inbox },
  { href: "/admin/bat-dong-san", label: "Kho nguồn", icon: Building2 },
  { href: "/admin/tin-tuc", label: "Blog", icon: FileText },
  { href: "/admin/noi-dung", label: "Trang & dịch vụ", icon: LayoutTemplate },
  { href: "/admin/cau-hinh", label: "Cấu hình site", icon: Settings, admin: true },
  { href: "/admin/tai-khoan", label: "Tài khoản", icon: UserCog },
];

export function AdminShell({ user, newLeads, children }: { user: SessionUser; newLeads: number; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-neutral lg:flex-row">
      <aside className="border-b border-border-subtle bg-surface-card lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/admin" className="font-display text-[20px] font-semibold text-slate-dark">
            Quản trị
          </Link>
          <p className="text-[12px] text-on-surface-variant lg:mt-1">
            {user.name} · {user.role === "ADMIN" ? "Quản trị viên" : "Biên tập viên"}
          </p>
        </div>
        <nav aria-label="Menu quản trị" className="overflow-x-auto px-3 pb-3 lg:pb-0">
          <ul className="flex gap-1 lg:flex-col">
            {NAV.filter((n) => !n.admin || user.role === "ADMIN").map((n) => (
              <li key={n.href}>
                <AdminNavLink href={n.href} exact={n.exact}>
                  <n.icon className="size-4 shrink-0" aria-hidden />
                  <span className="whitespace-nowrap">{n.label}</span>
                  {n.href === "/admin/khach-lien-he" && newLeads > 0 ? (
                    <span className="ml-auto rounded-full bg-brand-strong px-1.5 text-[11px] font-bold text-white">{newLeads}</span>
                  ) : null}
                </AdminNavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden space-y-1 border-t border-border-subtle p-3 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-[14px] text-on-surface-variant hover:bg-surface-neutral"
          >
            <ExternalLink className="size-4" aria-hidden /> Xem website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-[14px] text-on-surface-variant hover:bg-surface-neutral"
            >
              <LogOut className="size-4" aria-hidden /> Đăng xuất
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl p-5 lg:p-8">{children}</main>
        <form action={logoutAction} className="px-5 pb-6 lg:hidden">
          <button type="submit" className="btn-ghost w-full">
            <LogOut className="size-4" aria-hidden /> Đăng xuất
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminHeader({ title, actions, description }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[28px] leading-tight">{title}</h1>
        {description ? <p className="mt-1 text-[14px] text-on-surface-variant">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
