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
  platforms?: string[];
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

type GamePixCategoryProfile = {
  focus: string;
  audience: string;
  playNote: string;
  tipOne: string;
  tipTwo: string;
};

const GAMEPIX_CATEGORY_PROFILES: Record<string, GamePixCategoryProfile> = {
  Arcade: {
    focus: "quick retries, timing, and score pressure",
    audience: "players who want short arcade bursts with clear feedback",
    playNote: "look for repeatable patterns before trying to force speed",
    tipOne: "Treat the opening runs as rhythm checks so you can read the pace before pushing harder.",
    tipTwo: "When the screen gets busy, focus on one safe route instead of reacting to every distraction."
  },
  Action: {
    focus: "movement, survival pressure, and fast decisions",
    audience: "players who like constant motion and reactive play",
    playNote: "prioritize survival and position before committing to risky plays",
    tipOne: "Create a little space before attacking so you are not forced into rushed inputs.",
    tipTwo: "If the pace spikes, slow your decisions down enough to keep control of your route."
  },
  Puzzle: {
    focus: "pattern recognition, sequencing, and clean decisions",
    audience: "players who prefer logic and board-reading over raw speed",
    playNote: "scan the board or pattern first, then commit to your next move",
    tipOne: "Look for repeat structures and setup moves instead of solving each turn in isolation.",
    tipTwo: "Short pauses usually lead to cleaner decisions than rapid taps in puzzle-heavy moments."
  },
  Racing: {
    focus: "lane reading, pace control, and clean finishes",
    audience: "players who enjoy speed with steady control",
    playNote: "stay smooth through transitions instead of overcorrecting every corner",
    tipOne: "Protect your line first and let speed come from cleaner movement rather than constant full throttle.",
    tipTwo: "Use safer entries on unfamiliar sections so you can see the next obstacle sooner."
  },
  Reflex: {
    focus: "timing windows, reaction speed, and clean restarts",
    audience: "players who like short challenge loops with immediate feedback",
    playNote: "build a steady rhythm and react inside the timing window instead of rushing ahead",
    tipOne: "Keep your inputs compact so you can recover quickly when the timing changes.",
    tipTwo: "If a section feels inconsistent, watch for the cue pattern before increasing speed."
  },
  Clicker: {
    focus: "upgrade pacing, simple loops, and steady progression",
    audience: "players who enjoy relaxed improvement systems",
    playNote: "balance quick actions with the longer upgrade loop shown by the game",
    tipOne: "Early upgrades that stabilize your pace usually matter more than flashy short-term boosts.",
    tipTwo: "Check whether the game rewards frequent interaction or longer passive cycles before optimizing."
  },
  Sports: {
    focus: "timing, angle control, and compact competitive rounds",
    audience: "players who want quick sports-style matches and score chasing",
    playNote: "focus on timing and positioning instead of forcing every shot or pass",
    tipOne: "Establish a repeatable rhythm first, then push for cleaner scoring attempts.",
    tipTwo: "If the pace gets messy, reset to basic timing and rebuild from controlled plays."
  },
  Shooting: {
    focus: "aiming, spacing, and dodge pressure",
    audience: "players who want more direct action and target tracking",
    playNote: "keep enough space to aim cleanly before you commit to aggressive movement",
    tipOne: "Good positioning reduces panic shots and gives you more time to line up targets.",
    tipTwo: "When the screen fills up, prioritize the highest-risk threat instead of spraying everywhere."
  },
  Casual: {
    focus: "easy starts, readable goals, and low-pressure replay",
    audience: "players who want something simple to launch and revisit",
    playNote: "settle into the game's loop first and let the rules become obvious before chasing efficiency",
    tipOne: "A slow first run usually tells you more about the loop than trying to rush immediately.",
    tipTwo: "Use the early moments to understand the feedback the game gives for good and bad moves."
  }
};

function getGamePixCategoryProfile(category: string) {
  return GAMEPIX_CATEGORY_PROFILES[category] || GAMEPIX_CATEGORY_PROFILES.Casual;
}

function firstSentence(value: string) {
  return value.split(/(?<=[.!?])\s+/)[0]?.trim() || value.trim();
}

