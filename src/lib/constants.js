/**
 * Storycards Design System Constants
 * Color system, card types, tags, and layout for the application
 */

// ============================================
// CARD TYPES
// ============================================

export const CARD_TYPES = {
  STORY: 'story',
  CHARACTER: 'character',
};

// ============================================
// 10-COLOR WRITING FUNCTION SYSTEM
// ============================================

// Color keys
export const CARD_COLORS = {
  RED: 'red',
  BLUE: 'blue',
  GREEN: 'green',
  YELLOW: 'yellow',
  PURPLE: 'purple',
  ORANGE: 'orange',
  PINK: 'pink',
  GRAY: 'gray',
  BROWN: 'brown',
  TEAL: 'teal',
};

// Color hex values
export const COLOR_VALUES = {
  [CARD_COLORS.RED]: '#DC2626',
  [CARD_COLORS.BLUE]: '#2563EB',
  [CARD_COLORS.GREEN]: '#16A34A',
  [CARD_COLORS.YELLOW]: '#CA8A04',
  [CARD_COLORS.PURPLE]: '#9333EA',
  [CARD_COLORS.ORANGE]: '#EA580C',
  [CARD_COLORS.PINK]: '#DB2777',
  [CARD_COLORS.GRAY]: '#6B7280',
  [CARD_COLORS.BROWN]: '#92400E',
  [CARD_COLORS.TEAL]: '#0D9488',
};

// Default color labels (user-customizable per deck)
export const DEFAULT_COLOR_LABELS = {
  [CARD_COLORS.RED]: 'Action / High tension',
  [CARD_COLORS.BLUE]: 'Reflection / Emotion',
  [CARD_COLORS.GREEN]: 'Description / Setting',
  [CARD_COLORS.YELLOW]: 'Dialogue / Interaction',
  [CARD_COLORS.PURPLE]: 'Mystery / Omen',
  [CARD_COLORS.ORANGE]: 'Conflict escalation',
  [CARD_COLORS.PINK]: 'Relationship / Intimacy',
  [CARD_COLORS.GRAY]: 'Transition / Utility beat',
  [CARD_COLORS.BROWN]: 'Backstory / Memory',
  [CARD_COLORS.TEAL]: 'Discovery / Revelation',
};

// Color list for iteration (ColorSelector, etc.)
export const COLOR_LIST = Object.values(CARD_COLORS).map((color) => ({
  value: color,
  hex: COLOR_VALUES[color],
  defaultLabel: DEFAULT_COLOR_LABELS[color],
}));

// ============================================
// STORY FUNCTION TAGS
// ============================================

export const STORY_TAGS = [
  'Twist',
  'Reveal',
  'Setup',
  'Payoff',
  'Conflict',
  'Foreshadowing',
  'Clue',
  'Decision',
  'Reversal',
  'Theme',
  'Climax',
  'Resolution',
  'Inciting Incident',
  'Midpoint',
  'Stakes',
];

// ============================================
// VIEW MODES
// ============================================

export const VIEW_MODES = {
  MANUAL: 'manual',
  CREATED: 'created',
  COLOR: 'color',
  TAGS: 'tags',
};

export const VIEW_MODE_LABELS = {
  [VIEW_MODES.MANUAL]: 'Manual Order',
  [VIEW_MODES.CREATED]: 'Date Created',
  [VIEW_MODES.COLOR]: 'By Color',
  [VIEW_MODES.TAGS]: 'By Tags',
};

// ============================================
// BASE DESIGN SYSTEM
// ============================================

// Base design system colors
export const COLORS = {
  cream: '#FAF8F3',
  ink: '#1A1714',
  muted: '#6B665E',
  faint: '#B8B3AA',
};

// Typography font families
export const FONTS = {
  display: "'DM Serif Display', serif",
  body: "'Figtree', sans-serif",
  mono: "'DM Mono', monospace",
};

// ============================================
// CARD CONSTRAINTS
// ============================================

export const CARD_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 80,
  FRONT_TEXT_MAX_LENGTH: 500,
  BACK_TEXT_MAX_LENGTH: 1000,
};

// ============================================
// LAYOUT CONSTANTS
// ============================================

export const BOARD_LAYOUT = {
  MIN_CARD_WIDTH: 240,
  CARD_GAP: 16,
  WORKSPACE_PADDING: 32,
  WORKSPACE_PADDING_MOBILE: 16,
};

// Default deck title
export const DEFAULT_DECK_TITLE = 'Untitled deck';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get color hex value by color key
 */
export function getColorValue(color) {
  return COLOR_VALUES[color] || COLOR_VALUES[CARD_COLORS.GRAY];
}

/**
 * Get color label (from deck's custom labels or default)
 */
export function getColorLabel(color, customLabels = {}) {
  return customLabels[color] || DEFAULT_COLOR_LABELS[color] || color;
}

// ============================================
// LEGACY SUPPORT (for migration)
// ============================================

// Legacy category enum values (kept for backwards compatibility)
export const CATEGORIES = {
  PLOT: 'plot',
  CHARACTER: 'character',
  WORLD: 'world',
  THEME: 'theme',
  TWIST: 'twist',
  SCENE: 'scene',
};

// Legacy category colors
export const CATEGORY_COLORS = {
  [CATEGORIES.PLOT]: '#C8430A',
  [CATEGORIES.CHARACTER]: '#1A6B5A',
  [CATEGORIES.WORLD]: '#2952A3',
  [CATEGORIES.THEME]: '#7B3FA8',
  [CATEGORIES.TWIST]: '#B8830A',
  [CATEGORIES.SCENE]: '#555555',
};

// Map legacy category to new color
export const CATEGORY_TO_COLOR = {
  [CATEGORIES.PLOT]: CARD_COLORS.ORANGE,
  [CATEGORIES.CHARACTER]: CARD_COLORS.GREEN,
  [CATEGORIES.WORLD]: CARD_COLORS.BLUE,
  [CATEGORIES.THEME]: CARD_COLORS.PURPLE,
  [CATEGORIES.TWIST]: CARD_COLORS.RED,
  [CATEGORIES.SCENE]: CARD_COLORS.GRAY,
};

// Legacy helper (deprecated, use getColorValue instead)
export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || COLORS.muted;
}
