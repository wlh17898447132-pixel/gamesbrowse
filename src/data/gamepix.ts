export const GAMEPIX_SID = "EOG6S";
export const GAMEPIX_FEED_URL =
  `https://feeds.gamepix.com/v2/json?sid=${GAMEPIX_SID}&pagination=12&page=1`;

const GAMEPIX_FALLBACK_MESSAGE = "Games are temporarily unavailable. Please try again later.";

type GamePixFeedItem = {
  id?: string;
  title?: string;
  namespace?: string;
  description?: string;
  category?: string;
  orientation?: string;
  width?: number;
  height?: number;
  date_modified?: string;
  date_published?: string;
  banner_image?: string;
  image?: string;
  url?: string;
};

type GamePixFeedResponse = {
  modified?: string;
  items?: GamePixFeedItem[];
};

export type GamePixCatalogGame = {
  externalId?: string;
  title: string;
  slug: string;
  source: "gamepix";
  type: "iframe";
  category: string;
  categories?: string[];
  displayCategory?: string;
  tags: string[];
  shortDescription: string;
  description: string;
  instructions?: string;
  controls?: string;
  thumbnail?: string;
  iframeBaseUrl: string;
  iframeWidth?: number;
  iframeHeight?: number;
  featured?: boolean;
  popular?: boolean;
  editorPick?: boolean;
  newGame?: boolean;
  createdAt: string;
  status?: "live";
  lead?: string;
  overview?: string[];
  tips?: string[];
  faq?: Array<{ question: string; answer: string }>;
  sourceName?: string;
  licenseType?: string;
  orientation?: string;
};

export type GamePixFeedState = {
  available: boolean;
  message: string;
  modified: string | null;
  fetchedAt: string;
};

