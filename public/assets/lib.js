// Shared by the browser app and the Pages Functions: formatting, grades,
// message links and SEO. No DOM or Worker APIs in here.

import config from "../config.js";

const B = config.business;
export const DAY = 86400000;

export function money(price) {
  const n = Number(price?.value ?? price ?? 0);
  return n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Collection price: the listed item price, with none of what eBay adds at checkout
// (less a flat percentage on pricier items, see config.collection).
// The saving is eBay's Buyer Protection fee (config.buyerProtectionFee bands) plus postage.
export function buyerFee(price) {
  const f = config.buyerProtectionFee;
  if (!f) return 0;
  let fee = f.fixed || 0, from = 0;
  for (const [upTo, pct] of f.bands) {
    if (price > from) fee += (Math.min(price, upTo) - from) * pct / 100;
    from = upTo;
  }
  return Math.round(fee * 100) / 100;
}

export function collectPrice(item) {
  const price = Number(item?.price?.value ?? item?.price ?? 0);
  if (!price) return null;
  const fee = buyerFee(price);
  const postage = Number(item?.shippingCost?.value) || 0;
  const ebayTotal = Math.round((price + fee + postage) * 100) / 100;
  // From config.collection.flatFrom up, collection is also a flat percentage off the listed price.
  const c = config.collection || {};
  const pct = c.flatFrom && price >= c.flatFrom ? c.flatPercent : 0;
  // Those items show only the percentage as the saving; cheaper ones show eBay's fee plus postage.
  // Below config.collection.roundBelow the collection price is rounded down to a multiple of
  // roundTo (£5), or to the pound for items under £10 so cheap ones aren't halved.
  const step = price < 10 ? 1 : c.roundTo || 1;
  const collect = pct ? Math.round(price * (100 - pct)) / 100 : c.roundBelow && price < c.roundBelow ? Math.floor(price / step) * step : price;
  const saving = pct ? Math.round((price - collect) * 100) / 100 : Math.round((ebayTotal - collect) * 100) / 100;
  return { price: collect, listed: price, pct, fee, postage, ebayTotal, saving };
}

// "249.99" -> { pounds: "249", pence: "99" }
export function priceParts(price) {
  const [pounds, pence] = money(price).split(".");
  return { pounds, pence };
}

export function slugify(s) {
  return String(s)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");
}

// eBay itemIds look like "v1|123456789012|0". URLs use the middle part.
export function shortId(itemId) {
  const parts = String(itemId).split("|");
  return parts.length > 1 ? parts[1] : String(itemId);
}

export function itemPath(item) {
  return `/item/${shortId(item.itemId)}-${slugify(item.title)}`;
}

export function idFromPath(path) {
  const m = /^\/item\/(\d+)/.exec(path);
  return m ? m[1] : null;
}

export function gradeFor(item) {
  const id = Number(item.conditionId);
  let g = config.grades.find((x) => x.ebayIds.includes(id));
  if (!g && item.condition) {
    const c = item.condition.toLowerCase();
    g = config.grades.find((x) => c.startsWith(x.label.toLowerCase()))
      || (c.includes("part") || c.includes("not working") ? config.grades.find((x) => x.key === "faulty") : null)
      || (c.includes("refurb") ? config.grades.find((x) => x.key === "like-new") : null)
      || (c.startsWith("new") ? config.grades[0] : null);
  }
  return g || config.grades.find((x) => x.key === "good");
}

export function isJustListed(item, now = Date.now()) {
  return now - new Date(item.itemCreationDate).getTime() < 7 * DAY;
}

export function shippingText(item) {
  const s = item.shippingCost;
  if (!s || s.value == null) return "Postage shown on eBay";
  return Number(s.value) === 0 ? "Free UK postage" : `£${money(s)} UK postage`;
}

// Resize eBay-hosted images (s-l500, s-l1600, ...). Leaves other URLs alone.
export function img(url, size = 500) {
  if (!url) return "";
  return /i\.ebayimg\.com/.test(url) ? url.replace(/s-l\d+/, `s-l${size}`) : url;
}

export function allImages(item) {
  const list = [item.image, ...(item.additionalImages || [])].filter(Boolean).map((i) => i.imageUrl);
  return [...new Set(list)];
}

// ----- Pre-made messages -----

const wa = (text) => `https://wa.me/${B.whatsapp}?text=${encodeURIComponent(text)}`;
const mail = (subject, body) =>
  `mailto:${B.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const msg = {
  general: () => wa(`Hi ${B.name}, I found you on your website and have a question:`),
  generalMail: () => mail(`Question from your website`, `Hi ${B.name}, I found you on your website and have a question:\n\n`),
  product: (item) => wa(`Hi, is this still available? ${item.title} (£${money(item.price)}) ${item.itemWebUrl}`),
  productMail: (item) =>
    mail(`Is this still available? ${item.title}`, `Hi, is this still available? ${item.title} (£${money(item.price)}) ${item.itemWebUrl}\n\n`),
  offer: (item) =>
    wa(`Hi, I'm interested in ${item.title} (£${money(item.price)}) ${item.itemWebUrl}. Would you consider an offer or a trade-in against it? I have:`),
  offerMail: (item) =>
    mail(
      `Offer or trade-in: ${item.title}`,
      `Hi, I'm interested in ${item.title} (£${money(item.price)}) ${item.itemWebUrl}. Would you consider an offer or a trade-in against it? I have:\n\n`
    ),
  collect: (item, c) =>
    wa(`Hi, I'd like to collect ${item.title} from ${B.town} at the collection price of £${money(c.price)}. ${siteUrl(itemPath(item))} When could I pick it up?`),
  collectMail: (item, c) =>
    mail(
      `Collection: ${item.title}`,
      `Hi, I'd like to collect ${item.title} from ${B.town} at the collection price of £${money(c.price)}. ${siteUrl(itemPath(item))}\n\nWhen could I pick it up?\n\n`
    ),
  tradeIn: (a) => wa(tradeInText(a, "I'll send photos here.")),
  tradeInMail: (a) => mail(`Trade-in price: ${a.item}`, tradeInText(a, "I'll attach photos to this email.")),
};

