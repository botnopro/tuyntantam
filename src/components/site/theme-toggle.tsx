"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { THEME_STORAGE_KEY as STORAGE_KEY } from "@/lib/utils/theme";

/** Chuyển giao diện sáng/tối. Icon đổi bằng class `dark:` nên không lệch khi hydrate. */
export function ThemeToggle() {
  // Chưa chọn thủ công → bám theo cài đặt hệ điều hành
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        /* storage bị chặn */
      }
      document.documentElement.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      /* storage bị chặn: vẫn đổi trong phiên hiện tại */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Đổi giao diện sáng / tối"
      title="Đổi giao diện sáng / tối"
      className="grid size-11 cursor-pointer place-items-center rounded-xl text-on-surface transition-colors hover:bg-surface-container-low hover:text-primary"
    >
      <Moon className="size-5 dark:hidden" aria-hidden />
      <Sun className="hidden size-5 dark:block" aria-hidden />
    </button>
  );
}
