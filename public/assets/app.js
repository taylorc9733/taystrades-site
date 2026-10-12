// Taystrades front end. Plain ES modules, no framework.
import config from "../config.js";
import {
  money, priceParts, itemPath, idFromPath, gradeFor, isJustListed, shippingText, img, allImages,
  msg, metaFor, esc, DAY,
} from "./lib.js";

const B = config.business;
const PREVIEW = !!window.__TT_PREVIEW__; // the single-file preview uses #/hash routes
const app = document.getElementById("app");

// ---------- Data ----------

let DATA = readInline();
function readInline() {
  const el = document.getElementById("tt-data");
  try { return el ? JSON.parse(el.textContent) : window.__TT_DATA__ || null; } catch { return null; }
}
async function ensureData() {
  if (DATA) return;
  const [l, r] = await Promise.all([fetch("/api/listings").then((r) => r.json()), fetch("/api/reviews").then((r) => r.json())]);
  DATA = { ...l, reviews: r };
}
const items = () => DATA.items;
const newest = (list) => [...list].sort((a, b) => new Date(b.itemCreationDate) - new Date(a.itemCreationDate));
const catBySlug = (slug) => config.categories.find((c) => c.slug === slug);

async function getItem(id) {
  if (DATA.item && idFromPath(itemPath(DATA.item)) === id) return { item: DATA.item };
  if (DATA.sold && String(DATA.sold.id) === id) return { sold: DATA.sold };
  const local = items().find((i) => idFromPath(itemPath(i)) === id);
  if (PREVIEW || !local) return local ? { item: local } : { sold: { id } };
  try {
    const r = await fetch(`/api/item/${id}`).then((r) => r.json());
    return r.item ? { item: r.item } : { sold: r.sold || { id } };
  } catch {
    return { item: local };
  }
}

// ---------- Helpers ----------

const href = (path) => (PREVIEW ? `#${path}` : path);
const currentPath = () => (PREVIEW ? (location.hash.slice(1) || "/").split("?")[0] : location.pathname);
const currentQuery = () => new URLSearchParams(PREVIEW ? (location.hash.split("?")[1] || "") : location.search);

