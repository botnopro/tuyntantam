"use client";

import { useActionState } from "react";
import { savePageAction, saveServiceAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, Card, Field, fieldProps, inputCls, SubmitButton } from "@/components/admin/form-ui";
import { RichEditor } from "@/components/admin/rich-editor";

export function PageForm({
  page,
}: {
  page: { id: string; title: string; contentHtml: string; seoTitle: string | null; seoDescription: string | null };
}) {
  const [state, action] = useActionState(savePageAction, {} as ActionState);
  const e = state.errors;
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={page.id} />
      <Card>
        <Field label="Tiêu đề trang" name="title" error={e?.title}>
          <input {...fieldProps("title", e)} defaultValue={page.title} className={inputCls} />
        </Field>
        <p className="mt-3 text-[13px] text-on-surface-variant">
          Tiêu đề lớn và câu dẫn ở đầu trang lấy từ dòng “Tiêu đề 2” và đoạn văn đầu tiên trong nội dung.
        </p>
      </Card>
      <RichEditor name="contentHtml" initial={page.contentHtml} minHeight={480} />
      <Card title="SEO">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tiêu đề SEO" name="seoTitle" error={e?.seoTitle}>
            <input {...fieldProps("seoTitle", e)} defaultValue={page.seoTitle ?? ""} maxLength={70} className={inputCls} />
          </Field>
          <Field label="Mô tả SEO" name="seoDescription" error={e?.seoDescription}>
            <input {...fieldProps("seoDescription", e)} defaultValue={page.seoDescription ?? ""} maxLength={170} className={inputCls} />
          </Field>
        </div>
      </Card>
      <div className="flex items-center gap-3">
        <SubmitButton />
        <ActionMessage state={state} />
      </div>
    </form>
  );
}

export function ServiceForm({ service }: { service: { id: string; title: string; summary: string | null; contentHtml: string } }) {
  const [state, action] = useActionState(saveServiceAction, {} as ActionState);
  const e = state.errors;
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={service.id} />
      <Card>
        <div className="space-y-4">
          <Field label="Tên dịch vụ" name="title" error={e?.title}>
            <input {...fieldProps("title", e)} defaultValue={service.title} className={inputCls} />
          </Field>
          <Field label="Mô tả ngắn (trang Dịch vụ, đầu trang chi tiết)" name="summary" error={e?.summary}>
            <textarea {...fieldProps("summary", e)} rows={3} defaultValue={service.summary ?? ""} maxLength={600} className={inputCls} />
          </Field>
        </div>
      </Card>
      <RichEditor name="contentHtml" initial={service.contentHtml} minHeight={360} />
      <div className="flex items-center gap-3">
        <SubmitButton />
        <ActionMessage state={state} />
      </div>
    </form>
  );
}
