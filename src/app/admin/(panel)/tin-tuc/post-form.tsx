"use client";

import { useActionState } from "react";
import { savePostAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, Card, Field, fieldProps, inputCls, SubmitButton } from "@/components/admin/form-ui";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichEditor } from "@/components/admin/rich-editor";
import type { Post } from "@/lib/db/schema";

type Cat = { slug: string; name: string; parentSlug: string | null };

export function PostForm({
  post,
  categories,
  defaultAuthor,
}: {
  post?: Post & { categorySlugs: string[] };
  categories: Cat[];
  defaultAuthor: string;
}) {
  const [state, action] = useActionState(savePostAction, {} as ActionState);
  const e = state.errors;
  const fp = (n: string) => fieldProps(n, e);
  const toLocal = (d?: Date | null) => (d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-3">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <Field label="Tiêu đề *" name="title" error={e?.title}>
            <input
              {...fp("title")}
              defaultValue={post?.title}
              required
              maxLength={200}
              className={inputCls + " text-[17px] font-semibold"}
            />
          </Field>
          <div className="mt-4">
            <Field label="Trích đoạn" name="excerpt" error={e?.excerpt} hint="Hiện trên thẻ bài viết và mô tả SEO mặc định">
              <textarea {...fp("excerpt")} rows={3} maxLength={400} defaultValue={post?.excerpt ?? ""} className={inputCls} />
            </Field>
          </div>
        </Card>
        <div>
          <p className="mb-1 text-[13px] font-semibold">Nội dung</p>
          <RichEditor name="contentHtml" initial={post?.contentHtml ?? ""} minHeight={480} />
          {e?.contentHtml ? <p className="mt-1 text-[12px] text-error">{e.contentHtml}</p> : null}
        </div>
      </div>

      <div className="space-y-6">
        <Card title="Xuất bản">
          <div className="space-y-4">
            <Field label="Trạng thái" name="status" error={e?.status}>
              <select {...fp("status")} defaultValue={post?.status ?? "draft"} className={inputCls}>
                <option value="draft">Bản nháp</option>
                <option value="published">Đăng</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </Field>
            <Field label="Ngày đăng" name="publishedAt" error={e?.publishedAt} hint="Để trống = thời điểm đăng">
              <input {...fp("publishedAt")} type="datetime-local" defaultValue={toLocal(post?.publishedAt)} className={inputCls} />
            </Field>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="checkbox" name="featured" defaultChecked={post?.featured} className="size-4 accent-brand-strong" />
              Bài nổi bật
            </label>
            <ActionMessage state={state} />
            <SubmitButton className="w-full" />
          </div>
        </Card>
        <Card title="Ảnh bìa">
          <ImageUploader name="coverJson" multiple={false} initial={post?.coverImage ? [post.coverImage] : []} />
        </Card>
        <Card title="Phân loại">
          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold">Chuyên mục</legend>
            <ul className="space-y-1.5">
              {categories.map((c) => (
                <li key={c.slug} className={c.parentSlug ? "pl-5" : ""}>
                  <label className="flex items-center gap-2 text-[14px]">
                    <input
                      type="checkbox"
                      name="categories"
                      value={c.slug}
                      defaultChecked={post?.categorySlugs.includes(c.slug)}
                      className="size-4 accent-brand-strong"
                    />
                    {c.name}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <div className="mt-4">
            <Field label="Thẻ (tags)" name="tags" error={e?.tags} hint="Phân tách bằng dấu phẩy">
              <input {...fp("tags")} defaultValue={post?.tags.join(", ")} className={inputCls} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Tác giả" name="authorName" error={e?.authorName}>
              <input {...fp("authorName")} defaultValue={post?.authorName ?? defaultAuthor} className={inputCls} />
            </Field>
          </div>
        </Card>
        <Card title="SEO">
          <div className="space-y-4">
            <Field label="Đường dẫn (slug)" name="slug" error={e?.slug} hint="Để trống để tự tạo">
              <input {...fp("slug")} defaultValue={post?.slug} maxLength={140} className={inputCls} />
            </Field>
            <Field label="Tiêu đề SEO" name="seoTitle" error={e?.seoTitle}>
              <input {...fp("seoTitle")} defaultValue={post?.seoTitle ?? ""} maxLength={70} className={inputCls} />
            </Field>
            <Field label="Mô tả SEO" name="seoDescription" error={e?.seoDescription}>
              <textarea {...fp("seoDescription")} rows={3} defaultValue={post?.seoDescription ?? ""} maxLength={170} className={inputCls} />
            </Field>
          </div>
        </Card>
      </div>
    </form>
  );
}
