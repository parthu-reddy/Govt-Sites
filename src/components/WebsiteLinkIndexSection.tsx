import React, { useMemo, useState } from 'react';
import {
  Compass,
  ExternalLink,
  Globe,
  Link2,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import type {
  ContinentId,
  EnrichedCountryRecord,
  IndexedWebsiteLink,
  LanguageCode,
  WebsiteLinkCategory,
  WebsiteLinkResourceFormat,
} from '../types/registry';
import { isFavoriteId, SavedFavoriteItem } from '../utils/favoritesStorage';
import {
  buildGlobalWebsiteLinkIndex,
  filterIndexedWebsiteLinks,
  WEBSITE_LINK_CATEGORY_LABELS,
} from '../utils/websiteLinkIndexer';
import { FavoriteToggleButton } from './FavoritesQuickAccessModal';
import {
  WebsiteLinkIndexerModal,
  WebsiteLinkIndexerTarget,
} from './WebsiteLinkIndexerModal';

interface WebsiteLinkIndexSectionProps {
  allCountries: EnrichedCountryRecord[];
  language: LanguageCode;
  favorites: SavedFavoriteItem[];
  onToggleFavorite: (candidate: Omit<SavedFavoriteItem, 'savedAt'>) => void;
}

export const WebsiteLinkIndexSection: React.FC<WebsiteLinkIndexSectionProps> = ({
  allCountries,
  language,
  favorites,
  onToggleFavorite,
}) => {
  const { websites, allLinks } = useMemo(
    () => buildGlobalWebsiteLinkIndex(allCountries),
    [allCountries]
  );

  // Filter states
  const [continent, setContinent] = useState<ContinentId>('All');
  const [countryIso2, setCountryIso2] = useState<string>('ALL');
  const [websiteId, setWebsiteId] = useState<string>('ALL');
  const [category, setCategory] = useState<WebsiteLinkCategory>('All');
  const [resourceFormat, setResourceFormat] = useState<WebsiteLinkResourceFormat>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(18);

  // Custom URL to crawl directly
  const [customUrlToIndex, setCustomUrlToIndex] = useState<string>('');
  const [activeCrawlerTarget, setActiveCrawlerTarget] =
    useState<WebsiteLinkIndexerTarget | null>(null);

  const availableCountries = useMemo(() => {
    if (continent === 'All') return allCountries;
    return allCountries.filter((c) => c.continent === continent);
  }, [allCountries, continent]);

  const availableWebsites = useMemo(() => {
    return websites.filter((w) => {
      if (continent !== 'All' && w.continent !== continent) return false;
      if (countryIso2 !== 'ALL' && w.countryIso2 !== countryIso2) return false;
      return true;
    });
  }, [websites, continent, countryIso2]);

  const filteredLinks = useMemo(
    () =>
      filterIndexedWebsiteLinks(allLinks, {
        continent,
        countryIso2,
        websiteId,
        category,
        resourceFormat,
        searchQuery,
      }),
    [allLinks, continent, countryIso2, websiteId, category, resourceFormat, searchQuery]
  );

  const displayedLinks = filteredLinks.slice(0, visibleCount);

  const handleOpenWebsiteCrawler = (
    siteUrl: string,
    siteTitle: string,
    iso2: string,
    cName: string,
    cont: Exclude<ContinentId, 'All'> = 'Europe',
    siteId?: string
  ) => {
    const preIndexed = siteId
      ? allLinks.filter((l) => l.websiteId === siteId)
      : allLinks.filter((l) => l.websiteUrl === siteUrl);

    setActiveCrawlerTarget({
      websiteId: siteId,
      websiteTitle: siteTitle,
      websiteUrl: siteUrl,
      countryIso2: iso2,
      countryName: cName,
      continent: cont,
      preIndexedLinks: preIndexed,
    });
  };

  const handleReset = () => {
    setContinent('All');
    setCountryIso2('ALL');
    setWebsiteId('ALL');
    setCategory('All');
    setResourceFormat('All');
    setSearchQuery('');
    setVisibleCount(18);
  };

  return (
    <section
      id="website-link-index"
      aria-labelledby="website-link-index-heading"
      className="py-14 scroll-mt-16 bg-[#FBF9F5] border-t border-[#DED6C6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-stone-500 font-mono block">
              Complete Global Web & Resource Link Index · {websites.length.toLocaleString()} Websites ·{' '}
              {allLinks.length.toLocaleString()}+ Indexed Sub-Links
            </span>
            <h2
              id="website-link-index-heading"
              className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1"
            >
              Index & Search All Links, Webpages, Services & Resources Across Every Website
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
              Every single link—whether it is an informational webpage, topic guide, citizen service
              portal, ministry contact directory, downloadable form, or open data feed—is indexed
              with a clear explanation of what information it provides. You can also live-crawl any
              website URL to extract all links on that page in real time.
            </p>
          </div>

          <div className="text-xs font-mono tabular-nums text-stone-700 bg-[#F4EFE6] border border-[#DED6C6] rounded px-3.5 py-2 shrink-0">
            Matched Links: <strong>{filteredLinks.length.toLocaleString()}</strong> /{' '}
            {allLinks.length.toLocaleString()}
          </div>
        </div>

        {/* Live Custom Website Link Crawler Bar */}
        <div className="bg-[#F4EFE6] border border-[#DED6C6] rounded-lg p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Live Full-Website Link & Resource Crawler
              </h3>
              <p className="text-xs text-stone-600">
                Paste any government website URL (or click <strong>"Crawl All Site Links"</strong> on
                any card below) to extract and classify every webpage, resource, directory, and link
                on that website in real time.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = customUrlToIndex.trim();
              if (!trimmed) return;
              const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
              handleOpenWebsiteCrawler(
                normalized,
                `Live Link Index: ${normalized}`,
                'UN',
                'Live Crawled Website'
              );
            }}
            className="flex flex-col sm:flex-row gap-2.5"
          >
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={customUrlToIndex}
                onChange={(e) => setCustomUrlToIndex(e.target.value)}
                aria-label="Enter any website URL to index all its links"
                placeholder="Enter any website URL (e.g. https://www.gov.uk, https://www.usa.gov, https://www.india.gov.in, https://www.ca.gov)..."
                className="w-full pl-10 pr-4 py-2 text-xs font-mono bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0"
            >
              <Compass className="w-4 h-4" />
              <span>Crawl & Index All Website Links</span>
            </button>
          </form>

          {/* Quick One-Click Live Crawl Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
            <span className="text-stone-500 mr-1">Instant Live Crawl:</span>
            {[
              { label: 'USA.gov (United States)', url: 'https://www.usa.gov', iso2: 'US', country: 'United States' },
              { label: 'GOV.UK (United Kingdom)', url: 'https://www.gov.uk', iso2: 'GB', country: 'United Kingdom' },
              { label: 'India.gov.in (India)', url: 'https://www.india.gov.in', iso2: 'IN', country: 'India' },
              { label: 'Canada.ca (Canada)', url: 'https://www.canada.ca', iso2: 'CA', country: 'Canada' },
              { label: 'Service-Public.fr (France)', url: 'https://www.service-public.fr', iso2: 'FR', country: 'France' },
              { label: 'CA.gov (State of California)', url: 'https://www.ca.gov', iso2: 'US', country: 'United States' },
            ].map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() =>
                  handleOpenWebsiteCrawler(
                    preset.url,
                    preset.label,
                    preset.iso2,
                    preset.country
                  )
                }
                className="px-2.5 py-1 text-xs font-medium text-stone-800 bg-white border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap"
              >
                Crawl {preset.label} ↗
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Axis Link & Resource Filter Console */}
        <div className="bg-white border border-[#DED6C6] rounded-lg p-5 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(18);
              }}
              aria-label="Search all indexed website links, webpages, and resources"
              placeholder="Search across all indexed website links (e.g. passport, tax, health, directory, ministries, visa, business, statistics, land, contact)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          {/* Link Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                'All',
                'webpage_info',
                'citizen_service',
                'document_form',
                'data_api_feed',
                'directory_contact',
              ] as WebsiteLinkCategory[]
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setCategory(cat);
                  setVisibleCount(18);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
                }`}
              >
                {WEBSITE_LINK_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Selectors: Continent, Country, Specific Website, Resource Format, Reset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-stone-200">
            <div>
              <label
                htmlFor="link-index-continent"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Continent
              </label>
              <select
                id="link-index-continent"
                value={continent}
                onChange={(e) => {
                  setContinent(e.target.value as ContinentId);
                  setCountryIso2('ALL');
                  setWebsiteId('ALL');
                  setVisibleCount(18);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800"
              >
                <option value="All">All Continents (5)</option>
                <option value="Africa">Africa</option>
                <option value="Americas">Americas</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="link-index-country"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Sovereign Country
              </label>
              <select
                id="link-index-country"
                value={countryIso2}
                onChange={(e) => {
                  setCountryIso2(e.target.value);
                  setWebsiteId('ALL');
                  setVisibleCount(18);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800"
              >
                <option value="ALL">All Countries ({availableCountries.length})</option>
                {availableCountries.map((c) => (
                  <option key={c.iso2} value={c.iso2}>
                    {c.name} ({c.iso2})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="link-index-website"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Specific Website ({availableWebsites.length})
              </label>
              <select
                id="link-index-website"
                value={websiteId}
                onChange={(e) => {
                  setWebsiteId(e.target.value);
                  setVisibleCount(18);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800"
              >
                <option value="ALL">All Indexed Websites ({availableWebsites.length})</option>
                {availableWebsites.slice(0, 300).map((w) => (
                  <option key={w.websiteId} value={w.websiteId}>
                    {w.countryIso2} — {w.websiteTitle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="link-index-format"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Resource Format
              </label>
              <select
                id="link-index-format"
                value={resourceFormat}
                onChange={(e) => {
                  setResourceFormat(e.target.value as WebsiteLinkResourceFormat);
                  setVisibleCount(18);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800"
              >
                <option value="All">All Resource Types</option>
                <option value="HTML Webpage">HTML Webpage</option>
                <option value="Service Portal">Service Portal</option>
                <option value="PDF / Document">PDF / Document</option>
                <option value="Data / API / Feed">Data / API / Feed</option>
                <option value="Directory / Index">Directory / Index</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleReset}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Link Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Indexed Website Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedLinks.map((link) => {
            const favId = `link:${link.url}::${link.id}`;
            return (
              <article
                key={link.id}
                className="bg-white border border-[#DED6C6] rounded-lg p-5 flex flex-col justify-between hover:border-stone-400 transition-colors"
              >
                <div>
                  {/* Unboxed Metadata Line */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-stone-500">
                    <span className="font-semibold text-stone-800">{link.countryIso2}</span>
                    <span aria-hidden="true">·</span>
                    <span>{link.countryName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{link.resourceFormat}</span>
                    <span aria-hidden="true">·</span>
                    <span>{link.domain}</span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 mt-1.5 leading-snug">
                    {link.title}
                  </h3>

                  <div className="text-xs text-stone-500 mt-1">
                    Parent Site: <strong className="text-stone-700">{link.websiteTitle}</strong>
                  </div>

                  <div className="mt-1.5 text-xs font-mono text-[#1E3A8A] break-all">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline inline-flex items-center gap-1"
                    >
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span>{link.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Indexed Path: {link.pathSegment}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                      What Information & Capabilities This Link Provides:
                    </span>
                    <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                      {link.whatInfoItGives}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                  <FavoriteToggleButton
                    compact
                    isSaved={isFavoriteId(favorites, favId)}
                    itemName={link.title}
                    onToggle={() =>
                      onToggleFavorite({
                        id: favId,
                        itemType: 'website_link',
                        title: link.title,
                        subtitle: `${link.websiteTitle} (${link.resourceFormat})`,
                        countryIso2: link.countryIso2,
                        countryName: link.countryName,
                        url: link.url,
                        categoryLabel: WEBSITE_LINK_CATEGORY_LABELS[link.category],
                      })
                    }
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenWebsiteCrawler(
                          link.websiteUrl,
                          link.websiteTitle,
                          link.countryIso2,
                          link.countryName,
                          link.continent,
                          link.websiteId
                        )
                      }
                      aria-label={`Crawl and index all links on ${link.websiteTitle}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Crawl All Site Links</span>
                    </button>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Load More Indexed Links */}
        {visibleCount < filteredLinks.length && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 36)}
              className="px-6 py-2.5 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors"
            >
              Show Next 36 Indexed Website Links (
              {(filteredLinks.length - visibleCount).toLocaleString()} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Deep Website Link Crawler & Resource Inspector Modal */}
      <WebsiteLinkIndexerModal
        target={activeCrawlerTarget}
        onClose={() => setActiveCrawlerTarget(null)}
        language={language}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
};
