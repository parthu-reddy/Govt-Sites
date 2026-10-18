/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Compass,
  ExternalLink,
  Globe2,
  LayoutGrid,
  RotateCcw,
  Search,
  Sparkles,
  Table as TableIcon,
  Trash2,
} from 'lucide-react';
import {
  ContinentId,
  EnrichedCountryRecord,
  GovLevelId,
  LanguageCode,
  ServiceCategoryId,
} from './types/registry';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './data/i18n';
import { COUNTRIES_REGISTRY } from './data/countriesRegistry';
import { SUB_NATIONAL_REGISTRY } from './data/subNationalRegistry';
import { PUBLIC_GOV_APIS } from './data/publicGovApis';
import {
  isFavoriteId,
  loadFavoritesFromStorage,
  removeFavoriteById,
  SavedFavoriteItem,
  saveFavoritesToStorage,
  toggleFavoriteItem,
} from './utils/favoritesStorage';
import {
  computeRegistryStats,
  enrichCountriesRegistry,
  filterEnrichedCountries,
  getDistinctSubRegions,
} from './utils/registryFilter';
import { WorldMapCartography } from './components/WorldMapCartography';
import { InlineUrlVerifier, LiveUrlVerifierModal } from './components/LiveUrlVerifierModal';
import {
  FavoritesQuickAccessModal,
  FavoriteToggleButton,
} from './components/FavoritesQuickAccessModal';
import { CountryDetailModal } from './components/CountryDetailModal';
import { GovDocumentVaultSection } from './components/GovDocumentVaultSection';
import { SubNationalExplorerSection } from './components/SubNationalExplorerSection';
import { PublicGovApiExplorer } from './components/PublicGovApiExplorer';
import { AiCivicResearchPanel } from './components/AiCivicResearchPanel';
import { WebsiteLinkIndexSection } from './components/WebsiteLinkIndexSection';
import {
  WebsiteLinkIndexerModal,
  WebsiteLinkIndexerTarget,
} from './components/WebsiteLinkIndexerModal';
import { buildGlobalWebsiteLinkIndex } from './utils/websiteLinkIndexer';

