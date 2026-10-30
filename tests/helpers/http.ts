export const ORIGIN = "http://localhost:3000";

export const ctx = <P extends Record<string, string>>(params: P = {} as P) => ({ params: Promise.resolve(params) });

export function jsonRequest(path: string, body: unknown, init: { method?: string; headers?: Record<string, string> } = {}) {
  return new Request(`${ORIGIN}${path}`, {
    method: init.method ?? "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, ...init.headers },
    body: JSON.stringify(body),
  });
}

export const getRequest = (path: string, headers: Record<string, string> = {}) => new Request(`${ORIGIN}${path}`, { headers });
