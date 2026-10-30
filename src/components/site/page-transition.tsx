/**
 * Hiệu ứng vào trang: nội dung trồi lên nhẹ (CSS .page-in trong globals.css).
 * Dùng trong template.tsx — template mount lại mỗi lần đổi trang nên animation chạy mỗi lần chuyển.
 * Chỉ là animation CSS, không chặn điều hướng.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
