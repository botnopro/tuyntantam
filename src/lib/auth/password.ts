import "server-only";
import { hash, verify } from "@node-rs/argon2";

// argon2id, tham số theo khuyến nghị OWASP (m=19 MiB, t=2, p=1)
const OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

// Hash giả để thời gian phản hồi đồng đều khi email không tồn tại
let dummyHash: Promise<string> | undefined;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

export async function verifyPassword(hashed: string | null | undefined, plain: string): Promise<boolean> {
  if (!hashed) {
    dummyHash ??= hash("timing-equalizer-password", OPTIONS);
    await verify(await dummyHash, plain).catch(() => false);
    return false;
  }
  try {
    return await verify(hashed, plain);
  } catch {
    return false;
  }
}

export const PASSWORD_MIN = 10;
