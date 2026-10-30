import { NextResponse, type NextRequest } from "next/server";

/**
 * Kiểm tra lạc quan (optimistic) cho /admin: không có cookie phiên → chuyển ngay tới trang đăng nhập.
 * Đây chỉ là lớp phụ; quyền thật luôn được kiểm tra ở server (layout, Server Action, API).
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === "/admin/dang-nhap") return NextResponse.next();
  const hasSession = req.cookies.has("__Host-tt_session") || req.cookies.has("tt_session");
  if (!hasSession) {
    const url = new URL("/admin/dang-nhap", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
