// Serves every page route from the one index.html, with that route's title,
// description, Open Graph tags and schema baked in, plus the data the page
// needs so it renders without waiting on an API call.
import { getListings, getReviews, findItem } from "../shared/store.js";
import { metaFor, localBusinessSchema, productSchema, idFromPath, itemPath, siteUrl, esc } from "../public/assets/lib.js";

const PAGES = /^\/(shop|trade-in|reviews|contact|privacy|item\/[^/]+)?\/?$/;

export const trim = (i) => {
  const { aspects, conditionDescription, ...rest } = i;
  return rest;
};

// Every deploy gets a version made from the contents of the site's scripts and styles.
// Their URLs carry it (?v=...), so browsers and Cloudflare's cache can never serve an old copy.
const ASSET_FILES = ["/assets/app.css", "/assets/app.js", "/assets/lib.js", "/config.js"];
let versionPromise;
function assetVersion(env, url) {
  versionPromise ??= Promise.all(ASSET_FILES.map((f) => env.ASSETS.fetch(new Request(new URL(f, url))).then((r) => r.text())))
    .then((texts) => crypto.subtle.digest("SHA-1", new TextEncoder().encode(texts.join("\n"))))
    .then((buf) => [...new Uint8Array(buf)].slice(0, 5).map((b) => b.toString(16).padStart(2, "0")).join(""))
    .catch(() => {
      versionPromise = undefined;
      return String(Date.now());
    });
  return versionPromise;
}

export function versionAssets(shell, v) {
  const importmap = { imports: { "/assets/lib.js": `/assets/lib.js?v=${v}`, "/config.js": `/config.js?v=${v}` } };
  return shell
    .replace('href="/assets/app.css"', `href="/assets/app.css?v=${v}"`)
    .replace('<script type="module" src="/assets/app.js">', `<script type="importmap">${JSON.stringify(importmap)}</script>\n<script type="module" src="/assets/app.js?v=${v}">`);
}

export async function onRequest(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);
  if (request.method !== "GET" || !PAGES.test(url.pathname)) return next();

  const path = url.pathname.replace(/\/$/, "") || "/";
  const [data, reviews, rawShell, v] = await Promise.all([
    getListings(env),
    getReviews(env),
    env.ASSETS.fetch(new Request(new URL("/", url))).then((r) => r.text()),
    assetVersion(env, url),
  ]);
  const shell = versionAssets(rawShell, v);

  const payload = {
    source: data.source,
    updatedAt: data.updatedAt,
    seller: data.seller,
    items: data.items.map(trim),
    reviews,
  };
  const schemas = [localBusinessSchema(data.seller)];
  let meta;

  const id = idFromPath(path);
  if (path.startsWith("/item/")) {
    const item = id && findItem(data, id);
    if (item) {
      if (itemPath(item) !== path) return Response.redirect(new URL(itemPath(item), url), 301);
      payload.item = item;
      schemas.push(productSchema(item));
      meta = metaFor(path, { item });
    } else {
      const ended = (data.ended || []).find((e) => String(e.id) === String(id));
      payload.sold = ended || { id };
      meta = metaFor(path, {});
    }
  } else {
    meta = metaFor(path, { listings: data.items.length });
  }

  const canonical = siteUrl(path === "/" ? "/" : path);
  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}">`,
    `<meta name="robots" content="${meta.robots}">`,
    `<link rel="canonical" href="${esc(canonical)}">`,
    `<meta property="og:type" content="${payload.item ? "product" : "website"}">`,
    `<meta property="og:title" content="${esc(meta.title)}">`,
    `<meta property="og:description" content="${esc(meta.description)}">`,
    `<meta property="og:image" content="${esc(meta.image)}">`,
    `<meta property="og:url" content="${esc(canonical)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    ...schemas.map((s) => `<script type="application/ld+json">${json(s)}</script>`),
  ].join("\n");

  const html = shell
    .replace(/<title>.*?<\/title>/, "")
    .replace("<!--META-->", head)
    .replace("<!--DATA-->", `<script id="tt-data" type="application/json">${json(payload)}</script>`);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}

const json = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
