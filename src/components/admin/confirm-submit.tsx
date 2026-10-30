"use client";

import { Trash2 } from "lucide-react";

/** Nút submit có hộp xác nhận (dùng cho thao tác xoá). */
export function ConfirmSubmit({ message, children = "Xoá" }: { message: string; children?: React.ReactNode }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className="flex cursor-pointer items-center gap-2 rounded-sm border border-error/40 px-4 py-2 text-[14px] text-error hover:bg-error-container"
    >
      <Trash2 className="size-4" aria-hidden />
      {children}
    </button>
  );
}
