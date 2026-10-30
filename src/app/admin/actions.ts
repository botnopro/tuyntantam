"use server";

import { refresh } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/guard";
import { PASSWORD_MIN } from "@/lib/auth/password";
import { destroySession } from "@/lib/auth/session";
import type { SettingsMap } from "@/lib/content/types";
import { clientIp } from "@/lib/security/request";
import { uuidSchema } from "@/lib/validation/common";
import { leadUpdateSchema } from "@/lib/validation/lead";
import { postInputSchema } from "@/lib/validation/post";
import { propertyInputSchema } from "@/lib/validation/property";
import { siteSettingsSchema } from "@/lib/validation/settings";
import { pageInputSchema, serviceInputSchema, updatePage, updateService } from "@/server/admin/content";
import { createPost, deletePost, updatePost } from "@/server/admin/posts";
import { createProperty, deleteProperty, updateProperty } from "@/server/admin/properties";
import { changePassword, createUser, deleteUser, login } from "@/server/admin/users";
import { deleteLead, updateLead } from "@/server/leads";
import { saveSettings } from "@/server/settings";

export type ActionState = { ok?: boolean; message?: string; errors?: Record<string, string> };

function issuesToErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) out[i.path.map(String).join(".") || "form"] ??= i.message;
  return out;
}

const json = (v: FormDataEntryValue | null) => {
  try {
    return v ? JSON.parse(String(v)) : undefined;
  } catch {
    return undefined;
  }
};
const str = (fd: FormData, k: string) => (fd.get(k) == null ? undefined : String(fd.get(k)));
const lines = (v?: string) =>
  (v ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

/* ---------- Auth ---------- */

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const h = await headers();
  const result = await login(str(fd, "email") ?? "", str(fd, "password") ?? "", clientIp(h), h.get("user-agent"));
  if (!result.ok) return { ok: false, message: result.message };
  const next = str(fd, "next");
  redirect(next && /^\/admin(\/[a-z0-9/-]*)?$/.test(next) ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/dang-nhap");
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireRole("EDITOR");
  const parsed = z
    .object({
      current: z.string().min(1, "Nhập mật khẩu hiện tại"),
      next: z.string().min(PASSWORD_MIN, `Mật khẩu mới tối thiểu ${PASSWORD_MIN} ký tự`).max(200),
      confirm: z.string(),
    })
    .refine((d) => d.next === d.confirm, { message: "Xác nhận mật khẩu không khớp", path: ["confirm"] })
    .safeParse({ current: str(fd, "current"), next: str(fd, "next"), confirm: str(fd, "confirm") });
  if (!parsed.success) return { ok: false, errors: issuesToErrors(parsed.error.issues) };
  const r = await changePassword(user.id, parsed.data.current, parsed.data.next, (await headers()).get("user-agent"));
  return r.ok ? { ok: true, message: "Đã đổi mật khẩu. Các phiên đăng nhập khác đã bị đăng xuất." } : { ok: false, message: r.message };
}

export async function createUserAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = z
    .object({
      email: z.email("Email không hợp lệ"),
      name: z.string().trim().min(2, "Nhập tên").max(100),
      password: z.string().min(PASSWORD_MIN, `Mật khẩu tối thiểu ${PASSWORD_MIN} ký tự`).max(200),
      role: z.enum(["ADMIN", "EDITOR"]),
    })
    .safeParse({ email: str(fd, "email"), name: str(fd, "name"), password: str(fd, "password"), role: str(fd, "role") });
  if (!parsed.success) return { ok: false, errors: issuesToErrors(parsed.error.issues) };
  const r = await createUser(parsed.data);
  if (r.ok) refresh();
  return r.ok ? { ok: true, message: "Đã tạo tài khoản" } : { ok: false, message: r.message };
}

export async function deleteUserAction(fd: FormData) {
  const actor = await requireRole("ADMIN");
  const id = uuidSchema.parse(str(fd, "id"));
  await deleteUser(id, actor.id);
  redirect("/admin/tai-khoan");
}

/* ---------- Bất động sản ---------- */

function propertyFromForm(fd: FormData) {
  return {
    title: str(fd, "title"),
    slug: str(fd, "slug") || undefined,
    status: str(fd, "status"),
    listingType: str(fd, "listingType"),
    propertyType: str(fd, "propertyType"),
    price: str(fd, "priceM") ? Number(str(fd, "priceM")) * 1e6 : null,
    priceNote: str(fd, "priceNote"),
    area: str(fd, "area"),
    bedrooms: str(fd, "bedrooms"),
    bathrooms: str(fd, "bathrooms"),
    floors: str(fd, "floors"),
    direction: str(fd, "direction"),
    furnishing: str(fd, "furnishing"),
    address: str(fd, "address"),
    ward: str(fd, "ward"),
    district: str(fd, "district"),
    city: str(fd, "city") || "Hà Nội",
    summary: str(fd, "summary"),
    descriptionHtml: str(fd, "descriptionHtml"),
    amenities: lines(str(fd, "amenities")),
    images: json(fd.get("images")) ?? [],
    videoYoutubeId: str(fd, "videoYoutubeId"),
    virtualTourUrl: str(fd, "virtualTourUrl"),
    featured: fd.get("featured") === "on",
    seoTitle: str(fd, "seoTitle"),
    seoDescription: str(fd, "seoDescription"),
  };
}

