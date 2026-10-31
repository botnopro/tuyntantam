"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "@/components/ui/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { isActive, type NavItem } from "./navigation";

export function MobileMenu({ items, phone, phoneDisplay }: { items: NavItem[]; phone: string; phoneDisplay: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Đóng khi chuyển trang
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
      if (e.key === "Tab") {
        const els = focusables();
        const first = els[0];
        const last = els[els.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="grid size-11 cursor-pointer place-items-center rounded-sm text-on-surface transition-colors hover:bg-surface-container-low"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Đóng menu" : "Mở menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
      </button>
      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menu điều hướng"
        className={cn(
          // Header có backdrop-filter nên là khối chứa của phần tử fixed → đặt chiều cao tường minh thay vì bottom-0.
          // Nền đặc: backdrop-blur lồng trong header (cũng có backdrop-filter) không làm mờ được nội dung trang phía sau
          "fixed inset-x-0 top-20 z-40 h-[calc(100dvh-5rem)] overflow-y-auto bg-surface-card px-5 py-6 transition-[opacity,transform] duration-300",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        <nav aria-label="Menu chính">
          <ul>
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    tabIndex={open ? 0 : -1}
                    className={cn(
                      "block border-b border-border-subtle py-3.5 pl-3 font-sans text-subheading tracking-wider uppercase",
                      active ? "border-l-2 border-l-primary-container text-primary" : "text-on-surface",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <a href={`tel:${phone}`} tabIndex={open ? 0 : -1} className="mt-8 btn-primary w-full">
          <Phone className="size-4" aria-hidden />
          Gọi {phoneDisplay}
        </a>
      </div>
    </div>
  );
}
