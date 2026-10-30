/**
 * Cookie jar giả cho `next/headers` trong test. Test đặt cookie phiên bằng `setCookie`,
 * route handler đọc qua `cookies()` (được mock trong tests/setup/next-mocks.ts).
 */
type Cookie = { name: string; value: string };

const store = new Map<string, string>();

export const cookieJar = {
  get: (name: string): Cookie | undefined => (store.has(name) ? { name, value: store.get(name)! } : undefined),
  getAll: (): Cookie[] => [...store].map(([name, value]) => ({ name, value })),
  has: (name: string) => store.has(name),
  set: (name: string | Cookie, value?: string) => {
    if (typeof name === "string") store.set(name, value ?? "");
    else store.set(name.name, name.value);
  },
  delete: (name: string) => store.delete(name),
};

export const setCookie = (name: string, value: string) => store.set(name, value);
export const clearCookies = () => store.clear();
