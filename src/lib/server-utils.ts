"use server";

import { headers } from "next/headers";

/**
 * Gets the user's IP address from the request headers.
 * It checks 'x-forwarded-for' (common for Vercel/proxies) and falls back.
 */
export async function getIpAddress(): Promise<string | null> {
  try {
    const headersList = await headers();

    const forwardedFor = headersList.get("x-forwarded-for");
    if (forwardedFor) {
      const ip = forwardedFor.split(",")[0];
      return ip ? ip.trim() : null;
    }

    const realIp = headersList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }

    return headersList.get("remote-addr") ?? null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.warn("Could not retrieve IP address:", error.message);
    } else {
      console.warn("Could not retrieve IP address:", String(error));
    }
    return null;
  }
}
