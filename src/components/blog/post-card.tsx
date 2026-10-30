import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import Image from "next/image";
import Link from "@/components/ui/link";
import { postPath } from "@/lib/content/routes";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { PostCard as PostCardData } from "@/server/posts";

/** Blog card (Stitch c.11a/d): ảnh 16:9, chuyên mục, ngày, tiêu đề, trích đoạn, "Đọc tiếp". */
export function PostCard({ post, priority = false, className }: { post: PostCardData; priority?: boolean; className?: string }) {
  const cat = post.categories[0];
  return (
    <article className={cn("group relative flex card-lift flex-col overflow-hidden card", className)}>
      <div className="relative aspect-video overflow-hidden bg-surface-container-high">
        {post.coverImage ? (
          <Image
            src={post.coverImage.src}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : null}
        {cat ? <span className="absolute top-3 left-3 badge bg-secondary text-white">{cat.name}</span> : null}
        <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-xs bg-ink/85 px-2 py-0.5 text-[12px] font-semibold text-white">
          <Clock className="size-3" aria-hidden />
          {post.readingMinutes} phút đọc
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.publishedAt ? (
          <p className="mb-2 inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant">
            <CalendarDays className="size-3.5 text-primary" aria-hidden />
            <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
          </p>
        ) : null}
        <h3 className="line-clamp-2 text-headline-sm transition-colors group-hover:text-primary">
          <Link href={postPath(post.slug)} className="after:absolute after:inset-0 focus-visible:outline-none">
            {post.title}
          </Link>
        </h3>
        {post.excerpt ? <p className="mt-2 line-clamp-3 text-body-sm text-on-surface-variant">{post.excerpt}</p> : null}
        <span className="mt-auto link-arrow pt-4" aria-hidden>
          Đọc tiếp
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
}
