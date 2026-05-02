// Game source constants
export const GAME_SOURCES = {
  GAMEPIX: 'gamepix',
  PLAYGAMA: 'playgama',
  GAMEDISTRIBUTION: 'gamedistribution',
  INTERNAL: 'internal'
} as const;

export const GAME_SOURCE_NAMES = {
  [GAME_SOURCES.GAMEPIX]: 'GamePix',
  [GAME_SOURCES.PLAYGAMA]: 'PlayGama',
  [GAME_SOURCES.GAMEDISTRIBUTION]: 'Game Distribution',
  [GAME_SOURCES.INTERNAL]: 'Internal'
} as const;

// Game status constants
export const GAME_STATUS = {
  LIVE: 'live',
  DEMO: 'demo',
  INTERNAL: 'internal'
} as const;

// Game type constants
export const GAME_TYPES = {
  IFRAME: 'iframe',
  NATIVE: 'native'
} as const;

// License type constants
export const LICENSE_TYPES = {
  FREE: 'Free',
  FREEMIUM: 'Freemium',
  PREMIUM: 'Premium'
} as const;

// Orientation constants
export const ORIENTATIONS = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
  ANY: 'any'
} as const;

// Sort options
export const SORT_OPTIONS = {
  FEATURED: 'featured',
  NEWEST: 'newest',
  TITLE: 'title'
} as const;

// Category filter
export const CATEGORY_FILTER = {
  ALL: 'all'
} as const;

// Thumbnail tone constants
export const THUMBNAIL_TONES = {
  WARM: 'warm',
  COOL: 'cool',
  NEUTRAL: 'neutral',
  DARK: 'dark',
  LIGHT: 'light'
} as const;

// Frame ratios
export const FRAME_RATIOS = {
  STANDARD: '16:10',
  WIDESCREEN: '16:9',
  SQUARE: '1:1',
  PORTRAIT: '9:16'
} as const;

// Timeout constants (in milliseconds)
export const TIMEOUTS = {
  IFRAME_SLOW_LOAD: 5000,
  SEARCH_DEBOUNCE: 300
} as const;

// Max lengths
export const MAX_LENGTHS = {
  SEARCH_QUERY: 100,
  GAME_SLUG: 100,
  CARD_TAGS: 2
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  STATIC_ASSETS: 31536000, // 1 year
  IMAGES: 86400, // 1 day
  HTML: 3600 // 1 hour
} as const;
