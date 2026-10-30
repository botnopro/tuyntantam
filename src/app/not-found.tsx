import Link from "@/components/ui/link";

export const metadata = { title: "Không tìm thấy trang" };

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center bg-surface-warm px-5 py-24 text-center">
      <div>
        <p className="font-display text-[88px] leading-none font-bold text-primary-container">404</p>
        <h1 className="mt-4 text-headline-lg-mobile lg:text-headline-lg">Không tìm thấy trang</h1>
        <p className="mx-auto mt-3 max-w-md text-body-md text-on-surface-variant">
          Đường dẫn có thể đã thay đổi hoặc trang không còn tồn tại.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Về trang chủ
          </Link>
          <Link href="/blog" className="btn-ghost">
            Đọc blog
          </Link>
        </div>
      </div>
    </main>
  );
}