function track(name, props) {
  try { window.plausible?.(name, props ? { props } : undefined); } catch {}
}

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevL: '<path d="m15 6-6 6 6 6"/>',
  chevR: '<path d="m9 6 6 6-6 6"/>',
  chevD: '<path d="m6 9 6 6 6-6"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  swap: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>',
  call: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  ebay: '<path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 12h6"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-8 8"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  console: '<path d="M7 8h10a5 5 0 0 1 4.8 6.3l-.8 3a2.5 2.5 0 0 1-4.3 1L15 16H9l-1.7 2.3a2.5 2.5 0 0 1-4.3-1l-.8-3A5 5 0 0 1 7 8z"/><path d="M8 11v3M6.5 12.5h3"/><circle cx="15.5" cy="12" r=".6"/><circle cx="17.5" cy="13.5" r=".6"/>',
  headphones: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>',
  card: '<rect x="5" y="2.5" width="14" height="19" rx="2"/><circle cx="12" cy="10" r="3.5"/><path d="M8.5 16.5h7"/>',
  camera: '<path d="M4 7h3.5L9 5h6l1.5 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  laptop: '<rect x="5" y="5" width="14" height="10" rx="1.5"/><path d="M2.5 19h19"/>',
  brick: '<rect x="3" y="10" width="18" height="10" rx="1"/><rect x="5" y="6" width="5" height="4" rx="1"/><rect x="14" y="6" width="5" height="4" rx="1"/>',
  box: '<path d="m3 7 9-4 9 4v10l-9 4-9-4z"/><path d="m3 7 9 4 9-4M12 11v10"/>',
};
const icon = (name, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
const WA = '<svg class="icon fill wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.6-.3z"/></svg>';
const LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="rotate(-10 32 32)"><path d="M20 6h24l10 10v42H10V16z" fill="#FFC94D" stroke="#1C2B3A" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="17" r="5" fill="#F7F9FB" stroke="#1C2B3A" stroke-width="3.5"/></g></svg>';

function priceHTML(price) {
  const { pounds, pence } = priceParts(price);
  // Whole-pound prices read cleaner on a tag without ".00".
  return `<span class="price"><span class="cur">£</span>${pounds}${pence === "00" ? "" : `<span class="p">.${pence}</span>`}</span>`;
}

function tag(price, { size = "", tilt = -5, delay = 0, note = "", cls = "" } = {}) {
  const inner = note ? `<span class="tag-note">${esc(note)}</span>` : priceHTML(price);
  const label = note ? note : `£${money(price)}`;
  return `<span class="tag ${size ? `tag-${size}` : ""} ${note ? "tag-empty" : ""} ${cls}" style="--tilt:${tilt}deg;--delay:${delay}s" role="img" aria-label="${esc(label)}">
    <span class="tag-string"></span><span class="tag-body">${inner}</span></span>`;
}

function gradeBadge(item) {
  const g = gradeFor(item);
  const pips = Array.from({ length: 5 }, (_, i) => `<i class="${i < g.pips ? "" : "off"}"></i>`).join("");
  return `<span class="grade" title="${esc(g.explain)}"><span class="pips" aria-hidden="true">${pips}</span>${esc(g.label)}<span class="sr"> condition</span></span>`;
}

const trustLine = (short) =>
  `<p class="trust">${icon("shield")}<span>${short ? "Paid through eBay, with buyer protection" : "You pay through eBay, so you're covered by the eBay Money Back Guarantee."}</span></p>`;

const buyBtn = (item, extra = "") =>
  `<a class="btn btn-primary ${extra}" href="${esc(item.itemWebUrl)}" target="_blank" rel="noopener" data-track="Buy on eBay" data-item="${esc(item.title)}">Buy on eBay<span class="sr"> (opens in a new tab)</span></a>`;

const waBtn = (url, text, cls = "") => `<a class="btn ${cls}" href="${esc(url)}" target="_blank" rel="noopener" data-track="WhatsApp">${WA}${esc(text)}</a>`;

const tilts = [-6, 4, -3, 6, -7, 3, -4, 5];

function card(item, i = 0) {
  const path = itemPath(item);
  return `<article class="card">
    <a class="photo" href="${href(path)}" tabindex="-1" aria-hidden="true">
      <img src="${esc(img(item.image?.imageUrl, 500))}" alt="" loading="lazy" decoding="async" width="500" height="500">
      ${isJustListed(item) ? '<span class="new-mark">Just listed</span>' : ""}
      ${tag(item.price, { tilt: tilts[i % tilts.length] })}
    </a>
    <div class="body">
      <h3><a href="${href(path)}">${esc(item.title)}</a></h3>
      <div class="meta">${gradeBadge(item)}<span class="ship">${esc(shippingText(item))}</span></div>
      ${buyBtn(item, "btn-block")}
      ${trustLine(true)}
    </div>
  </article>`;
}

function stars(n) {
  const full = Math.round(n);
  return `<span class="stars" role="img" aria-label="${n} out of 5 stars">${Array.from({ length: 5 }, (_, i) => icon("star", i < full ? "fill" : "")).join("")}</span>`;
}

function quote(r) {
  const who = r.authorUri ? `<a href="${esc(r.authorUri)}" target="_blank" rel="noopener">${esc(r.author)}</a>` : esc(r.author);
  return `<figure class="quote">${stars(r.rating)}<blockquote>${esc(r.text)}</blockquote><footer><b>${who}</b>${r.when ? `, ${esc(r.when)}` : ""}</footer></figure>`;
}

// Null until the first eBay sync brings in real feedback numbers.
const feedback = () => (DATA.seller && DATA.seller.feedbackPercentage != null ? DATA.seller : null);
const feedbackUrl = () => `https://www.ebay.co.uk/fdbk/feedback_profile/${encodeURIComponent(config.ebay.username)}`;
const reviewsUrl = () => DATA.reviews?.mapsUri || config.google.mapsUrl;

// ---------- Shell ----------

const NAV = [["/shop", "Shop"], ["/trade-in", "Trade in"], ["/reviews", "Reviews"], ["/contact", "Contact"]];

function shell(path) {
  const cur = (p) => (path === p || (p === "/shop" && path.startsWith("/item/")) ? 'aria-current="page"' : "");
  return `
  <header class="topbar"><div class="wrap">
    <a class="logo" href="${href("/")}">${LOGO}${esc(B.name)}</a>
    <nav class="nav-desktop" aria-label="Main">${NAV.map(([p, t]) => `<a href="${href(p)}" ${cur(p)}>${t}</a>`).join("")}</nav>
    <form class="search-desktop searchbox" role="search" data-search>
      ${icon("search")}<label class="sr" for="q-top">Search items</label>
      <input id="q-top" type="search" name="q" placeholder="Search items" autocomplete="off">
    </form>
    <a class="icon-btn" href="${href("/shop?focus=1")}" aria-label="Search items">${icon("search")}</a>
    <button class="icon-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu aria-label="Menu">${icon("menu")}</button>
  </div></header>
  <nav class="menu" id="menu" hidden aria-label="Main">
    ${NAV.map(([p, t]) => `<a href="${href(p)}" ${cur(p)}>${t}</a>`).join("")}
    ${waBtn(msg.general(), "Message us on WhatsApp", "btn-block")}
  </nav>
  <main id="main" tabindex="-1"></main>
  ${footer()}
  <nav class="bottombar" aria-label="Quick actions">
    ${waBtn(msg.general(), "Message us")}
    <a class="btn btn-mint" href="${href("/trade-in")}">${icon("swap")}Trade in</a>
  </nav>
  <div class="lb" hidden role="dialog" aria-modal="true" aria-label="Photos"></div>`;
}

function footer() {
  return `<footer class="foot"><div class="wrap">
    <div class="cols">
      <div>
        <a class="logo" href="${href("/")}">${LOGO}${esc(B.name)}</a>
        <p style="margin-top:12px">${esc(B.tagline)}</p>
        <p style="margin-top:12px">${esc(B.town)}, ${esc(B.county)}</p>
      </div>
      <div><h2>Contact</h2><ul>
        <li><a href="${esc(msg.general())}" target="_blank" rel="noopener" data-track="WhatsApp">WhatsApp ${esc(B.phoneDisplay)}</a></li>
        <li><a href="${esc(msg.generalMail())}" data-track="Email">${esc(B.email)}</a></li>
        <li><a href="tel:+${B.whatsapp}">Call ${esc(B.phoneDisplay)}</a></li>
      </ul></div>
      <div><h2>Hours</h2><p>${esc(B.hoursText)}</p><p style="margin-top:8px">${esc(B.collection)}</p></div>
      <div><h2>Find us</h2><ul>
        <li><a href="${esc(config.ebay.storeUrl)}" target="_blank" rel="noopener">Our eBay shop</a></li>
        <li><a href="${esc(reviewsUrl())}" target="_blank" rel="noopener">Google reviews</a></li>
        <li><a href="${href("/privacy")}">Privacy</a></li>
      </ul></div>
    </div>
    <div class="small">
      <p>Prices and stock come from our live eBay listings.</p>
      ${DATA.source === "sample" ? "<p>Showing sample listings until the eBay shop is connected.</p>" : ""}
      <p>© ${new Date().getFullYear()} ${esc(B.name)}</p>
    </div>
  </div></footer>`;
}

// ---------- Pages ----------

function home() {
  const latest = newest(items());
  const hang = latest.slice(0, 4);
  // Positions for the hanging cluster: [left, top, width, photo rotation, z]
  const spots = innerWidth >= 900
    ? [["4%", "40px", "44%", -2, 2], ["50%", "8px", "40%", 2, 1], ["30%", "250px", "36%", 1, 3], ["66%", "238px", "30%", -3, 2]]
    : [["3%", "30px", "40%", -2, 2], ["40%", "4px", "34%", 2, 1], ["64%", "50px", "25%", -3, 3], ["50%", "126px", "27%", 1, 4]];
  const emptySpots = [["3%", "8px", "38%", -2, 1], ["53%", "22px", "36%", 2, 2], ["9%", "128px", "32%", 1, 3], ["57%", "142px", "32%", -2, 4]];
  const rev = DATA.reviews;
  const fb = feedback();
  return `
  <section class="hero"><div class="wrap">
    <div class="copy">
      <h1>Buy it, sell it, swap it. Pre-owned tech and more from ${esc(B.town)}.</h1>
      <p class="lede">Phones, consoles, games and collectables, graded honestly and sold through eBay. Got something to sell? We'll make you a cash or swap offer.</p>
      <div class="btn-row">
        <a class="btn btn-primary btn-lg" href="${href("/shop")}">Shop items</a>
        <a class="btn btn-mint btn-lg" href="${href("/trade-in")}">Get a trade-in price</a>
      </div>
    </div>
    <div class="rack" aria-label="${hang.length ? "Just listed" : "What we sell"}">
      ${hang.length ? "" : config.categories.slice(0, 4).map((c, i) => {
        const [x, y, w, r, z] = (innerWidth >= 900 ? spots : emptySpots)[i];
        return `<a class="hang" href="${esc(config.ebay.storeUrl)}" target="_blank" rel="noopener" style="--x:${x};--y:${y};--w:${w};--r:${r}deg;--z:${z}">
          <span class="photo cat-photo">${icon(c.icon)}${tag(null, { size: "md", note: c.name, tilt: tilts[i], delay: 0.15 + i * 0.12 })}</span></a>`;
      }).join("")}
      ${hang.map((it, i) => {
        const [x, y, w, r, z] = spots[i];
        return `<a class="hang" href="${href(itemPath(it))}" style="--x:${x};--y:${y};--w:${w};--r:${r}deg;--z:${z}">
          <span class="photo"><img src="${esc(img(it.image?.imageUrl, 500))}" alt="${esc(it.title)}" width="500" height="500" ${i < 2 ? 'fetchpriority="high"' : 'loading="lazy"'}>
          ${tag(it.price, { size: "md", tilt: tilts[i], delay: 0.15 + i * 0.12 })}</span></a>`;
      }).join("")}
    </div>
  </div></section>

  <section class="trustrow" aria-label="Why buy from us"><div class="wrap"><ul>
    <li>${icon("ebay")}<a href="${esc(feedbackUrl())}" target="_blank" rel="noopener">${fb
      ? `<b>${esc(fb.feedbackPercentage)}% positive</b><span class="muted">eBay feedback, ${Number(fb.feedbackScore).toLocaleString("en-GB")} ratings</span>`
      : `<b>eBay seller</b><span class="muted">See our eBay feedback</span>`}</a></li>
    <li>${icon("star")}<a href="${href("/reviews")}">${rev.count
      ? `<b>${rev.rating} on Google</b><span class="muted">from ${rev.count} reviews</span>`
      : `<b>Google reviews</b><span class="muted">Read or leave one</span>`}</a></li>
    <li>${icon("shield")}<span><b>Pay safely</b><span class="muted">through eBay with buyer protection</span></span></li>
    <li>${icon("swap")}<a href="${href("/trade-in")}"><b>Trade-ins</b><span class="muted">on almost anything</span></a></li>
  </ul></div></section>

  <section class="section"><div class="wrap">
    <div class="section-head"><h2>Just listed</h2>${items().length ? `<a class="textlink" href="${href("/shop")}">See all ${items().length} items</a>` : ""}</div>
    ${items().length ? `<div class="scroller">${latest.slice(0, 8).map(card).join("")}</div>` : onEbay()}
  </div></section>

  <section class="section" style="padding-top:0"><div class="wrap">
    <div class="section-head"><h2>Shop by category</h2></div>
    <div class="tiles">${config.categories.map((c) => {
      const n = items().filter((i) => i.siteCategory === c.slug).length;
      return `<a class="tile" href="${href(`/shop?cat=${c.slug}`)}">${icon(c.icon)}<b>${esc(c.name)}</b><span>${n ? `${n} item${n === 1 ? "" : "s"}` : items().length ? "Message us for stock" : "See what's in"}</span></a>`;
    }).join("")}</div>
  </div></section>

  <div class="band-outer"><section class="band"><div class="wrap">
    <div>
      <h2>Got something to sell or swap?</h2>
      <p>Phones, consoles, games, cards, cameras, Lego and plenty more. We'll give you a cash price, or a better one if you swap it against something we've got in.</p>
      <div class="btn-row"><a class="btn btn-primary btn-lg" href="${href("/trade-in")}">Get a trade-in price</a></div>
    </div>
    <div class="band-art" aria-hidden="true"><div class="your-item">Your item${tag(null, { note: "Your price here", tilt: 6 })}</div></div>
  </div></section></div>

  ${rev.reviews.length ? `<section class="section"><div class="wrap">
    <div class="section-head"><div><h2>What customers say</h2><p class="muted" style="margin-top:6px">${rev.rating} out of 5 from ${rev.count} Google reviews</p></div><a class="textlink" href="${href("/reviews")}">Read all reviews</a></div>
    <div class="quotes">${rev.reviews.slice(0, 3).map(quote).join("")}</div>
  </div></section>` : ""}

  <section class="section" style="padding-top:0"><div class="wrap steps-wrap">
    <div><h2>How buying works</h2><ol class="steps buy">
      <li><span><b>Find it here</b>Every item has real photos and a condition grade in plain English.</span></li>
      <li><span><b>Buy on eBay</b>Checkout happens on eBay, so you're covered by their Money Back Guarantee.</span></li>
      <li><span><b>Get it fast</b>Tracked UK postage, or collect from us in ${esc(B.town)}.</span></li>
    </ol></div>
    <div><h2>How trade-ins work</h2><ol class="steps trade">
      <li><span><b>Tell us what you've got</b>Fill in the short form, then send a few photos on WhatsApp.</span></li>
      <li><span><b>Get a price</b>We reply with a cash price and a swap price, usually within a couple of hours.</span></li>
      <li><span><b>Get paid</b>Drop it off, we collect, or post it free. Paid as soon as it's checked.</span></li>
    </ol></div>
  </div></section>`;
}

// ----- Shop -----

const PRICE_BANDS = [
  ["", "Any price", () => true],
  ["u50", "Under £50", (v) => v < 50],
  ["50-150", "£50 to £150", (v) => v >= 50 && v <= 150],
  ["150-300", "£150 to £300", (v) => v > 150 && v <= 300],
  ["o300", "Over £300", (v) => v > 300],
];
const SORTS = [["newest", "Newest first"], ["price-asc", "Price, low to high"], ["price-desc", "Price, high to low"]];
const norm = (s) => String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

function shopState() {
  const q = currentQuery();
  return {
    q: q.get("q") || "",
    cat: q.get("cat") || "",
    price: q.get("price") || "",
    cond: (q.get("cond") || "").split(",").filter(Boolean),
    sort: q.get("sort") || "newest",
  };
}

function filterItems(s) {
  const words = norm(s.q).split(/\s+/).filter(Boolean);
  const band = PRICE_BANDS.find((b) => b[0] === s.price) || PRICE_BANDS[0];
  let list = items().filter((i) => {
    if (s.cat && i.siteCategory !== s.cat) return false;
    if (!band[2](Number(i.price.value))) return false;
    if (s.cond.length && !s.cond.includes(gradeFor(i).key)) return false;
    const t = norm(i.title);
    return words.every((w) => t.includes(w));
  });
  if (s.sort === "price-asc") list.sort((a, b) => a.price.value - b.price.value);
  else if (s.sort === "price-desc") list.sort((a, b) => b.price.value - a.price.value);
  else list = newest(list);
  return list;
}

function shop() {
  const s = shopState();
  const grades = config.grades.filter((g) => items().some((i) => gradeFor(i).key === g.key));
  return `
  <div class="wrap shop-head"><h1>Shop items</h1>${DATA.source === "sample" ? `<p class="muted" style="margin-top:6px">These are sample listings. Live items from our eBay shop appear here once it's connected.</p>` : ""}</div>
  <div class="shop-tools"><div class="wrap">
    <div class="searchbox" role="search">${icon("search")}<label class="sr" for="q">Search items</label>
      <input id="q" type="search" placeholder="Search, e.g. iPhone or Pokémon" value="${esc(s.q)}" autocomplete="off" data-shop="q"></div>
    <button class="btn filter-btn" type="button" data-open-filters aria-controls="filters" aria-expanded="false">${icon("filter")}Filters</button>
    <div><label class="sr" for="sort">Sort by</label><select id="sort" data-shop="sort">${SORTS.map(([v, t]) => `<option value="${v}" ${s.sort === v ? "selected" : ""}>${t}</option>`).join("")}</select></div>
  </div></div>
  <div class="wrap shop-body">
    <form class="filters" id="filters" aria-label="Filters" onsubmit="return false">
      <div class="sheet-head"><h2 style="font-size:1.375rem">Filters</h2><button class="icon-btn" type="button" data-close-filters aria-label="Close filters">${icon("close")}</button></div>
      <fieldset><legend>Category</legend>
        ${[["", "All categories"], ...config.categories.map((c) => [c.slug, c.name])].map(([v, t]) => {
          const n = v ? items().filter((i) => i.siteCategory === v).length : items().length;
          return `<label class="check"><input type="radio" name="cat" value="${v}" ${s.cat === v ? "checked" : ""} data-shop="cat">${esc(t)}<span class="count">${n}</span></label>`;
        }).join("")}
      </fieldset>
      <fieldset><legend>Price</legend>
        ${PRICE_BANDS.map(([v, t]) => `<label class="check"><input type="radio" name="price" value="${v}" ${s.price === v ? "checked" : ""} data-shop="price">${t}</label>`).join("")}
      </fieldset>
      <fieldset><legend>Condition</legend>
        ${grades.map((g) => `<label class="check"><input type="checkbox" name="cond" value="${g.key}" ${s.cond.includes(g.key) ? "checked" : ""} data-shop="cond">${esc(g.label)}</label>`).join("")}
      </fieldset>
      <div class="sheet-foot"><button class="btn" type="button" data-clear>Clear filters</button><button class="btn btn-ink" type="button" data-close-filters data-show-count>Show items</button></div>
    </form>
    <div>
      <h2 class="sr">Items for sale</h2>
      <div class="result-line" aria-live="polite" data-results-line></div>
      <div class="rows" data-results style="margin-top:16px"></div>
    </div>
  </div>`;
}

// Shown while the live site has no synced listings yet.
function onEbay() {
  return `<div class="empty"><h2 style="font-size:1.375rem">Our latest listings are on eBay</h2>
    <p>They'll appear here automatically very soon. Until then, you can see everything we've got in our eBay shop.</p>
    <div class="btn-row"><a class="btn btn-primary" href="${esc(config.ebay.storeUrl)}" target="_blank" rel="noopener">See our items on eBay</a>${waBtn(msg.general(), "Message us on WhatsApp")}</div></div>`;
}

function renderResults() {
  if (!items().length) {
    document.querySelector("[data-results-line]").innerHTML = "";
    document.querySelector("[data-results]").innerHTML = onEbay();
    return;
  }
  const s = shopState();
  const list = filterItems(s);
  const chips = [];
  if (s.q) chips.push(["q", `“${s.q}”`]);
  if (s.cat) chips.push(["cat", catBySlug(s.cat)?.name || s.cat]);
  if (s.price) chips.push(["price", PRICE_BANDS.find((b) => b[0] === s.price)?.[1]]);
  s.cond.forEach((c) => chips.push([`cond:${c}`, config.grades.find((g) => g.key === c)?.label]));
  document.querySelector("[data-results-line]").innerHTML =
    `<span><b>${list.length}</b> item${list.length === 1 ? "" : "s"}</span>` +
    chips.map(([k, t]) => `<button class="chip" type="button" data-unset="${esc(k)}">${esc(t)}${icon("close")}<span class="sr">Remove filter</span></button>`).join("");
  const showBtn = document.querySelector("[data-show-count]");
  if (showBtn) showBtn.textContent = list.length ? `Show ${list.length} item${list.length === 1 ? "" : "s"}` : "No matches yet";
  document.querySelector("[data-results]").innerHTML = list.length
    ? list.map(card).join("")
    : `<div class="empty"><h2 style="font-size:1.375rem">Nothing matches that yet</h2>
        <p>Try fewer words or clear the filters. If you're after something specific, message us. New stock goes on most days and we can keep an eye out for you.</p>
        <div class="btn-row"><button class="btn" type="button" data-clear>Clear filters</button>${waBtn(msg.general(), "Message us on WhatsApp")}</div></div>`;
}

function setShopParam(key, value) {
  const q = currentQuery();
  if (value === "" || value == null || (Array.isArray(value) && !value.length)) q.delete(key);
  else q.set(key, Array.isArray(value) ? value.join(",") : value);
  q.delete("focus");
  const qs = q.toString();
  const url = PREVIEW ? `#/shop${qs ? `?${qs}` : ""}` : `/shop${qs ? `?${qs}` : ""}`;
  history.replaceState(null, "", url);
  renderResults();
}

function bindShop() {
  const root = document.getElementById("main");
  const filters = root.querySelector("#filters");
  const openBtn = root.querySelector("[data-open-filters]");
  let scrim;
  const close = () => {
    filters.classList.remove("open");
    openBtn.setAttribute("aria-expanded", "false");
    scrim?.remove();
    scrim = null;
    if (matchMedia("(max-width: 899px)").matches) openBtn.focus();
  };
  openBtn.addEventListener("click", () => {
    filters.classList.add("open");
    openBtn.setAttribute("aria-expanded", "true");
    scrim = document.createElement("div");
    scrim.className = "scrim";
    scrim.addEventListener("click", close);
    document.body.append(scrim);
    filters.querySelector("input")?.focus();
  });
  filters.addEventListener("keydown", (e) => e.key === "Escape" && close());
  root.querySelectorAll("[data-close-filters]").forEach((b) => b.addEventListener("click", close));

  root.addEventListener("input", (e) => {
    const k = e.target.dataset.shop;
    if (!k) return;
    if (k === "cond") setShopParam("cond", [...root.querySelectorAll('[data-shop="cond"]:checked')].map((x) => x.value));
    else setShopParam(k, e.target.value);
  });
  root.addEventListener("click", (e) => {
    const unset = e.target.closest("[data-unset]");
    if (unset) {
      const k = unset.dataset.unset;
      if (k.startsWith("cond:")) {
        const v = k.slice(5);
        root.querySelector(`[data-shop="cond"][value="${v}"]`).checked = false;
        setShopParam("cond", shopState().cond.filter((c) => c !== v));
      } else {
        if (k === "q") root.querySelector("#q").value = "";
        else root.querySelector(`[data-shop="${k}"][value=""]`).checked = true;
        setShopParam(k, "");
      }
    }
    if (e.target.closest("[data-clear]")) {
      history.replaceState(null, "", href("/shop"));
      root.querySelector("#q").value = "";
      root.querySelectorAll('[data-shop="cat"][value=""], [data-shop="price"][value=""]').forEach((x) => (x.checked = true));
      root.querySelectorAll('[data-shop="cond"]').forEach((x) => (x.checked = false));
      renderResults();
    }
  });
  renderResults();
  if (currentQuery().get("focus")) root.querySelector("#q").focus();
}

// ----- Product -----

function productPage(item) {
  const g = gradeFor(item);
  const imgs = allImages(item);
  const cat = catBySlug(item.siteCategory);
  const more = newest(items().filter((i) => i.siteCategory === item.siteCategory && i.itemId !== item.itemId)).slice(0, 4);
  const specs = (item.aspects || []).slice(0, 14);
  return `
  <div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${href("/shop")}">Shop</a><span aria-hidden="true">/</span>${cat ? `<a href="${href(`/shop?cat=${cat.slug}`)}">${esc(cat.name)}</a>` : ""}</nav>
    <div class="product">
      <div class="p-title"><h1>${esc(item.title)}</h1></div>
      <div class="gallery">
        <button class="photo main" type="button" data-open-lb="0"><span class="sr">Open photo 1 of ${imgs.length} full screen: </span>
          <img src="${esc(img(imgs[0], 1600))}" alt="${esc(item.title)}" width="800" height="800" fetchpriority="high">
          ${isJustListed(item) ? '<span class="new-mark">Just listed</span>' : ""}
          ${tag(item.price, { size: "lg", tilt: -5 })}
        </button>
        ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((u, i) => `<button type="button" data-open-lb="${i}" aria-label="Open photo ${i + 1} of ${imgs.length}"><img src="${esc(img(u, 140))}" alt="" loading="lazy" width="68" height="68"></button>`).join("")}</div>` : ""}
        <p class="hint">${imgs.length} photo${imgs.length === 1 ? "" : "s"}. Tap one to zoom in.</p>
      </div>
      <div class="buy">
        <div class="price-line">${priceHTML(item.price)}<span class="muted">${esc(shippingText(item))}</span></div>
        <div>${gradeBadge(item)}</div>
        <div class="actions">
          ${buyBtn(item, "btn-lg btn-block")}
          ${trustLine(false)}
          <div class="two">
            ${waBtn(msg.product(item), "Ask a question")}
            <a class="btn btn-mint" href="${esc(msg.offer(item))}" target="_blank" rel="noopener" data-track="WhatsApp" data-kind="offer">${icon("swap")}Offer or trade against this</a>
          </div>
          <p class="muted">Prefer email? <a href="${esc(msg.productMail(item))}" data-track="Email">Ask by email</a> or <a href="${esc(msg.offerMail(item))}" data-track="Email">make an offer by email</a>.</p>
        </div>
        <div class="condition">
          <h2 style="font-size:1.25rem">Condition: ${esc(g.label.toLowerCase())}</h2>
          <p>${esc(g.explain)}</p>
          ${item.conditionDescription ? `<p><b>Our notes:</b> ${esc(item.conditionDescription)}</p>` : ""}
        </div>
        ${specs.length ? `<div class="detail-block"><h2>Item details</h2><dl class="specs">${specs.map((a) => `<dt>${esc(a.name)}</dt><dd>${esc(a.value)}</dd>`).join("")}</dl></div>` : ""}
        <div class="detail-block"><h2>Postage and collection</h2><p>${esc(shippingText(item))}, sent tracked. ${esc(B.collection)} Full postage options are on the eBay listing.</p></div>
      </div>
    </div>
  </div>
  ${more.length ? `<section class="section" style="padding-top:24px"><div class="wrap"><div class="section-head"><h2>You might also like</h2>${cat ? `<a class="textlink" href="${href(`/shop?cat=${cat.slug}`)}">All ${esc(cat.name.toLowerCase())}</a>` : ""}</div><div class="scroller">${more.map(card).join("")}</div></div></section>` : ""}`;
}

function soldPage(sold) {
  const pool = sold.siteCategory ? items().filter((i) => i.siteCategory === sold.siteCategory) : [];
  const more = newest(pool.length ? pool : items()).slice(0, 4);
  return `
  <div class="wrap">
    <div class="sold">
      <div class="sold-art" aria-hidden="true">${tag(null, { note: "Sold", tilt: -6, cls: "tag-sold" })}</div>
      <div>
        <h1 style="font-size:2.25rem">This one's sold</h1>
        <p style="margin-top:10px;font-size:1.125rem">${sold.title ? `${esc(sold.title)} has found a new home.` : "That item has found a new home."} Here are similar things still for sale. If you were after that exact item, message us and we'll keep an eye out for another.</p>
        <div class="btn-row" style="margin-top:18px"><a class="btn btn-primary" href="${href(sold.siteCategory ? `/shop?cat=${sold.siteCategory}` : "/shop")}">See similar items</a>${waBtn(msg.general(), "Message us on WhatsApp")}</div>
      </div>
    </div>
  </div>
  <section class="section" style="padding-top:32px"><div class="wrap"><div class="section-head"><h2>Still available</h2></div><div class="scroller">${more.map(card).join("")}</div></div></section>`;
}

// ----- Lightbox -----

function openLightbox(item, start) {
  const imgs = allImages(item);
  const lb = document.querySelector(".lb");
  const opener = document.activeElement;
  let idx = start;
  let scale = 1, tx = 0, ty = 0;
  lb.setAttribute("aria-label", `Photos of ${item.title}`);
  lb.innerHTML = `
    <div class="lb-top"><span aria-live="polite" data-count></span>
      <button class="lb-close" type="button" data-lb-close>${icon("close")}Close</button></div>
    <div class="lb-stage"><img class="lb-img" alt="" draggable="false">
      <button class="lb-nav lb-prev" type="button" aria-label="Previous photo">${icon("chevL")}</button>
      <button class="lb-nav lb-next" type="button" aria-label="Next photo">${icon("chevR")}</button></div>
    <div class="lb-thumbs">${imgs.map((u, i) => `<button type="button" data-i="${i}" aria-label="Photo ${i + 1}"><img src="${esc(img(u, 140))}" alt=""></button>`).join("")}</div>`;
  const stage = lb.querySelector(".lb-stage");
  const im = lb.querySelector(".lb-img");

  const apply = (anim) => {
    im.classList.toggle("anim", !!anim);
    im.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };
  const clamp = () => {
    if (scale <= 1) { scale = 1; tx = 0; ty = 0; return; }
    const w = im.offsetWidth, h = im.offsetHeight;
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const ox = im.offsetLeft, oy = im.offsetTop;
    // keep the zoomed image covering the stage where it can
    const minX = Math.min(0, sw - ox - w * scale), maxX = Math.max(0, -ox);
    const minY = Math.min(0, sh - oy - h * scale), maxY = Math.max(0, -oy);
    tx = Math.min(maxX, Math.max(minX, tx));
    ty = Math.min(maxY, Math.max(minY, ty));
  };
  const show = (i) => {
    idx = (i + imgs.length) % imgs.length;
    scale = 1; tx = 0; ty = 0; apply();
    im.src = img(imgs[idx], 1600);
    im.alt = `${item.title}, photo ${idx + 1} of ${imgs.length}`;
    lb.querySelector("[data-count]").textContent = `Photo ${idx + 1} of ${imgs.length}`;
    lb.querySelectorAll(".lb-thumbs button").forEach((b, j) => b.setAttribute("aria-current", j === idx ? "true" : "false"));
  };
  // transform-origin is top-left, so zoom around a point by adjusting translation
  const zoomAt = (newScale, cx, cy) => {
    const r = im.getBoundingClientRect();
    const px = (cx - r.left) / scale, py = (cy - r.top) / scale;
    newScale = Math.min(4, Math.max(1, newScale));
    tx += px * (scale - newScale);
    ty += py * (scale - newScale);
    scale = newScale;
    clamp();
  };

  const pointers = new Map();
  let start0 = null, pinch0 = null, lastTap = 0;
  stage.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    try { stage.setPointerCapture(e.pointerId); } catch {}
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) start0 = { x: e.clientX, y: e.clientY, tx, ty, t: Date.now() };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), scale, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    }
  });
  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch0) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt(pinch0.scale * (d / pinch0.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
      apply();
    } else if (pointers.size === 1 && start0) {
      const dx = e.clientX - start0.x, dy = e.clientY - start0.y;
      if (scale > 1) { tx = start0.tx + dx; ty = start0.ty + dy; clamp(); }
      else { tx = dx; ty = 0; }
      apply();
    }
  });
  const end = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch0 = null;
    if (pointers.size > 0) {
      const [p] = [...pointers.values()];
      start0 = { x: p.x, y: p.y, tx, ty, t: Date.now() };
      return;
    }
    const dx = e.clientX - (start0?.x ?? e.clientX);
    const moved = Math.abs(dx) > 8 || Math.abs(e.clientY - (start0?.y ?? e.clientY)) > 8;
    if (scale === 1 && Math.abs(dx) > 60) { show(idx + (dx < 0 ? 1 : -1)); }
    else if (!moved && e.pointerType !== "mouse" ? Date.now() - lastTap < 300 : false) { zoomAt(scale > 1 ? 1 : 2.5, e.clientX, e.clientY); apply(true); lastTap = 0; }
    else { if (!moved) lastTap = Date.now(); if (scale === 1) { tx = 0; apply(true); } }
    start0 = null;
  };
  stage.addEventListener("pointerup", end);
  stage.addEventListener("pointercancel", end);
  stage.addEventListener("dblclick", (e) => { zoomAt(scale > 1 ? 1 : 2.5, e.clientX, e.clientY); apply(true); });
  stage.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(scale * (e.deltaY < 0 ? 1.15 : 0.87), e.clientX, e.clientY); apply(); }, { passive: false });

  lb.querySelector(".lb-prev").onclick = () => show(idx - 1);
  lb.querySelector(".lb-next").onclick = () => show(idx + 1);
  lb.querySelectorAll(".lb-thumbs button").forEach((b) => (b.onclick = () => show(Number(b.dataset.i))));

  const close = () => {
    lb.hidden = true;
    lb.innerHTML = "";
    document.removeEventListener("keydown", onKey);
    document.body.style.overflow = "";
    document.querySelector("#main").inert = false;
    opener?.focus?.();
  };
  const onKey = (e) => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "+" || e.key === "=") { const r = stage.getBoundingClientRect(); zoomAt(scale * 1.5, r.left + r.width / 2, r.top + r.height / 2); apply(true); }
    else if (e.key === "-") { const r = stage.getBoundingClientRect(); zoomAt(scale / 1.5, r.left + r.width / 2, r.top + r.height / 2); apply(true); }
    else if (e.key === "Tab") {
      const f = [...lb.querySelectorAll("button")].filter((b) => b.offsetParent);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  lb.querySelector("[data-lb-close]").onclick = close;
  document.addEventListener("keydown", onKey);
  document.body.style.overflow = "hidden";
  document.querySelector("#main").inert = true;
  lb.hidden = false;
  show(start);
  lb.querySelector("[data-lb-close]").focus();
}

// ----- Trade in -----

const COND_HINTS = { "Like new": "No marks, works perfectly", Good: "Light wear, works perfectly", Fair: "Obvious wear, still works", Faulty: "Doesn't fully work" };

function tradeIn() {
  const radios = (name, opts, hints = {}) =>
    `<div class="choices">${opts.map((o) => `<label class="choice"><input type="radio" name="${name}" value="${esc(o)}"><span>${esc(o)}${hints[o] ? `<span class="sr">: ${esc(hints[o])}</span>` : ""}</span></label>`).join("")}</div>`;
  return `
  <div class="wrap ti-hero">
    <h1>We take trade-ins on almost anything. Cash or swap.</h1>
    <p>Tell us what you've got and we'll reply on WhatsApp with a price. Swapping against something we've got in usually gets you more than cash.</p>
    <ul class="ti-cats" aria-label="Things we take">${config.tradeInCategories.map((c) => `<li><button type="button" data-pick="${esc(c.name)}">${icon(c.icon)}${esc(c.name)}</button></li>`).join("")}</ul>
  </div>
  <div class="wrap ti-main" id="form">
    <div class="ti-art" aria-hidden="true"><div class="your-item" style="width:210px">Your item${tag(null, { note: "Your price here", tilt: 7 })}</div></div>
    <form class="ti-form" novalidate data-tradein>
      <h2>Get a trade-in price</h2>
      <div class="field" id="f-item"><label for="ti-item">What is it?</label>
        <span class="hint" id="h-item">Make and model if you know it, for example iPhone 12 64GB.</span>
        <input id="ti-item" name="item" type="text" aria-describedby="h-item e-item" autocomplete="off"><span class="error" id="e-item" hidden></span></div>
      <div class="field" id="f-category"><label for="ti-cat">Category</label>
        <select id="ti-cat" name="category" aria-describedby="e-category"><option value="">Choose a category</option>${config.tradeInCategories.map((c) => `<option>${esc(c.name)}</option>`).join("")}</select><span class="error" id="e-category" hidden></span></div>
      <fieldset class="field" id="f-condition" aria-describedby="e-condition"><legend>Condition</legend>
        ${radios("condition", config.tradeInConditions, COND_HINTS)}
        <span class="hint" data-cond-hint>Pick the closest. We'll check it from your photos.</span><span class="error" id="e-condition" hidden></span></fieldset>
      <div class="field"><label for="ti-acc">Accessories <span class="muted">(optional)</span></label>
        <input id="ti-acc" name="accessories" type="text" placeholder="Box, charger, controllers, cases" autocomplete="off"></div>
      <fieldset class="field" id="f-want"><legend>Cash or swap?</legend>${radios("want", ["Cash", "Swap", "Not sure yet"])}<span class="error" id="e-want" hidden></span></fieldset>
      <div class="field" data-swapfor hidden><label for="ti-swap">What would you like to swap it for? <span class="muted">(optional)</span></label>
        <input id="ti-swap" name="swapFor" type="text" placeholder="An item from the shop, or what you're after" autocomplete="off"></div>
      <fieldset class="field" id="f-contact"><legend>How should we reply?</legend>${radios("contact", ["WhatsApp", "Email", "Phone call"])}<span class="error" id="e-contact" hidden></span></fieldset>
      <div class="error" data-summary hidden tabindex="-1"></div>
      <div style="display:grid;gap:10px">
        <button class="btn btn-primary btn-lg btn-block" type="submit">${WA}Send my answers on WhatsApp</button>
        <p class="muted">WhatsApp opens with everything filled in. Add a few photos there and press send.</p>
      </div>
      <div class="ti-alt">
        <p><b>Prefer email?</b> We'll get the same answers.</p>
        <button class="btn" type="button" data-email>${icon("mail")}Send my answers by email</button>
      </div>
    </form>
  </div>
  <section class="wrap faq" style="padding-bottom:56px"><h2 style="margin-bottom:12px">Questions about trade-ins</h2>
    ${config.faq.map((f) => `<details><summary>${esc(f.q)}${icon("chevD")}</summary><p>${esc(f.a)}</p></details>`).join("")}
  </section>`;
}

function bindTradeIn() {
  const form = document.querySelector("[data-tradein]");
  const sel = form.querySelector("#ti-cat");
  document.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
    sel.value = b.dataset.pick;
    form.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    form.querySelector("#ti-item").focus({ preventScroll: true });
  }));
  form.addEventListener("change", (e) => {
    if (e.target.name === "want") form.querySelector("[data-swapfor]").hidden = e.target.value !== "Swap";
    if (e.target.name === "condition") form.querySelector("[data-cond-hint]").textContent = COND_HINTS[e.target.value];
    // Text fields revalidate as you type (below), so a blur never shifts the layout mid-tap.
    if (e.target.type === "text") return;
    if (e.target.closest(".field")?.hasAttribute("data-invalid")) validate(true);
  });
  form.addEventListener("input", (e) => {
    if (e.target.type === "text" && e.target.closest(".field")?.hasAttribute("data-invalid")) validate(true);
  });

  const answers = () => {
    const fd = new FormData(form);
    const v = (k) => (fd.get(k) || "").toString().trim();
    return { item: v("item"), category: v("category"), condition: v("condition"), accessories: v("accessories"), want: v("want"), swapFor: v("swapFor"), contact: v("contact") };
  };
  const MSGS = {
    item: "Tell us what the item is, even roughly.",
    category: "Choose the category that fits best.",
    condition: "Choose the condition closest to yours.",
    want: "Choose cash, swap or not sure yet.",
    contact: "Choose how you'd like us to reply.",
  };
  function validate(quiet) {
    const a = answers();
    const bad = Object.keys(MSGS).filter((k) => !a[k]);
    Object.keys(MSGS).forEach((k) => {
      const f = form.querySelector(`#f-${k}`);
      const err = form.querySelector(`#e-${k}`);
      const isBad = bad.includes(k);
      f.toggleAttribute("data-invalid", isBad);
      err.hidden = !isBad;
      err.textContent = isBad ? MSGS[k] : "";
    });
    const sum = form.querySelector("[data-summary]");
    sum.hidden = !bad.length;
    sum.textContent = bad.length ? `${bad.length} answer${bad.length === 1 ? " is" : "s are"} missing. Fill in the highlighted question${bad.length === 1 ? "" : "s"} and try again.` : "";
    if (bad.length && !quiet) form.querySelector(`#f-${bad[0]} input, #f-${bad[0]} select`).focus();
    return bad.length ? null : a;
  }
  const go = (url, kind) => {
    const a = validate();
    if (!a) return;
    track("Trade-in submit", { via: kind });
    track(kind === "email" ? "Email" : "WhatsApp", { from: "trade-in" });
    if (kind === "email") location.href = msg.tradeInMail(a);
    else window.open(msg.tradeIn(a), "_blank", "noopener");
  };
  form.addEventListener("submit", (e) => { e.preventDefault(); go(null, "whatsapp"); });
  form.querySelector("[data-email]").addEventListener("click", () => go(null, "email"));
}

