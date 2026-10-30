import { Mail, MapPin, Phone } from "lucide-react";
import Link from "@/components/ui/link";
import { SOCIAL_BUTTON, SocialIcon } from "@/components/icons/social";
import { servicePath } from "@/lib/content/routes";
import { cn } from "@/lib/utils/cn";
import { telHref } from "@/lib/utils/format";
import { listServices } from "@/server/pages";
import { getSettings } from "@/server/settings";
import { SiteLogo } from "./site-logo";

const quickLinks = [
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Môi giới", href: "/moi-gioi" },
  { label: "Đầu tư", href: "/dau-tu" },
  { label: "Kho nguồn", href: "/kho-nguon" },
  { label: "Blog", href: "/blog" },
  { label: "Liên hệ & hợp tác", href: "/lien-he" },
];

/** Footer gọn: thương hiệu + liên hệ, liên kết dạng dòng chảy, mạng xã hội. */
export async function Footer() {
  const [site, services] = await Promise.all([getSettings("site"), listServices()]);
  const c = site.contacts;
  // Chỉ hiện email cá nhân (bỏ địa chỉ contact@)
  const email = c.emails.find((e) => !e.startsWith("contact@"));

  return (
    <footer className="mt-auto bg-surface-container-low text-on-surface">
      <div className="container-page grid gap-6 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] lg:py-10">
        <div>
          <Link href="/" aria-label={`${site.name} — Trang chủ`} className="inline-block">
            <SiteLogo site={site} className="h-9" />
          </Link>
          <ul className="mt-3 space-y-1.5 text-body-sm text-on-surface-variant">
            <li>
              <a href={telHref(c.phone)} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Phone className="size-4 text-primary" aria-hidden />
                {c.phoneDisplay}
              </a>
            </li>
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 break-all hover:text-primary">
                  <Mail className="size-4 shrink-0 text-primary" aria-hidden />
                  {email}
                </a>
              </li>
            ) : null}
            {c.address || c.area ? (
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" aria-hidden />
                {c.address ?? c.area}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="grid gap-4">
          <FooterLinks title="Khám phá" links={quickLinks} />
          <FooterLinks title="Dịch vụ" links={services.map((s) => ({ label: s.title, href: servicePath(s.slug) }))} />
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-2 lg:col-span-1 lg:flex-col lg:items-start">
          <ul className="flex gap-2" aria-label="Mạng xã hội">
            {site.socials.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={cn(
                    "grid size-10 place-items-center rounded-xl bg-surface-card shadow-xs transition-colors",
                    SOCIAL_BUTTON[s.platform] ?? "text-on-surface-variant hover:text-primary",
                  )}
                >
                  <SocialIcon platform={s.platform} className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
          {site.footerDonate ? (
            <Link href={site.footerDonate.url} className="text-body-sm font-semibold text-primary hover:underline">
              Ủng hộ Tuyn
            </Link>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-sans text-label-caps tracking-wider text-on-surface-variant uppercase">{title}</h2>
      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-body-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-on-surface hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
