"use client";

import { useActionState } from "react";
import { changePasswordAction, createUserAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, Card, Field, fieldProps, inputCls, SubmitButton } from "@/components/admin/form-ui";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, {} as ActionState);
  const e = state.errors;
  return (
    <Card title="Đổi mật khẩu">
      <form action={action} className="space-y-4">
        <Field label="Mật khẩu hiện tại" name="current" error={e?.current}>
          <input {...fieldProps("current", e)} type="password" autoComplete="current-password" className={inputCls} />
        </Field>
        <Field label="Mật khẩu mới (≥ 10 ký tự)" name="next" error={e?.next}>
          <input {...fieldProps("next", e)} type="password" autoComplete="new-password" className={inputCls} />
        </Field>
        <Field label="Nhập lại mật khẩu mới" name="confirm" error={e?.confirm}>
          <input {...fieldProps("confirm", e)} type="password" autoComplete="new-password" className={inputCls} />
        </Field>
        <ActionMessage state={state} />
        <SubmitButton>Đổi mật khẩu</SubmitButton>
      </form>
    </Card>
  );
}

export function CreateUserForm() {
  const [state, action] = useActionState(createUserAction, {} as ActionState);
  const e = state.errors;
  return (
    <Card title="Thêm tài khoản">
      <form action={action} className="space-y-4">
        <Field label="Email" name="email" error={e?.email}>
          <input {...fieldProps("email", e)} type="email" className={inputCls} />
        </Field>
        <Field label="Tên hiển thị" name="name" error={e?.name}>
          <input {...fieldProps("name", e)} className={inputCls} />
        </Field>
        <Field label="Mật khẩu tạm (≥ 10 ký tự)" name="password" error={e?.password}>
          <input {...fieldProps("password", e)} type="password" autoComplete="new-password" className={inputCls} />
        </Field>
        <Field label="Vai trò" name="role" error={e?.role}>
          <select {...fieldProps("role", e)} defaultValue="EDITOR" className={inputCls}>
            <option value="EDITOR">Biên tập viên (sửa nội dung, xem khách liên hệ)</option>
            <option value="ADMIN">Quản trị viên (toàn quyền)</option>
          </select>
        </Field>
        <ActionMessage state={state} />
        <SubmitButton>Tạo tài khoản</SubmitButton>
      </form>
    </Card>
  );
}
