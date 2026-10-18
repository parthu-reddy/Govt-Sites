import React, { useState } from 'react';
import { Bookmark, Database, ExternalLink, Loader2, Play } from 'lucide-react';
import { PUBLIC_GOV_APIS } from '../data/publicGovApis';
import { PublicGovApiSpec } from '../types/registry';
import { TranslationStrings } from '../data/i18n';
import { isFavoriteId, SavedFavoriteItem } from '../utils/favoritesStorage';
import { FavoriteToggleButton } from './FavoritesQuickAccessModal';

interface PublicGovApiExplorerProps {
  t: TranslationStrings;
  favorites: SavedFavoriteItem[];
  onToggleFavorite: (candidate: Omit<SavedFavoriteItem, 'savedAt'>) => void;
}

export const PublicGovApiExplorer: React.FC<PublicGovApiExplorerProps> = ({
  t,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedApi, setSelectedApi] = useState<PublicGovApiSpec>(PUBLIC_GOV_APIS[0]);
  const [customEndpoint, setCustomEndpoint] = useState<string>(PUBLIC_GOV_APIS[0].endpointUrl);
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [liveResponse, setLiveResponse] = useState<{
    ok: boolean;
    statusCode: number;
    latencyMs: number;
    endpointUrl: string;
    fetchedAt: string;
    data: any;
    error?: string;
  } | null>(null);

  const handleSelectApi = (api: PublicGovApiSpec) => {
    setSelectedApi(api);
    setCustomEndpoint(api.endpointUrl);
    setLiveResponse(null);
  };

  const buildApiFavoriteCandidate = (
    api: PublicGovApiSpec
  ): Omit<SavedFavoriteItem, 'savedAt'> => ({
    id: `api:${api.id}`,
    itemType: 'gov_api',
    title: api.title,
    subtitle: api.agency,
    countryIso2: api.countryIso2,
    countryName: api.countryName,
    url: api.docsUrl,
    apiEndpoint: api.endpointUrl,
    categoryLabel: t.categories[api.category] || 'Open Data API',
  });

  const displayedApis = showSavedOnly
    ? PUBLIC_GOV_APIS.filter((api) => isFavoriteId(favorites, `api:${api.id}`))
    : PUBLIC_GOV_APIS;

  const handleExecuteLiveFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const urlToFetch = customEndpoint.trim();
    if (!urlToFetch) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gov-data/live-api-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointUrl: urlToFetch }),
      });
      const json = await res.json();
      setLiveResponse(json);
    } catch (err: any) {
      setLiveResponse({
        ok: false,
        statusCode: 500,
        latencyMs: 0,
        endpointUrl: urlToFetch,
        fetchedAt: new Date().toISOString(),
        data: null,
        error: err?.message || 'Failed to fetch live API data',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="public-gov-apis"
      aria-labelledby="public-apis-heading"
      className="py-12 scroll-mt-16 border-t border-[#DED6C6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-stone-500 block">
              04. Machine-Readable Sovereign Infrastructure
            </span>
            <h2
              id="public-apis-heading"
              className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1"
            >
              Verified Public Government APIs & Live Open Data Console
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
              Every endpoint below is an official, documented, open-access government REST API.
              Select any national or statistical API to inspect what data it exposes, save it to
              your favorites, and fetch live records in real time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSavedOnly((prev) => !prev)}
            aria-pressed={showSavedOnly}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
              showSavedOnly
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-[#F4EFE6] text-stone-800 border border-[#DED6C6] hover:bg-[#E7E0D2]'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current' : ''}`} />
            <span>
              {showSavedOnly
                ? `Showing Saved APIs (${displayedApis.length})`
                : 'Filter: Saved APIs Only'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 items-start">
          {/* Left Column: Catalog of Verified Public Government APIs */}
          <div className="lg:col-span-5 divide-y divide-stone-200 border border-[#DED6C6] rounded-lg bg-white overflow-hidden">
            {displayedApis.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <p className="text-xs text-stone-600">
                  No public government APIs saved to favorites yet.
                </p>
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(false)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2]"
                >
                  Show All Verified APIs ({PUBLIC_GOV_APIS.length})
                </button>
              </div>
            ) : (
              displayedApis.map((api) => {
                const isSelected = selectedApi.id === api.id;
                const isApiSaved = isFavoriteId(favorites, `api:${api.id}`);
                return (
                  <div
                    key={api.id}
                    className={`p-4 transition-colors flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-[#F4EFE6]' : 'bg-white hover:bg-stone-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectApi(api)}
                      className="text-left flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
                        <span>
                          {api.countryName} ({api.countryIso2}) · {api.method} ·{' '}
                          {api.responseFormat}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-stone-900 mt-1">{api.title}</div>
                      <div className="text-xs text-stone-500 mt-0.5 truncate">{api.agency}</div>
                    </button>

                    <FavoriteToggleButton
                      compact
                      isSaved={isApiSaved}
                      itemName={api.title}
                      onToggle={() => onToggleFavorite(buildApiFavoriteCandidate(api))}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Live API Inspector & Real-Time Data Fetcher */}
          <div className="lg:col-span-7 bg-white border border-[#DED6C6] rounded-lg p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-200 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 font-mono">
                  <span>Jurisdiction: {selectedApi.countryName}</span>
                  <span aria-hidden="true">·</span>
                  <span>Category: {t.categories[selectedApi.category]}</span>
                  <span aria-hidden="true">·</span>
                  <span>Auth: Public (No API Key Required)</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900 mt-1">{selectedApi.title}</h3>
                <p className="text-xs text-stone-600 mt-0.5">{selectedApi.agency}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <FavoriteToggleButton
                  isSaved={isFavoriteId(favorites, `api:${selectedApi.id}`)}
                  itemName={selectedApi.title}
                  onToggle={() => onToggleFavorite(buildApiFavoriteCandidate(selectedApi))}
                />
                <a
                  href={selectedApi.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#D6CEBE] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Official API Docs</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">{selectedApi.description}</p>

            <div className="bg-[#FBF9F5] border border-stone-200 rounded p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                What Information Can Be Fetched & Linked from This API:
              </h4>
              <ul className="space-y-1 text-xs text-stone-700 list-disc list-inside">
                {selectedApi.whatCanBeFetched.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <form onSubmit={handleExecuteLiveFetch} className="space-y-2">
              <label
                htmlFor="live-api-endpoint-input"
                className="block text-xs font-semibold text-stone-700"
              >
                Live Government REST Endpoint URL (Editable for Custom Queries):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="live-api-endpoint-input"
                  type="text"
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[#FBF9F5] border border-stone-300 rounded text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching Live Gov API...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{selectedApi.sampleQueryLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Live Response Output */}
            {liveResponse ? (
              <div className="bg-stone-900 text-stone-100 rounded-lg p-4 font-mono text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3 border-b border-stone-700 text-stone-300">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      HTTP {liveResponse.statusCode} · {liveResponse.latencyMs}ms · Verified Source
                    </span>
                  </div>
                  <a
                    href={liveResponse.endpointUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-300 hover:underline"
                  >
                    <span>Open Raw Endpoint</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <pre className="overflow-x-auto max-h-80 text-[11px] leading-relaxed text-stone-200">
                  {JSON.stringify(liveResponse.data ?? liveResponse, null, 2).slice(0, 4500)}
                </pre>
              </div>
            ) : (
              <div className="bg-[#FBF9F5] border border-dashed border-stone-300 rounded-lg p-6 text-center">
                <p className="text-xs text-stone-600">
                  Click <strong>"{selectedApi.sampleQueryLabel}"</strong> above to execute a real
                  server-side GET request against{' '}
                  <span className="font-mono text-stone-800">{selectedApi.agency}</span> and inspect
                  the live JSON payload.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
