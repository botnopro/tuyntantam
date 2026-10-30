"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";
import { SOCIAL_BUTTON, SocialIcon } from "@/components/icons/social";

const noopSubscribe = () => () => {};

/** Chia sẻ: Web Share API (mobile) + Facebook + sao chép link. */
export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
  const btn =
    "grid size-10 cursor-pointer place-items-center rounded-xl bg-surface-card text-on-surface-variant shadow-xs transition-colors hover:bg-brand-subtle hover:text-primary";

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      /* người dùng huỷ */
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard bị chặn */
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="mr-1 text-body-sm text-on-surface-variant">Chia sẻ</span>
      {canShare ? (
        <button type="button" onClick={nativeShare} className={btn} aria-label="Chia sẻ">
          <Share2 className="size-[18px]" aria-hidden />
        </button>
      ) : null}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(btn, SOCIAL_BUTTON.facebook)}
        aria-label="Chia sẻ lên Facebook"
      >
        <SocialIcon platform="facebook" className="size-[18px]" />
      </a>
      <button type="button" onClick={copy} className={btn} aria-label={copied ? "Đã sao chép liên kết" : "Sao chép liên kết"}>
        {copied ? <Check className="size-[18px] text-success" aria-hidden /> : <Link2 className="size-[18px]" aria-hidden />}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Đã sao chép liên kết" : ""}
      </span>
    </div>
  );
}
