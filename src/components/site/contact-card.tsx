import { Mail, MapPin, Phone } from "lucide-react";
import { SocialIcon } from "@/components/icons/social";
import { telHref } from "@/lib/utils/format";
import { getSettings } from "@/server/settings";

/** Thẻ liên hệ nhanh cho sidebar (Stitch agent card rút gọn). */
export async function ContactCard() {
  const [site, agent] = await Promise.all([getSettings("site"), getSettings("agent")]);
  const c = site.contacts;
  return (
    <section className="rounded-lg bg-surface-card p-6 shadow-card" aria-label="Liên hệ">
      <p className="font-display text-headline-sm text-slate-dark">{agent.alias}</p>
      <p className="mt-1 eyebrow">{agent.title}</p>
      <a
        href={telHref(c.phone)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xs bg-surface-neutral py-3 text-spec-num text-slate-dark hover:bg-surface-container"
      >
        <Phone className="size-4 text-primary" aria-hidden />
        {c.phoneDisplay}
      </a>
      <a href={`mailto:${c.primaryEmail}`} className="mt-2 btn-primary w-full">
        <Mail className="size-4" aria-hidden />
        Gửi email
      </a>
      {c.zalo ? (
        <a href={c.zalo} target="_blank" rel="noopener noreferrer" className="mt-2 btn-ghost w-full">
          <SocialIcon platform="zalo" className="size-5 text-zalo" />
          Nhắn Zalo
        </a>
      ) : null}
      {c.area ? (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-body-sm text-on-surface-variant">
          <MapPin className="size-4 text-primary" aria-hidden />
          {c.area}
        </p>
      ) : null}
    </section>
  );
}
