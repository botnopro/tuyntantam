// Chụp ảnh full-page để rà giao diện: node scripts/screenshots.mjs <outDir> [baseUrl] [path...]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [outDir = "screenshots", base = "http://localhost:3000", ...paths] = process.argv.slice(2);
const targets = paths.length ? paths : ["/", "/gioi-thieu", "/blog", "/kho-nguon"];
const viewports = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true },
];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
for (const vp of viewports) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.isMobile,
    deviceScaleFactor: 1,
    locale: "vi-VN",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const p of targets) {
    await page.goto(base + p, { waitUntil: "networkidle", timeout: 120_000 });
    // cuộn để nạp ảnh lazy
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(300);
    const file = join(outDir, `${vp.name}${p.replace(/[/?=&]+/g, "_") || "_home"}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${vp.name} ${p} → ${file}${overflow > 1 ? `  ⚠ tràn ngang ${overflow}px` : ""}`);
  }
  if (errors.length) console.log(`[${vp.name}] lỗi console:\n  ${errors.join("\n  ")}`);
  await ctx.close();
}
await browser.close();
