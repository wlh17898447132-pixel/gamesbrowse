import { readFileSync } from "node:fs";

type SummaryItem = {
  label: string;
  value: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type PlaygamaCatalog = {
  segments?: PlaygamaSegment[];
};

type PlaygamaSegment = {
  hits?: PlaygamaGameHit[];
};

type PlaygamaGameHit = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  howToPlayText?: string;
  gameURL?: string;
  playgamaGameUrl?: string;
  genres?: string[];
  tags?: string[];
  images?: string[];
  mobileReady?: string[];
  gender?: string[];
  supportedLanguages?: string[];
  screenOrientation?: {
    horizontal?: boolean;
    vertical?: boolean;
  };
  embed?: string;
};

type PlaygamaGameItem = {
  externalId: string;
  title: string;
  slug: string;
  source: "playgama";
  type: "iframe";
  category: string;
  categories: string[];
  genreLabels: string[];
  tags: string[];
  shortDescription: string;
  description: string;
  instructions: string;
  controls: string;
  gender?: string[];
  language?: string;
  thumbnail?: string;
  gameUrl?: string;
  embedUrl?: string;
  iframeCode?: string;
  iframeBaseUrl: string;
  iframeAllow?: string;
  iframeWidth: number;
  iframeHeight: number;
  featured: boolean;
  popular: boolean;
  editorPick: boolean;
  newGame: boolean;
  createdAt: string;
  lead: string;
  overview: string[];
  tips: string[];
  faq: FaqItem[];
  summary: SummaryItem[];
  relatedSlugs: string[];
  sourceName: string;
  licenseType: string;
  orientation: string;
  platforms: string[];
  allowFullscreen: boolean;
};

type CopyOverride = {
  shortDescription: string;
  description: string;
  instructions: string;
  controls: string;
  lead: string;
  overview: string[];
  tips: string[];
  relatedSlugs: string[];
};

const PLAYGAMA_IMPORT_DATE = "2026-04-28";
const rawCatalogPath = new URL("../../games.json", import.meta.url);
const rawCatalog = JSON.parse(readFileSync(rawCatalogPath, "utf8")) as PlaygamaCatalog;
const rawHits = (rawCatalog.segments || []).flatMap((segment) => segment.hits || []);

if (rawHits.length !== 2) {
  throw new Error(`Expected exactly 2 Playgama games in games.json, found ${rawHits.length}.`);
}

const copyOverrides: Record<string, CopyOverride> = {
  "rooftop-run": {
    shortDescription: "Run, jump, and slide across city rooftops in a fast parkour chase.",
    description:
      "Rooftop Run is a fast parkour action game where you sprint across rooftops, dodge obstacles, smash through barriers, and stay ahead through increasingly busy stages.",
    instructions:
      "Desktop:\nUp Arrow = Move up\nDown Arrow = Move down\nLeft Arrow = Move left\nRight Arrow = Move right\nSpacebar = Fire\nShift = Boost\n\nMobile:\nUse the on-screen joystick to move.\nTap Fire to attack.\nTap Boost for extra speed.",
    controls:
      "Desktop: Arrow Keys = Move\nDesktop: Spacebar = Fire\nDesktop: Shift = Boost\nMobile: On-screen joystick and buttons",
    lead:
      "Keep your route clean, react quickly around rooftop hazards, and use your boost at the right time to stay in control.",
    overview: [
      "Rooftop Run mixes forward momentum with rooftop parkour, obstacle timing, and quick reactions as the route gets busier.",
      "This page keeps the official Playgama partner embed inside the GamesBrowse layout so players can launch the game without leaving your site."
    ],
    tips: [
      "Save boost for sections where you have a clear line ahead.",
      "Use short movement corrections instead of oversteering across narrow rooftops.",
      "On small phones, rotating to landscape gives the game more room."
    ],
    relatedSlugs: ["only-up-parkour-2", "red-light-challenge", "neon-drift-dash"]
  },
  "only-up-parkour-2": {
    shortDescription: "Climb through a vertical obstacle course and keep pushing upward without falling.",
    description:
      "Only Up Parkour 2 is an arcade climbing game where you jump through a vertical obstacle course, recover from risky landings, and keep advancing toward the 500 meter goal.",
    instructions:
      "WASD = Move\nSpace = Jump\nE = Return to checkpoint\nKeep climbing and avoid falling off the course.",
    controls: "WASD = Move\nSpace = Jump\nE = Return to checkpoint",
    lead:
      "Read each platform carefully, commit to clean jumps, and recover fast when the climb starts punishing small mistakes.",
    overview: [
      "Only Up Parkour 2 focuses on vertical parkour, precise jumps, and steady recovery as the course becomes more demanding higher up.",
      "The GamesBrowse route uses the official Playgama partner embed directly inside the page, keeping the tracking-enabled clid URL intact."
    ],
    tips: [
      "Line up before long jumps instead of correcting in midair.",
      "Use checkpoints when the climb gets more complex.",
      "Rotate your phone to landscape if the play area feels too narrow."
    ],
    relatedSlugs: ["rooftop-run", "red-light-challenge", "tap-forge-clicker"]
  }
};

const categoryMap: Record<string, string> = {
  arcade: "Arcade",
  action: "Action",
  puzzle: "Puzzle",
  racing: "Racing",
  reflex: "Reflex",
  clicker: "Clicker",
  sports: "Sports",
  shooting: "Shooting",
  casual: "Casual",
  running: "Action",
  parkour: "Arcade",
  platform: "Arcade",
  skill: "Arcade",
  physics: "Arcade",
  mobile: "Casual"
};

const labelMap: Record<string, string> = {
  ios: "iOS",
  "3d": "3D"
};

