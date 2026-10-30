import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập" };

export default function LoginPage(props: PageProps<"/admin/dang-nhap">) {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface-warm px-5 py-12">
      <div className="w-full max-w-sm rounded-lg bg-surface-card p-8 shadow-float">
        <h1 className="text-[26px]">Đăng nhập quản trị</h1>
        <p className="mt-1 text-[14px] text-on-surface-variant">Tuyn Tận Tâm</p>
        <Suspense>
          <Guard searchParams={props.searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Guard({ searchParams }: Pick<PageProps<"/admin/dang-nhap">, "searchParams">) {
  if (await getSessionUser()) redirect("/admin");
  const next = (await searchParams).next;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}
