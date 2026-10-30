import Link from "@/components/ui/link";

/** Empty state nhẹ dùng được trong client component. */
export function EmptyStateClient({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-warm px-6 py-12 text-center">
      <h2 className="text-headline-sm">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-body-md text-on-surface-variant">{description}</p>
      {action ? (
        <Link href={action.href} className="mt-6 btn-primary">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
