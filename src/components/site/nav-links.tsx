"use client";

import Link from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { isActive, type NavItem } from "./navigation";

export function NavLinks({ items }: { items: NavItem[] }) {
  return <NavList items={items} pathname={usePathname()} />;
}

/** Menu không đánh dấu mục hiện tại — fallback trong static shell khi pathname chưa có. */
export function NavList({ items, pathname }: { items: NavItem[]; pathname: string | null }) {
  return (
    <ul className="hidden items-center gap-1 xl:flex">
      {items.map((item) => {
        const active = pathname ? isActive(pathname, item.href) : false;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-sm px-3 py-1.5 font-sans text-subheading tracking-wider uppercase transition-colors",
                active
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
