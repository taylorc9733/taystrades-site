// Taystrades site config: the one file to edit for business details,
// categories, trade-in categories and fallback reviews.
//
// Anything marked DUMMY is a placeholder. Replace it before going live.
// Name, area and phone must match your Google Business Profile exactly,
// because they feed the LocalBusiness schema Google reads.

export default {
  business: {
    name: "Taystrades",
    tagline: "Pre-owned tech, games and collectables. Bought, sold and swapped.",
    town: "Anytown", // DUMMY
    county: "Someshire", // DUMMY
    whatsapp: "447700900123", // DUMMY: international format, no + (07700 900xxx is reserved for fiction)
    phoneDisplay: "07700 900123", // DUMMY
    email: "hello@taystrades.example", // DUMMY
    domain: "taystrades.pages.dev", // your free Cloudflare address for now; change when you add your own domain
    hoursText: "Mon to Sat, 9am to 7pm",
    // Used for schema.org opening hours. Days: Mo Tu We Th Fr Sa Su
    hours: [{ days: ["Mo", "Tu", "We", "Th", "Fr", "Sa"], opens: "09:00", closes: "19:00" }],
    collection: "Collection from Anytown, or tracked postage anywhere in the UK.", // DUMMY town
  },

  ebay: {
    username: "your-ebay-username", // DUMMY
    storeUrl: "https://www.ebay.co.uk/usr/your-ebay-username", // DUMMY
    // Shown until the first sync brings in your live feedback numbers.
    fallbackFeedback: { percentage: "100", score: 312 }, // DUMMY
  },

  google: {
    reviewLink: "https://g.page/r/DUMMY/review", // DUMMY: "Ask for reviews" link from your profile
    mapsUrl: "https://maps.google.com/?q=Taystrades", // DUMMY: your profile's Maps link
    // From Google Maps: Share > Embed a map > copy the src="..." URL. Leave "" to show a placeholder.
    mapsEmbedUrl: "", // DUMMY
  },

  // Sample mode shows 12 made-up listings until your eBay shop is connected. Handy for testing,
  // but keep it false on the live site so customers never see items you don't have.
  showSampleListings: false,

  analytics: {
    plausibleDomain: "", // e.g. "taystrades.co.uk" once you have a Plausible site. Tracks button clicks.
    cloudflareBeaconToken: "", // Cloudflare Web Analytics token. Page views only.
  },

  // Site categories. ebayCategoryIds are the top-level eBay UK categories the
  // sync searches in (the Browse API needs a category alongside the seller filter).
  // Add a category here and the next hourly sync picks it up.
  categories: [
    { slug: "phones", name: "Phones", icon: "phone", ebayCategoryIds: ["15032"] },
    { slug: "consoles-games", name: "Consoles and games", icon: "console", ebayCategoryIds: ["1249"] },
    { slug: "tech-audio", name: "Tech and audio", icon: "headphones", ebayCategoryIds: ["293", "58058"] },
    { slug: "collectables", name: "Collectables", icon: "card", ebayCategoryIds: ["1", "220"] },
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

  // Used when no Google Places key is set. DUMMY reviews: replace with real ones from your profile.
  fallbackReviews: {
    rating: 4.9,
    count: 37,
    reviews: [
      { author: "Sarah M.", rating: 5, when: "2 weeks ago", text: "Swapped my old Switch and a pile of games for a PS5. Fair price, sorted the same afternoon, and he answered every question on WhatsApp." },
      { author: "Dan P.", rating: 5, when: "1 month ago", text: "Bought an iPhone through the eBay shop. Battery health was exactly as listed and it arrived next day, well packed." },
      { author: "Priya K.", rating: 5, when: "2 months ago", text: "Sold my late dad's card collection here. Took the time to price it properly and explained everything. Really decent." },
      { author: "Tom H.", rating: 4, when: "3 months ago", text: "Good prices on headphones. Collection was easy and quick." },
    ],
  },

  faq: [
    { q: "How do you value my item?", a: "We check recent sold prices on eBay for the same model and condition, then allow for testing, cleaning and fees. Swaps get a better value than cash because the money stays with us." },
    { q: "How quickly will you reply?", a: "Usually within a couple of hours during opening hours. Messages sent late are answered the next morning." },
    { q: "Do you collect, or can I post it?", a: "Drop it off or we can collect locally. Further away, we'll send you a prepaid postage label once you've accepted the price, and pay as soon as it's checked." },
    { q: "What don't you take?", a: "Anything stolen, iCloud or Google locked, blacklisted or on finance. We also pass on counterfeit items, large furniture and anything unsafe to post." },
  ],
};
