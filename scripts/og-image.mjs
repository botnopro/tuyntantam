// Sinh ảnh chia sẻ mạng xã hội mặc định (1200×630) từ logo + chức danh thật trong data/agent.json.
// Chạy: node scripts/og-image.mjs → public/images/site/og-default.png
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const W = 1200;
const H = 630;
const INK = "#0f172a";
const BRAND = "#0068ff";

const agent = JSON.parse(await readFile("data/agent.json", "utf8"));
const escapeXml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const logo = await sharp("public/images/site/logo-tuyn-tan-tam.png").resize({ width: 900 }).toBuffer();
const { height: logoH } = await sharp(logo).metadata();

const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="0" y="${H - 24}" width="${W}" height="24" fill="${BRAND}"/>
  <text x="${W / 2}" y="470" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="44" font-weight="600" fill="${INK}">${escapeXml(agent.title)}</text>
</svg>`);

await sharp({ create: { width: W, height: H, channels: 4, background: "#ffffff" } })
  .composite([
    { input: logo, top: Math.round(330 - logoH - 10), left: Math.round((W - 900) / 2) },
    { input: text, top: 0, left: 0 },
  ])
  .png({ compressionLevel: 9 })
  .toFile("public/images/site/og-default.png");

console.log("✓ public/images/site/og-default.png");
