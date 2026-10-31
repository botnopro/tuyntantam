"use client";

import { ArrowUp, Mail, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SocialIcon } from "@/components/icons/social";
import { cn } from "@/lib/utils/cn";

type Props = { phone: string; phoneDisplay: string; zalo: string | null; email: string };

/**
 * Nút liên hệ nổi (Gọi / Zalo / Email) + nút lên đầu trang.
 * Mobile: gộp thành một nút "Liên hệ" bấm để bung (3 nút tròn che chữ nội dung); từ sm hiện đủ.
 */
export function FloatingContact({ phone, phoneDisplay, zalo, email }: Props) {
  const [showTop, setShowTop] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    {
      href: `tel:${phone}`,
      label: `Gọi ${phoneDisplay}`,
      className: "bg-call hover:bg-call-hover",
      icon: <Phone className="size-5" aria-hidden />,
    },
    zalo && {
      href: zalo,
      label: "Nhắn Zalo",
      className: "bg-zalo hover:bg-zalo-hover",
      icon: <SocialIcon platform="zalo" className="size-6" />,
      external: true,
    },
    {
      href: `mailto:${email}`,
      label: "Gửi email",
      className: "bg-secondary hover:bg-secondary/85",
      icon: <Mail className="size-5" aria-hidden />,
    },
  ].filter(Boolean) as { href: string; label: string; className: string; icon: React.ReactNode; external?: boolean }[];

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2.5 print:hidden" data-floating-contact>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Lên đầu trang"
        className={cn(
          "grid size-11 cursor-pointer place-items-center rounded-xl bg-surface-card text-slate-dark shadow-md transition-all hover:text-primary",
          showTop ? "visible opacity-100" : "invisible translate-y-2 opacity-0",
        )}
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>
      <ul id="floating-contact-list" className={cn("flex-col gap-2.5 sm:flex", open ? "flex" : "hidden")} aria-label="Liên hệ nhanh">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-label={item.label}
              title={item.label}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn("grid size-12 place-items-center rounded-full text-white shadow-lg transition-colors", item.className)}
            >
              {item.icon}
            </a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="floating-contact-list"
        aria-label={open ? "Đóng liên hệ nhanh" : "Liên hệ nhanh"}
        className="grid size-12 cursor-pointer place-items-center rounded-full bg-brand-strong text-white shadow-lg transition-colors hover:bg-brand-hover sm:hidden"
      >
        {open ? <X className="size-5" aria-hidden /> : <MessageCircle className="size-5" aria-hidden />}
      </button>
    </div>
  );
}
