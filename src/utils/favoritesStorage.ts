export type FavoriteItemType =
  | 'country_portal'
  | 'subnational_portal'
  | 'gov_api'
  | 'gov_document'
  | 'website_link';

export interface SavedFavoriteItem {
  id: string;
  itemType: FavoriteItemType;
  title: string;
  subtitle: string;
  countryIso2: string;
  countryName: string;
  url: string;
  apiEndpoint?: string;
  categoryLabel: string;
  savedAt: string;
}

export const FAVORITES_STORAGE_KEY = 'civis_mundi_favorites_v1';

/**
 * Safely parses a JSON string from localStorage into a validated array of SavedFavoriteItem.
 */
export function parseFavoritesJson(raw: string | null | undefined): SavedFavoriteItem[] {
  if (!raw || typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SavedFavoriteItem =>
        Boolean(
          item &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.itemType === 'string' &&
            typeof item.title === 'string' &&
            typeof item.url === 'string'
        )
    );
  } catch {
    return [];
  }
}

/**
 * Serializes an array of SavedFavoriteItem to JSON string.
 */
export function serializeFavoritesJson(items: SavedFavoriteItem[]): string {
  return JSON.stringify(items);
}

/**
 * Checks whether an item ID is currently in the favorites list.
 */
export function isFavoriteId(items: SavedFavoriteItem[], id: string): boolean {
  return items.some((item) => item.id === id);
}

/**
 * Toggles a favorite item in the array (adds it to the front if not present; removes it if already present).
 */
export function toggleFavoriteItem(
  items: SavedFavoriteItem[],
  candidate: Omit<SavedFavoriteItem, 'savedAt'>,
  nowIso: string = new Date().toISOString()
): { nextItems: SavedFavoriteItem[]; isSaved: boolean } {
  const exists = items.some((item) => item.id === candidate.id);
  if (exists) {
    return {
      nextItems: items.filter((item) => item.id !== candidate.id),
      isSaved: false,
    };
  }
  const newItem: SavedFavoriteItem = {
    ...candidate,
    savedAt: nowIso,
  };
  return {
    nextItems: [newItem, ...items],
    isSaved: true,
  };
}

/**
 * Removes a specific favorite item by ID.
 */
export function removeFavoriteById(
  items: SavedFavoriteItem[],
  id: string
): SavedFavoriteItem[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Filters saved favorite items by type and search query.
 */
export function filterSavedFavorites(
  items: SavedFavoriteItem[],
  typeFilter: FavoriteItemType | 'All',
  searchQuery: string
): SavedFavoriteItem[] {
  const q = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (typeFilter !== 'All' && item.itemType !== typeFilter) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      item.title,
      item.subtitle,
      item.countryName,
      item.countryIso2,
      item.url,
      item.apiEndpoint || '',
      item.categoryLabel,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

/**
 * Computes summary counts by favorite item category.
 */
export function computeFavoritesCounts(items: SavedFavoriteItem[]) {
  const counts: Record<FavoriteItemType | 'All', number> = {
    All: items.length,
    country_portal: 0,
    subnational_portal: 0,
    gov_api: 0,
    gov_document: 0,
    website_link: 0,
  };
  for (const item of items) {
    counts[item.itemType] = (counts[item.itemType] || 0) + 1;
  }
  return counts;
}

/**
 * Loads favorites from browser localStorage safely.
 */
export function loadFavoritesFromStorage(): SavedFavoriteItem[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    return parseFavoritesJson(window.localStorage.getItem(FAVORITES_STORAGE_KEY));
  } catch {
    return [];
  }
}

/**
 * Saves favorites to browser localStorage safely.
 */
export function saveFavoritesToStorage(items: SavedFavoriteItem[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavoritesJson(items));
  } catch {
    // ignore storage quota errors
  }
}
