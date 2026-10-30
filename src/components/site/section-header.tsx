import { ArrowRight } from "lucide-react";
import Link from "@/components/ui/link";
import { cn } from "@/lib/utils/cn";

type Props = {
  title: string;
  eyebrow?: string;
  description?: string;
  link?: { href: string; label: string };
  align?: "split" | "center";
  as?: "h1" | "h2";
  className?: string;
};

/** Header section kiểu Stitch: split (tiêu đề trái, link phải) hoặc căn giữa. */
export function SectionHeader({ title, eyebrow, description, link, align = "split", as: Tag = "h2", className }: Props) {
  if (align === "center") {
    return (
      <div className={cn("mx-auto mb-10 max-w-2xl text-center lg:mb-14", className)}>
        {eyebrow ? <p className="mb-3 eyebrow">{eyebrow}</p> : null}
        <Tag className="text-headline-lg-mobile lg:text-headline-lg">{title}</Tag>
        {description ? <p className="mt-4 text-body-md text-on-surface-variant">{description}</p> : null}
      </div>
    );
  }
  return (
    <div className={cn("mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end lg:mb-10", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <p className="mb-3 eyebrow-line">{eyebrow}</p> : null}
        <Tag className="text-headline-lg-mobile lg:text-headline-lg">{title}</Tag>
        {description ? <p className="mt-3 text-body-md text-on-surface-variant">{description}</p> : null}
      </div>
      {link ? (
        <Link href={link.href} className="group link-arrow shrink-0">
          {link.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
