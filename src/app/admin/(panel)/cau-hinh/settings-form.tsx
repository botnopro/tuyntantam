"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { saveSiteSettingsAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, Card, inputCls, SubmitButton } from "@/components/admin/form-ui";
import type { SiteSettings } from "@/lib/content/types";

const PLATFORMS = ["facebook", "youtube", "x", "zalo", "tiktok", "instagram", "telegram"] as const;

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [state, action] = useActionState(saveSiteSettingsAction, {} as ActionState);
  const [s, setS] = useState<SiteSettings>(initial);
  const e = state.errors ?? {};
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((p) => ({ ...p, [k]: v }));
  const setContact = (k: keyof SiteSettings["contacts"], v: string | string[] | null) =>
    setS((p) => ({ ...p, contacts: { ...p.contacts, [k]: v } }));
  const err = (path: string) => (e[path] ? <p className="mt-1 text-[12px] text-error">{e[path]}</p> : null);
  const input = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    path: string,
    opts: { hint?: string; type?: string } = {},
  ) => (
    <label className="block">
      <span className="mb-1 block text-[13px] font-semibold">{label}</span>
      <input
        value={value}
        type={opts.type ?? "text"}
        onChange={(ev) => onChange(ev.target.value)}
        aria-invalid={e[path] ? true : undefined}
        className={inputCls}
      />
      {opts.hint && !e[path] ? <span className="mt-1 block text-[12px] text-on-surface-variant">{opts.hint}</span> : null}
      {err(path)}
    </label>
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="settings" value={JSON.stringify(s)} />
      <Card title="Thương hiệu">
        <div className="grid gap-4 sm:grid-cols-2">
          {input("Tên website", s.name, (v) => set("name", v), "name")}
          {input("Khẩu hiệu", s.tagline, (v) => set("tagline", v), "tagline")}
          <div className="sm:col-span-2">{input("Mô tả", s.description, (v) => set("description", v), "description")}</div>
          {input("Dòng bản quyền", s.copyright, (v) => set("copyright", v), "copyright")}
        </div>
      </Card>

      <Card title="Liên hệ">
        <div className="grid gap-4 sm:grid-cols-2">
          {input("Số điện thoại (chỉ số)", s.contacts.phone, (v) => setContact("phone", v), "contacts.phone", {
            hint: "Ví dụ 0975373942 — dùng cho nút gọi",
          })}
          {input("Số điện thoại hiển thị", s.contacts.phoneDisplay, (v) => setContact("phoneDisplay", v), "contacts.phoneDisplay")}
          {input("Số quốc tế", s.contacts.phoneE164, (v) => setContact("phoneE164", v), "contacts.phoneE164", { hint: "+84…" })}
          {input("Email chính", s.contacts.primaryEmail, (v) => setContact("primaryEmail", v), "contacts.primaryEmail", { type: "email" })}
          {input(
            "Các email hiển thị (phân tách dấu phẩy)",
            s.contacts.emails.join(", "),
            (v) =>
              setContact(
                "emails",
                v
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean),
              ),
            "contacts.emails",
          )}
          {input("Link Zalo", s.contacts.zalo ?? "", (v) => setContact("zalo", v || null), "contacts.zalo", {
            hint: "https://zalo.me/… — để trống sẽ ẩn nút Zalo",
          })}
          {input("Địa chỉ", s.contacts.address ?? "", (v) => setContact("address", v || null), "contacts.address", {
            hint: "Để trống nếu không muốn công khai",
          })}
          {input("Khu vực hoạt động", s.contacts.area ?? "", (v) => setContact("area", v || null), "contacts.area")}
        </div>
      </Card>

      <Card title="Mạng xã hội">
        <ul className="space-y-3">
          {s.socials.map((so, i) => (
            <li key={i} className="grid gap-2 sm:grid-cols-[140px_1fr_160px_auto]">
              <select
                value={so.platform}
                onChange={(ev) =>
                  set(
                    "socials",
                    s.socials.map((x, k) => (k === i ? { ...x, platform: ev.target.value as (typeof PLATFORMS)[number] } : x)),
                  )
                }
                aria-label="Nền tảng"
                className={inputCls}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                value={so.url}
                onChange={(ev) =>
                  set(
                    "socials",
                    s.socials.map((x, k) => (k === i ? { ...x, url: ev.target.value } : x)),
                  )
                }
                placeholder="https://"
                aria-label="Đường dẫn"
                className={inputCls}
              />
              <input
                value={so.label}
                onChange={(ev) =>
                  set(
                    "socials",
                    s.socials.map((x, k) => (k === i ? { ...x, label: ev.target.value } : x)),
                  )
                }
                placeholder="Nhãn"
                aria-label="Nhãn"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() =>
                  set(
                    "socials",
                    s.socials.filter((_, k) => k !== i),
                  )
                }
                className="grid size-10 cursor-pointer place-items-center rounded-sm text-error hover:bg-error-container"
                aria-label="Xoá"
              >
                <Trash2 className="size-4" />
              </button>
              {err(`socials.${i}.url`)}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => set("socials", [...s.socials, { platform: "facebook", url: "", label: "" }])}
          className="mt-3 btn-ghost border border-border-subtle py-2"
        >
          <Plus className="size-4" aria-hidden /> Thêm mạng xã hội
        </button>
      </Card>

      <Card title="Cộng đồng & kho nguồn">
        <div className="grid gap-4 sm:grid-cols-2">
          {s.community ? (
            <>
              <div className="sm:col-span-2">
                {input(
                  "Lời mời tham gia cộng đồng",
                  s.community.text,
                  (v) => set("community", { ...s.community!, text: v }),
                  "community.text",
                )}
              </div>
              {input("Link nhóm cộng đồng", s.community.url, (v) => set("community", { ...s.community!, url: v }), "community.url")}
              {input(
                "Nhãn nút",
                s.community.buttonLabel,
                (v) => set("community", { ...s.community!, buttonLabel: v }),
                "community.buttonLabel",
              )}
            </>
          ) : null}
          {input(
            "Nhóm nguồn BĐS thuê",
            s.propertySources.rentGroupUrl ?? "",
            (v) => set("propertySources", { ...s.propertySources, rentGroupUrl: v || null }),
            "propertySources.rentGroupUrl",
          )}
          {input(
            "Nhóm nguồn BĐS bán",
            s.propertySources.saleGroupUrl ?? "",
            (v) => set("propertySources", { ...s.propertySources, saleGroupUrl: v || null }),
            "propertySources.saleGroupUrl",
          )}
        </div>
      </Card>

      <Card title="SEO trang chủ">
        <div className="grid gap-4">
          {input("Tiêu đề (≤ 70 ký tự)", s.seo.title, (v) => set("seo", { ...s.seo, title: v }), "seo.title")}
          {input("Mô tả (≤ 170 ký tự)", s.seo.description, (v) => set("seo", { ...s.seo, description: v }), "seo.description")}
        </div>
      </Card>

      <div className="sticky bottom-0 flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-card/95 p-3 backdrop-blur">
        <SubmitButton>Lưu cấu hình</SubmitButton>
        <ActionMessage state={state} />
      </div>
    </form>
  );
}
