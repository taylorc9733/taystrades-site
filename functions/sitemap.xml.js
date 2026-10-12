// Built from KV on each request, so it changes whenever the hourly sync does.
import { getListings } from "../shared/store.js";
import { itemPath, siteUrl } from "../public/assets/lib.js";

export async function onRequestGet({ env }) {
  const data = await getListings(env);
  const today = new Date().toISOString().slice(0, 10);
  const pages = ["/", "/shop", "/trade-in", "/reviews", "/contact", "/privacy"].map(
    (p) => `<url><loc>${siteUrl(p)}</loc><lastmod>${today}</lastmod></url>`
  );
  const items = data.source === "sample" ? [] : data.items.map(
    (i) => `<url><loc>${siteUrl(itemPath(i)).replace(/&/g, "&amp;")}</loc><lastmod>${String(i.itemCreationDate).slice(0, 10)}</lastmod></url>`
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...pages, ...items].join("\n")}\n</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" } });
}
