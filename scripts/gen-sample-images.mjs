// Draws the flat sample "photos" used in sample mode (public/sample/*.svg).
// Run: node scripts/gen-sample-images.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { SAMPLE_ITEMS } from "../shared/sample-data.js";

const out = new URL("../public/sample/", import.meta.url);
mkdirSync(out, { recursive: true });

const W = 800;
const wrap = (inner, { wall = "#E8EEF3", floor = "#D5DEE6" } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" width="${W}" height="${W}">
<rect width="800" height="800" fill="${wall}"/><rect y="560" width="800" height="240" fill="${floor}"/>
<ellipse cx="400" cy="640" rx="250" ry="26" fill="#1C2B3A" opacity=".12"/>
${inner}
<text x="28" y="772" font-family="Arial, sans-serif" font-size="22" fill="#5B6B7A">Sample photo</text></svg>`;

const rr = (x, y, w, h, r, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;
const circ = (cx, cy, r, fill, extra = "") => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
const g = (t, inner) => `<g transform="${t}">${inner}</g>`;

const screen = (x, y, w, h, r) =>
  `<defs><linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F6F8F"/><stop offset="1" stop-color="#1C2B3A"/></linearGradient></defs>${rr(x, y, w, h, r, "url(#scr)")}`;

const box = (label, accent) =>
  g("translate(250 170)", rr(0, 0, 300, 450, 14, "#FFFFFF", 'stroke="#C9D6E1" stroke-width="3"') +
    rr(40, 60, 220, 260, 18, accent, 'opacity=".9"') +
    `<text x="150" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="28" fill="#1C2B3A">${label}</text>` +
    rr(0, 410, 300, 40, 0, "#EEF2F5"));

const D = {
  phone(c, v) {
    const front = rr(0, 0, 250, 500, 44, "#111A22") + screen(12, 12, 226, 476, 34) + rr(95, 24, 60, 18, 9, "#0B1117");
    const back =
      rr(0, 0, 250, 500, 44, c.body) + rr(18, 18, 110, 110, 30, c.shade) +
      circ(50, 50, 22, "#1B242C", 'stroke="#55626E" stroke-width="5"') + circ(96, 96, 22, "#1B242C", 'stroke="#55626E" stroke-width="5"') + circ(100, 46, 8, "#F3F0E6");
    if (v === "front") return g("translate(275 110)", front);
    if (v === "back") return g("translate(275 110)", back);
    if (v === "angle") return g("translate(205 140) rotate(-10)", back) + g("translate(355 120) rotate(8)", front);
    if (v === "box") return box(c.boxLabel || "Phone", c.body);
    return g("translate(130 60) scale(2.6)", back);
  },
  tower(c, v) {
    const t = rr(0, 0, 200, 470, 70, "#F7F9FB", 'stroke="#C9D6E1" stroke-width="4"') + rr(70, 20, 60, 430, 30, "#1C2B3A") + rr(90, 380, 20, 6, 3, "#5A9FD4");
    const pad = rr(0, 30, 260, 110, 55, "#F7F9FB", 'stroke="#C9D6E1" stroke-width="4"') + circ(60, 85, 26, "#1C2B3A") + circ(200, 85, 26, "#1C2B3A") + rr(110, 50, 40, 20, 8, "#1C2B3A");
    if (v === "front") return g("translate(300 110)", t) + g("translate(470 470) scale(.7)", pad);
    if (v === "back") return g("translate(300 110)", t.replace("#1C2B3A", "#2A3846") + rr(80, 120, 40, 14, 4, "#0B1117") + rr(80, 150, 40, 14, 4, "#0B1117"));
    if (v === "angle") return g("translate(260 120) skewY(-6)", t) + g("translate(470 480) scale(.65) rotate(-8)", pad);
    if (v === "box") return box(c.boxLabel || "Console", "#2F6F8F");
    return g("translate(140 220) scale(2)", pad);
  },
  handheld(c, v) {
    const h = rr(0, 30, 90, 240, 45, c.left) + rr(380, 30, 90, 240, 45, c.right) + rr(70, 30, 330, 240, 16, "#151E26") + screen(92, 50, 286, 200, 6) + circ(45, 100, 20, "#1C2B3A") + circ(425, 190, 20, "#1C2B3A");
    if (v === "front") return g("translate(165 250)", h);
    if (v === "back") return g("translate(165 250)", rr(70, 30, 330, 240, 16, "#E9ECEF", 'stroke="#C9D6E1" stroke-width="4"') + rr(0, 30, 90, 240, 45, c.left) + rr(380, 30, 90, 240, 45, c.right) + rr(200, 210, 80, 50, 8, "#C9D6E1"));
    if (v === "angle") return g("translate(150 270) rotate(-6)", h) + g("translate(280 520)", rr(0, 0, 250, 70, 10, "#F7F9FB", 'stroke="#C9D6E1" stroke-width="4"'));
    if (v === "box") return box(c.boxLabel || "Console", c.left);
    return g("translate(260 60) scale(2.4)", rr(0, 30, 90, 240, 45, c.left) + circ(45, 100, 20, "#1C2B3A"));
  },
  gamecase(c, v) {
    const art =
      rr(0, 0, 300, 470, 14, c.case) + rr(16, 56, 268, 398, 6, "#9CC9E4") +
      `<polygon points="16,380 90,250 160,330 230,220 284,300 284,454 16,454" fill="${c.art}"/>` +
      `<polygon points="16,454 16,410 140,360 284,420 284,454" fill="#3D6B4F"/>` + circ(220, 130, 34, "#FFE9A8") + rr(0, 0, 300, 44, 14, c.case);
    if (v === "front") return g("translate(250 120)", art);
    if (v === "back") return g("translate(250 120)", rr(0, 0, 300, 470, 14, c.case) + rr(16, 56, 268, 398, 6, "#F7F9FB") + rr(40, 90, 220, 14, 4, "#C9D6E1") + rr(40, 120, 180, 14, 4, "#C9D6E1") + rr(40, 300, 100, 130, 6, "#9CC9E4"));
    if (v === "angle") return g("translate(200 140) rotate(-8)", art) + g("translate(520 470)", rr(0, 0, 80, 100, 10, "#E04A3F") + rr(10, 10, 60, 60, 4, "#F7F9FB"));
    return g("translate(150 50) scale(1.7)", art);
  },
  earbuds(c, v) {
    const cs = rr(0, 0, 320, 240, 100, "#FBFCFD", 'stroke="#C9D6E1" stroke-width="4"') + `<line x1="10" y1="90" x2="310" y2="90" stroke="#C9D6E1" stroke-width="4"/>` + circ(160, 150, 6, "#8FD18F");
    const bud = (x, r) => g(`translate(${x} 0) rotate(${r})`, circ(40, 40, 38, "#FBFCFD", 'stroke="#C9D6E1" stroke-width="4"') + rr(26, 50, 26, 120, 13, "#FBFCFD", 'stroke="#C9D6E1" stroke-width="4"') + circ(40, 36, 12, "#1C2B3A"));
    if (v === "front") return g("translate(240 310)", cs);
    if (v === "back") return g("translate(240 310)", cs) + g("translate(250 120)", bud(0, -12) + bud(200, 12));
    if (v === "angle") return g("translate(180 300) rotate(-8)", cs) + g("translate(520 340)", bud(0, 20));
    if (v === "box") return box(c.boxLabel || "Earbuds", "#DCEBF5");
    return g("translate(170 120) scale(2)", bud(0, 0));
  },
  headphones(c, v) {
    const hp =
      `<path d="M60 300 C60 60 440 60 440 300" fill="none" stroke="${c.body}" stroke-width="34" stroke-linecap="round"/>` +
      rr(10, 260, 110, 170, 50, c.body) + rr(380, 260, 110, 170, 50, c.body) + rr(30, 280, 70, 130, 35, c.shade) + rr(400, 280, 70, 130, 35, c.shade);
    if (v === "front") return g("translate(150 150)", hp);
    if (v === "back") return g("translate(150 200) scale(1 .85)", hp) + g("translate(230 560)", rr(0, 0, 340, 40, 20, c.shade));
    if (v === "angle") return g("translate(180 140) rotate(-12)", hp);
    if (v === "box") return box(c.boxLabel || "Headphones", c.body);
    return g("translate(40 -120) scale(2)", rr(10, 260, 110, 170, 50, c.body) + rr(30, 280, 70, 130, 35, c.shade));
  },
  tablet(c, v) {
    const t = rr(0, 0, 520, 370, 28, "#1A232B") + screen(20, 20, 480, 330, 12);
    if (v === "front") return g("translate(140 190)", t);
    if (v === "back") return g("translate(140 190)", rr(0, 0, 520, 370, 28, c.body) + rr(24, 24, 60, 60, 16, c.shade) + circ(54, 54, 16, "#1B242C"));
    if (v === "angle") return g("translate(140 230) skewX(-12) scale(1 .85)", t);
    if (v === "box") return box(c.boxLabel || "Tablet", c.body);
    return g("translate(-60 -40) scale(1.8)", rr(0, 0, 520, 370, 28, c.body) + rr(24, 24, 60, 60, 16, c.shade) + circ(54, 54, 16, "#1B242C"));
  },
  card(c, v) {
    const card =
      rr(0, 0, 300, 420, 16, "#F2C94C") + rr(14, 14, 272, 392, 10, c.body) + rr(28, 60, 244, 170, 6, "#FFB070") +
      `<path d="M150 90 C210 110 230 170 190 210 C170 180 140 190 120 215 C80 170 100 110 150 90Z" fill="#E2552B"/>` +
      rr(28, 250, 244, 22, 4, "#FFF6DD") + rr(28, 290, 200, 14, 4, "#FFF6DD") + rr(28, 318, 220, 14, 4, "#FFF6DD") + rr(28, 26, 150, 22, 4, "#FFF6DD");
    const backc = rr(0, 0, 300, 420, 16, "#2B5FA8") + circ(150, 210, 80, "#E2552B") + circ(150, 210, 30, "#F7F9FB") + rr(70, 205, 160, 10, 0, "#1C2B3A");
    if (v === "front") return g("translate(250 150)", card);
    if (v === "back") return g("translate(250 150)", backc);
    if (v === "angle") return g("translate(200 160) rotate(-8)", backc) + g("translate(330 150) rotate(6)", card);
    return g("translate(230 70)", rr(-20, -20, 380, 560, 20, "#FFFFFF", 'opacity=".55" stroke="#9FB3C4" stroke-width="4"') + g("translate(20 90)", card) + rr(20, 10, 300, 60, 6, "#FFFFFF", 'stroke="#C9D6E1" stroke-width="3"'));
  },
  bricks(c, v) {
    const ship =
      `<polygon points="0,180 260,100 520,180 260,230" fill="#C9D3DB"/>` + `<polygon points="0,180 260,230 260,270 0,210" fill="#9EABB6"/>` + `<polygon points="520,180 260,230 260,270 520,210" fill="#AEBAC4"/>` +
      rr(230, 120, 60, 40, 6, c.accent) + rr(100, 160, 70, 14, 3, c.accent) + rr(350, 160, 70, 14, 3, c.accent) + circ(260, 160, 14, "#2F3D4B");
    if (v === "front") return g("translate(140 230)", ship);
    if (v === "back") return g("translate(660 260) scale(-1 1)", ship);
    if (v === "angle") return g("translate(160 240) rotate(-10)", ship);
    if (v === "box") return box(c.boxLabel || "Building set", "#2B5FA8");
    return g("translate(-120 -10) scale(1.9)", ship);
  },
};

let count = 0;
for (const s of SAMPLE_ITEMS) {
  s.views.forEach((view, i) => {
    writeFileSync(new URL(`${s.key}-${i + 1}.svg`, out), wrap(D[s.draw](s.colors, view)));
    count++;
  });
}
console.log(`wrote ${count} sample images`);