export function tradeInText(a, closing) {
  const lines = [
    `Hi ${B.name}, I'd like a trade-in price.`,
    `Item: ${a.item}`,
    `Category: ${a.category}`,
    `Condition: ${a.condition}`,
    `Accessories: ${a.accessories || "None"}`,
    `Cash or swap: ${a.want}${a.want === "Swap" && a.swapFor ? ` (for ${a.swapFor})` : ""}`,
    `Best way to reach me: ${a.contact}`,
    closing,
  ];
  return lines.join("\n");
}

// ----- SEO -----

export function siteUrl(path = "/") {
  return `https://${B.domain}${path}`;
}

const absolute = (u) => (u && u.startsWith("/") ? siteUrl(u) : u);

export function localBusinessSchema(feedback) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": siteUrl("/#business"),
    name: B.googleName || B.name,
    alternateName: B.name,
    url: siteUrl("/"),
    telephone: `+${B.whatsapp}`,
    email: B.email,
    description: B.tagline,
    image: siteUrl("/og.png"),
    priceRange: "££",
    address: { "@type": "PostalAddress", addressLocality: B.town, addressRegion: B.county, addressCountry: "GB" },
    areaServed: (B.serviceArea || [`${B.town}, ${B.county}`]).map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: B.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => ({ Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday" })[d]),
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: [config.ebay.storeUrl, config.google.mapsUrl],
  };
}

const schemaCondition = (item) => {
  const k = gradeFor(item).key;
  if (k === "new") return "https://schema.org/NewCondition";
  if (k === "faulty") return "https://schema.org/DamagedCondition";
  if (/refurb/i.test(item.condition || "")) return "https://schema.org/RefurbishedCondition";
  return "https://schema.org/UsedCondition";
};

export function productSchema(item) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: item.title,
    sku: shortId(item.itemId),
    image: allImages(item).map((u) => absolute(img(u, 1600))),
    description: `${gradeFor(item).label}: ${gradeFor(item).explain}`,
    itemCondition: schemaCondition(item),
    offers: {
      "@type": "Offer",
      url: siteUrl(itemPath(item)),
      price: Number(item.price.value).toFixed(2),
      priceCurrency: item.price.currency || "GBP",
      availability: "https://schema.org/InStock",
      itemCondition: schemaCondition(item),
      seller: { "@id": siteUrl("/#business") },
      ...(item.shippingCost
        ? {
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: Number(item.shippingCost.value).toFixed(2), currency: "GBP" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "GB" },
            },
          }
        : {}),
    },
  };
}

// Title, description and image for a route. Used server-side and on client navigation.
export function metaFor(path, { item, sold, listings } = {}) {
  const where = `${B.town}`;
  const base = {
    title: `${B.name} | Pre-owned tech, games and collectables in ${where}`,
    description: `Buy pre-owned phones, consoles, games, audio and collectables from ${B.name} in ${where}, paid safely through eBay. Trade-ins on almost anything, for cash or a swap.`,
    image: siteUrl("/og.png"),
    robots: "index,follow",
  };
  if (path.startsWith("/item/")) {
    if (item) {
      const g = gradeFor(item);
      return {
        title: `${item.title} | £${money(item.price)} | ${B.name}`,
        description: `${g.label} condition, £${money(item.price)}. ${shippingText(item)}. Buy safely on eBay with buyer protection, or message ${B.name} in ${where} about an offer or trade-in.`,
        image: absolute(img(item.image?.imageUrl, 1600)),
        robots: "index,follow",
      };
    }
    return { ...base, title: `This one's sold | ${B.name}`, description: `This item has sold. See similar pre-owned items from ${B.name} in ${where}.`, robots: "noindex,follow" };
  }
  const map = {
    "/shop": [`Shop pre-owned tech, games and collectables | ${B.name}`, `${listings ?? "All"} items for sale from ${B.name} in ${where}. Every item is graded in plain English and sold through eBay with buyer protection.`],
    "/trade-in": [`Trade in your tech, games and collectables for cash or a swap | ${B.name}`, `Get a trade-in price from ${B.name} in ${where}. Tell us what you've got on WhatsApp and we'll reply with a cash or swap price.`],
    "/reviews": [`Reviews | ${B.name}`, `What customers say about ${B.name} on Google and eBay.`],
    "/contact": [`Contact | ${B.name}`, `Message ${B.name} on WhatsApp, email or call. ${B.hoursText}. ${B.town}, ${B.county}.`],
    "/privacy": [`Privacy | ${B.name}`, `How ${B.name} handles the details you send through this website.`],
  };
  const hit = map[path];
  return hit ? { ...base, title: hit[0], description: hit[1] } : base;
}

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