function toDisplayLabel(value: string) {
  const normalized = value.trim().toLowerCase();

  if (labelMap[normalized]) return labelMap[normalized];

  return normalized
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => labelMap[part] || `${part[0]?.toUpperCase() || ""}${part.slice(1)}`)
    .join(" ");
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function extractIframeAttribute(embedHtml: string | undefined, attribute: string) {
  if (!embedHtml) return "";
  const match = embedHtml.match(new RegExp(`${attribute}=['"]([^'"]+)['"]`, "i"));
  return match?.[1] || "";
}

function extractIframeSize(embedHtml: string | undefined) {
  const width = Number.parseInt(extractIframeAttribute(embedHtml, "width"), 10);
  const height = Number.parseInt(extractIframeAttribute(embedHtml, "height"), 10);

  return {
    width: Number.isFinite(width) ? width : 800,
    height: Number.isFinite(height) ? height : 450
  };
}

function pickPrimaryCategory(genres: string[]) {
  for (const genre of genres) {
    const category = categoryMap[genre];
    if (category) return category;
  }

  return "Arcade";
}

function pickCategories(genres: string[], primaryCategory: string) {
  const mappedCategories = genres
    .map((genre) => categoryMap[genre])
    .filter(Boolean);

  return uniqueValues([primaryCategory, ...mappedCategories]);
}

function pickPlatforms(hit: PlaygamaGameHit) {
  const mappedPlatforms = (hit.mobileReady || []).map((entry) => {
    const normalized = entry.trim().toLowerCase();
    if (normalized === "for desktop") return "Desktop Browser";
    if (normalized === "for android") return "Android";
    if (normalized === "for ios") return "iOS";
    return toDisplayLabel(entry);
  });

  return uniqueValues(mappedPlatforms.length ? mappedPlatforms : ["Desktop Browser"]);
}

function pickOrientation(hit: PlaygamaGameHit) {
  if (hit.screenOrientation?.horizontal) return "landscape";
  if (hit.screenOrientation?.vertical) return "portrait";
  return "landscape";
}

function normalizeLanguageList(hit: PlaygamaGameHit) {
  return uniqueValues((hit.supportedLanguages || []).map((language) => language.trim())).join(", ");
}

function buildFaq(title: string, orientation: string) {
  return [
    {
      question: `Can I play ${title} directly on GamesBrowse?`,
      answer:
        "Yes. The game runs inside an embedded Playgama iframe on the GamesBrowse detail page instead of sending players away from the site."
    },
    {
      question: "Does this page keep the Playgama partner tracking link intact?",
      answer:
        "Yes. The official Playgama embed URL is used as provided, and the clid tracking parameter remains unchanged."
    },
    {
      question: "What is the best way to play on mobile?",
      answer:
        orientation === "landscape"
          ? "Landscape orientation gives the game more room on narrow screens, especially for movement-heavy sections."
          : "Use the supported mobile controls shown by the game and switch orientation if you want a larger play area."
    }
  ];
}

function buildSummary(genreLabels: string[], platforms: string[], orientation: string) {
  return [
    { label: "Genre", value: genreLabels.join(" / ") },
    { label: "Platform", value: platforms.join(", ") },
    { label: "Orientation", value: orientation === "landscape" ? "Landscape" : "Portrait" },
    { label: "Source", value: "Playgama Partner Embed" }
  ];
}

function normalizeHit(hit: PlaygamaGameHit): PlaygamaGameItem {
  const override = copyOverrides[hit.slug];

  if (!override) {
    throw new Error(`Missing Playgama copy override for slug: ${hit.slug}`);
  }

  const embedUrl = extractIframeAttribute(hit.embed, "src") || hit.gameURL || "";

  if (!embedUrl) {
    throw new Error(`Missing Playgama embed URL for slug: ${hit.slug}`);
  }

  const iframeAllow = extractIframeAttribute(hit.embed, "allow") || "autoplay; fullscreen";
  const iframeSize = extractIframeSize(hit.embed);
  const genreLabels = uniqueValues((hit.genres || []).map((genre) => toDisplayLabel(genre)));
  const primaryCategory = pickPrimaryCategory(hit.genres || []);
  const categories = pickCategories(hit.genres || [], primaryCategory);
  const platforms = pickPlatforms(hit);
  const orientation = pickOrientation(hit);
  const tagLabels = uniqueValues(
    (hit.genres || []).map((genre) => toDisplayLabel(genre)).filter(Boolean)
  ).slice(0, 5);

  return {
    externalId: hit.id,
    title: hit.title,
    slug: hit.slug,
    source: "playgama",
    type: "iframe",
    category: primaryCategory,
    categories,
    genreLabels,
    tags: tagLabels.length ? tagLabels : ["Arcade"],
    shortDescription: override.shortDescription,
    description: override.description,
    instructions: override.instructions,
    controls: override.controls,
    gender: hit.gender,
    language: normalizeLanguageList(hit),
    thumbnail: hit.images?.[0],
    gameUrl: hit.playgamaGameUrl || hit.gameURL,
    embedUrl,
    iframeCode: hit.embed,
    iframeBaseUrl: embedUrl,
    iframeAllow,
    iframeWidth: iframeSize.width,
    iframeHeight: iframeSize.height,
    featured: true,
    popular: true,
    editorPick: true,
    newGame: true,
    createdAt: PLAYGAMA_IMPORT_DATE,
    lead: override.lead,
    overview: override.overview,
    tips: override.tips,
    faq: buildFaq(hit.title, orientation),
    summary: buildSummary(genreLabels, platforms, orientation),
    relatedSlugs: override.relatedSlugs,
    sourceName: "Playgama",
    licenseType: "partner embed",
    orientation,
    platforms,
    allowFullscreen: true
  };
}

export const playgamaGames = rawHits.map(normalizeHit);
