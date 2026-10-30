"use client";

import Link from "@/components/ui/link";

// Không hiển thị chi tiết lỗi/stack cho người dùng; digest giúp tra log phía server
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid flex-1 place-items-center bg-surface-warm px-5 py-24 text-center">
      <div>
        <h1 className="text-headline-lg-mobile lg:text-headline-lg">Đã có lỗi xảy ra</h1>
        <p className="mx-auto mt-3 max-w-md text-body-md text-on-surface-variant">Trang chưa tải được. Vui lòng thử lại sau ít phút.</p>
        {error.digest ? <p className="mt-2 text-body-sm text-on-surface-variant">Mã lỗi: {error.digest}</p> : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Thử lại
          </button>
          <Link href="/" className="btn-ghost">
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
