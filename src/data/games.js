export const games = [
  {
    slug: "red-light-challenge",
    listed: true,
    noindex: false,
    title: "Red Light Challenge",
    shortTitle: "Red Light Challenge",
    metaTitle: "Play Red Light Challenge Online | GamesBrowse",
    metaDescription:
      "Play Red Light Challenge online on GamesBrowse. Move on green, freeze on red, and race to the finish in this clean browser reflex game.",
    description:
      "Red Light Challenge is a lightweight browser reflex game built for quick sessions on desktop and mobile. Move on green, stop on red, and reach the finish line with clean timing.",
    heroEyebrow: "Original Browser Mini Game",
    lead:
      "This is the first production game on GamesBrowse and the reference implementation for the new multi-page site structure.",
    category: {
      slug: "reflex",
      label: "Reflex"
    },
    tags: ["arcade", "reaction", "survival"],
    featured: true,
    playMode: "native",
    scriptEntry: "/scripts/games/red-light-challenge.js",
    thumbnailTone: "sky",
    summary: [
      { label: "Genre", value: "Arcade / Reflex" },
      { label: "Platform", value: "Browser, Mobile Web" },
      { label: "Goal", value: "Move on green, stop on red" },
      { label: "Best For", value: "Fast challenge sessions" }
    ],
    overview: [
      "Red Light Challenge turns one simple rule into a tense timing loop: advance only on green, and freeze immediately on red.",
      "The game is designed to load fast, work well on phones and desktop browsers, and serve as the first standard native game template for the expanded GamesBrowse structure."
    ],
    controls: [
      "Desktop: hold the spacebar to move and release on red.",
      "Mobile: press and hold the on-screen move button.",
      "Use Restart at any time to reset the run."
    ],
    instructions: [
      "Start a run and watch the signal board.",
      "Hold the move input only when the board shows green.",
      "Release immediately when the signal turns red.",
      "Reach the finish zone without moving on red."
    ],
    tips: [
      "Focus on clean reaction timing instead of constant pressure.",
      "Use short bursts near a signal change instead of over-holding.",
      "Keep your attention on the board, not only on the player marker."
    ],
    faq: [
      {
        question: "Can I play Red Light Challenge for free?",
        answer:
          "Yes. The game runs directly in the browser as a lightweight front-end experience."
      },
      {
        question: "Does the page store my best score?",
        answer:
          "Yes. Best time is stored locally in the browser using local storage."
      },
      {
        question: "Does it work on mobile devices?",
        answer:
          "Yes. The hold-to-move button supports touch input for phones and tablets."
      }
    ],
    recommendedGames: ["reflex-lab-demo"]
  },
  {
    slug: "reflex-lab-demo",
    listed: false,
    noindex: true,
    title: "Reflex Lab Demo",
    shortTitle: "Reflex Lab Demo",
    metaTitle: "Reflex Lab Demo iframe Shell | GamesBrowse",
    metaDescription:
      "Internal iframe demo used to validate the GamesBrowse embed shell, responsive container, and fullscreen handling.",
    description:
      "Reflex Lab Demo is an internal validation page that demonstrates how GamesBrowse can host iframe-based game experiences inside a reusable page shell.",
    heroEyebrow: "iframe Validation Page",
    lead:
      "This page exists to prove the new architecture can support iframe-based games before third-party sources are added.",
    category: {
      slug: "reflex",
      label: "Reflex"
    },
    tags: ["iframe", "prototype", "lab"],
    featured: false,
    playMode: "iframe",
    embedUrl: "/embeds/reflex-lab-demo.html",
    sourceName: "GamesBrowse Lab",
    sourceUrl: "/embeds/reflex-lab-demo.html",
    licenseType: "owned",
    embedAllowed: true,
    orientation: "landscape",
    aspectRatio: "16:9",
    allowFullscreen: true,
    iframeSandbox: "allow-scripts allow-same-origin",
    iframeAllow: "fullscreen",
    thumbnailTone: "ink",
    summary: [
      { label: "Mode", value: "iframe Prototype" },
      { label: "Purpose", value: "Embed shell validation" },
      { label: "Source", value: "GamesBrowse Lab" },
      { label: "Status", value: "Internal testing page" }
    ],
    overview: [
      "This internal page confirms that the site can render iframe-based games inside a responsive, SEO-aware layout.",
      "It also gives the project a safe place to validate fullscreen behavior, source labeling, and fallback messaging before real aggregation sources are onboarded."
    ],
    controls: [
      "Press Start inside the embedded frame.",
      "Tap when the pulse turns live.",
      "Use fullscreen to inspect container behavior."
    ],
    instructions: [
      "Load the embedded demo frame.",
      "Start the pulse sequence inside the frame.",
      "Trigger a few successful taps to validate interaction."
    ],
    tips: [
      "Use this page to validate iframe fit on desktop and mobile widths.",
      "Check fallback messaging before onboarding third-party sources.",
      "Treat this as a shell test, not a production content page."
    ],
    faq: [
      {
        question: "Why is this page hidden from listings?",
        answer:
          "It is an internal validation route used during the site migration and is marked noindex."
      },
      {
        question: "Does this prove third-party sources are allowed?",
        answer:
          "No. It proves the shell works. Every external source still needs embedding and licensing review."
      }
    ],
    recommendedGames: ["red-light-challenge"]
  }
];

export function getListedGames() {
  return games.filter((game) => game.listed !== false);
}

export function getGameBySlug(slug) {
  return games.find((game) => game.slug === slug);
}

export function getCategoryGroups() {
  const categories = new Map();

  for (const game of getListedGames()) {
    const key = game.category.slug;
    const existing = categories.get(key);

    if (existing) {
      existing.games.push(game);
    } else {
      categories.set(key, {
        slug: game.category.slug,
        label: game.category.label,
        games: [game]
      });
    }
  }

  return Array.from(categories.values());
}

export function getGamesByCategory(slug) {
  return getListedGames().filter((game) => game.category.slug === slug);
}

export function getRelatedGames(currentSlug) {
  const current = getGameBySlug(currentSlug);
  if (!current) return [];

  const preferred = (current.recommendedGames || [])
    .map((slug) => getGameBySlug(slug))
    .filter(Boolean)
    .filter((game) => game.listed !== false);

  if (preferred.length) return preferred;

  return getListedGames().filter((game) => game.slug !== currentSlug).slice(0, 3);
}