// ----- Reviews, contact, privacy -----

function reviewsPage() {
  const r = DATA.reviews;
  const fb = feedback();
  return `
  <div class="wrap page-head">
    <h1>Reviews</h1>
    ${r.count
      ? `<div class="rating-big" style="margin-top:20px"><span class="num">${r.rating}</span><span>${stars(r.rating)}<br><span class="muted">from ${r.count} Google reviews</span></span></div>`
      : `<p style="margin-top:12px;font-size:1.125rem">If we've sold you something or bought your old kit, a quick Google review helps other people find us. It takes a minute.</p>`}
    <div class="btn-row" style="margin-top:20px">
      <a class="btn" href="${esc(reviewsUrl())}" target="_blank" rel="noopener">Read all on Google</a>
      <a class="btn btn-primary" href="${esc(config.google.reviewLink)}" target="_blank" rel="noopener">Leave a review</a>
    </div>
    <div class="feedback-line">${icon("ebay")}<span>${fb ? `<b>${esc(fb.feedbackPercentage)}% positive feedback on eBay</b> from ${Number(fb.feedbackScore).toLocaleString("en-GB")} ratings.` : "<b>Buying through eBay?</b> Every sale is covered by eBay's buyer protection."}</span><a class="textlink" href="${esc(feedbackUrl())}" target="_blank" rel="noopener">See our eBay feedback</a></div>
  </div>
  <section class="section" style="padding-top:32px"><div class="wrap">
    ${r.reviews.length ? `<div class="quotes">${r.reviews.map(quote).join("")}</div>` : ""}
    ${r.source === "google" ? `<p class="attrib" style="margin-top:28px">Reviews from Google. Ratings and reviews are updated daily.</p>` : ""}
  </div></section>`;
}

function contactPage() {
  const map = config.google.mapsEmbedUrl
    ? `<div class="placeholder"><p>The map loads from Google, which may set cookies.</p><button class="btn" type="button" data-load-map>${icon("pin")}Show the map</button><a class="textlink" href="${esc(config.google.mapsUrl)}" target="_blank" rel="noopener">Open in Google Maps</a></div>`
    : `<div class="placeholder"><p><b>${esc(B.town)}, ${esc(B.county)}</b></p><p>${esc(B.collection)}</p><a class="btn" href="${esc(config.google.mapsUrl)}" target="_blank" rel="noopener">${icon("pin")}Open in Google Maps</a></div>`;
  return `
  <div class="wrap page-head"><h1>Get in touch</h1><p>WhatsApp is quickest. We usually reply within a couple of hours during opening hours.</p></div>
  <div class="wrap contact-grid">
    <div style="display:grid;gap:32px;align-content:start">
      <div class="contact-actions">
        ${waBtn(msg.general(), "Message us on WhatsApp", "btn-lg")}
        <a class="btn btn-lg" href="${esc(msg.generalMail())}" data-track="Email">${icon("mail")}Email us</a>
        <a class="btn btn-lg" href="tel:+${B.whatsapp}" data-track="Call">${icon("call")}Call ${esc(B.phoneDisplay)}</a>
      </div>
      <dl class="facts">
        <div><dt>Hours</dt><dd>${esc(B.hoursText)}</dd></div>
        <div><dt>Area</dt><dd>${esc(B.town)}, ${esc(B.county)}</dd></div>
        <div><dt>Collection and postage</dt><dd>${esc(B.collection)}</dd></div>
        <div><dt>Email</dt><dd><a href="${esc(msg.generalMail())}" data-track="Email">${esc(B.email)}</a></dd></div>
      </dl>
    </div>
    <div class="map" data-map>${map}</div>
  </div>`;
}

function privacyPage() {
  return `
  <div class="wrap page-head"><h1>Privacy</h1><p>Short version: this website doesn't store anything you type, and it doesn't use tracking cookies.</p></div>
  <div class="wrap prose">
    <h2>The trade-in form and message buttons</h2>
    <p>When you use the trade-in form, "Ask a question", "Offer or trade against this" or any WhatsApp or email button, your answers are put into a message in WhatsApp or your email app on your own device. Nothing is sent to us until you press send there. This website does not save your answers.</p>
    <p>Once you send a message, we use your details only to reply about your enquiry. We keep conversations for up to 12 months so we can follow up on trade-ins and purchases, then delete them. You can ask us to delete them sooner at any time.</p>
    <h2>Buying</h2>
    <p>All purchases happen on eBay. eBay's own privacy notice covers your payment and delivery details.</p>
    <h2>Analytics</h2>
    <p>We count page visits and button taps (like "Buy on eBay") with cookie-free analytics. It doesn't identify you or follow you to other sites.</p>
    <h2>Google Maps and reviews</h2>
    <p>The map on our contact page only loads from Google if you choose to show it. Google may set cookies when it does.</p>
    <h2>Contact</h2>
    <p>${esc(B.name)}, ${esc(B.town)}, ${esc(B.county)}. Email <a href="mailto:${esc(B.email)}">${esc(B.email)}</a>.</p>
  </div>`;
}

function notFound() {
  return `<div class="wrap page-head" style="padding-bottom:64px"><h1>We couldn't find that page</h1><p>The link may be old. Try the shop, or message us and we'll point you to it.</p>
    <div class="btn-row" style="margin-top:20px"><a class="btn btn-primary" href="${href("/shop")}">Shop items</a>${waBtn(msg.general(), "Message us on WhatsApp")}</div></div>`;
}

// ---------- Router ----------

let shellPath = null;
async function route() {
  await ensureData();
  const path = currentPath().replace(/\/$/, "") || "/";
  if (shellPath === null) app.innerHTML = shell(path);
  shellPath = path;
  updateNav(path);
  document.body.classList.toggle("zone-mint", path === "/trade-in");
  const main = document.getElementById("main");
  let meta;

  if (path === "/") main.innerHTML = home();
  else if (path === "/shop") { main.innerHTML = shop(); bindShop(); }
  else if (path.startsWith("/item/")) {
    const id = idFromPath(path);
    const found = id ? await getItem(id) : { sold: { id } };
    if (found.item) {
      main.innerHTML = productPage(found.item);
      main.querySelectorAll("[data-open-lb]").forEach((b) => b.addEventListener("click", () => openLightbox(found.item, Number(b.dataset.openLb))));
      meta = metaFor(path, { item: found.item });
    } else {
      main.innerHTML = soldPage(found.sold);
      meta = metaFor(path, {});
    }
  }
  else if (path === "/trade-in") { main.innerHTML = tradeIn(); bindTradeIn(); }
  else if (path === "/reviews") main.innerHTML = reviewsPage();
  else if (path === "/contact") main.innerHTML = contactPage();
  else if (path === "/privacy") main.innerHTML = privacyPage();
  else main.innerHTML = notFound();

  document.title = (meta || metaFor(path, { listings: items().length })).title;
  // Inline payload only describes the first page; later navigations use the shared data.
  DATA.item = null;
  DATA.sold = null;
}

function updateNav(path) {
  document.querySelectorAll(".nav-desktop a, .menu a:not(.btn)").forEach((a) => {
    const p = a.getAttribute("href").replace(/^#/, "");
    const on = path === p || (p === "/shop" && path.startsWith("/item/"));
    on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current");
  });
  closeMenu();
}

function closeMenu() {
  const m = document.getElementById("menu");
  if (!m) return;
  m.hidden = true;
  document.querySelector("[data-menu]")?.setAttribute("aria-expanded", "false");
}

function navigate(to) {
  if (PREVIEW) location.hash = to;
  else { history.pushState(null, "", to); route().then(afterNav); }
}
function afterNav() {
  window.scrollTo(0, 0);
  document.getElementById("main")?.focus({ preventScroll: true });
}

document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-track]");
  if (t) {
    const name = t.dataset.track;
    track(name, t.dataset.item ? { item: t.dataset.item } : t.dataset.kind ? { kind: t.dataset.kind } : undefined);
  }
  const menuBtn = e.target.closest("[data-menu]");
  if (menuBtn) {
    const m = document.getElementById("menu");
    m.hidden = !m.hidden;
    menuBtn.setAttribute("aria-expanded", String(!m.hidden));
    if (!m.hidden) m.querySelector("a").focus();
    return;
  }
  const loadMap = e.target.closest("[data-load-map]");
  if (loadMap) {
    document.querySelector("[data-map]").innerHTML = `<iframe src="${esc(config.google.mapsEmbedUrl)}" title="Map of ${esc(B.town)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    return;
  }
  if (PREVIEW) return; // hash links route themselves
  const a = e.target.closest("a[href]");
  if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || /\.(xml|txt|svg|png)$/.test(url.pathname)) return;
  e.preventDefault();
  navigate(url.pathname + url.search);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !document.getElementById("menu")?.hidden) {
    closeMenu();
    document.querySelector("[data-menu]")?.focus();
  }
});

// Desktop search box in the top bar goes to the shop with the query.
document.addEventListener("submit", (e) => {
  const f = e.target.closest("[data-search]");
  if (!f) return;
  e.preventDefault();
  const q = f.q.value.trim();
  navigate(`/shop${q ? `?q=${encodeURIComponent(q)}` : ""}`);
});
document.addEventListener("input", (e) => {
  if (e.target.id !== "q-top") return;
  const q = e.target.value;
  if (currentPath() === "/shop") {
    const box = document.getElementById("q");
    if (box) { box.value = q; setShopParam("q", q); }
  }
});

if (PREVIEW) {
  addEventListener("hashchange", () => route().then(afterNav));
} else {
  addEventListener("popstate", () => route());
}

// Analytics: both are cookie-free. Plausible also records the click events above.
if (config.analytics.plausibleDomain) {
  const s = document.createElement("script");
  s.defer = true;
  s.dataset.domain = config.analytics.plausibleDomain;
  s.src = "https://plausible.io/js/script.js";
  document.head.append(s);
  window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
}
if (config.analytics.cloudflareBeaconToken) {
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.dataset.cfBeacon = JSON.stringify({ token: config.analytics.cloudflareBeaconToken });
  document.head.append(s);
}

route();
