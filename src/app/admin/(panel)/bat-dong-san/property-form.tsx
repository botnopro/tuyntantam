"use client";

import { useActionState } from "react";
import { savePropertyAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, Card, Field, fieldProps, inputCls, SubmitButton } from "@/components/admin/form-ui";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichEditor } from "@/components/admin/rich-editor";
import { FURNISHING, PROPERTY_TYPES } from "@/lib/content/property-options";
import type { Property } from "@/lib/db/schema";

export function PropertyForm({ property }: { property?: Property }) {
  const [state, action] = useActionState(savePropertyAction, {} as ActionState);
  const e = state.errors;
  const p = property;
  const fp = (name: string) => fieldProps(name, e);

  return (
    <form action={action} className="space-y-6">
      {p ? <input type="hidden" name="id" value={p.id} /> : null}
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-card/95 p-3 backdrop-blur">
        <ActionMessage state={state} />
        <div className="ml-auto flex items-center gap-2">
          <select {...fp("status")} defaultValue={p?.status ?? "draft"} aria-label="Trạng thái" className={inputCls + " w-auto"}>
            <option value="draft">Bản nháp</option>
            <option value="published">Hiển thị</option>
            <option value="archived">Lưu trữ</option>
          </select>
          <SubmitButton />
        </div>
      </div>

      <Card title="Thông tin chính">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiêu đề *" name="title" error={e?.title} className="sm:col-span-2">
            <input {...fp("title")} defaultValue={p?.title} required maxLength={200} className={inputCls} />
          </Field>
          <Field label="Đường dẫn (slug)" name="slug" error={e?.slug} hint="Để trống để tự tạo từ tiêu đề">
            <input {...fp("slug")} defaultValue={p?.slug} maxLength={140} className={inputCls} />
          </Field>
          <Field label="Hình thức *" name="listingType" error={e?.listingType}>
            <select {...fp("listingType")} defaultValue={p?.listingType ?? "RENT"} className={inputCls}>
              <option value="RENT">Cho thuê</option>
              <option value="SALE">Bán</option>
            </select>
          </Field>
          <Field label="Loại hình *" name="propertyType" error={e?.propertyType}>
            <select {...fp("propertyType")} defaultValue={p?.propertyType ?? "can-ho"} className={inputCls}>
              {Object.entries(PROPERTY_TYPES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Giá (triệu đồng)" name="priceM" error={e?.price} hint="Thuê: giá/tháng · Bán: tổng giá. Để trống = thoả thuận">
            <input
              {...fp("priceM")}
              type="number"
              min={0}
              step="any"
              defaultValue={p?.price != null ? p.price / 1e6 : ""}
              className={inputCls}
            />
          </Field>
          <Field label="Ghi chú giá" name="priceNote" error={e?.priceNote} hint='Ví dụ: "Thoả thuận", "Chưa gồm phí dịch vụ"'>
            <input {...fp("priceNote")} defaultValue={p?.priceNote ?? ""} maxLength={100} className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" name="featured" defaultChecked={p?.featured} className="size-4 accent-brand-strong" />
            Tin nổi bật
          </label>
        </div>
      </Card>

      <Card title="Thông số">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Diện tích (m²)" name="area" error={e?.area}>
            <input {...fp("area")} type="number" min={0} step="any" defaultValue={p?.area ?? ""} className={inputCls} />
          </Field>
          <Field label="Phòng ngủ" name="bedrooms" error={e?.bedrooms}>
            <input {...fp("bedrooms")} type="number" min={0} defaultValue={p?.bedrooms ?? ""} className={inputCls} />
          </Field>
          <Field label="Phòng tắm" name="bathrooms" error={e?.bathrooms}>
            <input {...fp("bathrooms")} type="number" min={0} defaultValue={p?.bathrooms ?? ""} className={inputCls} />
          </Field>
          <Field label="Số tầng" name="floors" error={e?.floors}>
            <input {...fp("floors")} type="number" min={0} defaultValue={p?.floors ?? ""} className={inputCls} />
          </Field>
          <Field label="Hướng" name="direction" error={e?.direction}>
            <input {...fp("direction")} defaultValue={p?.direction ?? ""} maxLength={50} className={inputCls} />
          </Field>
          <Field label="Nội thất" name="furnishing" error={e?.furnishing}>
            <select {...fp("furnishing")} defaultValue={p?.furnishing ?? ""} className={inputCls}>
              <option value="">—</option>
              {Object.entries(FURNISHING).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Tiện ích"
            name="amenities"
            error={e?.amenities}
            hint="Mỗi dòng (hoặc dấu phẩy) một tiện ích"
            className="sm:col-span-3"
          >
            <textarea {...fp("amenities")} rows={3} defaultValue={p?.amenities.join("\n")} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Vị trí">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Địa chỉ"
            name="address"
            error={e?.address}
            hint="Bản đồ trên trang chi tiết hiển thị theo địa chỉ này"
            className="sm:col-span-3"
          >
            <input {...fp("address")} defaultValue={p?.address ?? ""} maxLength={250} className={inputCls} />
          </Field>
          <Field label="Phường/xã" name="ward" error={e?.ward}>
            <input {...fp("ward")} defaultValue={p?.ward ?? ""} maxLength={80} className={inputCls} />
          </Field>
          <Field label="Quận/huyện" name="district" error={e?.district} hint="Dùng cho bộ lọc & lưới khu vực">
            <input {...fp("district")} defaultValue={p?.district ?? ""} maxLength={80} className={inputCls} />
          </Field>
          <Field label="Tỉnh/thành" name="city" error={e?.city}>
            <input {...fp("city")} defaultValue={p?.city ?? "Hà Nội"} maxLength={80} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card title="Ảnh">
        <ImageUploader name="images" initial={p?.images ?? []} />
        {e?.images ? <p className="mt-2 text-[12px] text-error">{e.images}</p> : null}
      </Card>

      <Card title="Mô tả">
        <Field label="Tóm tắt (hiện trên thẻ danh sách)" name="summary" error={e?.summary}>
          <textarea {...fp("summary")} rows={2} maxLength={500} defaultValue={p?.summary ?? ""} className={inputCls} />
        </Field>
        <div className="mt-4">
          <p className="mb-1 text-[13px] font-semibold">Mô tả chi tiết</p>
          <RichEditor name="descriptionHtml" initial={p?.descriptionHtml ?? ""} minHeight={260} />
        </div>
      </Card>

      <Card title="Video & SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Video YouTube (link hoặc ID)" name="videoYoutubeId" error={e?.videoYoutubeId}>
            <input {...fp("videoYoutubeId")} defaultValue={p?.videoYoutubeId ?? ""} className={inputCls} />
          </Field>
          <Field label="Tour 360° (Matterport/Kuula)" name="virtualTourUrl" error={e?.virtualTourUrl}>
            <input {...fp("virtualTourUrl")} defaultValue={p?.virtualTourUrl ?? ""} className={inputCls} />
          </Field>
          <Field label="Tiêu đề SEO (≤ 70 ký tự)" name="seoTitle" error={e?.seoTitle}>
            <input {...fp("seoTitle")} defaultValue={p?.seoTitle ?? ""} maxLength={70} className={inputCls} />
          </Field>
          <Field label="Mô tả SEO (≤ 170 ký tự)" name="seoDescription" error={e?.seoDescription}>
            <input {...fp("seoDescription")} defaultValue={p?.seoDescription ?? ""} maxLength={170} className={inputCls} />
          </Field>
        </div>
      </Card>
    </form>
  );
}
