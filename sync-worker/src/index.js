// Taystrades sync Worker. Runs hourly on a Cron Trigger and refreshes the
// eBay listings (and, once a day, Google reviews) into the KV namespace the
// Pages site reads from. If eBay or Google fail, the last good data stays.
import config from "../../public/config.js";
import { KEYS } from "../../shared/store.js";
import { shortId } from "../../public/assets/lib.js";

const EBAY = "https://api.ebay.com";
const SCOPE = "https://api.ebay.com/oauth/api_scope";
const PAGE = 200; // Browse API maximum
const MAX_PAGES = 10; // per category, keeps us well inside the free plan's 50 subrequests
const DETAIL_BUDGET = 25; // item detail calls per run; the rest are picked up next hour
const DETAIL_MAX_AGE = 7 * 86400000;
const ENDED_KEEP = 90 * 86400000;

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(run(env));
  },

  // GET  /        shows the last sync status
  // POST /run     runs a sync now (Authorization: Bearer <SYNC_KEY>)
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/run") {
      if (!env.SYNC_KEY || request.headers.get("authorization") !== `Bearer ${env.SYNC_KEY}`) {
        return new Response("Set the SYNC_KEY secret and send it as a Bearer token.", { status: 401 });
      }
      return Response.json(await run(env));
    }
    return Response.json((await env.TT_KV.get(KEYS.status, "json")) || { message: "No sync has run yet." });
  },
};

export async function run(env) {
  const result = { at: new Date().toISOString() };

  if (!env.EBAY_CLIENT_ID || !env.EBAY_CLIENT_SECRET) {
    result.ebay = "skipped: no eBay secrets, the site is in sample mode";
    console.log(result.ebay);
  } else {
    try {
      result.ebay = await syncEbay(env);
    } catch (err) {
      result.ebay = `failed, kept last good data: ${err.message}`;
      console.error("eBay sync failed", err.stack || err);
    }
  }

  try {
    result.reviews = await syncReviews(env);
  } catch (err) {
    result.reviews = `failed, kept last good reviews: ${err.message}`;
    console.error("Google reviews sync failed", err.stack || err);
  }

  await env.TT_KV.put(KEYS.status, JSON.stringify(result));
  return result;
}

// ---------- eBay ----------

let memToken = null;

