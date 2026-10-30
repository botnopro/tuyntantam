import { FloatingContact } from "@/components/site/floating-contact";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd, organizationJsonLd } from "@/components/site/json-ld";
import { getSettings } from "@/server/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSettings("site");
  const c = site.contacts;
  return (
    <>
      <Header />
      <main id="noi-dung" className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <FloatingContact phone={c.phone} phoneDisplay={c.phoneDisplay} zalo={c.zalo} email={c.primaryEmail} />
      <JsonLd data={organizationJsonLd(site)} />
    </>
  );
}
