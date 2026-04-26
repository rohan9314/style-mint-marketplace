import { kv } from "@vercel/kv";

export const STORE_KEYS = {
  styles: "stylemint:styles",
  earnings: "stylemint:earnings",
} as const;

export function isCloudStoreEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function cloudGet<T>(key: string): Promise<T | null> {
  if (!isCloudStoreEnabled()) {
    return null;
  }
  return (await kv.get<T>(key)) ?? null;
}

export async function cloudSet<T>(key: string, value: T): Promise<void> {
  if (!isCloudStoreEnabled()) {
    return;
  }
  await kv.set(key, value);
}
