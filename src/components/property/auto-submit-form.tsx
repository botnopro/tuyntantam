"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useRef, useTransition } from "react";

const TYPING_DELAY_MS = 500;
const TYPED = new Set(["text", "search", "number"]);

type Props = Omit<React.ComponentProps<"form">, "action" | "method" | "onChange" | "onInput" | "onSubmit"> & { action: string };

/**
 * Form GET tự áp dụng khi người dùng đổi bộ lọc (không cần bấm "Lọc").
 * Chọn/radio áp dụng ngay; ô gõ chữ/số chờ ngừng gõ một chút. Bỏ tham số rỗng cho URL gọn,
 * chuyển trang phía client và giữ vị trí cuộn. Không có JS vẫn là form GET bình thường.
 */
export function AutoSubmitForm({ action, children, ...props }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const apply = (delay = 0) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const params = new URLSearchParams();
      for (const [key, value] of new FormData(ref.current)) {
        if (typeof value === "string" && value.trim() !== "") params.append(key, value.trim());
      }
      const query = params.toString();
      startTransition(() => router.replace(query ? `${action}?${query}` : action, { scroll: false }));
    }, delay);
  };
  const isTyped = (el: EventTarget) => el instanceof HTMLInputElement && TYPED.has(el.type);

  return (
    <form
      {...props}
      ref={ref}
      aria-busy={pending}
      action={action}
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      onInput={(e) => {
        if (isTyped(e.target)) apply(TYPING_DELAY_MS);
      }}
      onChange={(e) => {
        // Ô không có name (vd. nút thu gọn bộ lọc) không thuộc dữ liệu lọc
        if (e.target instanceof HTMLInputElement && !e.target.name) return;
        if (!isTyped(e.target)) apply();
      }}
    >
      {children}
      {/* Phản hồi ngay khi đang tải kết quả mới (truy vấn có thể mất vài trăm ms) */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-strong transition-opacity",
          pending ? "animate-pulse opacity-100" : "opacity-0",
        )}
      />
      <span role="status" className="sr-only">
        {pending ? "Đang lọc…" : ""}
      </span>
    </form>
  );
}
