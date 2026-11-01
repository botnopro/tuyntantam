import "server-only";
import { env } from "@/lib/env";

const TIMEOUT_MS = 5000;

const escape = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/** Tin Telegram (parse_mode HTML): tiêu đề đậm, mỗi dòng "Nhãn: giá trị", bỏ dòng trống, link cuối. */
export function formatTelegramMessage(title: string, rows: [string, string | null | undefined][], link?: string): string {
  const lines = rows
    .filter((row): row is [string, string] => Boolean(row[1]?.trim()))
    .map(([k, v]) => `<b>${escape(k)}:</b> ${escape(v.trim())}`);
  const parts = [`🔔 <b>${escape(title)}</b>`, ...lines];
  if (link) parts.push(`\n<a href="${escape(link).replace(/"/g, "&quot;")}">Mở trong trang quản trị</a>`);
  // Giới hạn 4096 ký tự của Telegram
  return parts.join("\n").slice(0, 4000);
}

/** Gửi tin tới TELEGRAM_CHAT_ID nếu đã cấu hình; không cấu hình thì bỏ qua. Lỗi ném ra để nơi gọi ghi log. */
export async function sendTelegram(text: string): Promise<boolean> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = env();
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.info("[telegram] chưa cấu hình TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID — bỏ qua");
    return false;
  }
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    // Không ghi URL (chứa token) vào log
    const body = (await res.json().catch(() => null)) as { description?: string } | null;
    throw new Error(`Telegram ${res.status}: ${body?.description ?? res.statusText}`);
  }
  return true;
}
