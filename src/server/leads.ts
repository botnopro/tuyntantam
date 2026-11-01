import "server-only";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { leads, properties, type Lead } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/security/rate-limit";
import { clientIp, hashIp, maskEmail, verifyFormToken, verifyTurnstile } from "@/lib/security/request";
import { stripTags } from "@/lib/security/sanitize";
import { LEAD_INTERESTS, leadInputSchema, type LeadInput } from "@/lib/validation/lead";
import { formatDateTime } from "@/lib/utils/format";
import { sendMail } from "./mail";
import { formatTelegramMessage, sendTelegram } from "./telegram";

export type LeadResult =
  { ok: true; id: string | null } | { ok: false; status: 400 | 429; message: string; fieldErrors?: Record<string, string> };

const LEAD_LIMIT = 5;
const LEAD_WINDOW_SEC = 10 * 60;

const TYPE_LABEL: Record<Lead["type"], string> = {
  CONTACT: "Liên hệ",
  VIEWING: "Đặt lịch xem nhà",
  PROPERTY_INQUIRY: "Hỏi thông tin BĐS",
  CONSIGNMENT: "Ký gửi BĐS",
};

/**
 * Xử lý lead từ form công khai: validate → chống spam (honeypot, token thời gian, Turnstile)
 * → giới hạn tần suất theo IP → lưu DB → gửi email thông báo sau khi phản hồi.
 */
export async function submitLead(raw: unknown, headers: Headers): Promise<LeadResult> {
  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, status: 400, message: "Vui lòng kiểm tra lại thông tin", fieldErrors };
  }
  const input = parsed.data;
  const ip = clientIp(headers);

  const limit = await rateLimit(`lead:${hashIp(ip)}`, LEAD_LIMIT, LEAD_WINDOW_SEC);
  if (!limit.ok) {
    return { ok: false, status: 429, message: "Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau ít phút." };
  }

  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return { ok: false, status: 400, message: "Xác minh chống spam không thành công, vui lòng thử lại" };
  }

  // Honeypot có giá trị, token thiếu/sai/hết hạn hoặc điền quá nhanh → lưu ở trạng thái SPAM
  // (không gửi email) để admin xem lại — không đánh mất lead thật khi JS lỗi.
  const token = verifyFormToken(input.formToken);
  const suspicious = Boolean(input.website) || token !== "ok";
  if (suspicious) console.warn(`[leads] nghi spam (${input.website ? "honeypot" : token}) → SPAM`);

  const id = await saveLead(input, ip, headers.get("user-agent"), suspicious ? "SPAM" : "NEW");
  if (!suspicious) {
    after(() => notifyNewLead(id).catch((e) => console.error("[leads] gửi thông báo thất bại:", e instanceof Error ? e.message : e)));
  }
  return { ok: true, id };
}

