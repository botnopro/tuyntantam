import { absoluteUrl } from "@/lib/seo/url";
import { getSettings } from "@/server/settings";

/** RFC 9116: kênh báo lỗ hổng bảo mật — email lấy từ cấu hình site (admin sửa được). */
export async function GET() {
  const site = await getSettings("site");
  const email = site.contacts.emails[0];
  if (!email) return new Response("Not found", { status: 404 });
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const body = [
    `Contact: mailto:${email}`,
    `Expires: ${expires}`,
    "Preferred-Languages: vi, en",
    `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
