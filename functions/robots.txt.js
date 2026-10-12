import { siteUrl } from "../public/assets/lib.js";

export const onRequestGet = () =>
  new Response(`User-agent: *\nAllow: /\nSitemap: ${siteUrl("/sitemap.xml")}\n`, { headers: { "content-type": "text/plain" } });
