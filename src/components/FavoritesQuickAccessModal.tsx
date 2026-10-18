import React, { useState } from 'react';
import {
  Bookmark,
  Database,
  ExternalLink,
  Loader2,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  computeFavoritesCounts,
  FavoriteItemType,
  filterSavedFavorites,
  SavedFavoriteItem,
} from '../utils/favoritesStorage';

interface FavoriteToggleButtonProps {
  isSaved: boolean;
  onToggle: (e: React.MouseEvent) => void;
  itemName: string;
  compact?: boolean;
}

export const FavoriteToggleButton: React.FC<FavoriteToggleButtonProps> = ({
  isSaved,
  onToggle,
  itemName,
  compact = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${itemName} from saved favorites` : `Save ${itemName} to favorites`}
      className={`inline-flex items-center gap-1.5 rounded font-medium transition-colors whitespace-nowrap shrink-0 ${
        compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
      } ${
        isSaved
          ? 'bg-[#1E3A8A] text-white hover:bg-[#172554]'
          : 'bg-[#F4EFE6] text-stone-800 border border-[#DED6C6] hover:bg-[#E7E0D2]'
      }`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
      <span>{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  );
};

interface FavoritesQuickAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: SavedFavoriteItem[];
  onRemoveFavorite: (id: string) => void;
  onClearAllFavorites: () => void;
  onInspectCountryIso2?: (iso2: string) => void;
}

const TYPE_LABELS: Record<FavoriteItemType | 'All', string> = {
  All: 'All Saved Items',
  country_portal: 'National & Ministry Portals',
  subnational_portal: 'State & Regional Portals',
  gov_api: 'Public Government APIs',
  gov_document: 'Official Documents & Forms',
  website_link: 'Indexed Website Links & Pages',
};

export const FavoritesQuickAccessModal: React.FC<FavoritesQuickAccessModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onClearAllFavorites,
  onInspectCountryIso2,
}) => {
  const [typeFilter, setTypeFilter] = useState<FavoriteItemType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveApiPayloads, setLiveApiPayloads] = useState<
    Record<string, { loading: boolean; data: any }>
  >({});

  if (!isOpen) return null;

  const counts = computeFavoritesCounts(favorites);
  const filteredItems = filterSavedFavorites(favorites, typeFilter, searchQuery);

  const handleTestSavedApi = async (itemId: string, endpointUrl: string) => {
    setLiveApiPayloads((prev) => ({
      ...prev,
      [itemId]: { loading: true, data: null },
    }));
    try {
      const res = await fetch('/api/gov-data/live-api-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointUrl }),
      });
      const json = await res.json();
      setLiveApiPayloads((prev) => ({
        ...prev,
        [itemId]: { loading: false, data: json },
      }));
    } catch (err: any) {
      setLiveApiPayloads((prev) => ({
        ...prev,
        [itemId]: { loading: false, data: { error: err?.message } },
      }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="favorites-modal-title"
    >
      <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#F4EFE6] border-b border-[#DED6C6] flex items-start justify-between gap-4 shrink-0">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-mono block">
              Persistent Local Registry · Saved in Browser Storage
            </span>
            <h2
              id="favorites-modal-title"
              className="text-2xl font-bold text-stone-900 mt-0.5"
            >
              Saved Government Portals, APIs & Official Documents ({favorites.length})
            </h2>
            <p className="text-xs text-stone-600 mt-1">
              Your preferred sovereign gateways, state portals, live REST APIs, and official forms
              are automatically persisted to local storage for instant access across sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close saved favorites manager"
            className="p-2 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-200/70 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-4 bg-white border-b border-[#DED6C6] space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter saved items by type">
              {(
                [
                  'All',
                  'country_portal',
                  'subnational_portal',
                  'gov_api',
                  'gov_document',
                  'website_link',
                ] as (FavoriteItemType | 'All')[]
              ).map((tKey) => (
                <button
                  key={tKey}
                  type="button"
                  onClick={() => setTypeFilter(tKey)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    typeFilter === tKey
                      ? 'bg-stone-900 text-white'
                      : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
                  }`}
                >
                  {TYPE_LABELS[tKey]} ({counts[tKey]})
                </button>
              ))}
            </div>

            {favorites.length > 0 && (
              <button
                type="button"
                onClick={onClearAllFavorites}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-800 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Saved</span>
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search within saved portals and APIs"
              placeholder="Filter your saved portals, APIs, countries, or endpoints..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>
        </div>

        {/* Saved Items List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {favorites.length === 0 ? (
            <div className="bg-white border border-[#DED6C6] rounded-lg p-10 text-center space-y-2">
              <Bookmark className="w-7 h-7 text-stone-400 mx-auto" />
              <p className="text-base font-bold text-stone-900">
                No government portals or APIs saved yet
              </p>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Click the <strong>"Save"</strong> button on any country portal, state/provincial
                gateway, public government API, or official document card to bookmark it to your
                browser's local storage for instant access.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white border border-[#DED6C6] rounded-lg p-8 text-center">
              <p className="text-sm text-stone-700">
                No saved items matched your current filter ("{searchQuery}").
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const apiTestState = liveApiPayloads[item.id];
              return (
                <article
                  key={item.id}
                  className="bg-white border border-[#DED6C6] rounded-lg p-4 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-stone-500">
                        <span>{TYPE_LABELS[item.itemType]}</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {item.countryName} ({item.countryIso2})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.categoryLabel}</span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 mt-0.5">{item.title}</h3>
                      <p className="text-xs text-stone-600 mt-0.5">{item.subtitle}</p>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#1E3A8A] hover:underline mt-1 break-all"
                      >
                        <span>{item.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {item.apiEndpoint && (
                        <button
                          type="button"
                          onClick={() => handleTestSavedApi(item.id, item.apiEndpoint!)}
                          disabled={apiTestState?.loading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap"
                        >
                          {apiTestState?.loading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Database className="w-3.5 h-3.5" />
                          )}
                          <span>Fetch Live API</span>
                        </button>
                      )}

                      {onInspectCountryIso2 && item.countryIso2.length === 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onInspectCountryIso2(item.countryIso2);
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap"
                        >
                          Inspect {item.countryIso2} Registry
                        </button>
                      )}

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onRemoveFavorite(item.id)}
                        aria-label={`Remove ${item.title} from favorites`}
                        className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {apiTestState?.data && (
                    <div className="mt-2 bg-stone-900 text-stone-100 rounded p-3 text-xs font-mono overflow-x-auto max-h-52">
                      <div className="flex items-center justify-between text-stone-400 pb-1.5 mb-1.5 border-b border-stone-700">
                        <span>
                          Status: HTTP {apiTestState.data.statusCode || 200} · Latency:{' '}
                          {apiTestState.data.latencyMs || 0}ms
                        </span>
                        <span>Saved API Live Payload</span>
                      </div>
                      <pre className="text-[11px] leading-relaxed">
                        {JSON.stringify(apiTestState.data.data ?? apiTestState.data, null, 2).slice(
                          0,
                          2000
                        )}
                      </pre>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
