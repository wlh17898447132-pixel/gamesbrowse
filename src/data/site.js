export const site = {
  name: "Chaos Front Guide",
  url: "https://gamesbrowse.online",
  title: "Chaos Front Guide | Official Intel & Field Notes",
  description:
    "Chaos Front release intel, official trailer footage, and evidence-led field guides for the turn-based space mecha mercenary game.",
  steamUrl: "https://store.steampowered.com/app/2770330/Chaos_Front/",
  sourceChecked: "2026-08-14",
  releaseDate: "2026-09-03",
  releaseDateLabel: "September 3, 2026",
  shareImage: "/media/chaos-front-share.webp",
  trailerUrl: "/media/chaos-front-official-trailer.mp4",
  trailerPoster: "/media/chaos-front-hero.webp"
};

export const firstWaveGuides = [
  {
    code: "GF-01",
    title: "Beginner Operations",
    intent: "Early priorities, resources, pilots, captains, and avoidable mistakes.",
    status: "Verification queue"
  },
  {
    code: "GF-02",
    title: "Combat Systems",
    intent: "Turn flow, range, terrain, counterattacks, status effects, and unit behavior.",
    status: "Verification queue"
  },
  {
    code: "GF-03",
    title: "Unit Doctrine",
    intent: "Mecha, warship, fighter, artillery roles, and tested squad combinations.",
    status: "Verification queue"
  },
  {
    code: "GF-04",
    title: "Missions & Choices",
    intent: "Prerequisites, outcomes, rewards, failure conditions, and recovery paths.",
    status: "Verification queue"
  }
];

export const indexablePages = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: "2026-08-14" },
  { path: "/release-date/", changefreq: "weekly", priority: "0.8", lastmod: "2026-08-14" },
  { path: "/about/", changefreq: "monthly", priority: "0.5", lastmod: "2026-08-14" }
];
