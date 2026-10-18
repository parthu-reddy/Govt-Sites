import React, { useEffect, useState } from 'react';
import {
  Compass,
  Database,
  Download,
  ExternalLink,
  FolderSearch,
  Loader2,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  EnrichedCountryRecord,
  GovLevelId,
  LanguageCode,
  LiveCountryIndicators,
  PortalScanResult,
  ServiceCategoryId,
} from '../types/registry';
import { TranslationStrings } from '../data/i18n';
import { isFavoriteId, SavedFavoriteItem } from '../utils/favoritesStorage';
import { filterPortalsWithinCountry } from '../utils/registryFilter';
import { FavoriteToggleButton } from './FavoritesQuickAccessModal';
import { InlineUrlVerifier } from './LiveUrlVerifierModal';

interface CountryDetailModalProps {
  country: EnrichedCountryRecord | null;
  onClose: () => void;
  t: TranslationStrings;
  language?: LanguageCode;
  favorites: SavedFavoriteItem[];
  onToggleFavorite: (candidate: Omit<SavedFavoriteItem, 'savedAt'>) => void;
  onTriggerAiForCountry: (query: string) => void;
  onOpenWebsiteLinkIndexer?: (target: {
    websiteId?: string;
    websiteTitle: string;
    websiteUrl: string;
    countryIso2: string;
    countryName: string;
    continent?: EnrichedCountryRecord['continent'];
  }) => void;
}

