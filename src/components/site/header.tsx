import Link from "@/components/ui/link";
import { Suspense } from "react";
import { getSettings } from "@/server/settings";
import { MobileMenu } from "./mobile-menu";
import { NavLinks, NavList } from "./nav-links";
import { mainNav } from "./navigation";
import { SiteLogo } from "./site-logo";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const site = await getSettings("site");
  const items = mainNav();
  const { phone, phoneDisplay } = site.contacts;

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface-card/90 shadow-header backdrop-blur-xl">
      <a
        href="#noi-dung"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-surface-card focus:px-4 focus:py-2 focus:shadow-md"
      >
        Bỏ qua điều hướng
      </a>
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link href="/" className="shrink-0" aria-label={`${site.name} — Trang chủ`}>
          <SiteLogo site={site} priority className="h-9 sm:h-10" />
        </Link>
        <nav aria-label="Menu chính" className="flex items-center">
          <Suspense fallback={<NavList items={items} pathname={null} />}>
            <NavLinks items={items} />
          </Suspense>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Suspense fallback={<span className="size-11 xl:hidden" aria-hidden />}>
            <MobileMenu items={items} phone={phone} phoneDisplay={phoneDisplay} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
