"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageRef } from "@/lib/content/types";
import { cn } from "@/lib/utils/cn";

const AUTOPLAY_MS = 1000;

/** Một ảnh bìa tự chuyển + lightbox (bấm vào ảnh) để xem lần lượt, điều khiển bằng bàn phím. */
export function Gallery({ images, title }: { images: ImageRef[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = images.length;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback((d: number) => setIndex((i) => (i == null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    dlg.addEventListener("keydown", onKey);
    dlg.addEventListener("close", onClose);
    return () => {
      dlg.removeEventListener("keydown", onKey);
      dlg.removeEventListener("close", onClose);
    };
  }, [step]);

  // Ảnh bìa tự chuyển mỗi giây; dừng khi đang mở lightbox, khi rê chuột/focus vào hoặc tab bị ẩn
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (count < 2 || paused || index != null) return;
    // Người dùng bật "giảm chuyển động" trong hệ điều hành → không tự chuyển ảnh
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (!document.hidden) setCurrent((c) => (c + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused, index]);

  if (!count) return null;
  const alt = (img: ImageRef, i: number) => img.alt || `${title} — ảnh ${i + 1}`;

  return (
    <>
      <button
        type="button"
        onClick={() => open(current)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="group relative block h-[300px] w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-dim sm:h-[480px]"
        aria-label={`Xem ảnh ${current + 1} trên ${count} — bấm để xem các ảnh khác`}
      >
        {images.map((img, i) => {
          const photo = (
            <Image
              src={img.src}
              alt={alt(img, i)}
              fill
              priority={i === 0}
              sizes="(min-width: 1280px) 1240px, 100vw"
              className="object-cover"
            />
          );
          return (
            <span
              key={img.src}
              aria-hidden={i !== current}
              className={cn("absolute inset-0 transition-opacity duration-500", i === current ? "opacity-100" : "opacity-0")}
            >
              {photo}
            </span>
          );
        })}
        {count > 1 ? (
          <span className="absolute right-3 bottom-3 rounded-xs bg-ink/70 px-2.5 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
            {current + 1} / {count}
          </span>
        ) : null}
      </button>

      <dialog
        ref={dialogRef}
        aria-label={`Ảnh ${title}`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 backdrop:bg-ink/80"
      >
        {index != null ? (
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-body-sm">
                {index + 1} / {count}
              </span>
              <button
                type="button"
                onClick={close}
                className="grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 hover:bg-white/20"
                aria-label="Đóng"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <div className="relative flex-1">
              <Image src={images[index]!.src} alt={alt(images[index]!, index)} fill sizes="100vw" className="object-contain" />
            </div>
            {count > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="size-7" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Ảnh sau"
                >
                  <ChevronRight className="size-7" aria-hidden />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
