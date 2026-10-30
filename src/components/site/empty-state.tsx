import Link from "@/components/ui/link";

type Action = { href: string; label: string; external?: boolean; variant?: "primary" | "ghost" };

export function EmptyState({
  title,
  description,
  actions = [],
  icon,
}: {
  title: string;
  description: string;
  actions?: Action[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-warm px-6 py-12 text-center sm:px-10">
      {icon ? <div className="mx-auto mb-5 grid size-14 place-items-center rounded-sm bg-brand-subtle text-primary">{icon}</div> : null}
      <h2 className="text-headline-sm">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-body-md text-on-surface-variant">{description}</p>
      {actions.length ? (
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {actions.map((a) =>
            a.external ? (
              <a
                key={a.href}
                href={a.href}
                target="_blank"
                rel="noopener noreferrer"
                className={a.variant === "ghost" ? "btn-ghost" : "btn-primary"}
              >
                {a.label}
              </a>
            ) : (
              <Link key={a.href} href={a.href} className={a.variant === "ghost" ? "btn-ghost" : "btn-primary"}>
                {a.label}
              </Link>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
