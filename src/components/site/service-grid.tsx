import { ArrowRight, Building2, Handshake, KeyRound, Sofa } from "lucide-react";
import Link from "@/components/ui/link";
import type { Service } from "@/lib/db/schema";
import { servicePath } from "@/lib/content/routes";

const ICONS: Record<string, typeof KeyRound> = {
  "tu-van-thue-nha": KeyRound,
  "dan-khach-xem-nha": Handshake,
  "tu-van-dau-tu": Building2,
  "tu-van-setup-noi-that": Sofa,
};

/** Lưới dịch vụ (Stitch About c.23b): card nền ấm, ô icon, link "Tìm hiểu". */
export function ServiceGrid({ services }: { services: Service[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {services.map((s) => {
        const Icon = ICONS[s.slug] ?? KeyRound;
        return (
          <li key={s.slug} className="group relative flex flex-col rounded-sm bg-surface-warm p-7 transition-shadow hover:shadow-md">
            <span className="mb-6 grid size-14 place-items-center rounded-sm bg-brand-subtle text-primary transition-colors group-hover:bg-brand-strong group-hover:text-white">
              <Icon className="size-6" aria-hidden />
            </span>
            <h3 className="text-headline-sm">
              <Link href={servicePath(s.slug)} className="after:absolute after:inset-0">
                {s.title}
              </Link>
            </h3>
            {s.summary ? <p className="mt-3 text-body-md text-on-surface-variant">{s.summary}</p> : null}
            <span className="mt-auto link-arrow pt-6" aria-hidden>
              Tìm hiểu
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
