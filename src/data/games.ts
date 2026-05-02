import {
  GAMEPIX_SID,
  gamePixCatalogGames,
  gamePixFeedGames,
  gamePixFeedState,
  normalizeGamePixEmbedUrl
} from "./gamepix";
import { playgamaGames } from "./playgamaGames";

export type GameSource = "gamedistribution" | "gamepix" | "native" | "other" | "playgama";
export type GameType = "iframe" | "native";
export type GameStatus = "live" | "demo" | "internal";

export type SummaryItem = {
  label: string;
  value: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type CategoryDefinition = {
  slug: string;
  label: string;
  description: string;
  tone: string;
};

export type GameItem = {
  externalId?: string;
  title: string;
  slug: string;
  source: GameSource;
  type: GameType;
  category: string;
  categories?: string[];
  displayCategory?: string;
  tags: string[];
  shortDescription: string;
  description: string;
  instructions?: string;
  controls?: string;
  gender?: string[];
  ageGroup?: string;
  language?: string;
  thumbnail?: string;
  genreLabels?: string[];
  platforms?: string[];
  gameUrl?: string;
  embedUrl?: string;
  iframeCode?: string;
  iframeAllow?: string;
  iframeSandbox?: string;
  allowFullscreen?: boolean;
  gameDistributionUrl?: string;
  iframeBaseUrl?: string;
  iframeWidth?: number;
  iframeHeight?: number;
  featured?: boolean;
  popular?: boolean;
  editorPick?: boolean;
  newGame?: boolean;
  createdAt: string;
  listed?: boolean;
  noindex?: boolean;
  status?: GameStatus;
  shortTitle?: string;
  heroEyebrow?: string;
  lead?: string;
  overview?: string[];
  tips?: string[];
  faq?: FaqItem[];
  summary?: SummaryItem[];
  coverMark?: string;
  thumbnailTone?: string;
  sourceName?: string;
  licenseType?: string;
  relatedSlugs?: string[];
  nativeComponent?: string;
  orientation?: string;
};

export type ResolvedGameItem = Omit<GameItem, "category" | "categories" | "instructions" | "controls"> & {
  category: CategoryDefinition;
  categories: CategoryDefinition[];
  categorySlugs: string[];
  categoryLabels: string[];
  instructions: string[];
  controls: string[];
  summary: SummaryItem[];
  overview: string[];
  tips: string[];
  faq: FaqItem[];
  metaTitle: string;
  metaDescription: string;
  detailUrl: string;
  sourceName: string;
  licenseType: string;
  status: GameStatus;
};

export const SITE_URL = "https://gamesbrowse.online";

export const categoryDefinitions: CategoryDefinition[] = [
  {
    slug: "arcade",
    label: "Arcade",
    description: "Fast browser games built for instant starts, quick retries, and satisfying score chasing.",
    tone: "sun"
  },
  {
    slug: "action",
    label: "Action",
    description: "High-pressure browser games built around danger, fast decisions, and constant momentum.",
    tone: "ink"
  },
  {
    slug: "puzzle",
    label: "Puzzle",
    description: "Logic and pattern games focused on smart moves, matching, and compact problem solving.",
    tone: "mint"
  },
  {
    slug: "racing",
    label: "Racing",
    description: "Speed-driven browser games with drifting, lane control, and tight lap timing.",
    tone: "sky"
  },
  {
    slug: "reflex",
    label: "Reflex",
    description: "Reaction-based challenges where fast inputs and clean timing make the difference.",
    tone: "ember"
  },
  {
    slug: "clicker",
    label: "Clicker",
    description: "Incremental games built around tapping, upgrades, and steady progression loops.",
    tone: "gold"
  },
  {
    slug: "sports",
    label: "Sports",
    description: "Quick sports-inspired browser games with score pressure, timing, and replay value.",
    tone: "ocean"
  },
  {
    slug: "shooting",
    label: "Shooting",
    description: "Arcade action games focused on dodging, aiming, and fast defensive movement.",
    tone: "slate"
  },
  {
    slug: "casual",
    label: "Casual",
    description: "Low-pressure browser games that are easy to learn and comfortable to replay.",
    tone: "peach"
  }
];

const categoriesBySlug = new Map(categoryDefinitions.map((category) => [category.slug, category]));
const categoriesByLabel = new Map(
  categoryDefinitions.map((category) => [category.label.toLowerCase(), category])
);

function toCategorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryDefinition(value: string) {
  const normalizedSlug = toCategorySlug(value);
  const bySlug = categoriesBySlug.get(normalizedSlug);
  if (bySlug) return bySlug;

  const byLabel = categoriesByLabel.get(value.trim().toLowerCase());
  if (byLabel) return byLabel;

  throw new Error(`Unknown category: ${value}`);
}

function findCategoryDefinition(value: string) {
  const normalizedSlug = toCategorySlug(value);
  return categoriesBySlug.get(normalizedSlug) || categoriesByLabel.get(value.trim().toLowerCase());
}

function toList(value?: string) {
  if (!value) return [];

  const normalized = value.replace(/\r/g, "").trim();
  if (!normalized) return [];

  if (normalized.includes("\n")) {
    return normalized
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (normalized.includes(",")) {
    return normalized
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [normalized];
}

const defaultBestForByCategory: Record<string, string> = {
  arcade: "quick retry sessions and score chasing",
  action: "players who want pressure, movement, and momentum",
  puzzle: "logic-focused runs and pattern solving",
  racing: "speed control, lane reading, and clean finishes",
  reflex: "short timing tests and fast reactions",
  clicker: "casual upgrade loops and steady progression",
  sports: "quick competitive rounds and shot timing",
  shooting: "aim-heavy runs and dodge pressure",
  casual: "low-pressure sessions and easy replay"
};

function defaultPlatformValue(game: GameItem) {
  if (game.platforms?.length) return game.platforms.join(", ");
  if (game.type === "iframe") return "Desktop Browser, Mobile Web";
  return "Desktop Browser";
}

function defaultFormatValue(game: GameItem) {
  if (game.status === "demo") return "Catalog Demo";
  if (game.status === "internal") return "Internal Validation Route";
  if (game.source === "gamepix") return "GamePix Embed";
  if (game.source === "playgama") return "Playgama Embed";
  if (game.source === "gamedistribution") return "GameDistribution Embed";
  if (game.type === "native") return "Native Browser Game";
  return "Browser Game";
}

function defaultBestForValue(game: GameItem, primaryCategory: CategoryDefinition) {
  const displayCategorySlug = game.displayCategory ? toCategorySlug(game.displayCategory) : "";
  const ignoredBestForTags = new Set([
    toCategorySlug(primaryCategory.label),
    primaryCategory.slug,
    displayCategorySlug,
    "gamepix",
    "playgama",
    "gamedistribution",
    "responsive",
    "portrait",
    "landscape"
  ]);
  const explicitTags = (game.tags || [])
    .filter((tag) => !ignoredBestForTags.has(toCategorySlug(tag)))
    .slice(0, 2);

  if (explicitTags.length > 0) {
    return explicitTags.join(" and ").toLowerCase();
  }

  return defaultBestForByCategory[primaryCategory.slug] || "fast browser play";
}

function createDefaultSummary(game: GameItem, primaryCategory: CategoryDefinition) {
  return [
    { label: "Category", value: game.displayCategory || primaryCategory.label },
    { label: "Format", value: defaultFormatValue(game) },
    { label: "Platform", value: defaultPlatformValue(game) },
    { label: "Best For", value: defaultBestForValue(game, primaryCategory) }
  ];
}

function selectMetaDescription(shortDescription: string, description: string) {
  if (shortDescription.trim().length >= 60) {
    return shortDescription.trim();
  }

  return description.trim() || shortDescription.trim();
}

function defaultHeroEyebrow(game: GameItem, primaryCategory: CategoryDefinition) {
  if (game.status === "internal") return "Internal Tooling Route";
  if (game.status === "demo") return `${primaryCategory.label} Demo`;
  if (game.source === "gamepix") return `Featured ${game.displayCategory || primaryCategory.label} Game`;
  if (game.source === "playgama") return `Featured ${game.displayCategory || primaryCategory.label} Game`;
  if (game.source === "gamedistribution") return `Featured ${primaryCategory.label} Game`;
  return `${primaryCategory.label} Game`;
}

function defaultLead(game: GameItem) {
  return game.shortDescription;
}

function defaultSourceName(game: GameItem) {
  if (game.sourceName) return game.sourceName;
  if (game.source === "gamepix") return "GamePix";
  if (game.source === "playgama") return "Playgama";
  if (game.source === "gamedistribution") return "GameDistribution";
  if (game.source === "native") return "GamesBrowse";
  return "GamesBrowse Catalog";
}

function defaultLicenseType(game: GameItem) {
  if (game.licenseType) return game.licenseType;
  if (game.source === "gamepix") return "external embed";
  if (game.source === "playgama") return "partner embed";
  if (game.source === "gamedistribution") return "external embed";
  if (game.status === "demo") return "catalog demo";
  return "owned";
}

function defaultOverview(game: GameItem) {
  return game.overview?.length ? game.overview : [game.description];
}

function defaultTips(game: GameItem) {
  return game.tips?.length ? game.tips : [];
}

function defaultFaq(game: GameItem) {
  return game.faq?.length ? game.faq : [];
}

function defaultCoverMark(game: GameItem) {
  if (game.coverMark) return game.coverMark;

  return game.title
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getDefaultFrameSize(game: GameItem) {
  return {
    width: game.iframeWidth || 960,
    height: game.iframeHeight || 600
  };
}

export const games: GameItem[] = [
  ...playgamaGames,
  {
    title: "Vex X3M",
    slug: "vex-x3m",
    source: "gamedistribution",
    type: "iframe",
    category: "Racing",
    categories: ["Racing", "Bike", "Stunt", "Skill", "Action"],
    tags: ["Racing", "Bike", "Stunt", "Obstacle", "Skill", "Action"],
    shortDescription:
      "Race through dangerous bike stunt levels, avoid obstacles, and reach the finish line safely.",
    description:
      "VEX X3M is an extreme hill racing game packed with bike stunts, deadly obstacles, and classic Vex-style pressure. Race through 30 dangerous levels filled with spikes, shooting knives, rockets, and lasers, reach the finish safely, and collect stars to unlock unique bike skins. Clear the full set in easy and hard mode to prove yourself as a true VEX X3M rider.",
    instructions:
      "Press Up or W to accelerate.\nUse Left or A and Right or D to tilt your bike.\nPress Backwards or S to brake.\nWatch the surroundings and follow the traffic signs.",
    controls:
      "Up or W = Accelerate\nLeft or A = Tilt left\nRight or D = Tilt right\nBackwards or S = Brake",
    gender: ["Male"],
    ageGroup: "Teens, YoungAdults",
    language: "Dutch, English, French, German, Italian, Spanish",
    gameDistributionUrl: "https://gamedistribution.com/games/vex-x3m/",
    iframeBaseUrl: "https://html5.gamedistribution.com/0a3c55fe33ba415f9b761b5831e75b27/",
    iframeWidth: 800,
    iframeHeight: 600,
    featured: true,
    popular: true,
    editorPick: true,
    newGame: true,
    createdAt: "2026-04-28",
    lead:
      "Manage your speed, keep the bike balanced, and survive every trap-filled sprint to the finish.",
    summary: [
      { label: "Genre", value: "Racing / Bike Stunt" },
      { label: "Platform", value: "Browser, Mobile Web" },
      { label: "Goal", value: "Reach the finish safely" },
      { label: "Best For", value: "Obstacle-heavy stunt runs" }
    ],
    overview: [
      "Vex X3M mixes precise bike control with the punishing trap design the Vex series is known for, so every jump and landing matters.",
      "The GameDistribution embed stays inside the GamesBrowse detail page shell, giving the game a stable play area plus supporting content, FAQ, and related titles."
    ],
    tips: [
      "Slow down before blind jumps so you have time to correct the bike angle.",
      "Use light tilts in midair instead of over-rotating the bike.",
      "If a section feels cramped, switch to fullscreen for a wider view of the trap layout."
    ],
    faq: [
      {
        question: "Is Vex X3M hosted directly on GamesBrowse?",
        answer: "No. The game is embedded from GameDistribution inside the GamesBrowse page shell."
      },
      {
        question: "Does the page still use the GameDistribution source URL?",
        answer:
          "Yes. The iframe source remains on html5.gamedistribution.com, and the page adds gd_sdk_referrer_url automatically for the GamesBrowse route."
      },
      {
        question: "Can I play Vex X3M on mobile?",
        answer: "Yes. The page is responsive and the embedded game can load on supported mobile browsers."
      }
    ]
  },
  {
    title: "Crazy Motorcycle",
    slug: "crazy-motorcycle",
    source: "gamedistribution",
    type: "iframe",
    category: "Racing",
    categories: ["Racing", "Motorcycle", "Obstacle", "Skill", "Casual"],
    tags: ["Racing", "Motorcycle", "Bike", "Obstacle", "Skill", "Casual"],
    shortDescription:
      "Drive a motorcycle through exciting tracks, jump over gaps, avoid obstacles, and reach the finish line.",
    description:
      "Crazy Motorcycle is a fast obstacle racing game where you guide Nubik across dangerous tracks, jump over gaps, dodge hazards, and push for the finish without wrecking your bike. Each level adds new layouts and pressure, so clean control and timing matter as much as raw speed.",
    instructions:
      "On PC, use WASD or the arrow keys to drive.\nPress Space to jump.\nOn mobile, use the on-screen buttons and joystick.\nReach the finish line without crashing.",
    controls:
      "PC: WASD or Arrow Keys = Drive\nPC: Space = Jump\nMobile: On-screen buttons and joystick",
    gender: ["Male", "Female"],
    ageGroup: "Kids, Teens, YoungAdults, Adults, Seniors",
    language: "English, German, Russian, Simple English, Spanish",
    gameDistributionUrl: "https://gamedistribution.com/games/crazy-motorcycle/",
    iframeBaseUrl: "https://html5.gamedistribution.com/30637801603e46ec82b342b77f539cf3/",
    iframeWidth: 800,
    iframeHeight: 600,
    featured: true,
    popular: false,
    editorPick: false,
    newGame: true,
    createdAt: "2026-04-28",
    lead:
      "Push through the track at speed, clear the gaps cleanly, and avoid destroying the bike before the last stretch.",
    summary: [
      { label: "Genre", value: "Racing / Motorcycle" },
      { label: "Platform", value: "Browser, Mobile Web" },
      { label: "Goal", value: "Finish each obstacle track" },
      { label: "Best For", value: "Quick motorcycle challenge runs" }
    ],
    overview: [
      "Crazy Motorcycle is built around short, punchy levels where one bad landing can end the run, so throttle control and timing stay important from start to finish.",
      "On GamesBrowse, the GameDistribution version sits inside the shared iframe detail layout, so the route automatically appears across the homepage, game listings, and category pages."
    ],
    tips: [
      "Jump early enough to level out before landing on the next platform.",
      "Do not stay at full speed in cramped obstacle sections.",
      "Use the mobile controls in short inputs rather than holding them too long."
    ],
    faq: [
      {
        question: "Is Crazy Motorcycle a native GamesBrowse game?",
        answer: "No. It is embedded from GameDistribution and rendered inside the standard GamesBrowse game page."
      },
      {
        question: "Will the iframe source include the GamesBrowse game URL?",
        answer:
          "Yes. The final iframe source is generated automatically from iframeBaseUrl and appends gd_sdk_referrer_url for the Crazy Motorcycle slug."
      },
      {
        question: "Does Crazy Motorcycle work on phones?",
        answer: "Yes. The embedded page is configured for supported mobile browsers and uses the responsive iframe shell."
      }
    ]
  },
  {
    title: "Murder Mystery",
    slug: "murder-mystery",
    source: "gamedistribution",
    type: "iframe",
    category: "Action",
    categories: ["Action", "Mystery", "Multiplayer", "Strategy", "Social Deduction"],
    tags: ["Action", "Mystery", "Multiplayer", "Social Deduction", "Strategy", "Survival"],
    shortDescription:
      "Play a fast-paced social deduction game where one player is the murderer, one is the sheriff, and the rest are innocents.",
    description:
      "Murder Mystery is a fast-paced social deduction game where one player becomes the killer, another the sheriff, and everyone else starts as an innocent. Survive with logic, stealth, and quick decisions, expose the murderer before it is too late, or take over the sheriff role if the weapon is dropped during the round.",
    instructions:
      "Each round assigns you a role: Murderer, Sheriff, or Innocent.\nIf you are the Murderer, eliminate the others without getting caught.\nIf you are the Sheriff, identify and stop the Murderer.\nIf the Sheriff is defeated, another player can pick up the weapon.",
    controls: "Follow the in-game instructions.",
    gender: ["Male", "Female"],
    ageGroup: "Kids, Teens, YoungAdults, Adults, Seniors",
    language: "English",
    gameDistributionUrl: "https://gamedistribution.com/games/murder-mystery/",
    iframeBaseUrl: "https://html5.gamedistribution.com/38d45e35b9c24bd0b6029c1be21f0d05/",
    iframeWidth: 800,
    iframeHeight: 600,
    featured: true,
    popular: true,
    editorPick: false,
    newGame: true,
    createdAt: "2026-04-28",
    lead:
      "Read the room, react quickly, and decide whether to hide, hunt, or expose the killer before the round collapses.",
    summary: [
      { label: "Genre", value: "Action / Social Deduction" },
      { label: "Platform", value: "Browser, Mobile Web" },
      { label: "Goal", value: "Survive or expose the murderer" },
      { label: "Best For", value: "High-tension multiplayer rounds" }
    ],
    overview: [
      "Murder Mystery leans on fast role-reading and short bursts of decision-making, so every round can swing quickly once the murderer reveals themselves.",
      "The GamesBrowse detail route keeps the external GameDistribution build inside the same reusable page shell used by other iframe titles, including responsive sizing and fallback source access."
    ],
    tips: [
      "Stay aware of player movement patterns before making a risky decision.",
      "If you are not the sheriff, survive long enough to react when the weapon changes hands.",
      "Use fullscreen when you want a larger view of the play area on desktop."
    ],
    faq: [
      {
        question: "Is Murder Mystery hosted directly on GamesBrowse?",
        answer: "No. The game is delivered through a GameDistribution iframe inside the GamesBrowse page layout."
      },
      {
        question: "Does the generated iframe source keep the GameDistribution host?",
        answer:
          "Yes. The saved iframeBaseUrl stays on html5.gamedistribution.com, and the page appends gd_sdk_referrer_url automatically when rendering."
      },
      {
        question: "Can Murder Mystery be played on mobile browsers?",
        answer: "Yes. The game is configured for supported mobile web play and uses the same responsive iframe shell as the rest of the catalog."
      }
    ]
  },
  {
    title: "Red Light Challenge",
    slug: "red-light-challenge",
    source: "native",
    type: "native",
    category: "Reflex",
    categories: ["Reflex", "Casual"],
    tags: ["Reflex", "Timing", "Casual"],
    shortDescription: "Move on green, stop on red, and reach the finish line with clean timing.",
    description:
      "Red Light Challenge is a lightweight browser reflex game built for quick sessions on desktop and mobile.",
    instructions:
      "Start the game and watch the signal board.\nMove only while the board is green.\nRelease immediately when the board turns red.\nReach the finish line without moving during a red signal.",
    controls:
      "Desktop = Hold Space to move\nMobile = Press and hold the move button\nRestart = Reset the run at any time",
    featured: true,
    popular: true,
    editorPick: true,
    newGame: false,
    createdAt: "2026-04-20",
    nativeComponent: "red-light-challenge",
    lead:
      "Move with discipline, freeze instantly on red, and chase a cleaner finish time on each run.",
    summary: [
      { label: "Genre", value: "Reflex / Arcade" },
      { label: "Platform", value: "Browser, Mobile Web" },
      { label: "Goal", value: "Reach the finish line safely" },
      { label: "Best For", value: "Short reaction challenges" }
    ],
    overview: [
      "Red Light Challenge turns one simple rule into a tense timing loop: advance only on green, and freeze the moment the signal turns red.",
      "It is designed for fast sessions, smooth mobile play, and repeat runs where precision matters more than constant speed."
    ],
    tips: [
      "Use short bursts instead of holding too long near a signal change.",
      "Keep your eyes on the signal board, not only on your player marker.",
      "Focus on clean timing first. Speed improves naturally after that."
    ],
    faq: [
      {
        question: "Can I play Red Light Challenge for free?",
        answer: "Yes. It runs directly in the browser and can be started instantly."
      },
      {
        question: "Does the page save my best result?",
        answer: "Yes. Best time is stored locally in your browser."
      },
      {
        question: "Does it work on phones?",
        answer: "Yes. The game includes touch-friendly hold controls for mobile play."
      }
    ],
    relatedSlugs: ["only-up-parkour-2", "vex-x3m", "crazy-motorcycle"]
  },
  ...gamePixCatalogGames
];

function validateGames(items: GameItem[]) {
  const seenSlugs = new Set<string>();

  for (const game of items) {
    if (seenSlugs.has(game.slug)) {
      throw new Error(`Duplicate game slug detected: ${game.slug}`);
    }

    seenSlugs.add(game.slug);

    if (Number.isNaN(new Date(game.createdAt).getTime())) {
      throw new Error(`Invalid createdAt value for ${game.slug}: ${game.createdAt}`);
    }

    getCategoryDefinition(game.category);

    if (game.type === "iframe" && game.source === "gamedistribution") {
      if (!game.iframeBaseUrl) {
        throw new Error(`Missing iframeBaseUrl for GameDistribution game: ${game.slug}`);
      }

      if (game.iframeBaseUrl.includes("gd_sdk_referrer_url=")) {
        throw new Error(`iframeBaseUrl must not include gd_sdk_referrer_url: ${game.slug}`);
      }

      if (game.iframeBaseUrl.includes("www.example.com")) {
        throw new Error(`iframeBaseUrl must not contain example.com: ${game.slug}`);
      }

      if (game.iframeBaseUrl.includes("gamesbrowse.online")) {
        throw new Error(`iframeBaseUrl must not contain gamesbrowse.online: ${game.slug}`);
      }

      const iframeUrl = new URL(game.iframeBaseUrl);

      if (iframeUrl.hostname !== "html5.gamedistribution.com") {
        throw new Error(
          `GameDistribution iframeBaseUrl must use html5.gamedistribution.com: ${game.slug}`
        );
      }
    }

    if (game.type === "iframe" && game.source === "gamepix") {
      if (!game.iframeBaseUrl) {
        throw new Error(`Missing iframeBaseUrl for GamePix game: ${game.slug}`);
      }

      const iframeUrl = new URL(normalizeGamePixEmbedUrl(game.iframeBaseUrl, game.slug));

      if (iframeUrl.hostname !== "play.gamepix.com") {
        throw new Error(`GamePix iframeBaseUrl must use play.gamepix.com: ${game.slug}`);
      }

      if (iframeUrl.searchParams.get("sid") !== GAMEPIX_SID) {
        throw new Error(`GamePix iframeBaseUrl must use sid=${GAMEPIX_SID}: ${game.slug}`);
      }
    }

    if (game.type === "iframe" && game.source === "playgama") {
      if (!game.iframeBaseUrl) {
        throw new Error(`Missing iframeBaseUrl for Playgama game: ${game.slug}`);
      }

      const iframeUrl = new URL(game.iframeBaseUrl);

      if (!iframeUrl.hostname.endsWith("playgama.com")) {
        throw new Error(`Playgama iframeBaseUrl must use playgama.com: ${game.slug}`);
      }
    }
  }
}

validateGames(games);

function resolveGame(game: GameItem): ResolvedGameItem {
  const primaryCategory = getCategoryDefinition(game.category);
  const extraCategories = (game.categories || [])
    .map((value) => findCategoryDefinition(value))
    .filter((category): category is CategoryDefinition => Boolean(category));
  const categories = Array.from(
    new Map([primaryCategory, ...extraCategories].map((category) => [category.slug, category])).values()
  );
  const frameSize = getDefaultFrameSize(game);
  const metaDescription = selectMetaDescription(game.shortDescription, game.description);

  return {
    ...game,
    category: primaryCategory,
    categories,
    categorySlugs: categories.map((category) => category.slug),
    categoryLabels: categories.map((category) => category.label),
    instructions: toList(game.instructions),
    controls: toList(game.controls),
    summary: game.summary || createDefaultSummary(game, primaryCategory),
    overview: defaultOverview(game),
    tips: defaultTips(game),
    faq: defaultFaq(game),
    metaTitle: `${game.title} - Play Free Online | GamesBrowse`,
    metaDescription,
    detailUrl: `/games/${game.slug}/`,
    listed: game.listed !== false,
    noindex: game.noindex === true,
    status: game.status || "live",
    sourceName: defaultSourceName(game),
    licenseType: defaultLicenseType(game),
    heroEyebrow: game.heroEyebrow || defaultHeroEyebrow(game, primaryCategory),
    lead: game.lead || defaultLead(game),
    thumbnailTone: game.thumbnailTone || primaryCategory.tone,
    coverMark: defaultCoverMark(game),
    iframeWidth: frameSize.width,
    iframeHeight: frameSize.height
  };
}

export const catalogGames: ResolvedGameItem[] = games.map(resolveGame);
const gamePixFeedSlugSet = new Set(gamePixFeedGames.map((game) => game.slug));

export function getGameUrl(slug: string) {
  return `${SITE_URL}/games/${slug}/`;
}

export function getGameIframeSrc(game: Pick<GameItem, "slug" | "type" | "source" | "iframeBaseUrl">) {
  if (game.type !== "iframe" || !game.iframeBaseUrl) return "";
  if (game.source === "gamepix") return normalizeGamePixEmbedUrl(game.iframeBaseUrl, game.slug);
  if (game.source !== "gamedistribution") return game.iframeBaseUrl;

  const referrerUrl = getGameUrl(game.slug);
  const separator = game.iframeBaseUrl.includes("?") ? "&" : "?";

  return `${game.iframeBaseUrl}${separator}gd_sdk_referrer_url=${encodeURIComponent(referrerUrl)}`;
}

export function getGameFrameRatio(game: Pick<GameItem, "iframeWidth" | "iframeHeight">) {
  const width = game.iframeWidth || 960;
  const height = game.iframeHeight || 600;
  return `${width}:${height}`;
}

export function getListedGames() {
  return catalogGames.filter((game) => game.listed !== false);
}

export function getDiscoverableGames() {
  return getListedGames().filter((game) => !game.noindex);
}

export function getIndexableGames() {
  return getDiscoverableGames();
}

export function getGameBySlug(slug: string) {
  return catalogGames.find((game) => game.slug === slug);
}

export function getGamePixFeedState() {
  return gamePixFeedState;
}

export function getGamePixFeedGames(limit = 12) {
  return getDiscoverableGames().filter((game) => gamePixFeedSlugSet.has(game.slug)).slice(0, limit);
}

export function getHomeShowcaseGames(limit = 4) {
  const showcase = [
    getGameBySlug("buckshot-roulette"),
    ...getGamePixFeedGames(limit),
    ...getFeaturedGames(limit)
  ].filter((game): game is ResolvedGameItem => Boolean(game));

  return Array.from(new Map(showcase.map((game) => [game.slug, game])).values()).slice(0, limit);
}

export function getCategoryCatalog() {
  const discoverableGames = getDiscoverableGames();

  return categoryDefinitions.map((category) => {
    const gameCount = discoverableGames.filter((game) => game.categorySlugs.includes(category.slug)).length;

    return {
      ...category,
      gameCount
    };
  });
}

export function getCategoryBySlug(slug: string) {
  return getCategoryCatalog().find((category) => category.slug === slug);
}

export function getGamesByCategory(slug: string) {
  return getDiscoverableGames()
    .filter((game) => game.categorySlugs.includes(slug))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getFeaturedGames(limit = 8) {
  return getDiscoverableGames()
    .filter((game) => game.featured)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getPopularGames(limit = 12) {
  return getDiscoverableGames()
    .filter((game) => game.popular)
    .sort((a, b) => {
      if (Number(b.featured) !== Number(a.featured)) {
        return Number(b.featured) - Number(a.featured);
      }

      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, limit);
}

export function getEditorPickGames(limit = 8) {
  return getDiscoverableGames()
    .filter((game) => game.editorPick)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getNewGames(limit = 8) {
  return getDiscoverableGames()
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getRelatedGames(currentSlug: string, limit = 8) {
  const current = getGameBySlug(currentSlug);
  if (!current) return [];

  const preferred = (current.relatedSlugs || [])
    .map((slug) => getGameBySlug(slug))
    .filter((game): game is ResolvedGameItem => Boolean(game))
    .filter((game) => game.listed !== false && !game.noindex && game.slug !== current.slug);

  const rankedFallback = getDiscoverableGames()
    .filter((game) => game.slug !== current.slug)
    .filter((game) => !preferred.some((entry) => entry.slug === game.slug))
    .sort((a, b) => {
      const sharedCategoryDelta =
        b.categorySlugs.filter((slug) => current.categorySlugs.includes(slug)).length -
        a.categorySlugs.filter((slug) => current.categorySlugs.includes(slug)).length;

      if (sharedCategoryDelta !== 0) return sharedCategoryDelta;

      const sharedTagDelta =
        b.tags.filter((tag) => current.tags.includes(tag)).length -
        a.tags.filter((tag) => current.tags.includes(tag)).length;

      if (sharedTagDelta !== 0) return sharedTagDelta;

      return b.createdAt.localeCompare(a.createdAt);
    });

  return [...preferred, ...rankedFallback].slice(0, limit);
}
