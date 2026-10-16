// Tays Trades site config: the one file to edit for business details,
// categories, trade-in categories and fallback reviews.
// Name, area and phone must match your Google Business Profile exactly,
// because they feed the LocalBusiness schema Google reads.

export default {
  business: {
    name: "Tays Trades",
    // The old one-word spelling, kept so Google links searches for it to this shop.
    alternateName: "Taystrades",
    // Exactly as your Google Business Profile spells it. Used in the data Google reads.
    googleName: "Tays Trades",
    tagline: "Pre-owned tech, games and collectables. Bought, sold and swapped.",
    town: "Totton",
    county: "Southampton",
    whatsapp: "447475762695", // international format, no +
    phoneDisplay: "07475 762695",
    email: "taystrades42@gmail.com",
    domain: "www.taystrades.co.uk", // the address Google should use (canonical links, sitemap, schema)
    hoursText: "Mon to Sat, 8am to 9pm. Sunday, 9am to 6pm",
    // Used for schema.org opening hours. Days: Mo Tu We Th Fr Sa Su
    hours: [
      { days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"], opens: "08:00", closes: "21:00" },
      { days: ["Su"], opens: "09:00", closes: "18:00" },
    ],
    collection: "Collection from Totton, or tracked postage anywhere in the UK.",
    // Your Google profile's service areas (you don't show a street address, so none is published here either).
    serviceArea: ["Totton and Eling, Southampton", "Southampton", "Eastleigh", "Romsey", "Lyndhurst", "Bournemouth", "Salisbury", "Hampshire", "Dorset", "Wiltshire"],
  },

  ebay: {
    username: "taystrades",
    storeUrl: "https://www.ebay.co.uk/usr/taystrades",
  },

  google: {
    // Swap these for your profile's own links when you have them:
    // the "Ask for reviews" link (g.page/r/...) and your profile's Maps link.
    reviewLink: "https://www.google.com/maps/search/?api=1&query=Tays%20Trades%20Totton",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Tays%20Trades%20Totton",
    // From Google Maps: Share > Embed a map > copy the src="..." URL. Leave "" to show a link instead.
    mapsEmbedUrl: "",
  },

  // Sample mode shows 12 made-up listings until your eBay shop is connected. Handy for testing,
  // but keep it false on the live site so customers never see items you don't have.
  showSampleListings: false,

  // Discount for buyers who collect in person instead of buying on eBay (no eBay fees or postage).
  // percent: 0 turns it off. The collection price is rounded down to the whole pound.
  // byCategory overrides the percent for a site category (by slug).
  // eBay UK Buyer Protection fee (charged to buyers on private-seller listings):
  // fixed £0.10 plus 7% up to £20, 4% from £20 to £300, 2% from £300 to £4,000.
  // Collection price = item price; the site shows this fee plus postage as the saving.
  buyerProtectionFee: { fixed: 0.10, bands: [[20, 7], [300, 4], [4000, 2]] },
  // Items listed at flatFrom or more are flatPercent off the listed price for collection,
  // and the site shows that percentage as the saving.
  // Items under roundBelow collect at the listed price rounded down to the nearest roundTo
  // (£129.99 -> £125). Items under £10 round down to the pound instead.
  collection: { flatFrom: 300, flatPercent: 5, roundBelow: 200, roundTo: 5 },

  analytics: {
    plausibleDomain: "", // e.g. "taystrades.co.uk" once you have a Plausible site. Tracks button clicks.
    cloudflareBeaconToken: "", // Cloudflare Web Analytics token. Page views only.
  },

  // Site categories. ebayCategoryIds are the top-level eBay UK categories the
  // sync searches in (the Browse API needs a category alongside the seller filter).
  // Add a category here and the next hourly sync picks it up. Listings in any
  // other eBay category still show: under "Other electronics" when its eBay
  // category or title has one of the `match` words, otherwise "Everything else".
  // Those two only appear on the site once they have something in them.
  categories: [
    { slug: "phones", name: "Phones", icon: "phone", ebayCategoryIds: ["15032"] },
    { slug: "consoles-games", name: "Consoles and games", icon: "console", ebayCategoryIds: ["1249"] },
    { slug: "tech-audio", name: "Tech and audio", icon: "headphones", ebayCategoryIds: ["293", "58058"] },
    { slug: "collectables", name: "Collectables", icon: "card", ebayCategoryIds: ["1", "220"] },
    { slug: "cameras", name: "Cameras", icon: "camera", ebayCategoryIds: ["625"] },
    {
      slug: "electronics", name: "Other electronics", icon: "plug", ebayCategoryIds: [], catchAll: true,
      match: ["electric", "electrical", "electronic", "appliance", "gadget", "smart", "charger", "battery", "batteries", "power bank",
        "drone", "radio", "speaker", "bluetooth", "wireless", "usb", "tv", "projector", "sat nav", "dash cam", "led",
        "hair dryer", "straightener", "shaver", "vacuum", "kindle", "e-reader", "smartwatch", "fitness tracker"],
    },
    { slug: "more", name: "Everything else", icon: "box", ebayCategoryIds: [], catchAll: true },
  ],

  // Shown on the trade-in page and in its form.
  tradeInCategories: [
    { name: "Phones and tablets", icon: "phone" },
    { name: "Consoles and games", icon: "console" },
    { name: "Headphones and audio", icon: "headphones" },
    { name: "Cameras", icon: "camera" },
    { name: "Laptops and computers", icon: "laptop" },
    { name: "Trading cards", icon: "card" },
    { name: "Toys and collectables", icon: "brick" },
    { name: "Something else", icon: "box" },
  ],

  // Plain-English condition grades. eBay condition IDs map onto these.
  grades: [
    { key: "new", label: "New", pips: 5, ebayIds: [1000, 1500, 1750], explain: "Never used. It may have been opened to check it, but it has no wear at all." },
    { key: "like-new", label: "Like new", pips: 4, ebayIds: [2000, 2010, 2500, 2750], explain: "Used very little or professionally refurbished. You'd struggle to spot a mark." },
    { key: "very-good", label: "Very good", pips: 3, ebayIds: [2020, 4000], explain: "Light signs of use, like faint hairline marks you'd only see up close. Works perfectly." },
    { key: "good", label: "Good", pips: 2, ebayIds: [2030, 3000, 5000], explain: "Visible wear such as scuffs or small scratches. Fully tested and works as it should." },
    { key: "fair", label: "Fair", pips: 1, ebayIds: [6000], explain: "Well used, with obvious marks or dents. Everything works, and the photos show every flaw." },
    { key: "faulty", label: "Spares or repair", pips: 0, ebayIds: [7000], explain: "Doesn't fully work. The listing says exactly what's wrong. Priced for fixing or parts." },
  ],

  tradeInConditions: ["Like new", "Good", "Fair", "Faulty"],

  // Used when no Google Places key is set. Only add real reviews copied from your Google profile.
  // While this is empty, the site invites people to leave a review instead.
  fallbackReviews: { rating: null, count: 0, reviews: [] },

  // eBay feedback shown as small cards on the home and reviews pages.
  // Copy real comments from https://www.ebay.co.uk/fdbk/feedback_profile/taystrades
  // Newest first. Leave empty to hide the cards. Example:
  // { text: "Fast postage, item exactly as described.", buyer: "j***n", item: "iPhone 13 128GB", when: "Sep 2026" },
  // Buyer names are shortened so their full eBay usernames aren't published.
  ebayFeedback: [
    { text: "Great seller! The phone was exactly as described and was dispatched very quickly. Everything was perfect. Highly recommended!", buyer: "d***0", item: "Apple iPhone 17 Pro Max 256GB Cosmic Orange", when: "Past month" },
    { text: "Thank you, I'm really pleased. Great item exactly as described. Arrived quickly and well packaged. Great customer service.", buyer: "g***2", item: "Apple iPhone 16e 128GB Black", when: "Past 6 months" },
    { text: "Item was received as described. The seller was great at ensuring everything went well and also was kind to refund me the postage despite the great price. Will definitely be coming back for more deals.", buyer: "k***0", item: "Samsung Galaxy S26 Ultra 256GB Black", when: "Past 6 months" },
    { text: "Very happy with my eBay experience with this seller. Great condition item, good value, fast dispatch, hope to buy from them again!", buyer: "s***3", item: "SanDisk Ultra 512GB microSD card", when: "Past month" },
    { text: "Great seller, I received it very fast and was all well packed and in good condition as described, would recommend.", buyer: "d***w", item: "Modded PS Vita 1000 OLED", when: "Past month" },
    { text: "Seller was clear about the specifications and performance of the item and came as described. Postage was quickly received and packaged in the best way that protected the components.", buyer: "s***0", item: "Gaming PC, Ryzen 7 7800X3D, RX 9070 XT", when: "Past 6 months" },
    { text: "Great eBayer. Phone received in great condition. As described. Very good value. Well recommended. Swift postage and delivery.", buyer: "m***0", item: "Samsung Galaxy S25 Ultra 1TB Titanium", when: "Past year" },
    { text: "Excellent comms and after sales support. +++++", buyer: "m***n", item: "Apple iPhone 16e 128GB Black", when: "Past 6 months" },
    { text: "As described. Recommend!", buyer: "c***k", item: "Nikon Coolpix S3500 Camera", when: "Past month" },
  ],

  faq: [
    { q: "How do you value my item?", a: "We check recent sold prices on eBay for the same model and condition, then allow for testing, cleaning and fees. Swaps get a better value than cash because the money stays with us." },
    { q: "How quickly will you reply?", a: "Usually within a couple of hours during opening hours. Messages sent late are answered the next morning." },
    { q: "Do you collect, or can I post it?", a: "Drop it off or we can collect locally. Further away, we'll send you a prepaid postage label once you've accepted the price, and pay as soon as it's checked." },
    { q: "What don't you take?", a: "Anything stolen, iCloud or Google locked, blacklisted or on finance. We also pass on counterfeit items, large furniture and anything unsafe to post." },
  ],
};
