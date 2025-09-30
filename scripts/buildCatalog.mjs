// scripts/buildCatalog.mjs
// Genera src/lib/catalog_full.js con TODO el catálogo (metadatos, sin letras)

import fs from "node:fs";
import path from "node:path";

// ——— Config ———
// Mapear álbum -> era (puedes ajustar o ampliar)
const ALBUM_ERAS = {
  "Taylor Swift": "Debut",
  "Fearless (Taylor's Version)": "Fearless",
  "Speak Now (Taylor's Version)": "Speak Now",
  "Red (Taylor's Version)": "Red",
  "1989 (Taylor's Version)": "1989",
  reputation: "Reputation",
  Lover: "Lover",
  folklore: "folklore",
  evermore: "evermore",
  "Midnights (The Til Dawn Edition)": "Midnights",
  "The Tortured Poets Department: The Anthology":
    "The Tortured Poets Department",
};

// Si quieres incluir versiones no-TV antiguas u otros lanzamientos:
const EXTRA_ALBUMS = [
  // "Fearless", "Speak Now", "Red", "1989",
];

// Heurísticos súper simples para etiquetar temas por título
const THEME_RULES = [
  { key: "ruptura", re: /(break up|broke up|never|exile|trouble|back together|bad blood|end|over|again)/i },
  { key: "nostalgia", re: /(remember|cardigan|august|forever|back then|memories|home)/i },
  { key: "ansiedad", re: /(anx|worry|fear|nervous|arrows?|delicate|woods)/i },
  { key: "amor", re: /(love|lover|story|kiss|romeo|juliet|enchanted|style|willow)/i },
  { key: "ambición", re: /(name|fame|dream|city|midnight rain|career)/i },
  { key: "traición", re: /(liar|lies|betray|cheat|bad blood|mad)/i },
  { key: "verano", re: /(summer|august|cruel summer|sun)/i },
  { key: "secreto", re: /(secret|hidden|illicit|escond)/i },
];

const MOODS_BY_ERA = {
  Debut: ["country", "teen", "sweet"],
  Fearless: ["romántica", "optimista"],
  "Speak Now": ["cuento", "dramática"],
  Red: ["melancólica", "catártica"],
  "1989": ["pop", "nocturna"],
  Reputation: ["oscura", "cinética"],
  Lover: ["brillante", "eufórica"],
  folklore: ["íntima", "nostálgica"],
  evermore: ["contemplativa", "mística"],
  Midnights: ["confesional", "nocturna"],
  "The Tortured Poets Department": ["sombría", "hipnótica"],
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function themesFrom(title) {
  const t = [];
  for (const rule of THEME_RULES) if (rule.re.test(title)) t.push(rule.key);
  if (t.length === 0) t.push("amor"); // fallback mínimo
  return Array.from(new Set(t));
}

async function itunesSearchSongs(term) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    term
  )}&media=music&entity=song&limit=200`;
  const res = await fetch(url);
  const data = await res.json();
  return data.results || [];
}

function normalizeAlbumName(name = "") {
  if (/midnights/i.test(name)) return "Midnights (The Til Dawn Edition)";
  if (/tortured poets/i.test(name))
    return "The Tortured Poets Department: The Anthology";
  return name;
}

function pickEraFromAlbum(album) {
  const a = normalizeAlbumName(album);
  if (ALBUM_ERAS[a]) return { era: ALBUM_ERAS[a], album: a };
  if (EXTRA_ALBUMS.includes(a)) return { era: a, album: a };
  return null;
}

function preferTV(a, b) {
  const atv = /\(Taylor's Version\)/i.test(a.collectionName || "");
  const btv = /\(Taylor's Version\)/i.test(b.collectionName || "");
  if (atv && !btv) return -1;
  if (btv && !atv) return 1;
  return 0;
}

async function build() {
  const queries = [
    "Taylor Swift",
    "Fearless Taylor's Version",
    "Speak Now Taylor's Version",
    "Red Taylor's Version",
    "1989 Taylor's Version",
    "reputation Taylor Swift",
    "Lover Taylor Swift",
    "folklore Taylor Swift",
    "evermore Taylor Swift",
    "Midnights Taylor Swift",
    "The Tortured Poets Department Taylor Swift",
  ];

  const all = [];
  for (const q of queries) {
    const chunk = await itunesSearchSongs(q);
    all.push(...chunk);
    await delay(200); // cortesía
  }

  // Solo Taylor Swift como artista principal
  const onlyTaylor = all.filter(
    (r) => (r.artistName || "").toLowerCase() === "taylor swift"
  );

  // Dedup por (trackName + collectionName), preferimos Taylor's Version
  const map = new Map();
  for (const r of onlyTaylor) {
    const key = `${(r.trackName || "").toLowerCase()}__${(
      r.collectionName || ""
    ).toLowerCase()}`;
    if (!map.has(key)) map.set(key, r);
    else {
      const prev = map.get(key);
      const cmp = preferTV(r, prev);
      if (cmp < 0) map.set(key, r);
    }
  }

  // Transformar a nuestro formato y filtrar por álbumes/eras válidos
  const items = [];
  for (const r of map.values()) {
    const albumRaw = (r.collectionName || "").trim();
    const eraInfo = pickEraFromAlbum(albumRaw);
    if (!eraInfo) continue; // fuera del set soportado

    const title = (r.trackName || "").trim();
    const year = r.releaseDate ? new Date(r.releaseDate).getFullYear() : null;
    const id = `${slugify(title)}-${year || "na"}-${slugify(eraInfo.album)}`;
    const themes = themesFrom(title);
    const moods = MOODS_BY_ERA[eraInfo.era] || [];

    items.push({
      id,
      title,
      album: eraInfo.album,
      year,
      era: eraInfo.era,
      themes,
      moods,
    });
  }

  // Orden: era > año > título
  items.sort(
    (a, b) =>
      a.era.localeCompare(b.era) ||
      ((a.year || 0) - (b.year || 0)) ||
      a.title.localeCompare(b.title)
  );

  // Escribir archivo
  const outPath = path.join(process.cwd(), "src", "lib", "catalog_full.js");
  const header =
    "// ⚠️ Generado automáticamente por scripts/buildCatalog.mjs\n" +
    "// Metadatos de canciones (sin letras). Úsalo en lugar de catalog.js si quieres TODO el catálogo.\n" +
    "export const SONGS = ";
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, header + JSON.stringify(items, null, 2) + "\n");
  console.log(`Escrito: ${outPath} con ${items.length} canciones.`);
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
