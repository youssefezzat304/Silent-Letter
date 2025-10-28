import { LRUCache } from "lru-cache";

// This cache will store IP addresses and their request timestamps
// max: 500 = store up to 500 unique IPs
// ttl: 20 * 60 * 1000 = 20 minutes. An IP's record is cleared after 20 mins of inactivity.
const cache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 20 * 60 * 1000,
});

/**
 * Checks if a given IP has exceeded the request limit within the specified window.
 * @param ip The user's IP address.
 * @param limit The number of allowed requests.
 * @param windowInSeconds The time window in seconds.
 * @returns { isLimited: boolean, error: string | null }
 */
export function checkRateLimit(
  ip: string | null,
  limit: number,
  windowInSeconds: number,
) {
  if (!ip) {
    return { isLimited: true, error: "Could not identify request origin." };
  }

  const now = Date.now();
  const windowStart = now - windowInSeconds * 1000;

  const timestamps = cache.get(ip) ?? [];

  const recentTimestamps = timestamps.filter((ts) => ts > windowStart);

  if (recentTimestamps.length >= limit) {
    return {
      isLimited: true,
      error: "Too many requests. Please try again later.",
    };
  }

  recentTimestamps.push(now);
  cache.set(ip, recentTimestamps);

  return { isLimited: false, error: null };
}
