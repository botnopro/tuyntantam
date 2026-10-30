import type { Metadata } from "next";
import { FavoritesList } from "@/components/property/saved-properties";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({ title: "Bất động sản yêu thích", path: "/yeu-thich", noindex: true });

export default function FavoritesPage() {
  return (
    <>
      <PageHero title="Bất động sản yêu thích" crumbs={[{ name: "Yêu thích", href: "/yeu-thich" }]} tone="plain" />
      <div className="container-page py-12">
        <FavoritesList />
      </div>
    </>
  );
}
