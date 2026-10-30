import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

let client: Resend | null | undefined;

/** Gửi email qua Resend nếu đã cấu hình; không cấu hình thì chỉ ghi log. */
export async function sendMail(msg: { to: string; subject: string; html: string; replyTo?: string }): Promise<boolean> {
  const { RESEND_API_KEY, MAIL_FROM } = env();
  if (!RESEND_API_KEY || !MAIL_FROM) {
    console.info(`[mail] chưa cấu hình RESEND_API_KEY/MAIL_FROM — bỏ qua email "${msg.subject}"`);
    return false;
  }
  client ??= new Resend(RESEND_API_KEY);
  const { error } = await client.emails.send({ from: MAIL_FROM, ...msg });
  if (error) throw new Error(`Resend: ${error.message}`);
  return true;
}
