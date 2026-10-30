export type NavItem = { label: string; href: string };

/** Menu chính — theo cấu trúc menu của tuyntantam.com (đổi đường dẫn sang route mới). */
export function mainNav(): NavItem[] {
  return [
    { label: "Giới thiệu", href: "/gioi-thieu" },
    { label: "Kho nguồn", href: "/kho-nguon" },
    { label: "Môi giới", href: "/moi-gioi" },
    { label: "Đầu tư", href: "/dau-tu" },
    { label: "Dịch vụ", href: "/dich-vu" },
    { label: "Blog", href: "/blog" },
    { label: "Liên hệ", href: "/lien-he" },
  ];
}

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
