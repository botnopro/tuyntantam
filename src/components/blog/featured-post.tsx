import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import Image from "next/image";
import Link from "@/components/ui/link";
import { postPath } from "@/lib/content/routes";
import { formatDate } from "@/lib/utils/format";
import type { PostCard } from "@/server/posts";

/** Bài nổi bật (Stitch Blog c.11b): card ngang — ảnh 7 cột, nội dung 5 cột nền ấm. */
export function FeaturedPost({ post }: { post: PostCard }) {
  return (
    <article className="group relative grid overflow-hidden card lg:grid-cols-12">
      <div className="relative aspect-video overflow-hidden bg-surface-container-high lg:col-span-7 lg:aspect-auto lg:min-h-[420px]">
        {post.coverImage ? (
          <Image
            src={post.coverImage.src}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="badge bg-brand-strong text-white">Bài nổi bật</span>
          <span className="badge gap-1 bg-ink/85 text-white">
            <Clock className="size-3" aria-hidden />
            {post.readingMinutes} phút đọc
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center bg-surface-warm p-6 sm:p-10 lg:col-span-5 lg:p-12">
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {post.categories[0] ? <span className="eyebrow">{post.categories[0].name}</span> : null}
          {post.publishedAt ? (
            <span className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant">
              <CalendarDays className="size-3.5" aria-hidden />
              <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
            </span>
          ) : null}
        </div>
        <h2 className="text-headline-lg-mobile lg:text-headline-lg">
          <Link href={postPath(post.slug)} className="group-hover:text-primary after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="mt-4 line-clamp-4 text-body-md text-on-surface-variant">{post.excerpt}</p> : null}
        <span className="mt-6 link-arrow" aria-hidden>
          Đọc toàn bộ
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