function gamePixPlayerShellCopy(orientation?: string) {
  if (orientation === "portrait") return "a portrait-friendly GamePix player shell";
  if (orientation === "landscape") return "a landscape-friendly GamePix player shell";
  return "a mobile-friendly GamePix player shell";
}

function gamePixFrameBehaviorCopy(orientation?: string) {
  if (orientation === "portrait") {
    return "The GamesBrowse frame keeps portrait titles readable on phones and tablets when the game allows it.";
  }

  if (orientation === "landscape") {
    return "The GamesBrowse frame gives landscape titles more room on wider screens and rotated phones.";
  }

  return "The GamesBrowse frame adapts to the available screen size when the game allows it.";
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

function createGamePixLead(title: string, internalCategory: string, description: string) {
  const profile = getGamePixCategoryProfile(internalCategory);
  const sentence = firstSentence(description);

  if (sentence && sentence.length <= 110) {
    return `${sentence} It is a good fit for ${profile.audience}.`;
  }

  return `${title} is a strong match for ${profile.audience} and players who enjoy ${profile.focus}.`;
}

function createGamePixInstructions(title: string, internalCategory: string, orientation?: string) {
  const profile = getGamePixCategoryProfile(internalCategory);
  const orientationNote =
    orientation === "portrait"
      ? "On smaller phones, portrait play usually keeps the controls closer to your thumbs."
      : "On smaller phones, landscape usually gives the play field more room.";

  return [
    `Start ${title} inside the official GamePix player and follow the in-game prompts for the active mode.`,
    `While learning the flow, ${profile.playNote}.`,
    orientationNote
  ].join("\n");
}

function createGamePixControls(orientation?: string) {
  return [
    "Keyboard, mouse, or touch controls depend on the official GamePix build for this title.",
    "Check the opening in-game prompts for the exact layout before your first full run.",
    gamePixFrameBehaviorCopy(orientation)
  ].join("\n");
}

function createGamePixOverview(
  title: string,
  description: string,
  internalCategory: string,
  displayCategory: string,
  orientation?: string
) {
  const profile = getGamePixCategoryProfile(internalCategory);

  return [
    description,
    `${title} sits in the ${displayCategory.toLowerCase()} section of the GamesBrowse catalog and works best for ${profile.audience}. This page adds standalone text guidance, FAQ content, and ${gamePixPlayerShellCopy(orientation)} so the route has value outside the iframe itself.`
  ];
}

function createGamePixFaq(
  title: string,
  internalCategory: string,
  displayCategory: string,
  orientation?: string
) {
  const profile = getGamePixCategoryProfile(internalCategory);

  return [
    {
      question: `What kind of game is ${title}?`,
      answer: `${title} is presented on GamesBrowse as a ${displayCategory.toLowerCase()} browser game built around ${profile.focus}.`
    },
    {
      question: `Can I play ${title} on mobile?`,
      answer:
        orientation === "portrait"
          ? "Yes. Portrait-oriented titles usually feel more comfortable on phones because the controls stay closer to the active play area."
          : "Yes. Landscape-oriented titles generally get more room on phones when you rotate the device for a wider play field."
    },
    {
      question: `Does ${title} run directly on GamesBrowse?`,
      answer: `The game is played through the official GamePix embed on this GamesBrowse URL, and the iframe is normalized to use sid=${GAMEPIX_SID} for this property.`
    }
  ];
}

function createGamePixTips(internalCategory: string, orientation?: string) {
  const profile = getGamePixCategoryProfile(internalCategory);

  return [
    profile.tipOne,
    profile.tipTwo,
    `If you want a larger view, use fullscreen on desktop. ${gamePixFrameBehaviorCopy(orientation)}`,
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
    instructions: createGamePixInstructions(title, internalCategory, orientation),
    controls: createGamePixControls(orientation),
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
    lead: createGamePixLead(title, internalCategory, description),
    overview: createGamePixOverview(title, description, internalCategory, displayCategory, orientation),
    tips: createGamePixTips(internalCategory, orientation),
    faq: createGamePixFaq(title, internalCategory, displayCategory, orientation),
    platforms: ["Desktop Browser", "Mobile Web"],
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
  faq: createGamePixFaq("Buckshot Roulette", "Action", "Action", "landscape"),
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
