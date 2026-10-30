"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function AdminNavLink({ href, exact, children }: { href: string; exact?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-sm px-3 py-2 text-[14px] font-medium",
        active ? "bg-brand-subtle text-on-primary-container" : "text-slate-dark hover:bg-surface-neutral",
      )}
    >
      {children}
    </Link>
  );
}
