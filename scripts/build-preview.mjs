// Builds a static, clickable sample-mode preview into ./preview (no Worker needed).
// Uses #/hash routes so it works from any static host. Run: node scripts/build-preview.mjs
import { readFileSync, writeFileSync, cpSync, rmSync, mkdirSync } from "node:fs";
import { sampleData, SAMPLE_REVIEWS } from "../shared/sample-data.js";
import config from "../public/config.js";

const root = new URL("../", import.meta.url);
const out = new URL("preview/", root);
rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const d of ["assets", "fonts", "sample"]) cpSync(new URL(`public/${d}`, root), new URL(d, out), { recursive: true });
for (const f of ["config.js", "favicon.svg"]) cpSync(new URL(`public/${f}`, root), new URL(f, out));

const data = sampleData();
for (const i of data.items) {
  i.image.imageUrl = i.image.imageUrl.slice(1);
  i.additionalImages.forEach((a) => (a.imageUrl = a.imageUrl.slice(1)));
}
const payload = { ...data, reviews: SAMPLE_REVIEWS };

const html = readFileSync(new URL("public/index.html", root), "utf8")
  .replace(/(href|src)="\/(?!\/)/g, '$1="')
  .replace("<title>Tays Trades</title>", "<title>Tays Trades preview</title>")
  .replace("<!--META-->", '<meta name="description" content="Sample-mode preview of the Tays Trades website.">\n<script>window.__TT_PREVIEW__ = true;</script>')
  .replace("<!--DATA-->", `<script id="tt-data" type="application/json">${JSON.stringify(payload).replace(/</g, "\\u003c")}</script>`);
writeFileSync(new URL("index.html", out), html);
console.log("preview built in ./preview");
