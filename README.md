# Taystrades website

Mobile-first shop front for the Taystrades eBay UK shop. It runs on Cloudflare's free tier:

- **Cloudflare Pages** serves the site from `public/`. Pages Functions in `functions/` add each page's title, description, Open Graph tags and schema, and serve `/api/*`, `/sitemap.xml` and `/robots.txt`.
- **A Cloudflare Worker** in `sync-worker/` runs every hour on a Cron Trigger. It pulls your eBay listings (and, once a day, Google reviews) into **Workers KV**. The site only ever reads KV, so pages stay fast and nothing calls eBay or Google from the browser.
- **Sample mode**: until the eBay keys are in, the site shows 12 sample listings in exactly the shape eBay returns. Everything works, including the lightbox, filters and messages.

Everything you'll want to change is in **`public/config.js`**: business details, categories, trade-in categories, condition wording, FAQ and fallback reviews. Lines marked `DUMMY` are placeholders.

## Before you start

You need Node.js 20 or newer and a free Cloudflare account.

```sh
npm install
npx wrangler login
```

## 1. Fill in your details

Edit `public/config.js`. The name, town, county and phone must match your Google Business Profile exactly, because Google compares them with the site's LocalBusiness schema.

## 2. Create the KV namespace

```sh
npx wrangler kv namespace create TT_KV
```

Copy the `id` it prints into **both** `wrangler.toml` and `sync-worker/wrangler.toml`, replacing `REPLACE_WITH_KV_NAMESPACE_ID`.

## 3. Deploy the site

```sh
npx wrangler pages project create taystrades --production-branch main
npm run deploy
```

Wrangler prints a `*.pages.dev` address. The site works there straight away in sample mode.

## 4. Create the eBay keyset

1. Sign in at [developer.ebay.com](https://developer.ebay.com) with your eBay account and join the Developers Program (free).
2. Go to **Application Keys** and create a **Production** keyset.
3. eBay asks about **Marketplace Account Deletion** notifications before it activates production keys. This site doesn't store any eBay user data, so choose the option to apply for an exemption ("I do not persist eBay data").
4. Note the **App ID (Client ID)** and **Cert ID (Client Secret)**.

The site only uses the public Browse API with an application token (client credentials grant, scope `https://api.ebay.com/oauth/api_scope`), so you don't need user tokens or OAuth redirect URLs.

## 5. Add the eBay secrets and deploy the sync Worker

```sh
cd sync-worker
npx wrangler secret put EBAY_CLIENT_ID
npx wrangler secret put EBAY_CLIENT_SECRET
npx wrangler deploy
```

Secrets live in Cloudflare only. They are never in the code or the repo.

The Worker runs at the top of every hour. To run it straight away, add a sync key and call it:

```sh
npx wrangler secret put SYNC_KEY          # any long random string
curl -X POST https://taystrades-sync.<your-subdomain>.workers.dev/run -H "Authorization: Bearer <SYNC_KEY>"
```

Opening `https://taystrades-sync.<your-subdomain>.workers.dev/` shows the last sync result. Logs are under **Workers > taystrades-sync > Logs** in the Cloudflare dashboard.

**Checking it works**: list something new on eBay, wait for the next hourly run (or call `/run`), and it appears in "Just listed" and the shop. Items that sell disappear on the next run, and their old links show "This one's sold" with similar items.

How the sync behaves:

- It searches each category in `config.categories` (by `ebayCategoryIds`) with `filter=sellers:{your username}` on the `EBAY_GB` marketplace, pages through results, and merges and de-duplicates by `itemId`.
- It calls `/buy/browse/v1/item/{id}` for full photos, item specifics and condition notes. To stay inside the free plan's 50 outbound requests per run, it fetches up to 25 per run, newest first, and refreshes each one weekly. With a big first import, the rest arrive over the next few hours.
- If eBay errors, or suddenly returns nothing, it keeps the last good data and logs the error.
- The OAuth token is cached in KV until five minutes before it expires.

To sell in a new eBay category, add it to `config.categories`, then run `npm run deploy` and `npm run sync:deploy`.

## 6. Google reviews (optional)

Without a key, the site uses the reviews in `config.fallbackReviews`. To pull live ones daily:

1. In [Google Cloud Console](https://console.cloud.google.com), create a project, add a billing account, and enable **Places API (New)**.
2. Create an API key and restrict it to Places API (New).
3. Find your Place ID with Google's [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
4. Add both secrets:

```sh
cd sync-worker
npx wrangler secret put GOOGLE_PLACES_API_KEY
npx wrangler secret put GOOGLE_PLACE_ID
npx wrangler deploy
```

One call a day sits well inside Google's free monthly allowance. Google returns up to 5 reviews, which the site shows with author links and "Reviews from Google".

## 7. Connect your domain

1. In the Cloudflare dashboard, go to **Workers & Pages > taystrades > Custom domains > Set up a domain** and enter it (for example `taystrades.co.uk`, then again for `www.taystrades.co.uk`).
2. If the domain's DNS is already on Cloudflare, it's done automatically. If not, Cloudflare shows the CNAME record to add at your registrar, or you can move the domain's nameservers to Cloudflare.
3. Set `domain` in `public/config.js` to the same domain and run `npm run deploy`, so canonical URLs, the sitemap and schema all use it.
4. Put the new address on your Google Business Profile, and submit `https://yourdomain/sitemap.xml` in Google Search Console.

## Analytics

Both options are cookie-free, so there's no banner.

- **Plausible** (paid): set `analytics.plausibleDomain`. It records page views and the click events: "Buy on eBay", "WhatsApp", "Email", "Call" and "Trade-in submit". Add these as custom event goals in Plausible.
- **Cloudflare Web Analytics** (free): set `analytics.cloudflareBeaconToken`. It records page views only. It can't count button clicks, so use Plausible if you want those.

## Working on it locally

```sh
npm run dev            # site with Functions at http://localhost:8788 (sample mode)
npm run sync:dev       # sync Worker; trigger with curl "http://localhost:8787/__scheduled"
node test/sync.test.mjs  # runs the sync against a fake eBay and checks a new listing appears
npm run preview        # static sample-mode preview in ./preview
npm run images         # regenerates the sample photos
```

## Files

```
public/config.js          the one config file
public/index.html         page shell (every route uses it)
public/assets/app.js      the front end
public/assets/lib.js      formatting, condition grades, WhatsApp/email messages, SEO (shared)
public/assets/app.css     styles
functions/                Pages Functions: per-page meta + schema, /api, sitemap, robots
shared/store.js           KV reads and the sample-mode fallback
shared/sample-data.js     the 12 sample listings
sync-worker/              hourly eBay + daily Google sync
DESIGN-PLAN.md            palette, type, layout and principles
```
