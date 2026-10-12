// KV access shared by the Pages Functions (read) and the sync Worker (write).
import config from "../public/config.js";
import { sampleData } from "./sample-data.js";
import { shortId } from "../public/assets/lib.js";

export const KEYS = {
  listings: "listings:v1",
  reviews: "reviews:v1",
  token: "ebay:token",
  status: "sync:status",
};

// Live data if the sync has written any. Otherwise sample mode, or (on the live
// site) an empty list that points people to the eBay shop.
export async function getListings(env) {
  const live = env.TT_KV ? await env.TT_KV.get(KEYS.listings, "json") : null;
  if (live && Array.isArray(live.items)) return live;
  if (config.showSampleListings || env.SHOW_SAMPLES) return sampleData();
  return { source: "empty", updatedAt: null, seller: null, items: [] };
}

export async function getReviews(env) {
  const live = env.TT_KV ? await env.TT_KV.get(KEYS.reviews, "json") : null;
  if (live && Array.isArray(live.reviews)) return live;
  return { source: "config", ...config.fallbackReviews };
}

export function findItem(data, id) {
  return data.items.find((i) => shortId(i.itemId) === String(id)) || null;
}

// Up to n items from the same site category, newest first.
export function similar(data, item, n = 4) {
  return data.items
    .filter((i) => i.siteCategory === item.siteCategory && i.itemId !== item.itemId)
    .sort((a, b) => new Date(b.itemCreationDate) - new Date(a.itemCreationDate))
    .slice(0, n);
}
