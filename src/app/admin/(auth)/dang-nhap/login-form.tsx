"use client";

import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { ActionMessage, inputCls } from "@/components/admin/form-ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, {} as ActionState);
  return (
    <form action={action} className="mt-6 space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-[13px] font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-[13px] font-semibold">
          Mật khẩu
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className="btn-primary w-full">
        <LogIn className="size-4" aria-hidden />
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