export async function savePropertyAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const id = str(fd, "id");
  const parsed = propertyInputSchema.safeParse(propertyFromForm(fd));
  if (!parsed.success)
    return { ok: false, message: "Vui lòng kiểm tra các trường được đánh dấu", errors: issuesToErrors(parsed.error.issues) };
  // Form không còn ô toạ độ (bản đồ hiển thị theo địa chỉ) → khi sửa, giữ nguyên lat/lng đã có
  const { lat: _lat, lng: _lng, ...changes } = parsed.data;
  const row = id ? await updateProperty(uuidSchema.parse(id), changes) : await createProperty(parsed.data);
  if (!row) return { ok: false, message: "Không tìm thấy bất động sản" };
  if (!id) redirect(`/admin/bat-dong-san/${row.id}?da-luu=1`);
  return { ok: true, message: "Đã lưu" };
}

export async function deletePropertyAction(fd: FormData) {
  await requireRole("ADMIN");
  await deleteProperty(uuidSchema.parse(str(fd, "id")));
  redirect("/admin/bat-dong-san");
}

/* ---------- Bài viết ---------- */

export async function savePostAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const id = str(fd, "id");
  const cover = (json(fd.get("coverJson")) as { src?: string; alt?: string | null }[] | undefined)?.[0];
  const parsed = postInputSchema.safeParse({
    title: str(fd, "title"),
    slug: str(fd, "slug") || undefined,
    excerpt: str(fd, "excerpt"),
    contentHtml: str(fd, "contentHtml") ?? "",
    coverImage: cover?.src ? { src: cover.src, alt: cover.alt || null } : null,
    tags: lines(str(fd, "tags")),
    categorySlugs: fd.getAll("categories").map(String),
    authorName: str(fd, "authorName"),
    status: str(fd, "status"),
    featured: fd.get("featured") === "on",
    seoTitle: str(fd, "seoTitle"),
    seoDescription: str(fd, "seoDescription"),
    publishedAt: str(fd, "publishedAt") || undefined,
  });
  if (!parsed.success)
    return { ok: false, message: "Vui lòng kiểm tra các trường được đánh dấu", errors: issuesToErrors(parsed.error.issues) };
  const row = id ? await updatePost(uuidSchema.parse(id), parsed.data) : await createPost(parsed.data);
  if (!row) return { ok: false, message: "Không tìm thấy bài viết" };
  if (!id) redirect(`/admin/tin-tuc/${row.id}?da-luu=1`);
  return { ok: true, message: "Đã lưu" };
}

export async function deletePostAction(fd: FormData) {
  await requireRole("ADMIN");
  await deletePost(uuidSchema.parse(str(fd, "id")));
  redirect("/admin/tin-tuc");
}

/* ---------- Khách liên hệ ---------- */

export async function updateLeadAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await requireRole("EDITOR");
  const parsed = leadUpdateSchema.safeParse({ status: str(fd, "status"), adminNote: str(fd, "adminNote") ?? null });
  if (!parsed.success) return { ok: false, errors: issuesToErrors(parsed.error.issues) };
  const row = await updateLead(uuidSchema.parse(str(fd, "id")), parsed.data, user.id);
  refresh();
  return row ? { ok: true, message: "Đã cập nhật" } : { ok: false, message: "Không tìm thấy" };
}

/** Đổi nhanh trạng thái từ danh sách. */
export async function quickLeadStatusAction(fd: FormData) {
  const user = await requireRole("EDITOR");
  const status = leadUpdateSchema.shape.status.parse(str(fd, "status"));
  await updateLead(uuidSchema.parse(str(fd, "id")), { status }, user.id);
  refresh();
}

export async function deleteLeadAction(fd: FormData) {
  await requireRole("ADMIN");
  await deleteLead(uuidSchema.parse(str(fd, "id")));
  redirect("/admin/khach-lien-he");
}

/* ---------- Trang, dịch vụ, cấu hình ---------- */

export async function savePageAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = pageInputSchema.safeParse({
    title: str(fd, "title"),
    contentHtml: str(fd, "contentHtml") ?? "",
    seoTitle: str(fd, "seoTitle"),
    seoDescription: str(fd, "seoDescription"),
  });
  if (!parsed.success) return { ok: false, errors: issuesToErrors(parsed.error.issues) };
  const row = await updatePage(uuidSchema.parse(str(fd, "id")), parsed.data);
  return row ? { ok: true, message: "Đã lưu trang" } : { ok: false, message: "Không tìm thấy trang" };
}

export async function saveServiceAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = serviceInputSchema.safeParse({
    title: str(fd, "title"),
    summary: str(fd, "summary"),
    contentHtml: str(fd, "contentHtml") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: issuesToErrors(parsed.error.issues) };
  const row = await updateService(uuidSchema.parse(str(fd, "id")), parsed.data);
  return row ? { ok: true, message: "Đã lưu dịch vụ" } : { ok: false, message: "Không tìm thấy dịch vụ" };
}

export async function saveSiteSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = siteSettingsSchema.safeParse(json(fd.get("settings")));
  if (!parsed.success)
    return { ok: false, message: "Vui lòng kiểm tra các trường được đánh dấu", errors: issuesToErrors(parsed.error.issues) };
  await saveSettings("site", parsed.data as SettingsMap["site"]);
  return { ok: true, message: "Đã lưu cấu hình" };
}
