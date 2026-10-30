"use client";

import { GitCompareArrows, Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { COMPARE_MAX, useSavedList } from "./saved-store";

export function FavoriteButton({ slug, title, className }: { slug: string; title: string; className?: string }) {
  const fav = useSavedList("tt-favorites");
  const active = fav.has(slug);
  return (
    <button
      type="button"
      onClick={() => fav.toggle(slug)}
      aria-pressed={active}
      aria-label={active ? `Bỏ yêu thích ${title}` : `Lưu ${title} vào yêu thích`}
      className={cn(
        "grid size-9 cursor-pointer place-items-center rounded-xl bg-surface-card/90 backdrop-blur transition-colors hover:text-primary",
        active ? "text-primary-container" : "text-on-surface",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", active && "fill-current")} aria-hidden />
    </button>
  );
}

export function CompareButton({
  slug,
  title,
  className,
  withLabel = false,
}: {
  slug: string;
  title: string;
  className?: string;
  withLabel?: boolean;
}) {
  const cmp = useSavedList("tt-compare");
  const [full, setFull] = useState(false);
  const active = cmp.has(slug);
  return (
    <button
      type="button"
      onClick={() => setFull(cmp.toggle(slug) === null)}
      aria-pressed={active}
      aria-label={active ? `Bỏ ${title} khỏi so sánh` : `Thêm ${title} vào so sánh`}
      title={full ? `Chỉ so sánh tối đa ${COMPARE_MAX} bất động sản` : undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-surface-card/90 backdrop-blur transition-colors hover:text-primary",
        withLabel ? "h-9 px-3 text-[13px] font-semibold" : "size-9",
        active ? "text-primary" : "text-on-surface",
        className,
      )}
    >
      <GitCompareArrows className="size-[18px]" aria-hidden />
      {withLabel ? (active ? "Đang so sánh" : "So sánh") : null}
    </button>
  );
}