const INTERNAL_CATEGORY_MAP: Record<string, string> = {
  arcade: "Arcade",
  "match-3": "Puzzle",
  "2048": "Puzzle",
  memory: "Puzzle",
  puzzle: "Puzzle",
  logic: "Puzzle",
  drawing: "Puzzle",
  battle: "Action",
  action: "Action",
  stickman: "Action",
  simulation: "Casual",
  casual: "Casual",
  kids: "Casual",
  ball: "Casual",
  racing: "Racing",
  driving: "Racing",
  reflex: "Reflex",
  sports: "Sports",
  shooting: "Shooting",
  clicker: "Clicker"
};

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCaseCategory(value: string) {
  if (!value) return "Arcade";
  if (/^\d+$/.test(value)) return value;

  return value
    .replace(/_/g, "-")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function mapInternalCategory(rawCategory: string, title: string) {
  const normalized = slugify(rawCategory || "");
  if (INTERNAL_CATEGORY_MAP[normalized]) return INTERNAL_CATEGORY_MAP[normalized];

  const titleHint = `${normalized} ${slugify(title)}`;

  if (/(shoot|sniper|gun|bullet)/.test(titleHint)) return "Shooting";
  if (/(race|drive|bike|car|truck|bus)/.test(titleHint)) return "Racing";
  if (/(sport|soccer|football|basket|tennis|golf)/.test(titleHint)) return "Sports";
  if (/(puzz|match|logic|memory|draw|mahjong|2048)/.test(titleHint)) return "Puzzle";
  if (/(click|idle|tycoon)/.test(titleHint)) return "Clicker";
  if (/(reflex|timing)/.test(titleHint)) return "Reflex";
  if (/(battle|fight|war|stickman|action|survival|adventure)/.test(titleHint)) return "Action";
  if (/(arcade|ball|skill)/.test(titleHint)) return "Arcade";

  return "Casual";
}

function toShortDescription(description: string, title: string) {
  const clean = description.replace(/\s+/g, " ").trim();
  if (!clean) return `Play ${title} online on GamesBrowse.`;
  if (clean.length <= 120) return clean;

  const firstSentence = clean.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (firstSentence && firstSentence.length >= 60 && firstSentence.length <= 120) {
    return firstSentence;
  }

  return `${clean.slice(0, 117).trimEnd()}...`;
}

function toCreatedAt(value?: string) {
  if (!value) return todayStamp();

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return todayStamp();

  return parsed.toISOString().slice(0, 10);
}

function toOrientationLabel(value?: string) {
  if (!value) return "Responsive";
  if (value === "all") return "Responsive";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function normalizeGamePixEmbedUrl(input?: string, slug?: string) {
  const fallbackSlug = slug || "buckshot-roulette";

  try {
    const parsed = new URL(
      input || `https://play.gamepix.com/${fallbackSlug}/embed?sid=${GAMEPIX_SID}`
    );

    if (parsed.hostname !== "play.gamepix.com") {
      return `https://play.gamepix.com/${fallbackSlug}/embed?sid=${GAMEPIX_SID}`;
    }

    parsed.searchParams.set("sid", GAMEPIX_SID);
    return parsed.toString();
  } catch {
    return `https://play.gamepix.com/${fallbackSlug}/embed?sid=${GAMEPIX_SID}`;
  }
}

function createGenericFaq(title: string) {
  return [
    {
      question: `Can I play ${title} on GamesBrowse?`,
      answer: `Yes. ${title} is embedded on GamesBrowse through the official GamePix player.`
    },
    {
      question: "Does the iframe use the verified GamePix SID?",
      answer: `Yes. The embed URL is normalized to use sid=${GAMEPIX_SID} for this GamePix property.`
    },
    {
      question: "Will the game work on mobile browsers?",
      answer: "Yes. The play area uses a responsive iframe layout for supported mobile browsers."
    }
  ];
}

function createGenericTips(orientation?: string) {
  const orientationLabel = toOrientationLabel(orientation).toLowerCase();
  return [
    "Use fullscreen on desktop when you want the largest play area.",
    `The frame stays responsive, so ${orientationLabel} titles can fit more cleanly on smaller screens.`,
    "If the game takes longer than expected to appear, use the source link below the player."
  ];
}

function createGamePixEntry(item: GamePixFeedItem, index: number): GamePixCatalogGame | null {
  const title = item.title?.trim();
  const slug = slugify(item.namespace || title || "");

  if (!title || !slug) return null;

  const description =
    item.description?.replace(/\s+/g, " ").trim() ||
    `Play ${title} online on GamesBrowse through the official GamePix embed.`;
  const displayCategory = titleCaseCategory(item.category || "Arcade");
  const internalCategory = mapInternalCategory(item.category || "", title);
  const orientation = item.orientation || "landscape";
  const width = item.width || (orientation === "portrait" ? 600 : 800);
  const height = item.height || (orientation === "portrait" ? 800 : 600);

  return {
    externalId: item.id,
    title,
    slug,
    source: "gamepix",
    type: "iframe",
    category: internalCategory,
    categories: [internalCategory, displayCategory],
    displayCategory,
    tags: [displayCategory, "GamePix", toOrientationLabel(orientation)],
    shortDescription: toShortDescription(description, title),
    description,
    instructions:
      "Use the in-game controls shown inside the GamePix player.\nSwitch to fullscreen on desktop for a larger play area.",
    controls: "Follow the in-game control prompts.",
    thumbnail: item.banner_image || item.image,
    iframeBaseUrl: normalizeGamePixEmbedUrl(item.url, slug),
    iframeWidth: width,
    iframeHeight: height,
    featured: index < 6,
    popular: index < 12,
    editorPick: index < 4,
    newGame: index < 6,
    createdAt: toCreatedAt(item.date_published || item.date_modified),
    status: "live",
    lead: toShortDescription(description, title),
    overview: [
      description,
      "This GamePix title is embedded inside the GamesBrowse detail page with a responsive player that stays centered on desktop and flexible on mobile."
    ],
    tips: createGenericTips(orientation),
    faq: createGenericFaq(title),
    sourceName: "GamePix",
    licenseType: "external embed",
    orientation
  };
}

export const BUCKSHOT_ROULETTE_GAME: GamePixCatalogGame = {
  title: "Buckshot Roulette",
  slug: "buckshot-roulette",
  source: "gamepix",
  type: "iframe",
  category: "Action",
  categories: ["Action", "Shooting"],
  displayCategory: "Action",
  tags: ["Action", "Strategy", "Turn-Based", "GamePix"],
  shortDescription:
    "Enter the deadly arena of Buckshot Roulette, where each shotgun blast could seal your fate.",
  description:
    "Enter the deadly arena of Buckshot Roulette, where each shotgun blast could seal your fate. Strategize, manipulate, and survive in this turn-based showdown, using clever props to tip the odds. With every trigger pull, decide between life or death as you navigate this intense, thrilling gamble. Will you survive the ultimate test?",
  instructions:
    "Use the in-game controls shown inside the GamePix player.\nPlan each turn carefully before pulling the trigger.\nSwitch to fullscreen on desktop for a larger play area.",
  controls: "Follow the in-game control prompts.",
  thumbnail: "https://img.gamepix.com/games/buckshot-roulette/cover/buckshot-roulette.png?w=320",
  iframeBaseUrl: normalizeGamePixEmbedUrl(
    "https://play.gamepix.com/buckshot-roulette/embed?sid=EOG6S",
    "buckshot-roulette"
  ),
  iframeWidth: 960,
  iframeHeight: 540,
  featured: true,
  popular: true,
  editorPick: true,
  newGame: true,
  createdAt: todayStamp(),
  status: "live",
  lead:
    "Stay calm, read the odds, and make each turn count in this tense GamePix showdown.",
  overview: [
    "Enter the deadly arena of Buckshot Roulette, where each shotgun blast could seal your fate. Strategize, manipulate, and survive in this turn-based showdown, using clever props to tip the odds.",
    "GamesBrowse embeds the official GamePix player with sid=EOG6S in a responsive frame, so the game stays centered on desktop and adapts cleanly on mobile."
  ],
  tips: [
    "Slow down between turns and think through the odds before committing to an action.",
    "Use fullscreen on desktop when you want a larger view of the board and props.",
    "If the game takes longer than expected to appear, use the source link below the player."
  ],
  faq: createGenericFaq("Buckshot Roulette"),
  sourceName: "GamePix",
  licenseType: "external embed",
  orientation: "landscape"
};

async function fetchGamePixFeed() {
  try {
    const response = await fetch(GAMEPIX_FEED_URL, {
      headers: {
        accept: "application/json"
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`GamePix feed request failed with ${response.status}`);
    }

    const payload = (await response.json()) as GamePixFeedResponse;
    const items = Array.isArray(payload.items) ? payload.items : [];
    const feedGames = items
      .map((item, index) => createGamePixEntry(item, index))
      .filter((game): game is GamePixCatalogGame => Boolean(game));

    return {
      state: {
        available: feedGames.length > 0,
        message: feedGames.length > 0 ? "" : GAMEPIX_FALLBACK_MESSAGE,
        modified: payload.modified || null,
        fetchedAt: new Date().toISOString()
      },
      feedGames
    };
  } catch {
    return {
      state: {
        available: false,
        message: GAMEPIX_FALLBACK_MESSAGE,
        modified: null,
        fetchedAt: new Date().toISOString()
      },
      feedGames: [] as GamePixCatalogGame[]
    };
  }
}

function uniqueBySlug(items: GamePixCatalogGame[]) {
  const seen = new Set<string>();
  const result: GamePixCatalogGame[] = [];

  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    result.push(item);
  }

  return result;
}

const gamePixPayload = await fetchGamePixFeed();

export const gamePixFeedState: GamePixFeedState = gamePixPayload.state;
export const gamePixFeedGames: GamePixCatalogGame[] = gamePixPayload.feedGames;
export const gamePixCatalogGames: GamePixCatalogGame[] = uniqueBySlug([
  BUCKSHOT_ROULETTE_GAME,
  ...gamePixFeedGames
]);