export default function App() {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const t = TRANSLATIONS[language];
  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  // Enrich all 195+ countries with portals, states/provinces, and public APIs
  const allCountries = useMemo(
    () =>
      enrichCountriesRegistry(
        COUNTRIES_REGISTRY,
        SUB_NATIONAL_REGISTRY,
        PUBLIC_GOV_APIS
      ),
    []
  );

  const globalStats = useMemo(() => computeRegistryStats(allCountries), [allCountries]);

  const continentCounts = useMemo(() => {
    const counts: Record<Exclude<ContinentId, 'All'>, number> = {
      Africa: 0,
      Americas: 0,
      Asia: 0,
      Europe: 0,
      Oceania: 0,
    };
    for (const c of allCountries) {
      counts[c.continent] = (counts[c.continent] || 0) + 1;
    }
    return counts;
  }, [allCountries]);

  // Filter States
  const [continent, setContinent] = useState<ContinentId>('All');
  const [subRegion, setSubRegion] = useState<string>('All');
  const [category, setCategory] = useState<ServiceCategoryId>('All');
  const [level, setLevel] = useState<GovLevelId>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSavedCountriesOnly, setShowSavedCountriesOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  // Persistent Favorites State (Portals, Sub-National Sites, Public APIs & Documents)
  const [favorites, setFavorites] = useState<SavedFavoriteItem[]>(() =>
    loadFavoritesFromStorage()
  );
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState<boolean>(false);

  const handleToggleFavorite = (candidate: Omit<SavedFavoriteItem, 'savedAt'>) => {
    setFavorites((prev) => {
      const { nextItems } = toggleFavoriteItem(prev, candidate);
      saveFavoritesToStorage(nextItems);
      return nextItems;
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => {
      const nextItems = removeFavoriteById(prev, id);
      saveFavoritesToStorage(nextItems);
      return nextItems;
    });
  };

  const handleClearAllFavorites = () => {
    setFavorites([]);
    saveFavoritesToStorage([]);
  };

  const buildCountryFavoriteCandidate = (
    country: EnrichedCountryRecord
  ): Omit<SavedFavoriteItem, 'savedAt'> => ({
    id: `country:${country.iso2}`,
    itemType: 'country_portal',
    title: `${country.name} — ${country.primaryPortalName}`,
    subtitle: `${country.capital} · ${country.govTld} · ${country.totalPortalsCount} Portals`,
    countryIso2: country.iso2,
    countryName: country.name,
    url: country.primaryPortalUrl,
    categoryLabel: 'Sovereign National Portal',
  });

  // Modals & AI Research Trigger
  const [selectedCountry, setSelectedCountry] = useState<EnrichedCountryRecord | null>(null);
  const [isVerifierOpen, setIsVerifierOpen] = useState<boolean>(false);
  const [aiTriggerQuery, setAiTriggerQuery] = useState<string | null>(null);
  const [linkIndexerTarget, setLinkIndexerTarget] =
    useState<WebsiteLinkIndexerTarget | null>(null);

  const globalWebsiteLinks = useMemo(
    () => buildGlobalWebsiteLinkIndex(allCountries).allLinks,
    [allCountries]
  );

  const handleOpenWebsiteLinkIndexer = (target: {
    websiteId?: string;
    websiteTitle: string;
    websiteUrl: string;
    countryIso2: string;
    countryName: string;
    continent?: Exclude<ContinentId, 'All'>;
  }) => {
    const preIndexed = globalWebsiteLinks.filter(
      (l) =>
        (target.websiteId && l.websiteId === target.websiteId) ||
        l.websiteUrl === target.websiteUrl ||
        l.countryIso2 === target.countryIso2
    );
    setLinkIndexerTarget({
      ...target,
      preIndexedLinks: preIndexed,
    });
  };

  const availableSubRegions = useMemo(
    () => getDistinctSubRegions(allCountries, continent),
    [allCountries, continent]
  );

  const filteredCountries = useMemo(() => {
    const base = filterEnrichedCountries(allCountries, {
      continent,
      subRegion,
      category,
      level,
      searchQuery,
    });
    if (!showSavedCountriesOnly) return base;
    return base.filter((c) => isFavoriteId(favorites, `country:${c.iso2}`));
  }, [allCountries, continent, subRegion, category, level, searchQuery, showSavedCountriesOnly, favorites]);

  const displayedCountries = filteredCountries.slice(0, visibleCount);

  const handleContinentChange = (newContinent: ContinentId) => {
    setContinent(newContinent);
    setSubRegion('All');
    setVisibleCount(24);
  };

  const handleResetFilters = () => {
    setContinent('All');
    setSubRegion('All');
    setCategory('All');
    setLevel('All');
    setSearchQuery('');
    setShowSavedCountriesOnly(false);
    setVisibleCount(24);
  };

  const handleJumpToAiWithQuery = (q: string) => {
    const finalQuery =
      q.trim() ||
      'Official national and state government portals for business registration, taxation, and open data APIs';
    setAiTriggerQuery(finalQuery);
    const el = document.getElementById('civic-ai-intelligence');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div dir={currentLangMeta.dir} className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 backdrop-blur border-b border-[#DED6C6] px-6 py-4 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 font-display"
        >
          {t.brandTitle}
        </a>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav
          aria-label="Primary Registry Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700"
        >
          <a
            href="#sovereign-directory"
            className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navDirectory}
          </a>
          <a
            href="#website-link-index"
            className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Website Link Index
          </a>
          <a
            href="#official-document-vault"
            className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Official Documents
          </a>
          <a
            href="#state-local-portals"
            className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navSubNational}
          </a>
          <a
            href="#public-gov-apis"
            className="hover:text-stone-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.navLiveApis}
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsVerifierOpen(true)}
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            {t.ctaVerifyUrl}
          </button>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Institutional Operational Utility & Multilingual Accessibility Ribbon */}
        <div className="bg-[#F4EFE6] border-b border-[#DED6C6] px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-stone-600 font-mono tabular-nums">
                <span>Jurisdictions: {globalStats.totalCountries} Sovereign Nations</span>
                <span aria-hidden="true"> · </span>
                <span>{globalStats.totalSubNational} States & Provinces</span>
                <span aria-hidden="true"> · </span>
                <span>{globalStats.totalPortals.toLocaleString()} Portals</span>
                <span aria-hidden="true"> · </span>
                <a
                  href="#website-link-index"
                  className="text-[#1E3A8A] font-semibold hover:underline"
                >
                  {globalWebsiteLinks.length.toLocaleString()} Indexed Website Links
                </a>
              </div>

              <button
                type="button"
                onClick={() => setIsFavoritesModalOpen(true)}
                aria-label={`Open saved portals and APIs (${favorites.length})`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-stone-900 bg-white border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#1E3A8A] fill-current" />
                <span>Saved Portals & APIs ({favorites.length})</span>
              </button>
            </div>

            {/* Multilingual Accessibility Switcher (8 World Languages) */}
            <div
              className="flex flex-wrap items-center gap-1"
              role="group"
              aria-label="Interface Language Switcher"
            >
              <Globe2 className="w-3.5 h-3.5 text-stone-500 mr-1 shrink-0" />
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  aria-pressed={language === lang.code}
                  className={`px-2 py-0.5 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
                    language === lang.code
                      ? 'bg-stone-900 text-white font-semibold'
                      : 'text-stone-700 hover:bg-stone-200/70'
                  }`}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Section: 2-Column Asymmetric Split */}
        <section className="py-10 lg:py-14 border-b border-[#DED6C6]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Column: Editorial Lead & Global Search */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-500 font-mono">
                    {t.heroKicker}
                  </p>
                  <h1
                    className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-stone-900 mt-3 leading-[1.15]"
                    style={{ textWrap: 'balance' }}
                  >
                    {t.heroTitle}
                  </h1>
                  <p className="text-base text-stone-600 mt-4 leading-relaxed max-w-2xl">
                    {t.heroSubtitle}
                  </p>
                </div>

                {/* Primary Search & AI Grounded Lookup Box */}
                <div className="bg-white border border-[#DED6C6] rounded-lg p-5 shadow-xs space-y-3">
                  <label
                    htmlFor="global-registry-search"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600"
                  >
                    Search All 195 Countries, State/Provincial Portals, Local Services & APIs
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="global-registry-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setVisibleCount(24);
                        }}
                        placeholder={t.searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleJumpToAiWithQuery(searchQuery)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t.aiSearchButton}</span>
                    </button>
                  </div>

                  {/* Quick Jump Chips for Popular Searches */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-stone-500 mr-1">Quick Filter:</span>
                    {[
                      { label: 'United States (50 States)', query: 'United States' },
                      { label: 'India (28 States & UTs)', query: 'India' },
                      { label: 'United Kingdom (GOV.UK)', query: 'United Kingdom' },
                      { label: 'Germany (Bund & 16 Länder)', query: 'Germany' },
                      { label: 'California (ca.gov)', query: 'California' },
                      { label: 'Maharashtra (maharashtra.gov.in)', query: 'Maharashtra' },
                      { label: 'Estonia (eesti.ee)', query: 'Estonia' },
                      { label: 'Singapore (gov.sg)', query: 'Singapore' },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => {
                          setSearchQuery(chip.query);
                          setContinent('All');
                          setSubRegion('All');
                        }}
                        className="px-2.5 py-1 text-xs text-stone-700 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Cartographic Atlas */}
              <div className="lg:col-span-5">
                <WorldMapCartography
                  selectedContinent={continent}
                  onSelectContinent={handleContinentChange}
                  continentCounts={continentCounts}
                  totalPortals={globalStats.totalPortals}
                  totalSubNational={globalStats.totalSubNational}
                  totalApis={globalStats.totalApis}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 01: Sovereign Directory & Multi-Axis Filter Console */}
        <section
          id="sovereign-directory"
          aria-labelledby="directory-heading"
          className="py-12 scroll-mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-stone-500 block">
                01. Complete Sovereign & Ministerial Registry
              </span>
              <h2
                id="directory-heading"
                className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1"
              >
                Global Directory of Official National & State Portals
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono tabular-nums text-stone-600">
                {t.showingCountries}: <strong>{filteredCountries.length}</strong> /{' '}
                {allCountries.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  setShowSavedCountriesOnly((prev) => !prev);
                  setVisibleCount(24);
                }}
                aria-pressed={showSavedCountriesOnly}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  showSavedCountriesOnly
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-[#F4EFE6] text-stone-800 border border-[#DED6C6] hover:bg-[#E7E0D2]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${showSavedCountriesOnly ? 'fill-current' : ''}`} />
                <span>Saved Only</span>
              </button>

              <div
                className="inline-flex items-center p-1 bg-[#F4EFE6] border border-[#DED6C6] rounded"
                role="group"
                aria-label="Directory View Mode"
              >
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'cards'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Catalog Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                    viewMode === 'table'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Compact Index Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Persistent Saved Portals & APIs Quick-Access Shelf */}
          {favorites.length > 0 && (
            <div
              aria-label="Saved Government Portals and APIs Quick Access"
              className="mt-6 bg-white border border-[#DED6C6] rounded-lg p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                  <Bookmark className="w-4 h-4 text-[#1E3A8A] fill-current" />
                  <span>
                    Saved Favorites Quick-Access Shelf ({favorites.length} Persisted in Local
                    Storage)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsFavoritesModalOpen(true)}
                    className="font-semibold text-[#1E3A8A] hover:underline"
                  >
                    Manage & Filter All Saved ({favorites.length})
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllFavorites}
                    className="text-stone-500 hover:text-red-700 underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {favorites.slice(0, 6).map((fav) => (
                  <div
                    key={fav.id}
                    className="p-3 bg-[#FBF9F5] border border-stone-200 rounded flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-stone-500 truncate">
                        {fav.countryName} ({fav.countryIso2}) · {fav.categoryLabel}
                      </div>
                      <a
                        href={fav.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-stone-900 hover:text-[#1E3A8A] hover:underline truncate block mt-0.5"
                      >
                        {fav.title}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={fav.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open saved ${fav.title}`}
                        className="p-1.5 text-stone-700 hover:text-stone-950 rounded hover:bg-stone-200/60"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(fav.id)}
                        aria-label={`Remove ${fav.title} from saved favorites`}
                        className="p-1.5 text-stone-400 hover:text-red-700 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Dimensional Filter Console */}
          <div className="mt-6 bg-[#F4EFE6] border border-[#DED6C6] rounded-lg p-5 space-y-4">
            {/* Continent Segmented Bar */}
            <div>
              <span className="block text-xs font-semibold text-stone-700 mb-2">
                {t.filterContinent}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'] as ContinentId[]).map(
                  (cont) => (
                    <button
                      key={cont}
                      type="button"
                      onClick={() => handleContinentChange(cont)}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                        continent === cont
                          ? 'bg-stone-900 text-white'
                          : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {t.continents[cont]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Sub-Region, Service Category, and Jurisdiction Level Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#DED6C6]">
              <div>
                <label
                  htmlFor="filter-subregion-select"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  {t.filterSubRegion}
                </label>
                <select
                  id="filter-subregion-select"
                  value={subRegion}
                  onChange={(e) => {
                    setSubRegion(e.target.value);
                    setVisibleCount(24);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="All">{t.allRegions}</option>
                  {availableSubRegions.map((sr) => (
                    <option key={sr} value={sr}>
                      {sr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-category-select"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  {t.filterCategory}
                </label>
                <select
                  id="filter-category-select"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as ServiceCategoryId);
                    setVisibleCount(24);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  {Object.entries(t.categories).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filter-level-select"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  {t.filterGovLevel}
                </label>
                <select
                  id="filter-level-select"
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value as GovLevelId);
                    setVisibleCount(24);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  {Object.entries(t.levels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.resetFilters}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          {filteredCountries.length === 0 ? (
            <div className="mt-8 bg-white border border-[#DED6C6] rounded-lg p-10 text-center space-y-3">
              <p className="text-base font-semibold text-stone-900">
                No countries matched the current combination of filters for "{searchQuery}".
              </p>
              <p className="text-xs text-stone-600 max-w-lg mx-auto">
                You can reset your filters or run a live Google Search-grounded AI query to locate
                any specialized municipal, regional, or agency portal.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2]"
                >
                  {t.resetFilters}
                </button>
                <button
                  type="button"
                  onClick={() => handleJumpToAiWithQuery(searchQuery)}
                  className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554]"
                >
                  Run Grounded AI Search for "{searchQuery}"
                </button>
              </div>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {displayedCountries.map((country) => (
                <article
                  key={country.iso2}
                  className="bg-white border border-[#DED6C6] rounded-lg p-6 flex flex-col justify-between hover:border-stone-400 transition-colors"
                >
                  <div>
                    {/* Clean Unboxed Metadata Line (Zero-Pill Rule) */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 font-mono">
                      <span>{country.iso2}</span>
                      <span aria-hidden="true">·</span>
                      <span>{country.continent}</span>
                      <span aria-hidden="true">·</span>
                      <span>{country.subRegion}</span>
                      <span aria-hidden="true">·</span>
                      <span>{country.govTld}</span>
                    </div>

                    {/* Country Title */}
                    <h3 className="text-xl font-bold text-stone-900 mt-1.5">
                      {country.name}{' '}
                      <span className="text-sm font-normal text-stone-500">
                        ({country.nativeName})
                      </span>
                    </h3>

                    {/* Capital & Official Languages */}
                    <div className="text-xs text-stone-600 mt-1">
                      <span>
                        {t.capitalLabel}: <strong>{country.capital}</strong>
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>
                        {t.officialLanguagesLabel}: {country.officialLanguages.slice(0, 3).join(', ')}
                      </span>
                    </div>

                    {/* Primary National Portal Link */}
                    <div className="mt-3 pt-3 border-t border-stone-100">
                      <div className="text-xs font-semibold text-stone-800">
                        {country.primaryPortalName}
                      </div>
                      <a
                        href={country.primaryPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-mono text-[#1E3A8A] hover:underline mt-0.5 break-all"
                      >
                        <span>{country.primaryPortalUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>

                    {/* What Can Be Done Summary */}
                    <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                      {country.eGovSummary}
                    </p>

                    {/* Direct Specialized Ministerial Links */}
                    <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600 space-y-1">
                      <div className="font-mono tabular-nums text-[11px] text-stone-500">
                        <span>{country.totalPortalsCount} Total Portals</span>
                        <span aria-hidden="true"> · </span>
                        <span>{country.subNationalCount} States/Provinces</span>
                        <span aria-hidden="true"> · </span>
                        <span>{country.publicApiCount} Open Data APIs</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-1 text-xs">
                        {country.taxAuthorityUrl && (
                          <a
                            href={country.taxAuthorityUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1E3A8A] hover:underline"
                          >
                            Tax & Revenue ↗
                          </a>
                        )}
                        {country.immigrationPortalUrl && (
                          <a
                            href={country.immigrationPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1E3A8A] hover:underline"
                          >
                            Passports & Visas ↗
                          </a>
                        )}
                        {country.businessRegistryUrl && (
                          <a
                            href={country.businessRegistryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1E3A8A] hover:underline"
                          >
                            Business Registry ↗
                          </a>
                        )}
                        {(country.openDataPortalUrl || country.statisticalOfficeUrl) && (
                          <a
                            href={country.openDataPortalUrl || country.statisticalOfficeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1E3A8A] hover:underline"
                          >
                            Open Data & Stats ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Live HTTP Cross-Check + Save Favorite + Full Inspection Modal Button */}
                  <div className="mt-5 pt-3.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                    <InlineUrlVerifier
                      url={country.primaryPortalUrl}
                      verifyLabel={t.verifyLiveStatus}
                      verifyingLabel={t.verifying}
                      verifiedLabel={t.verifiedOnline}
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <FavoriteToggleButton
                        compact
                        isSaved={isFavoriteId(favorites, `country:${country.iso2}`)}
                        itemName={`${country.name} (${country.primaryPortalName})`}
                        onToggle={() =>
                          handleToggleFavorite(buildCountryFavoriteCandidate(country))
                        }
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenWebsiteLinkIndexer({
                            websiteId: `${country.iso2.toLowerCase()}-primary`,
                            websiteTitle: `${country.name} — ${country.primaryPortalName}`,
                            websiteUrl: country.primaryPortalUrl,
                            countryIso2: country.iso2,
                            countryName: country.name,
                            continent: country.continent,
                          })
                        }
                        aria-label={`Index all links for ${country.name} (${country.primaryPortalName})`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#1E3A8A]" />
                        <span>Index Links</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedCountry(country)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        {t.viewFullRegistry}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* High-Density Archival Table View */
            <div className="mt-8 bg-white border border-[#DED6C6] rounded-lg overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4EFE6] border-b border-[#DED6C6] text-stone-700 font-semibold">
                    <th className="py-3 px-4">ISO</th>
                    <th className="py-3 px-4">Sovereign State</th>
                    <th className="py-3 px-4">Continent · Sub-Region</th>
                    <th className="py-3 px-4">Gov TLD</th>
                    <th className="py-3 px-4">Primary Official Portal</th>
                    <th className="py-3 px-4 text-right">Portals / States</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {displayedCountries.map((country) => (
                    <tr key={country.iso2} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-stone-900">
                        {country.iso2}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-stone-900">{country.name}</div>
                        <div className="text-stone-500">{country.capital}</div>
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        {country.continent} · {country.subRegion}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-700">{country.govTld}</td>
                      <td className="py-3 px-4 font-mono">
                        <a
                          href={country.primaryPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
                        >
                          <span>{country.primaryPortalUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-stone-700">
                        {country.totalPortalsCount} / {country.subNationalCount}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <FavoriteToggleButton
                            compact
                            isSaved={isFavoriteId(favorites, `country:${country.iso2}`)}
                            itemName={`${country.name} (${country.primaryPortalName})`}
                            onToggle={() =>
                              handleToggleFavorite(buildCountryFavoriteCandidate(country))
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenWebsiteLinkIndexer({
                                websiteId: `${country.iso2.toLowerCase()}-primary`,
                                websiteTitle: `${country.name} — ${country.primaryPortalName}`,
                                websiteUrl: country.primaryPortalUrl,
                                countryIso2: country.iso2,
                                countryName: country.name,
                                continent: country.continent,
                              })
                            }
                            aria-label={`Index all links for ${country.name}`}
                            className="px-2.5 py-1 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] whitespace-nowrap"
                          >
                            Index Links
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCountry(country)}
                            className="px-3 py-1 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 whitespace-nowrap"
                          >
                            Inspect ({country.totalPortalsCount})
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination / Load More */}
          {visibleCount < filteredCountries.length && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 36)}
                className="px-6 py-2.5 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors"
              >
                Show Next 36 Sovereign Countries ({filteredCountries.length - visibleCount}{' '}
                remaining)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredCountries.length)}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors"
              >
                Display All {filteredCountries.length} Matched Countries
              </button>
            </div>
          )}
        </section>

        {/* Section 02: Complete Website Link & Resource Index Across All Websites */}
        <WebsiteLinkIndexSection
          allCountries={allCountries}
          language={language}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Section 03: Global Official Government Document, Form & Publication Vault */}
        <GovDocumentVaultSection
          allCountries={allCountries}
          language={language}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onJumpToAiResearch={(q) => handleJumpToAiWithQuery(q)}
        />

        {/* Section 04: State, Provincial, Regional & Local Government Services Directory */}
        <SubNationalExplorerSection
          t={t}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onOpenWebsiteLinkIndexer={handleOpenWebsiteLinkIndexer}
        />

        {/* Section 04: Verified Public Government APIs & Live Open Data Console */}
        <PublicGovApiExplorer
          t={t}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
        />

        {/* Section 05: Google Search-Grounded Civic & Local Service Intelligence */}
        <AiCivicResearchPanel
          t={t}
          language={language}
          externalQuery={aiTriggerQuery}
          onClearExternalQuery={() => setAiTriggerQuery(null)}
          allCountries={allCountries}
          onSelectCountry={(c) => setSelectedCountry(c)}
        />
      </main>

      {/* Clean Institutional Footer */}
      <footer className="bg-[#F4EFE6] border-t border-[#DED6C6] py-8 px-4 sm:px-6 lg:px-8 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-stone-900 font-display text-sm">Civis Mundi</span>
            <span aria-hidden="true"> — </span>
            <span>
              Global Sovereign, State & Municipal Government Portal & Document Registry. All
              portals, official forms, and open data endpoints are cross-checked against official
              sovereign domain registries.
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <a href="#sovereign-directory" className="hover:text-stone-900 hover:underline">
              {t.navDirectory}
            </a>
            <a href="#official-document-vault" className="hover:text-stone-900 hover:underline">
              Official Documents
            </a>
            <a href="#state-local-portals" className="hover:text-stone-900 hover:underline">
              {t.navSubNational}
            </a>
            <a href="#public-gov-apis" className="hover:text-stone-900 hover:underline">
              {t.navLiveApis}
            </a>
            <button
              type="button"
              onClick={() => setIsFavoritesModalOpen(true)}
              className="hover:text-stone-900 underline"
            >
              Saved ({favorites.length})
            </button>
            <button
              type="button"
              onClick={() => setIsVerifierOpen(true)}
              className="hover:text-stone-900 underline"
            >
              {t.ctaVerifyUrl}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CountryDetailModal
        country={selectedCountry}
        onClose={() => setSelectedCountry(null)}
        t={t}
        language={language}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onTriggerAiForCountry={(q) => handleJumpToAiWithQuery(q)}
        onOpenWebsiteLinkIndexer={handleOpenWebsiteLinkIndexer}
      />

      <WebsiteLinkIndexerModal
        target={linkIndexerTarget}
        onClose={() => setLinkIndexerTarget(null)}
        language={language}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
      />

      <FavoritesQuickAccessModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        favorites={favorites}
        onRemoveFavorite={handleRemoveFavorite}
        onClearAllFavorites={handleClearAllFavorites}
        onInspectCountryIso2={(iso2) => {
          const found = allCountries.find((c) => c.iso2 === iso2);
          if (found) setSelectedCountry(found);
        }}
      />

      <LiveUrlVerifierModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
      />
    </div>
  );
}
