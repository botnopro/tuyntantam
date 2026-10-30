import { cn } from "@/lib/utils/cn";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

type Props = {
  title: string;
  description?: string | null;
  crumbs: Crumb[];
  aside?: React.ReactNode;
  children?: React.ReactNode;
  tone?: "warm" | "plain";
};

/** Đầu trang gọn: breadcrumb, H1, mô tả ngắn, khối phụ (tuỳ chọn) bên phải. */
export function PageHero({ title, description, crumbs, aside, children, tone = "warm" }: Props) {
  return (
    <section className={cn("border-b border-border-subtle", tone === "warm" ? "bg-surface-warm" : "bg-surface")}>
      <div className="container-page py-5 lg:py-7">
        <Breadcrumbs items={crumbs} />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-headline-lg-mobile lg:text-headline-lg">{title}</h1>
            {description ? <p className="mt-2 max-w-3xl text-body-md text-on-surface-variant">{description}</p> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
