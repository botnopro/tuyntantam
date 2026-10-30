"use client";

import { useActionState } from "react";
import { updateLeadAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, inputCls, SubmitButton } from "@/components/admin/form-ui";

const STATUS = { NEW: "Mới", IN_PROGRESS: "Đang xử lý", DONE: "Đã xử lý", SPAM: "Spam" } as const;

export function LeadUpdateForm({ id, status, note }: { id: string; status: keyof typeof STATUS; note: string | null }) {
  const [state, action] = useActionState(updateLeadAction, {} as ActionState);
  return (
    <form action={action} className="space-y-4 rounded-lg border border-border-subtle bg-surface-card p-5">
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="status" className="mb-1 block text-[13px] font-semibold">
          Trạng thái
        </label>
        <select id="status" name="status" defaultValue={status} className={inputCls}>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="adminNote" className="mb-1 block text-[13px] font-semibold">
          Ghi chú nội bộ
        </label>
        <textarea id="adminNote" name="adminNote" defaultValue={note ?? ""} rows={5} maxLength={2000} className={inputCls} />
      </div>
      <ActionMessage state={state} />
      <SubmitButton className="w-full">Cập nhật</SubmitButton>
    </form>
  );
}
