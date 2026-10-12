// Sample mode: 12 listings across 4 categories, in exactly the shape the sync
// writes from eBay. Used whenever there is no live eBay data in KV yet.
import config from "../public/config.js";

const DAY = 86400000;

// key, draw and colors are only used to generate the sample images.
export const SAMPLE_ITEMS = [
  {
    key: "iphone-13", draw: "phone", colors: { body: "#2A3542", shade: "#36424F", boxLabel: "Phone" }, views: ["front", "back", "angle", "detail", "box"],
    id: "100000000001", title: "Apple iPhone 13 128GB Midnight Unlocked, battery health 87%", price: "289.00", conditionId: 3000, condition: "Used", cat: "phones",
    ebayCat: ["9355", "Mobile & Smart Phones"], days: 1, ship: "0.00",
    conditionDescription: "Light scuffs on the frame, screen has no scratches. Battery health 87%. Face ID works.",
    aspects: [["Brand", "Apple"], ["Model", "iPhone 13"], ["Storage capacity", "128 GB"], ["Colour", "Midnight"], ["Network", "Unlocked"], ["Battery health", "87%"], ["In the box", "Phone and USB-C to Lightning cable"]],
  },
  {
    key: "galaxy-s22", draw: "phone", colors: { body: "#1F2830", shade: "#2B3640" }, views: ["front", "back", "angle"],
    id: "100000000002", title: "Samsung Galaxy S22 5G 128GB Phantom Black Unlocked", price: "219.99", conditionId: 4000, condition: "Used", cat: "phones",
    ebayCat: ["9355", "Mobile & Smart Phones"], days: 12, ship: "3.49",
    conditionDescription: "Two hairline marks on the back glass. Screen perfect.",
    aspects: [["Brand", "Samsung"], ["Model", "Galaxy S22"], ["Storage capacity", "128 GB"], ["Colour", "Phantom Black"], ["Network", "Unlocked"]],
  },
  {
    key: "pixel-7a", draw: "phone", colors: { body: "#3E4A52", shade: "#56636C" }, views: ["front", "back", "detail", "box"],
    id: "100000000003", title: "Google Pixel 7a 128GB Charcoal Unlocked, boxed", price: "199.00", conditionId: 2750, condition: "Used - Like new", cat: "phones",
    ebayCat: ["9355", "Mobile & Smart Phones"], days: 20, ship: "0.00",
    conditionDescription: "Used for two months with a case and screen protector. Boxed with cable.",
    aspects: [["Brand", "Google"], ["Model", "Pixel 7a"], ["Storage capacity", "128 GB"], ["Colour", "Charcoal"], ["Network", "Unlocked"], ["In the box", "Original box and USB-C cable"]],
  },
  {
    key: "ps5", draw: "tower", colors: { boxLabel: "Console" }, views: ["front", "angle", "back", "detail", "box"],
    id: "100000000004", title: "Sony PlayStation 5 Disc Edition 825GB with DualSense controller", price: "329.00", conditionId: 4000, condition: "Used", cat: "consoles-games",
    ebayCat: ["139971", "Video Game Consoles"], days: 3, ship: "0.00",
    conditionDescription: "Fully tested. Faint marks on the side panels. Comes with one controller, HDMI and power cables.",
    aspects: [["Platform", "Sony PlayStation 5"], ["Model", "Disc Edition"], ["Storage capacity", "825 GB"], ["Colour", "White"], ["In the box", "Console, controller, HDMI and power cables"]],
  },
  {
    key: "switch-oled", draw: "handheld", colors: { left: "#F3F5F7", right: "#F3F5F7", boxLabel: "Console" }, views: ["front", "angle", "back", "detail"],
    id: "100000000005", title: "Nintendo Switch OLED Model White, with dock and Joy-Cons", price: "214.99", conditionId: 5000, condition: "Used", cat: "consoles-games",
    ebayCat: ["139971", "Video Game Consoles"], days: 9, ship: "3.99",
    conditionDescription: "Small scratches on the back and dock. Screen is clean. No drift on either Joy-Con.",
    aspects: [["Platform", "Nintendo Switch"], ["Model", "OLED"], ["Storage capacity", "64 GB"], ["Colour", "White"], ["In the box", "Console, Joy-Cons, dock, HDMI and charger"]],
  },
  {
    key: "zelda-totk", draw: "gamecase", colors: { case: "#D7322C", art: "#6E8F5C" }, views: ["front", "back", "angle"],
    id: "100000000006", title: "The Legend of Zelda: Tears of the Kingdom (Nintendo Switch)", price: "32.50", conditionId: 2750, condition: "Used - Like new", cat: "consoles-games",
    ebayCat: ["139973", "Video Games"], days: 5, ship: "1.99",
    conditionDescription: "Played once. Case and cartridge are spotless.",
    aspects: [["Platform", "Nintendo Switch"], ["Game name", "The Legend of Zelda: Tears of the Kingdom"], ["Region", "PAL"], ["Age rating", "PEGI 12"]],
  },
  {
    key: "xbox-series-s", draw: "tower", colors: { boxLabel: "Console" }, views: ["front", "angle", "detail"],
    id: "100000000007", title: "Microsoft Xbox Series S 512GB White with controller", price: "159.00", conditionId: 5000, condition: "Used", cat: "consoles-games",
    ebayCat: ["139971", "Video Game Consoles"], days: 26, ship: "0.00",
    conditionDescription: "Some scuffs on the top. Works perfectly.",
    aspects: [["Platform", "Microsoft Xbox Series S"], ["Storage capacity", "512 GB"], ["Colour", "White"]],
  },
  {
    key: "airpods-pro", draw: "earbuds", colors: { boxLabel: "Earbuds" }, views: ["back", "front", "detail", "box"],
    id: "100000000008", title: "Apple AirPods Pro (2nd generation) with MagSafe charging case", price: "119.00", conditionId: 4000, condition: "Used", cat: "tech-audio",
    ebayCat: ["112529", "Headphones"], days: 14, ship: "0.00",
    conditionDescription: "Cleaned and tested. Light marks on the case. New ear tips fitted.",
    aspects: [["Brand", "Apple"], ["Model", "AirPods Pro (2nd generation)"], ["Connectivity", "Bluetooth"], ["Features", "Active noise cancelling"]],
  },
  {
    key: "sony-xm4", draw: "headphones", colors: { body: "#2A2F35", shade: "#3D444C", boxLabel: "Headphones" }, views: ["front", "angle", "back", "detail"],
    id: "100000000009", title: "Sony WH-1000XM4 Wireless Noise Cancelling Headphones Black", price: "129.99", conditionId: 5000, condition: "Used", cat: "tech-audio",
    ebayCat: ["112529", "Headphones"], days: 33, ship: "3.49",
    conditionDescription: "Ear pads show wear but aren't torn. Battery lasts all day.",
    aspects: [["Brand", "Sony"], ["Model", "WH-1000XM4"], ["Colour", "Black"], ["Connectivity", "Bluetooth, 3.5 mm"]],
  },
  {
    key: "ipad-9", draw: "tablet", colors: { body: "#8C949B", shade: "#7A838B", boxLabel: "Tablet" }, views: ["front", "back", "angle", "detail"],
    id: "100000000010", title: "Apple iPad 9th generation 64GB Wi-Fi Space Grey 10.2in", price: "179.00", conditionId: 5000, condition: "Used", cat: "tech-audio",
    ebayCat: ["171485", "Tablets & eBook Readers"], days: 40, ship: "0.00",
    conditionDescription: "A couple of small dents on the corners. Screen is perfect. iCloud removed.",
    aspects: [["Brand", "Apple"], ["Model", "iPad (9th generation)"], ["Storage capacity", "64 GB"], ["Connectivity", "Wi-Fi"], ["Colour", "Space Grey"]],
  },
  {
    key: "charizard-151", draw: "card", colors: { body: "#FFD98A" }, views: ["front", "back", "detail"],
    id: "100000000011", title: "Pokémon TCG Charizard ex 199/165 Special Illustration Rare, Scarlet & Violet 151", price: "84.00", conditionId: 2750, condition: "Used - Like new", cat: "collectables",
    ebayCat: ["183454", "CCG Individual Cards"], days: 17, ship: "1.55",
    conditionDescription: "Pulled straight into a sleeve and top loader. Near mint, centring is good.",
    aspects: [["Game", "Pokémon TCG"], ["Set", "Scarlet & Violet 151"], ["Card number", "199/165"], ["Rarity", "Special Illustration Rare"], ["Graded", "No"]],
  },
  {
    key: "lego-xwing", draw: "bricks", colors: { accent: "#C8462E", boxLabel: "Building set" }, views: ["front", "angle", "back", "box"],
    id: "100000000012", title: "LEGO Star Wars 75301 Luke Skywalker's X-Wing Fighter, complete with instructions", price: "27.50", conditionId: 4000, condition: "Used", cat: "collectables",
    ebayCat: ["19006", "LEGO Complete Sets & Packs"], days: 24, ship: "3.99",
    conditionDescription: "Built once and displayed. Checked complete against the instructions. No box.",
    aspects: [["Brand", "LEGO"], ["Theme", "Star Wars"], ["Set number", "75301"], ["Minifigures", "4 included"], ["Instructions", "Yes"]],
  },
];

export function sampleListings(now = Date.now()) {
  const base = config.ebay.storeUrl;
  return SAMPLE_ITEMS.map((s) => {
    const images = s.views.map((_, i) => ({ imageUrl: `/sample/${s.key}-${i + 1}.svg` }));
    return {
      itemId: `v1|${s.id}|0`,
      title: s.title,
      price: { value: s.price, currency: "GBP" },
      condition: s.condition,
      conditionId: s.conditionId,
      categories: [{ categoryId: s.ebayCat[0], categoryName: s.ebayCat[1] }],
      image: images[0],
      additionalImages: images.slice(1),
      itemWebUrl: base,
      itemCreationDate: new Date(now - s.days * DAY - 3600000).toISOString(),
      shippingCost: { value: s.ship, currency: "GBP" },
      siteCategory: s.cat,
      conditionDescription: s.conditionDescription,
      aspects: s.aspects.map(([name, value]) => ({ name, value })),
    };
  });
}

export function sampleData(now = Date.now()) {
  return {
    source: "sample",
    updatedAt: new Date(now).toISOString(),
    seller: { feedbackPercentage: config.ebay.fallbackFeedback.percentage, feedbackScore: config.ebay.fallbackFeedback.score },
    items: sampleListings(now),
  };
}