async function getToken(env) {
  const now = Date.now();
  const valid = (t) => t && t.expiresAt - 5 * 60000 > now;
  if (valid(memToken)) return memToken.token;
  const cached = await env.TT_KV.get(KEYS.token, "json");
  if (valid(cached)) return (memToken = cached).token;

  const res = await fetch(`${EBAY}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: SCOPE }),
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const body = await res.json();
  memToken = { token: body.access_token, expiresAt: now + body.expires_in * 1000 };
  // KV TTL must be at least 60s; the token itself lasts two hours.
  await env.TT_KV.put(KEYS.token, JSON.stringify(memToken), { expirationTtl: Math.max(60, body.expires_in - 300) });
  return memToken.token;
}

async function ebayGet(env, path) {
  const res = await fetch(`${EBAY}${path}`, {
    headers: {
      authorization: `Bearer ${await getToken(env)}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_GB",
      "accept-language": "en-GB",
    },
  });
  if (!res.ok) throw new Error(`GET ${path.split("?")[0]} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

function fromSummary(s, siteCategory) {
  return {
    itemId: s.itemId,
    title: s.title,
    price: { value: s.price?.value, currency: s.price?.currency || "GBP" },
    condition: s.condition,
    conditionId: Number(s.conditionId) || null,
    categories: s.categories || [],
    image: s.image || null,
    additionalImages: s.additionalImages || [],
    itemWebUrl: s.itemWebUrl,
    itemCreationDate: s.itemCreationDate,
    shippingCost: s.shippingOptions?.[0]?.shippingCost || null,
    siteCategory,
  };
}

async function syncEbay(env) {
  const seller = encodeURIComponent(`sellers:{${config.ebay.username}}`);
  const found = new Map();
  let sellerInfo = null;

  for (const cat of config.categories) {
    for (const catId of cat.ebayCategoryIds) {
      for (let page = 0, offset = 0; page < MAX_PAGES; page++, offset += PAGE) {
        const data = await ebayGet(
          env,
          `/buy/browse/v1/item_summary/search?category_ids=${catId}&filter=${seller}&limit=${PAGE}&offset=${offset}`
        );
        for (const s of data.itemSummaries || []) {
          if (!found.has(s.itemId)) found.set(s.itemId, fromSummary(s, cat.slug));
          if (!sellerInfo && s.seller) sellerInfo = { feedbackPercentage: s.seller.feedbackPercentage, feedbackScore: s.seller.feedbackScore };
        }
        if (!data.next || offset + PAGE >= (data.total || 0)) break;
      }
    }
  }

  const prev = await env.TT_KV.get(KEYS.listings, "json");
  const prevItems = new Map((prev?.items || []).map((i) => [i.itemId, i]));

  // An empty result when we had plenty last time is far more likely an eBay hiccup than a sell-out.
  if (found.size === 0 && prevItems.size > 3) throw new Error("eBay returned no listings; keeping the previous set");

  // Carry over detail fields we already have, then top up the stalest ones.
  const items = [...found.values()].map((i) => {
    const old = prevItems.get(i.itemId);
    if (!old?.detailFetchedAt) return i;
    return {
      ...i,
      additionalImages: old.additionalImages?.length > i.additionalImages.length ? old.additionalImages : i.additionalImages,
      aspects: old.aspects,
      conditionDescription: old.conditionDescription,
      shippingCost: i.shippingCost || old.shippingCost,
      detailFetchedAt: old.detailFetchedAt,
    };
  });

  const now = Date.now();
  const stale = items
    .filter((i) => !i.detailFetchedAt || now - i.detailFetchedAt > DETAIL_MAX_AGE)
    .sort((a, b) => (a.detailFetchedAt || 0) - (b.detailFetchedAt || 0))
    .slice(0, DETAIL_BUDGET);

  let details = 0;
  for (const item of stale) {
    try {
      const d = await ebayGet(env, `/buy/browse/v1/item/${encodeURIComponent(item.itemId)}`);
      item.additionalImages = d.additionalImages || item.additionalImages;
      if (d.image) item.image = d.image;
      item.aspects = (d.localizedAspects || []).map((a) => ({ name: a.name, value: a.value }));
      item.conditionDescription = d.conditionDescription || null;
      item.condition = d.condition || item.condition;
      item.conditionId = Number(d.conditionId) || item.conditionId;
      item.shippingCost = d.shippingOptions?.[0]?.shippingCost || item.shippingCost;
      item.detailFetchedAt = now;
      details++;
    } catch (err) {
      console.error(`detail for ${item.itemId} failed`, err.message);
    }
  }

  // Remember what ended, so its page can say "This one's sold" and show similar items.
  const ended = (prev?.ended || []).filter((e) => now - Date.parse(e.endedAt) < ENDED_KEEP && !found.has(e.itemId));
  for (const [id, old] of prevItems) {
    if (!found.has(id)) {
      ended.unshift({ id: shortId(id), itemId: id, title: old.title, siteCategory: old.siteCategory, image: old.image, endedAt: new Date(now).toISOString() });
    }
  }

  await env.TT_KV.put(
    KEYS.listings,
    JSON.stringify({
      source: "ebay",
      updatedAt: new Date(now).toISOString(),
      seller: sellerInfo || prev?.seller || { feedbackPercentage: config.ebay.fallbackFeedback.percentage, feedbackScore: config.ebay.fallbackFeedback.score },
      items,
      ended: ended.slice(0, 300),
    })
  );
  return `ok: ${items.length} listings, ${details} details refreshed, ${ended.length} recently ended`;
}

// ---------- Google reviews ----------

async function syncReviews(env) {
  if (!env.GOOGLE_PLACES_API_KEY || !env.GOOGLE_PLACE_ID) return "skipped: no Google key, using reviews from config";
  const prev = await env.TT_KV.get(KEYS.reviews, "json");
  if (prev?.fetchedAt && Date.now() - Date.parse(prev.fetchedAt) < 23 * 3600000) return "skipped: fetched within the last day";

  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(env.GOOGLE_PLACE_ID)}?languageCode=en-GB&regionCode=GB`, {
    headers: {
      "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
    },
  });
  if (!res.ok) throw new Error(`Places ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const p = await res.json();
  const data = {
    source: "google",
    fetchedAt: new Date().toISOString(),
    rating: p.rating,
    count: p.userRatingCount,
    mapsUri: p.googleMapsUri,
    reviews: (p.reviews || []).map((r) => ({
      author: r.authorAttribution?.displayName || "Google user",
      authorUri: r.authorAttribution?.uri || null,
      rating: r.rating,
      when: r.relativePublishTimeDescription,
      text: r.text?.text || r.originalText?.text || "",
    })),
  };
  await env.TT_KV.put(KEYS.reviews, JSON.stringify(data));
  return `ok: ${data.count} reviews, rating ${data.rating}`;
}
