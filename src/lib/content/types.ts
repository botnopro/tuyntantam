import type { ImageRef } from "@/lib/db/schema";

export type { ImageRef };

export type SocialLink = {
  platform: "facebook" | "x" | "youtube" | "telegram" | "zalo" | "tiktok" | "instagram";
  url: string;
  label: string;
};

/** site_settings["site"] — thông tin chung, admin sửa được */
export type SiteSettings = {
  name: string;
  tagline: string;
  description: string;
  logo: ImageRef;
  logoFooter: ImageRef | null;
  contacts: {
    phone: string;
    phoneDisplay: string;
    phoneE164: string;
    emails: string[];
    primaryEmail: string;
    zalo: string | null;
    address: string | null;
    area: string | null;
  };
  socials: SocialLink[];
  community: { text: string; url: string; buttonLabel: string } | null;
  propertySources: { rentGroupUrl: string | null; saleGroupUrl: string | null };
  footerDonate: { text: string; url: string; buttonImage: ImageRef | null } | null;
  copyright: string;
  seo: { title: string; description: string; ogImage: string | null };
};

export type Stat = { label: string; value: number; suffix: string; display: string };
export type Testimonial = { quote: string; name: string; role: string; avatar: ImageRef | null };
export type Partner = { name: string; logo: ImageRef };
export type HomeService = { title: string; text: string; icon: string };

/** site_settings["home"] — bố cục trang chủ */
export type HomeSettings = {
  hero: { heading: string; text: string; image: ImageRef | null; socialsLabel: string };
  about: { heading: string; html: string; stats: Stat[] };
  contact: { heading: string; submitLabel: string };
  services: { heading: string; items: HomeService[] };
  testimonials: { heading: string; items: Testimonial[] };
  posts: { heading: string };
  community: { heading: string; ctaLabel: string; url: string } | null;
  partners: { heading: string; items: Partner[] };
};

/** site_settings["agent"] — hồ sơ môi giới (trang Giới thiệu, author box) */
export type AgentSettings = {
  name: string;
  alias: string;
  title: string;
  shortBio: string;
  avatar: ImageRef | null;
  portrait: ImageRef | null;
  pageIntro: { heading: string; text: string };
  story: { heading: string; html: string }[];
};

/** site_settings["donate"] */
export type DonateSettings = {
  intro: string;
  buyMeACoffee: { url: string; image: ImageRef | null } | null;
  paypal: { url: string; image: ImageRef | null } | null;
  momo: { qrImage: ImageRef | null } | null;
  bank: { bankName: string; accountNumber: string; accountName: string; qrImage: ImageRef | null } | null;
};

export type SettingsMap = {
  site: SiteSettings;
  home: HomeSettings;
  agent: AgentSettings;
  donate: DonateSettings;
};
