/**
 * Storycards Design System Constants
 * Category definitions, colors, and labels for the application
 */

// Category enum values
export const CATEGORIES = {
  PLOT: 'plot',
  CHARACTER: 'character',
  WORLD: 'world',
  THEME: 'theme',
  TWIST: 'twist',
  SCENE: 'scene',
};

// Category display labels
export const CATEGORY_LABELS = {
  [CATEGORIES.PLOT]: 'Plot',
  [CATEGORIES.CHARACTER]: 'Character',
  [CATEGORIES.WORLD]: 'World Building',
  [CATEGORIES.THEME]: 'Theme',
  [CATEGORIES.TWIST]: 'Twist',
  [CATEGORIES.SCENE]: 'Scene',
};

// Category colors (matching CSS custom properties)
export const CATEGORY_COLORS = {
  [CATEGORIES.PLOT]: '#C8430A',      // burnt orange
  [CATEGORIES.CHARACTER]: '#1A6B5A', // forest green
  [CATEGORIES.WORLD]: '#2952A3',     // deep blue
  [CATEGORIES.THEME]: '#7B3FA8',     // purple
  [CATEGORIES.TWIST]: '#B8830A',     // amber
  [CATEGORIES.SCENE]: '#555555',     // neutral gray
};

// Category Tailwind class names for backgrounds
export const CATEGORY_BG_CLASSES = {
  [CATEGORIES.PLOT]: 'bg-plot',
  [CATEGORIES.CHARACTER]: 'bg-character',
  [CATEGORIES.WORLD]: 'bg-world',
  [CATEGORIES.THEME]: 'bg-theme',
  [CATEGORIES.TWIST]: 'bg-twist',
  [CATEGORIES.SCENE]: 'bg-scene',
};

// Array of all categories for iteration (filter pills, dropdowns)
export const CATEGORY_LIST = [
  { value: CATEGORIES.PLOT, label: CATEGORY_LABELS[CATEGORIES.PLOT], color: CATEGORY_COLORS[CATEGORIES.PLOT] },
  { value: CATEGORIES.CHARACTER, label: CATEGORY_LABELS[CATEGORIES.CHARACTER], color: CATEGORY_COLORS[CATEGORIES.CHARACTER] },
  { value: CATEGORIES.WORLD, label: CATEGORY_LABELS[CATEGORIES.WORLD], color: CATEGORY_COLORS[CATEGORIES.WORLD] },
  { value: CATEGORIES.THEME, label: CATEGORY_LABELS[CATEGORIES.THEME], color: CATEGORY_COLORS[CATEGORIES.THEME] },
  { value: CATEGORIES.TWIST, label: CATEGORY_LABELS[CATEGORIES.TWIST], color: CATEGORY_COLORS[CATEGORIES.TWIST] },
  { value: CATEGORIES.SCENE, label: CATEGORY_LABELS[CATEGORIES.SCENE], color: CATEGORY_COLORS[CATEGORIES.SCENE] },
];

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

// Card field constraints
export const CARD_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 80,
  BODY_MAX_LENGTH: 500,
};

// Board layout constants
export const BOARD_LAYOUT = {
  MIN_CARD_WIDTH: 220,
  CARD_GAP: 14,
  SIDEBAR_WIDTH: 340,
};

// Filter options including "All"
export const FILTER_OPTIONS = [
  { value: 'all', label: 'All', color: null },
  ...CATEGORY_LIST,
];

// Default deck title
export const DEFAULT_DECK_TITLE = 'Untitled deck';

// Helper function to get category color by value
export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || COLORS.muted;
}

// Helper function to get category label by value
export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}
