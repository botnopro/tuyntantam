import Image from "next/image";
import type { SiteSettings } from "@/lib/content/types";
import { cn } from "@/lib/utils/cn";

/** Logo theo chế độ: nền sáng dùng logo chính, nền tối dùng logo chữ trắng (logoFooter của site gốc). */
export function SiteLogo({ site, className, priority }: { site: SiteSettings; className?: string; priority?: boolean }) {
  const dark = site.logoFooter;
  return (
    <>
      <Image
        src={site.logo.src}
        alt={site.name}
        width={1920}
        height={384}
        priority={priority}
        sizes="200px"
        className={cn("w-auto", className, dark && "dark:hidden")}
      />
      {dark ? (
        <Image
          src={dark.src}
          alt={site.name}
          width={350}
          height={70}
          loading={priority ? "eager" : undefined}
          sizes="200px"
          className={cn("hidden w-auto dark:block", className)}
        />
      ) : null}
    </>
  );
}