async function saveLead(input: LeadInput, ip: string, userAgent: string | null, status: "NEW" | "SPAM"): Promise<string> {
  const db = getDb();
  let propertyId: string | null = null;
  if (input.propertySlug) {
    const [p] = await db.select({ id: properties.id }).from(properties).where(eq(properties.slug, input.propertySlug)).limit(1);
    propertyId = p?.id ?? null;
  }
  const details: Record<string, string> = {};
  if (input.consignmentType) details.consignmentType = input.consignmentType;
  if (input.propertyAddress) details.propertyAddress = stripTags(input.propertyAddress);
  if (input.expectedPrice) details.expectedPrice = stripTags(input.expectedPrice);

  const [row] = await db
    .insert(leads)
    .values({
      type: input.type,
      status,
      name: stripTags(input.name),
      phone: input.phone ?? null,
      email: input.email?.toLowerCase() ?? null,
      message: input.message ? stripTags(input.message) : null,
      interest: input.interest ?? null,
      propertyId,
      preferredDate: input.preferredDate ?? null,
      preferredTime: input.preferredTime ?? null,
      tourType: input.tourType ?? null,
      details: Object.keys(details).length ? details : null,
      sourcePage: input.sourcePage?.startsWith("/") ? input.sourcePage.slice(0, 200) : null,
      ipHash: hashIp(ip),
      userAgent: userAgent?.slice(0, 300) ?? null,
    })
    .returning({ id: leads.id });
  return row!.id;
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Báo lead mới qua email và Telegram (kênh nào đã cấu hình); một kênh lỗi không chặn kênh kia. */
async function notifyNewLead(id: string) {
  const { LEAD_NOTIFY_EMAIL: to, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = env();
  const telegram = Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
  if (!to && !telegram) return;
  const [lead] = await getDb()
    .select({ lead: leads, propertyTitle: properties.title, propertySlug: properties.slug })
    .from(leads)
    .leftJoin(properties, eq(properties.id, leads.propertyId))
    .where(eq(leads.id, id))
    .limit(1);
  if (!lead) return;
  const l = lead.lead;
  const rows: [string, string | null | undefined][] = [
    ["Loại", TYPE_LABEL[l.type]],
    ["Họ tên", l.name],
    ["Điện thoại", l.phone],
    ["Email", l.email],
    ["Nhu cầu", l.interest ? LEAD_INTERESTS[l.interest as keyof typeof LEAD_INTERESTS] : null],
    ["BĐS", lead.propertyTitle],
    ["Ngày xem", l.preferredDate ? `${l.preferredDate} ${l.preferredTime ?? ""}` : null],
    ["Hình thức xem", l.tourType === "video" ? "Video call" : l.tourType === "in-person" ? "Trực tiếp" : null],
    ["Ký gửi", l.details?.consignmentType === "SALE" ? "Gửi bán" : l.details?.consignmentType === "RENT" ? "Cho thuê" : null],
    ["Địa chỉ BĐS", l.details?.propertyAddress],
    ["Giá mong muốn", l.details?.expectedPrice],
    ["Lời nhắn", l.message],
    ["Trang gửi", l.sourcePage],
    ["Thời gian", formatDateTime(l.createdAt)],
  ];
  const adminUrl = `${env().APP_URL}/admin/khach-lien-he/${l.id}`;
  const jobs: Promise<unknown>[] = [];
  if (to) {
    const html = `<h2>Khách liên hệ mới — ${escape(TYPE_LABEL[l.type])}</h2><table cellpadding="6">${rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td><b>${escape(k)}</b></td><td>${escape(String(v)).replace(/\n/g, "<br>")}</td></tr>`)
      .join("")}</table><p><a href="${adminUrl}">Mở trong trang quản trị</a></p>`;
    jobs.push(
      sendMail({ to, subject: `[Tuyn Tận Tâm] ${TYPE_LABEL[l.type]}: ${l.name}`, html, replyTo: l.email ?? undefined }).then(() =>
        console.info(`[leads] đã gửi email lead ${id} tới ${maskEmail(to)}`),
      ),
    );
  }
  if (telegram) {
    jobs.push(
      sendTelegram(formatTelegramMessage(`Khách mới — ${TYPE_LABEL[l.type]}`, rows.slice(1), adminUrl)).then(() =>
        console.info(`[leads] đã gửi Telegram lead ${id}`),
      ),
    );
  }
  for (const r of await Promise.allSettled(jobs)) {
    if (r.status === "rejected") console.error("[leads] gửi thông báo thất bại:", r.reason instanceof Error ? r.reason.message : r.reason);
  }
}

/* ---------- Admin ---------- */

export async function listLeads(f: { status?: Lead["status"]; type?: Lead["type"]; q?: string; page: number; limit: number }) {
  const db = getDb();
  const where: SQL[] = [];
  if (f.status) where.push(eq(leads.status, f.status));
  if (f.type) where.push(eq(leads.type, f.type));
  if (f.q) {
    const term = `%${f.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    where.push(or(ilike(leads.name, term), ilike(leads.phone, term), ilike(leads.email, term), ilike(leads.message, term))!);
  }
  const cond = where.length ? and(...where) : undefined;
  const [{ total }] = (await db.select({ total: count() }).from(leads).where(cond)) as [{ total: number }];
  const items = await db
    .select({ lead: leads, propertyTitle: properties.title, propertySlug: properties.slug })
    .from(leads)
    .leftJoin(properties, eq(properties.id, leads.propertyId))
    .where(cond)
    .orderBy(desc(leads.createdAt))
    .limit(f.limit)
    .offset((f.page - 1) * f.limit);
  return { items, total, page: f.page, limit: f.limit, pages: Math.max(1, Math.ceil(total / f.limit)) };
}

export async function getLead(id: string) {
  const [row] = await getDb()
    .select({ lead: leads, propertyTitle: properties.title, propertySlug: properties.slug })
    .from(leads)
    .leftJoin(properties, eq(properties.id, leads.propertyId))
    .where(eq(leads.id, id))
    .limit(1);
  return row ?? null;
}

export async function updateLead(id: string, patch: { status?: Lead["status"]; adminNote?: string | null }, userId: string) {
  const set: Partial<typeof leads.$inferInsert> = {};
  if (patch.status) {
    set.status = patch.status;
    set.handledAt = patch.status === "NEW" ? null : new Date();
    set.handledBy = patch.status === "NEW" ? null : userId;
  }
  if (patch.adminNote !== undefined) set.adminNote = patch.adminNote ? stripTags(patch.adminNote) : null;
  const [row] = await getDb().update(leads).set(set).where(eq(leads.id, id)).returning();
  return row ?? null;
}

export async function deleteLead(id: string) {
  const [row] = await getDb().delete(leads).where(eq(leads.id, id)).returning({ id: leads.id });
  return !!row;
}

export async function countNewLeads() {
  const [{ total }] = (await getDb().select({ total: count() }).from(leads).where(eq(leads.status, "NEW"))) as [{ total: number }];
  return total;
}

/** CSV (UTF-8 BOM để Excel đọc đúng tiếng Việt); chống CSV injection bằng tiền tố ' */
export async function exportLeadsCsv(f: { status?: Lead["status"]; type?: Lead["type"] }) {
  const { items } = await listLeads({ ...f, page: 1, limit: 10_000 });
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r|%＝＋－＠]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = [
    "Thời gian",
    "Loại",
    "Trạng thái",
    "Họ tên",
    "Điện thoại",
    "Email",
    "Nhu cầu",
    "BĐS",
    "Ngày xem",
    "Giờ xem",
    "Lời nhắn",
    "Ghi chú",
    "Trang gửi",
  ];
  const lines = items.map(({ lead: l, propertyTitle }) =>
    [
      formatDateTime(l.createdAt),
      TYPE_LABEL[l.type],
      l.status,
      l.name,
      l.phone,
      l.email,
      l.interest ? LEAD_INTERESTS[l.interest as keyof typeof LEAD_INTERESTS] : "",
      propertyTitle,
      l.preferredDate,
      l.preferredTime,
      l.message,
      l.adminNote,
      l.sourcePage,
    ]
      .map(cell)
      .join(","),
  );
  return "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
}

export { TYPE_LABEL as LEAD_TYPE_LABEL };
