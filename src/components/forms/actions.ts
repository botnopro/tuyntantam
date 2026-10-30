"use server";

import { headers } from "next/headers";
import { submitLead } from "@/server/leads";

export type LeadFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function submitLeadAction(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$")) raw[key] = value;
  }
  if (raw["cf-turnstile-response"]) raw.turnstileToken = raw["cf-turnstile-response"];

  try {
    const result = await submitLead(raw, await headers());
    if (result.ok) {
      return { status: "success", message: "Cảm ơn bạn! Tuyn đã nhận được thông tin và sẽ liên hệ lại sớm." };
    }
    // Trả lại giá trị đã nhập (trừ trường chống spam) để người dùng không phải gõ lại
    const { formToken: _t, website: _w, turnstileToken: _tt, ...values } = raw;
    return { status: "error", message: result.message, fieldErrors: result.fieldErrors, values };
  } catch (err) {
    console.error("[lead-action]", err instanceof Error ? err.message : err);
    return { status: "error", message: "Không gửi được thông tin. Vui lòng thử lại hoặc gọi trực tiếp cho Tuyn." };
  }
}
