"use client";

import { CheckCircle2, Loader2, Send } from "lucide-react";
import Script from "next/script";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { LEAD_INTERESTS } from "@/lib/content/lead-options";
import { cn } from "@/lib/utils/cn";
import { submitLeadAction, type LeadFormState } from "./actions";

export type LeadFormVariant = "contact" | "viewing" | "inquiry" | "consignment";

type Props = {
  variant?: LeadFormVariant;
  propertySlug?: string;
  propertyTitle?: string;
  defaultInterest?: keyof typeof LEAD_INTERESTS;
  submitLabel?: string;
  labels?: Partial<Record<"name" | "phone" | "email" | "message", string>>;
  showInterest?: boolean;
  compact?: boolean;
  className?: string;
};

const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const initial: LeadFormState = { status: "idle" };

export function LeadForm({
  variant = "contact",
  propertySlug,
  propertyTitle,
  defaultInterest,
  submitLabel,
  labels = {},
  showInterest = variant === "contact",
  compact = false,
  className,
}: Props) {
  const [state, action, pending] = useActionState(submitLeadAction, initial);
  const [token, setToken] = useState("");
  const sourceRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  useEffect(() => {
    // Đồng bộ giá trị phụ thuộc trình duyệt trực tiếp vào DOM (không gây render lại)
    if (sourceRef.current) sourceRef.current.value = window.location.pathname;
    formRef.current?.querySelectorAll<HTMLInputElement>('input[type="date"]').forEach((el) => {
      el.min = new Date().toLocaleDateString("en-CA");
    });
    let cancelled = false;
    fetch("/api/v1/form-token", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { data?: { token?: string } } | null) => {
        if (!cancelled && d?.data?.token) setToken(d.data.token);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  if (state.status === "success") {
    return (
      <div role="status" className={cn("rounded-lg bg-success-container p-6 text-success", className)}>
        <CheckCircle2 className="mb-3 size-8" aria-hidden />
        <p className="font-semibold">{state.message}</p>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const type =
    variant === "viewing" ? "VIEWING" : variant === "inquiry" ? "PROPERTY_INQUIRY" : variant === "consignment" ? "CONSIGNMENT" : "CONTACT";
  const defaultMessage = variant === "inquiry" && propertyTitle ? `Tôi quan tâm đến "${propertyTitle}". Vui lòng liên hệ lại cho tôi.` : "";

  const field = (name: string) => ({
    id: id(name),
    name,
    "aria-invalid": err[name] ? true : undefined,
    "aria-describedby": err[name] ? id(`${name}-err`) : undefined,
  });
  const errorText = (name: string) =>
    err[name] ? (
      <p id={id(`${name}-err`)} className="mt-1 text-[13px] text-error">
        {err[name]}
      </p>
    ) : null;

  return (
    <form ref={formRef} action={action} noValidate className={cn("space-y-4", className)}>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="formToken" value={token} />
      <input ref={sourceRef} type="hidden" name="sourcePage" defaultValue="" />
      {propertySlug ? <input type="hidden" name="propertySlug" value={propertySlug} /> : null}
      {/* Honeypot: ẩn với người dùng, bot thường điền */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      {showInterest ? (
        <div>
          <label htmlFor={id("interest")} className="label-field">
            Bạn cần Tuyn hỗ trợ gì?
          </label>
          <select {...field("interest")} defaultValue={v.interest ?? defaultInterest ?? ""} className="field cursor-pointer">
            <option value="">Chọn nhu cầu</option>
            {Object.entries(LEAD_INTERESTS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {variant === "consignment" ? (
        <fieldset>
          <legend className="label-field">Hình thức ký gửi</legend>
          <div className="flex gap-2">
            {[
              ["RENT", "Cần cho thuê"],
              ["SALE", "Cần gửi bán"],
            ].map(([value, label]) => (
              <label
                key={value}
                className="flex flex-1 cursor-pointer items-center gap-2 rounded-sm bg-surface-container-low px-3 py-2.5 text-[15px] has-[:checked]:bg-brand-subtle has-[:checked]:text-on-primary-container"
              >
                <input
                  type="radio"
                  name="consignmentType"
                  value={value}
                  defaultChecked={v.consignmentType === value}
                  className="accent-brand-strong"
                />
                {label}
              </label>
            ))}
          </div>
          {errorText("consignmentType")}
        </fieldset>
      ) : null}

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div>
          <label htmlFor={id("name")} className="label-field">
            {labels.name ?? "Họ và tên"} <span className="text-error">*</span>
          </label>
          <input {...field("name")} type="text" autoComplete="name" required maxLength={100} defaultValue={v.name} className="field" />
          {errorText("name")}
        </div>
        <div>
          <label htmlFor={id("phone")} className="label-field">
            {labels.phone ?? "Số điện thoại"}
          </label>
          <input
            {...field("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            defaultValue={v.phone}
            className="field"
          />
          {errorText("phone")}
        </div>
      </div>
      <div>
        <label htmlFor={id("email")} className="label-field">
          {labels.email ?? "Email"}
        </label>
        <input {...field("email")} type="email" autoComplete="email" maxLength={150} defaultValue={v.email} className="field" />
        {errorText("email")}
        {!err.phone && !err.email ? (
          <p className="mt-1 text-[13px] text-on-surface-variant">Nhập số điện thoại hoặc email để Tuyn liên hệ lại.</p>
        ) : null}
      </div>

      {variant === "viewing" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={id("preferredDate")} className="label-field">
              Ngày xem <span className="text-error">*</span>
            </label>
            <input {...field("preferredDate")} type="date" defaultValue={v.preferredDate} className="field" />
            {errorText("preferredDate")}
          </div>
          <div>
            <label htmlFor={id("preferredTime")} className="label-field">
              Giờ xem
            </label>
            <input
              {...field("preferredTime")}
              type="time"
              min="07:00"
              max="21:00"
              step={900}
              defaultValue={v.preferredTime}
              className="field"
            />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="label-field">Hình thức</legend>
            <div className="flex gap-2">
              {[
                ["in-person", "Xem trực tiếp"],
                ["video", "Video call"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex flex-1 cursor-pointer items-center gap-2 rounded-sm bg-surface-container-low px-3 py-2.5 text-[15px] has-[:checked]:bg-brand-subtle has-[:checked]:text-on-primary-container"
                >
                  <input
                    type="radio"
                    name="tourType"
                    value={value}
                    defaultChecked={(v.tourType ?? "in-person") === value}
                    className="accent-brand-strong"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}

      {variant === "consignment" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor={id("propertyAddress")} className="label-field">
              Địa chỉ bất động sản
            </label>
            <input {...field("propertyAddress")} type="text" maxLength={250} defaultValue={v.propertyAddress} className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={id("expectedPrice")} className="label-field">
              Giá mong muốn
            </label>
            <input {...field("expectedPrice")} type="text" maxLength={100} defaultValue={v.expectedPrice} className="field" />
          </div>
        </div>
      ) : null}

      <div>
        <label htmlFor={id("message")} className="label-field">
          {labels.message ?? "Lời nhắn"}
        </label>
        <textarea
          {...field("message")}
          rows={compact ? 3 : 4}
          maxLength={3000}
          defaultValue={v.message ?? defaultMessage}
          className="field resize-y"
        />
        {errorText("message")}
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[14px] text-on-surface-variant">
          <input
            type="checkbox"
            name="consent"
            value="true"
            defaultChecked={v.consent === "true"}
            aria-invalid={err.consent ? true : undefined}
            className="mt-0.5 size-4 shrink-0 accent-brand-strong"
          />
          <span>Tôi đồng ý để Tuyn Tận Tâm lưu thông tin trên và liên hệ lại với tôi.</span>
        </label>
        {errorText("consent")}
      </div>

      {TURNSTILE_KEY ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
          <div className="cf-turnstile" data-sitekey={TURNSTILE_KEY} data-language="vi" />
        </>
      ) : null}

      {state.status === "error" && state.message ? (
        <p role="alert" className="rounded-sm bg-error-container px-3 py-2.5 text-[14px] text-on-error-container">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full py-3.5">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {pending ? "Đang gửi…" : (submitLabel ?? (variant === "viewing" ? "Đặt lịch xem nhà" : "Gửi cho Tuyn"))}
      </button>
    </form>
  );
}
