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

export type CategoryCatalogEntry = CategoryDefinition & {
  gameCount: number;
  indexable: boolean;
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
export const MIN_CATEGORY_GAMES_FOR_INDEX = 2;

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

export function shouldIndexCategory(gameCount: number) {
  return gameCount >= MIN_CATEGORY_GAMES_FOR_INDEX;
}

export function getHomeShowcaseGames(limit = 4) {
  const showcase = [
    getGameBySlug("buckshot-roulette"),
    ...getGamePixFeedGames(limit),
    ...getFeaturedGames(limit)
  ].filter((game): game is ResolvedGameItem => Boolean(game));

  return Array.from(new Map(showcase.map((game) => [game.slug, game])).values()).slice(0, limit);
}

export function getCategoryCatalog(): CategoryCatalogEntry[] {
  const discoverableGames = getDiscoverableGames();

  return categoryDefinitions.map((category) => {
    const gameCount = discoverableGames.filter((game) => game.categorySlugs.includes(category.slug)).length;

    return {
      ...category,
      gameCount,
      indexable: shouldIndexCategory(gameCount)
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