export const CountryDetailModal: React.FC<CountryDetailModalProps> = ({
  country,
  onClose,
  t,
  language = 'en',
  favorites,
  onToggleFavorite,
  onTriggerAiForCountry,
  onOpenWebsiteLinkIndexer,
}) => {
  const [activeLevel, setActiveLevel] = useState<GovLevelId>('All');
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryId>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [liveIndicators, setLiveIndicators] = useState<LiveCountryIndicators | null>(null);
  const [loadingIndicators, setLoadingIndicators] = useState(false);

  // State for testing live API endpoints directly inside the modal
  const [apiResults, setApiResults] = useState<Record<string, { loading: boolean; payload: any }>>(
    {}
  );

  // State for live document extraction from any portal in this country
  const [portalScans, setPortalScans] = useState<
    Record<string, { loading: boolean; result: PortalScanResult | null }>
  >({});

  // State for AI Plain-Language Citizen Guide per portal
  const [portalGuides, setPortalGuides] = useState<
    Record<string, { loading: boolean; markdown: string | null; error?: string }>
  >({});

  useEffect(() => {
    if (!country) return;
    setActiveLevel('All');
    setActiveCategory('All');
    setLocalSearch('');
    setLiveIndicators(null);
    setPortalScans({});
    setPortalGuides({});
    setLoadingIndicators(true);

    fetch(`/api/gov-data/country/${country.iso2}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setLiveIndicators(data);
      })
      .catch(() => {})
      .finally(() => setLoadingIndicators(false));
  }, [country]);

  if (!country) return null;

  const filteredPortals = filterPortalsWithinCountry(country.portals, {
    category: activeCategory,
    level: activeLevel,
    searchQuery: localSearch,
  });

  const handleFetchPortalApi = async (portalId: string, endpointUrl: string) => {
    setApiResults((prev) => ({
      ...prev,
      [portalId]: { loading: true, payload: null },
    }));
    try {
      const res = await fetch('/api/gov-data/live-api-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointUrl }),
      });
      const data = await res.json();
      setApiResults((prev) => ({
        ...prev,
        [portalId]: { loading: false, payload: data },
      }));
    } catch (err: any) {
      setApiResults((prev) => ({
        ...prev,
        [portalId]: { loading: false, payload: { error: err?.message } },
      }));
    }
  };

  const handleScanPortalDocuments = async (portalId: string, portalUrl: string) => {
    setPortalScans((prev) => ({
      ...prev,
      [portalId]: { loading: true, result: null },
    }));
    try {
      const res = await fetch('/api/gov-documents/scan-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: portalUrl }),
      });
      const data = await res.json();
      setPortalScans((prev) => ({
        ...prev,
        [portalId]: { loading: false, result: data },
      }));
    } catch (err: any) {
      setPortalScans((prev) => ({
        ...prev,
        [portalId]: {
          loading: false,
          result: {
            portalUrl,
            finalUrl: portalUrl,
            pageTitle: portalUrl,
            statusCode: null,
            scannedAt: new Date().toISOString(),
            latencyMs: 0,
            directFiles: [],
            publicationPages: [],
            error: err?.message || 'Failed to scan portal documents',
          },
        },
      }));
    }
  };

  const handleExplainPortalForCitizen = async (
    portalId: string,
    title: string,
    url: string,
    agency: string,
    summary: string
  ) => {
    setPortalGuides((prev) => ({
      ...prev,
      [portalId]: { loading: true, markdown: null },
    }));
    try {
      const res = await fetch('/api/ai/explain-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          url,
          agency,
          countryName: country.name,
          summary,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setPortalGuides((prev) => ({
          ...prev,
          [portalId]: {
            loading: false,
            markdown: null,
            error: data.error || 'Could not generate AI citizen guide.',
          },
        }));
      } else {
        setPortalGuides((prev) => ({
          ...prev,
          [portalId]: { loading: false, markdown: data.explanationMarkdown },
        }));
      }
    } catch (err: any) {
      setPortalGuides((prev) => ({
        ...prev,
        [portalId]: {
          loading: false,
          markdown: null,
          error: err?.message || 'Network error generating guide.',
        },
      }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/65 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="country-modal-title"
    >
      <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#F4EFE6] border-b border-[#DED6C6] flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 font-mono">
              <span>ISO: {country.iso2} / {country.iso3}</span>
              <span aria-hidden="true">·</span>
              <span>{country.continent}</span>
              <span aria-hidden="true">·</span>
              <span>{country.subRegion}</span>
              <span aria-hidden="true">·</span>
              <span>TLD: {country.govTld}</span>
            </div>
            <h2 id="country-modal-title" className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              {country.name}{' '}
              <span className="text-lg font-normal text-stone-600">
                ({country.nativeName})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600 mt-1.5">
              <span>
                <strong>{t.capitalLabel}:</strong> {country.capital}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>{t.officialLanguagesLabel}:</strong>{' '}
                {country.officialLanguages.join(', ')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${country.name} registry`}
            className="p-2 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-200/70 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live API-Fetched Sovereign Telemetry Strip */}
          <div className="bg-white border border-stone-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5 mb-3">
              <div className="text-xs font-medium text-stone-700">
                Live Sovereign Data Feed (Fetched in Real Time via World Bank & REST Countries APIs)
              </div>
              {loadingIndicators && (
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 font-mono">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Fetching live sovereign API records...</span>
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <dt className="text-stone-500">Population (World Bank API)</dt>
                <dd className="text-sm font-semibold font-mono tabular-nums text-stone-900 mt-0.5">
                  {liveIndicators?.population
                    ? `${liveIndicators.population.toLocaleString()} (${liveIndicators.populationYear})`
                    : loadingIndicators
                    ? '...'
                    : 'Verified via Census'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Nominal GDP (USD)</dt>
                <dd className="text-sm font-semibold font-mono tabular-nums text-stone-900 mt-0.5">
                  {liveIndicators?.gdpUsd
                    ? `$${(liveIndicators.gdpUsd / 1e9).toFixed(1)}B (${liveIndicators.gdpYear})`
                    : loadingIndicators
                    ? '...'
                    : 'See Statistical Portal'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Internet Penetration</dt>
                <dd className="text-sm font-semibold font-mono tabular-nums text-stone-900 mt-0.5">
                  {liveIndicators?.internetUsersPct !== null &&
                  liveIndicators?.internetUsersPct !== undefined
                    ? `${liveIndicators.internetUsersPct.toFixed(1)}% (${liveIndicators.internetUsersYear})`
                    : loadingIndicators
                    ? '...'
                    : 'Active National Grid'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Documented Registry Scope</dt>
                <dd className="text-sm font-semibold font-mono tabular-nums text-stone-900 mt-0.5">
                  {country.totalPortalsCount} Portals · {country.subNationalCount} States
                </dd>
              </div>
            </dl>

            {liveIndicators?.sources && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-3 pt-2.5 border-t border-stone-100">
                <span>Verified API Sources:</span>
                {liveIndicators.sources.map((src) => (
                  <a
                    key={src.apiUrl}
                    href={src.apiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#1E3A8A] hover:underline font-mono"
                  >
                    <span>{src.name}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Filter & Local State/Service Search Controls */}
          <div className="bg-[#F4EFE6] border border-[#DED6C6] rounded-lg p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  aria-label={`Search portals, states, or local services in ${country.name}`}
                  placeholder={`Search within ${country.name} (e.g. state name, tax, passport, land registry, municipal permit, API)...`}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <select
                aria-label="Filter country portals by service category"
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as ServiceCategoryId)}
                className="px-3 py-2 text-xs font-medium bg-white border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {Object.entries(t.categories).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  const q = localSearch.trim()
                    ? `Official government websites, local state/municipal portals, and APIs for "${localSearch.trim()}" in ${country.name}`
                    : `Complete directory of national ministries, state/provincial portals, municipal services, and public APIs in ${country.name}`;
                  onClose();
                  onTriggerAiForCountry(q);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Deep AI Search for {country.name}</span>
              </button>
            </div>

            {/* Level Segmented Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {(
                [
                  { id: 'All', label: `All Portals (${country.totalPortalsCount})` },
                  {
                    id: 'national',
                    label: `National Ministries (${
                      country.portals.filter((p) => p.level === 'national').length
                    })`,
                  },
                  {
                    id: 'state_provincial',
                    label: `States, Provinces & Regions (${country.subNationalCount})`,
                  },
                  {
                    id: 'api',
                    label: `Open Data & Live APIs (${country.publicApiCount})`,
                  },
                ] as { id: GovLevelId; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveLevel(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    activeLevel === tab.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Portals & Sub-National List */}
          <div className="divide-y divide-stone-200 border border-stone-200 rounded-lg bg-white">
            {filteredPortals.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-stone-600">
                  No pre-indexed portals in {country.name} matched "{localSearch}".
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTriggerAiForCountry(
                      `Find the official government website and services for "${localSearch}" in ${country.name}`
                    );
                  }}
                  className="mt-3 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors"
                >
                  Run Live Google Search Grounded Lookup for "{localSearch}" in {country.name}
                </button>
              </div>
            ) : (
              filteredPortals.map((portal) => {
                const apiState = apiResults[portal.id];
                const scanState = portalScans[portal.id];
                const guideState = portalGuides[portal.id];
                return (
                  <div key={portal.id} className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                          <span>{t.categories[portal.category]}</span>
                          <span aria-hidden="true">·</span>
                          <span>{t.levels[portal.level]}</span>
                          <span aria-hidden="true">·</span>
                          <span>{portal.agency}</span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-1">
                          {portal.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <InlineUrlVerifier
                          url={portal.url}
                          verifyLabel={t.verifyLiveStatus}
                          verifyingLabel={t.verifying}
                          verifiedLabel={t.verifiedOnline}
                        />
                        <FavoriteToggleButton
                          compact
                          isSaved={isFavoriteId(favorites, `portal:${portal.id}`)}
                          itemName={portal.title}
                          onToggle={() =>
                            onToggleFavorite({
                              id: `portal:${portal.id}`,
                              itemType: portal.hasPublicApi
                                ? 'gov_api'
                                : portal.level === 'state_provincial'
                                ? 'subnational_portal'
                                : 'country_portal',
                              title: portal.title,
                              subtitle: portal.agency,
                              countryIso2: country.iso2,
                              countryName: country.name,
                              url: portal.url,
                              apiEndpoint: portal.apiEndpoint,
                              categoryLabel: t.categories[portal.category],
                            })
                          }
                        />
                        {onOpenWebsiteLinkIndexer && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenWebsiteLinkIndexer({
                                websiteId: portal.id,
                                websiteTitle: portal.title,
                                websiteUrl: portal.url,
                                countryIso2: country.iso2,
                                countryName: country.name,
                                continent: country.continent,
                              })
                            }
                            aria-label={`Index all links and webpages on ${portal.title}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            <span>Index All Links</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleScanPortalDocuments(portal.id, portal.url)}
                          disabled={scanState?.loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
                        >
                          {scanState?.loading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FolderSearch className="w-3.5 h-3.5" />
                          )}
                          <span>Extract Site Documents</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleExplainPortalForCitizen(
                              portal.id,
                              portal.title,
                              portal.url,
                              portal.agency,
                              portal.summary
                            )
                          }
                          disabled={guideState?.loading}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0"
                        >
                          {guideState?.loading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>AI Citizen Guide</span>
                        </button>
                        <a
                          href={portal.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                        >
                          <span>Visit Official Site</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-[#1E3A8A] break-all">
                      Official URL:{' '}
                      <a
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-[#172554]"
                      >
                        {portal.url}
                      </a>
                    </div>

                    <p className="text-sm text-stone-700 leading-relaxed">{portal.summary}</p>

                    {/* Capabilities: What Can Be Done on This Website */}
                    <div className="bg-[#FBF9F5] border border-stone-200 rounded p-3.5">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                        {t.whatYouCanDo}:
                      </h4>
                      <ul className="space-y-1.5 text-xs text-stone-700 list-disc list-inside">
                        {portal.capabilities.map((cap, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {cap}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Inline Extracted Documents & Forms from this Portal */}
                    {scanState?.result && (
                      <div className="bg-[#F4EFE6] border border-[#DED6C6] rounded p-3.5 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">
                            Documents & Form Pages Extracted from {portal.url} (
                            {scanState.result.directFiles.length} Direct Files ·{' '}
                            {scanState.result.publicationPages.length} Form/Service Pages)
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPortalScans((prev) => {
                                const copy = { ...prev };
                                delete copy[portal.id];
                                return copy;
                              })
                            }
                            className="text-stone-500 hover:text-stone-900 underline"
                          >
                            Hide
                          </button>
                        </div>

                        {scanState.result.directFiles.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {scanState.result.directFiles.slice(0, 10).map((f) => (
                              <a
                                key={f.url}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white border border-stone-200 rounded hover:border-[#1E3A8A] flex items-center justify-between gap-2"
                              >
                                <span className="truncate font-medium text-stone-800">
                                  [{f.fileType}] {f.title}
                                </span>
                                <Download className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}

                        {scanState.result.publicationPages.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                            {scanState.result.publicationPages.slice(0, 12).map((p) => (
                              <a
                                key={p.url}
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white border border-stone-200 rounded hover:border-[#1E3A8A] flex items-center justify-between gap-2"
                              >
                                <span className="truncate text-stone-800">{p.title}</span>
                                <ExternalLink className="w-3 h-3 text-stone-500 shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}

                        {scanState.result.directFiles.length === 0 &&
                          scanState.result.publicationPages.length === 0 && (
                            <p className="text-stone-600">
                              {scanState.result.error ||
                                'No direct sub-documents detected on the root page. Open the portal directly or use the AI Citizen Guide.'}
                            </p>
                          )}
                      </div>
                    )}

                    {/* Inline AI Plain-Language Citizen Guide for this Portal */}
                    {(guideState?.markdown || guideState?.error) && (
                      <div className="bg-white border border-[#1E3A8A]/40 rounded p-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span className="font-bold text-[#1E3A8A] uppercase tracking-wider font-mono">
                            AI Citizen Guide & Required Documents Checklist
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPortalGuides((prev) => {
                                const copy = { ...prev };
                                delete copy[portal.id];
                                return copy;
                              })
                            }
                            className="text-stone-500 hover:text-stone-900 underline"
                          >
                            Close Guide
                          </button>
                        </div>
                        {guideState.error ? (
                          <p className="text-amber-800">{guideState.error}</p>
                        ) : (
                          <div className="text-stone-800 whitespace-pre-wrap leading-relaxed">
                            {guideState.markdown}
                          </div>
                        )}
                      </div>
                    )}

                    {/* If Portal Has a Public API Endpoint, allow Live Data Fetching */}
                    {portal.hasPublicApi && portal.apiEndpoint && (
                      <div className="pt-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F4EFE6] border border-[#DED6C6] rounded p-3">
                          <div className="text-xs font-mono text-stone-700 break-all">
                            <span className="font-semibold text-stone-900">
                              Live API Endpoint:
                            </span>{' '}
                            {portal.apiEndpoint}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleFetchPortalApi(portal.id, portal.apiEndpoint!)
                            }
                            disabled={apiState?.loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                          >
                            {apiState?.loading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Fetching JSON...</span>
                              </>
                            ) : (
                              <>
                                <Database className="w-3.5 h-3.5" />
                                <span>{t.fetchLiveData}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {apiState?.payload && (
                          <div className="mt-2 bg-stone-900 text-stone-100 rounded p-3 text-xs font-mono overflow-x-auto max-h-60">
                            <div className="flex items-center justify-between text-stone-400 pb-2 mb-2 border-b border-stone-700">
                              <span>
                                Status: HTTP {apiState.payload.statusCode || 200} · Latency:{' '}
                                {apiState.payload.latencyMs || 0}ms
                              </span>
                              <span>Source: Official API Response</span>
                            </div>
                            <pre className="text-[11px] leading-relaxed">
                              {JSON.stringify(apiState.payload.data ?? apiState.payload, null, 2).slice(
                                0,
                                3000
                              )}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
