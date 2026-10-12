// Runs the sync Worker against a fake eBay and an in-memory KV, then reads the
// result through the same code the Pages site uses. Run: node test/sync.test.mjs
import { run } from "../sync-worker/src/index.js";
import { getListings, findItem } from "../shared/store.js";
import config from "../public/config.js";

const kv = new Map();
const KV = {
  get: async (k, t) => (kv.has(k) ? (t === "json" ? JSON.parse(kv.get(k)) : kv.get(k)) : null),
  put: async (k, v) => void kv.set(k, v),
};
const env = { TT_KV: KV, EBAY_CLIENT_ID: "id", EBAY_CLIENT_SECRET: "secret" };

let listings = [
  { id: "111", title: "Nintendo Switch Lite Coral", price: "119.00", cat: "139971" },
  { id: "222", title: "iPhone 12 64GB Black", price: "189.00", cat: "9355" },
];
let calls = { token: 0, search: 0, item: 0 };
let failSearch = false;
const summary = (l) => ({
  itemId: `v1|${l.id}|0`, legacyItemId: l.id, title: l.title, price: { value: l.price, currency: "GBP" },
  condition: "Used", conditionId: "3000", categories: [{ categoryId: l.cat, categoryName: "x" }],
  image: { imageUrl: `https://i.ebayimg.com/images/g/${l.id}/s-l225.jpg` }, additionalImages: [],
  itemWebUrl: `https://www.ebay.co.uk/itm/${l.id}`, itemCreationDate: new Date().toISOString(),
  shippingOptions: [{ shippingCost: { value: "3.99", currency: "GBP" } }],
  seller: { username: config.ebay.username, feedbackPercentage: "99.8", feedbackScore: 540 },
});
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url.includes("/oauth2/token")) {
    calls.token++;
    if (!init.headers.authorization.startsWith("Basic ")) throw new Error("no basic auth");
    return Response.json({ access_token: "tok", expires_in: 7200 });
  }
  if (init.headers?.["X-EBAY-C-MARKETPLACE-ID"] !== "EBAY_GB") throw new Error("missing marketplace header");
  if (url.includes("/item_summary/search")) {
    calls.search++;
    if (failSearch) return new Response("boom", { status: 500 });
    const u = new URL(url);
    if (!u.searchParams.get("filter").includes(`sellers:{${config.ebay.username}}`)) throw new Error("no seller filter");
    // Only the console and phone categories return anything; mirrors eBay returning items in sub-categories.
    const cat = u.searchParams.get("category_ids");
    const map = { 1249: "139971", 15032: "9355" };
    const hits = listings.filter((l) => map[cat] === l.cat);
    return Response.json({ total: hits.length, itemSummaries: hits.map(summary) });
  }
  if (url.includes("/buy/browse/v1/item/")) {
    calls.item++;
    const id = decodeURIComponent(url.split("/item/")[1]).split("|")[1];
    const l = listings.find((x) => x.id === id);
    return Response.json({
      ...summary(l),
      additionalImages: [1, 2, 3].map((n) => ({ imageUrl: `https://i.ebayimg.com/images/g/${id}${n}/s-l225.jpg` })),
      localizedAspects: [{ name: "Brand", value: "Test" }],
      conditionDescription: "Tested and working.",
    });
  }
  throw new Error("unexpected fetch " + url);
};

const check = (c, m) => { console.log(c ? "PASS" : "FAIL", m); if (!c) process.exitCode = 1; };

// 0. No data yet: sample mode
check((await getListings({ TT_KV: KV })).source === "empty", "no KV data on the live site -> empty list pointing to eBay");
check((await getListings({ TT_KV: KV, SHOW_SAMPLES: "1" })).items.length === 12, "SHOW_SAMPLES -> 12 sample items");

// 1. Missing secrets: skipped, still sample
let r = await run({ TT_KV: KV });
check(/sample mode/.test(r.ebay), "no secrets -> sync skipped: " + r.ebay);

// 2. First live run
r = await run(env);
let data = await getListings(env);
check(data.source === "ebay" && data.items.length === 2, "first sync -> 2 live items: " + r.ebay);
check(findItem(data, "111").siteCategory === "consoles-games", "item mapped to site category");
check(findItem(data, "111").additionalImages.length === 3 && findItem(data, "111").aspects.length === 1, "detail call filled all images + specifics");
check(data.seller.feedbackScore === 540, "seller feedback captured");

// 3. New listing appears after next cron, sold one disappears
listings.push({ id: "333", title: "PS5 Slim Digital", price: "299.00", cat: "139971" });
listings = listings.filter((l) => l.id !== "222");
const tokensBefore = calls.token;
r = await run(env);
data = await getListings(env);
check(!!findItem(data, "333"), "new eBay listing appears after the cron runs: " + r.ebay);
check(!findItem(data, "222") && data.ended.some((e) => e.id === "222"), "sold item removed and remembered for its 'sold' page");
check(calls.token === tokensBefore, "token reused from cache, no second token call");
check(findItem(data, "111").aspects?.length === 1, "existing details carried over without refetching");

// 4. eBay down: keep last good data
failSearch = true;
r = await run(env);
data = await getListings(env);
check(/failed, kept last good data/.test(r.ebay) && data.items.length === 2, "eBay failure keeps the previous listings: " + r.ebay);

console.log("calls:", calls);
