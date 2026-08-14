export const site = {
  name: "Chaos Front Guide",
  url: "https://gamesbrowse.online",
  title: "Chaos Front Guide | Verified Strategy Notes",
  description:
    "An English-first Chaos Front guide site built from reproducible Demo and release testing, with dated sources and update records.",
  steamUrl: "https://store.steampowered.com/app/2770330/Chaos_Front/"
};

export const firstWaveGuides = [
  {
    title: "Beginner Guide",
    intent: "Early priorities, resources, pilots, captains, and avoidable mistakes.",
    status: "Evidence collection"
  },
  {
    title: "Combat Guide",
    intent: "Turn flow, range, terrain, counterattacks, status effects, and unit behavior.",
    status: "Evidence collection"
  },
  {
    title: "Units and Squad Building",
    intent: "Mecha, warship, fighter, artillery roles, and tested squad combinations.",
    status: "Evidence collection"
  },
  {
    title: "Missions and Choices",
    intent: "Prerequisites, outcomes, rewards, failure conditions, and recovery paths.",
    status: "Evidence collection"
  }
];

export const indexablePages = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about/", changefreq: "monthly", priority: "0.5" }
];
