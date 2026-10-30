"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils/cn";

export function Field({
  label,
  name,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={`f-${name}`} className="mb-1 block text-[13px] font-semibold text-slate-dark">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-[12px] text-on-surface-variant">{hint}</p> : null}
      {error ? (
        <p id={`f-${name}-err`} className="mt-1 text-[12px] text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputCls =
  "w-full rounded-sm border border-border-subtle bg-surface-card px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:outline-none aria-[invalid=true]:border-error";

export function fieldProps(name: string, errors?: Record<string, string>) {
  return {
    id: `f-${name}`,
    name,
    "aria-invalid": errors?.[name] ? true : undefined,
    "aria-describedby": errors?.[name] ? `f-${name}-err` : undefined,
  };
}

export function SubmitButton({ children = "Lưu", className }: { children?: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn("btn-primary px-5 py-2.5", className)}>
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
      {pending ? "Đang lưu…" : children}
    </button>
  );
}

export function ActionMessage({ state }: { state: { ok?: boolean; message?: string } }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn(
        "flex items-center gap-2 rounded-sm px-3 py-2 text-[14px]",
        state.ok ? "bg-success-container text-success" : "bg-error-container text-on-error-container",
      )}
    >
      {state.ok ? <CheckCircle2 className="size-4" aria-hidden /> : null}
      {state.message}
    </p>
  );
}

export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-border-subtle bg-surface-card p-5", className)}>
      {title ? <h2 className="mb-4 font-sans text-[15px] font-bold text-slate-dark">{title}</h2> : null}
      {children}
    </section>
  );
}
