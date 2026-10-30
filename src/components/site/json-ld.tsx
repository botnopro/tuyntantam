import type { AgentSettings, SiteSettings } from "@/lib/content/types";
import type { Post, Property } from "@/lib/db/schema";
import { propertyTypeLabel } from "@/lib/content/property-options";
import { absoluteUrl } from "@/lib/seo/url";

/** Nhúng JSON-LD an toàn: escape "<" để không thể đóng thẻ script. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationJsonLd(site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: site.name,
        url: absoluteUrl("/"),
        logo: absoluteUrl(site.logo.src),
        email: site.contacts.primaryEmail,
        telephone: site.contacts.phoneE164,
        sameAs: site.socials.map((s) => s.url),
        ...(site.contacts.area ? { areaServed: site.contacts.area } : {}),
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: absoluteUrl("/"),
        name: site.name,
        description: site.description,
        inLanguage: "vi-VN",
        publisher: { "@id": absoluteUrl("/#organization") },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/blog?q={search_term_string}") },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function personJsonLd(agent: AgentSettings, site: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.alias,
    alternateName: agent.name,
    description: agent.shortBio,
    url: absoluteUrl("/gioi-thieu"),
    image: agent.portrait ? absoluteUrl(agent.portrait.src) : undefined,
    telephone: site.contacts.phoneE164,
    email: site.contacts.primaryEmail,
    areaServed: "Hà Nội",
    sameAs: site.socials.map((s) => s.url),
  };
}

export function articleJsonLd(
  post: Pick<Post, "title" | "slug" | "excerpt" | "coverImage" | "publishedAt" | "updatedAt" | "authorName">,
  site: SiteSettings,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.coverImage ? [absoluteUrl(post.coverImage.src)] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName ?? site.name, url: absoluteUrl("/gioi-thieu") },
    publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: absoluteUrl(site.logo.src) } },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    inLanguage: "vi-VN",
  };
}

export function listingJsonLd(p: Property) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.summary ?? undefined,
    url: absoluteUrl(`/kho-nguon/${p.slug}`),
    image: p.images.map((i) => absoluteUrl(i.src)),
    datePosted: p.publishedAt?.toISOString(),
    ...(p.price
      ? {
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "VND",
            availability: "https://schema.org/InStock",
            ...(p.listingType === "RENT"
              ? { priceSpecification: { "@type": "UnitPriceSpecification", price: p.price, priceCurrency: "VND", unitText: "MONTH" } }
              : {}),
          },
        }
      : {}),
    about: {
      "@type": p.propertyType === "nha-rieng" || p.propertyType === "nha-pho" || p.propertyType === "biet-thu" ? "House" : "Apartment",
      name: propertyTypeLabel(p.propertyType),
      ...(p.area ? { floorSize: { "@type": "QuantitativeValue", value: p.area, unitCode: "MTK" } } : {}),
      ...(p.bedrooms != null ? { numberOfBedrooms: p.bedrooms } : {}),
      ...(p.bathrooms != null ? { numberOfBathroomsTotal: p.bathrooms } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress: p.address ?? undefined,
        addressLocality: p.district ?? undefined,
        addressRegion: p.city,
        addressCountry: "VN",
      },
      ...(p.lat != null && p.lng != null ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.href) })),
  };
}
