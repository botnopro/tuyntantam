import Image from "next/image";
import Link from "@/components/ui/link";
import { cn } from "@/lib/utils/cn";
import { SOCIAL_BUTTON, SocialIcon } from "@/components/icons/social";
import { getSettings } from "@/server/settings";

export async function AuthorBox() {
  const [agent, site] = await Promise.all([getSettings("agent"), getSettings("site")]);
  return (
    <section aria-label="Tác giả" className="flex flex-col gap-5 rounded-lg bg-surface-warm p-6 sm:flex-row sm:items-start sm:p-8">
      {agent.avatar ? (
        <Image src={agent.avatar.src} alt="" width={80} height={80} className="size-20 shrink-0 rounded-full object-cover" />
      ) : null}
      <div>
        <p className="eyebrow">Tác giả</p>
        <p className="mt-1 font-display text-headline-sm text-slate-dark">{agent.alias}</p>
        <p className="mt-2 text-body-md text-on-surface-variant">{agent.shortBio}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link href="/gioi-thieu" className="link-arrow">
            Về Tuyn
          </Link>
          <ul className="flex gap-2">
            {site.socials.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className={cn(
                    "grid size-9 place-items-center rounded-xl bg-surface-card shadow-xs transition-colors",
                    SOCIAL_BUTTON[s.platform] ?? "text-on-surface-variant hover:text-primary",
                  )}
                >
                  <SocialIcon platform={s.platform} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
