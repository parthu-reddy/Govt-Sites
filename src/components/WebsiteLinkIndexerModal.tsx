import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Compass,
  ExternalLink,
  FileSearch,
  Globe,
  Link2,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  ContinentId,
  DocumentInspectionResult,
  IndexedWebsiteLink,
  LanguageCode,
  LiveWebsiteLinkCrawlResult,
  WebsiteLinkCategory,
} from '../types/registry';
import { isFavoriteId, SavedFavoriteItem } from '../utils/favoritesStorage';
import { WEBSITE_LINK_CATEGORY_LABELS } from '../utils/websiteLinkIndexer';
import { FavoriteToggleButton } from './FavoritesQuickAccessModal';

export interface WebsiteLinkIndexerTarget {
  websiteId?: string;
  websiteTitle: string;
  websiteUrl: string;
  countryIso2: string;
  countryName: string;
  continent?: Exclude<ContinentId, 'All'>;
  preIndexedLinks?: IndexedWebsiteLink[];
}

interface WebsiteLinkIndexerModalProps {
  target: WebsiteLinkIndexerTarget | null;
  onClose: () => void;
  language: LanguageCode;
  favorites: SavedFavoriteItem[];
  onToggleFavorite: (candidate: Omit<SavedFavoriteItem, 'savedAt'>) => void;
}

export const WebsiteLinkIndexerModal: React.FC<WebsiteLinkIndexerModalProps> = ({
  target,
  onClose,
  language,
  favorites,
  onToggleFavorite,
}) => {
  const [customCrawlUrl, setCustomCrawlUrl] = useState<string>('');
  const [crawlHistory, setCrawlHistory] = useState<{ title: string; url: string }[]>([]);
  const [liveCrawl, setLiveCrawl] = useState<LiveWebsiteLinkCrawlResult | null>(null);
  const [isCrawling, setIsCrawling] = useState<boolean>(false);

  const [categoryFilter, setCategoryFilter] = useState<WebsiteLinkCategory>('All');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'internal' | 'external'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleLimit, setVisibleLimit] = useState<number>(40);

  // Per-link live content inspection & AI plain-language explanation state
  const [inspectedLinks, setInspectedLinks] = useState<
    Record<
      string,
      {
        loadingInspect: boolean;
        inspection: DocumentInspectionResult | null;
        loadingAi: boolean;
        aiMarkdown: string | null;
        aiError?: string;
      }
    >
  >({});

  const runLiveWebsiteCrawl = async (
    urlToCrawl: string,
    titleLabel: string,
    iso2: string,
    cName: string,
    cont: Exclude<ContinentId, 'All'> = 'Europe'
  ) => {
    setIsCrawling(true);
    setCustomCrawlUrl(urlToCrawl);
    try {
      const res = await fetch('/api/gov-links/index-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToCrawl,
          websiteTitle: titleLabel,
          countryIso2: iso2,
          countryName: cName,
          continent: cont,
        }),
      });
      const data: LiveWebsiteLinkCrawlResult = await res.json();
      setLiveCrawl(data);
      setCrawlHistory((prev) => {
        const exists = prev.some((h) => h.url === urlToCrawl);
        if (exists) return prev;
        return [...prev, { title: data.pageTitle || titleLabel, url: urlToCrawl }];
      });
    } catch (err: any) {
      setLiveCrawl({
        websiteUrl: urlToCrawl,
        finalUrl: urlToCrawl,
        pageTitle: titleLabel,
        metaDescription: '',
        statusCode: null,
        crawledAt: new Date().toISOString(),
        latencyMs: 0,
        totalLinksFound: 0,
        internalLinksCount: 0,
        externalLinksCount: 0,
        categoryBreakdown: {
          webpage_info: 0,
          citizen_service: 0,
          document_form: 0,
          data_api_feed: 0,
          directory_contact: 0,
          external_resource: 0,
        },
        links: [],
        error: err?.message || 'Could not complete live HTML link extraction.',
      });
    } finally {
      setIsCrawling(false);
    }
  };

  useEffect(() => {
    if (!target) return;
    setCategoryFilter('All');
    setScopeFilter('all');
    setSearchQuery('');
    setVisibleLimit(40);
    setCrawlHistory([{ title: target.websiteTitle, url: target.websiteUrl }]);
    setInspectedLinks({});
    runLiveWebsiteCrawl(
      target.websiteUrl,
      target.websiteTitle,
      target.countryIso2,
      target.countryName,
      target.continent || 'Europe'
    );
  }, [target]);

  // Combine pre-indexed links for this website with live-crawled HTML links (deduplicated by URL + title)
  const combinedLinks = useMemo(() => {
    if (!target) return [];
    const map = new Map<string, IndexedWebsiteLink>();

    // Put live-crawled links first so real-time HTML anchors appear prominently
    if (liveCrawl?.links) {
      for (const l of liveCrawl.links) {
        map.set(`${l.url}::${l.title}`, l);
      }
    }

    // Include pre-indexed site map links for this portal
    if (target.preIndexedLinks) {
      for (const p of target.preIndexedLinks) {
        const key = `${p.url}::${p.title}`;
        if (!map.has(key)) {
          map.set(key, p);
        }
      }
    }

    return Array.from(map.values());
  }, [target, liveCrawl]);

  const categoryCounts = useMemo(() => {
    const counts: Record<WebsiteLinkCategory, number> = {
      All: combinedLinks.length,
      webpage_info: 0,
      citizen_service: 0,
      document_form: 0,
      data_api_feed: 0,
      directory_contact: 0,
      external_resource: 0,
    };
    for (const l of combinedLinks) {
      counts[l.category] = (counts[l.category] || 0) + 1;
    }
    return counts;
  }, [combinedLinks]);

  const filteredLinks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return combinedLinks.filter((l) => {
      if (categoryFilter !== 'All' && l.category !== categoryFilter) return false;
      if (scopeFilter === 'internal' && !l.isInternal) return false;
      if (scopeFilter === 'external' && l.isInternal) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.pathSegment.toLowerCase().includes(q) ||
        l.whatInfoItGives.toLowerCase().includes(q) ||
        l.domain.toLowerCase().includes(q)
      );
    });
  }, [combinedLinks, categoryFilter, scopeFilter, searchQuery]);

  if (!target) return null;

  const handleInspectAndExplainLink = async (link: IndexedWebsiteLink) => {
    setInspectedLinks((prev) => ({
      ...prev,
      [link.id]: {
        loadingInspect: true,
        inspection: prev[link.id]?.inspection || null,
        loadingAi: true,
        aiMarkdown: prev[link.id]?.aiMarkdown || null,
      },
    }));

    // Run live HTTP page/resource inspection and AI plain-language explainer in parallel
    const inspectPromise = fetch('/api/gov-documents/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: link.url }),
    })
      .then((r) => r.json())
      .catch(() => null);

    const aiPromise = fetch('/api/ai/explain-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: link.title,
        url: link.url,
        agency: link.websiteTitle,
        countryName: link.countryName,
        summary: link.whatInfoItGives,
        language,
      }),
    })
      .then((r) => r.json())
      .catch((e) => ({ error: e?.message || 'Failed to generate AI summary' }));

    const [inspectionData, aiData] = await Promise.all([inspectPromise, aiPromise]);

    setInspectedLinks((prev) => ({
      ...prev,
      [link.id]: {
        loadingInspect: false,
        inspection: inspectionData,
        loadingAi: false,
        aiMarkdown: aiData?.explanationMarkdown || null,
        aiError: aiData?.error,
      },
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-2 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="website-link-indexer-modal-title"
    >
      <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-[#F4EFE6] border-b border-[#DED6C6] flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600">
              <span>WEBSITE COMPLETE LINK & RESOURCE INDEXER</span>
              <span aria-hidden="true">·</span>
              <span>
                {target.countryName} ({target.countryIso2})
              </span>
              {liveCrawl?.statusCode && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-800 font-semibold">
                    Live Crawl HTTP {liveCrawl.statusCode} ({liveCrawl.latencyMs}ms)
                  </span>
                </>
              )}
            </div>
            <h2
              id="website-link-indexer-modal-title"
              className="text-xl sm:text-2xl font-bold text-stone-900 mt-1 truncate"
            >
              {liveCrawl?.pageTitle || target.websiteTitle}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
              {liveCrawl?.metaDescription ||
                `Complete index of webpages, citizen services, directories, documents, and data resources on ${target.websiteUrl}.`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close website link indexer modal"
            className="p-2 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-200/70 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Crawler Address Bar & Breadcrumb Trail */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-[#DED6C6] space-y-2.5 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customCrawlUrl.trim()) {
                runLiveWebsiteCrawl(
                  customCrawlUrl.trim(),
                  customCrawlUrl.trim(),
                  target.countryIso2,
                  target.countryName,
                  target.continent || 'Europe'
                );
              }
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={customCrawlUrl}
                onChange={(e) => setCustomCrawlUrl(e.target.value)}
                aria-label="Website URL to crawl and index all links"
                placeholder="Enter any official government website or sub-page URL to index all links..."
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            <button
              type="submit"
              disabled={isCrawling}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0"
            >
              {isCrawling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Compass className="w-3.5 h-3.5" />
              )}
              <span>{isCrawling ? 'Crawling Website Links...' : 'Live Crawl & Index All Links'}</span>
            </button>
          </form>

          {/* Crawl History Breadcrumbs */}
          {crawlHistory.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-600">
              <span className="font-mono text-[11px] text-stone-500">Crawl Path:</span>
              {crawlHistory.map((item, idx) => (
                <React.Fragment key={item.url}>
                  {idx > 0 && <ArrowRight className="w-3 h-3 text-stone-400" />}
                  <button
                    type="button"
                    onClick={() =>
                      runLiveWebsiteCrawl(
                        item.url,
                        item.title,
                        target.countryIso2,
                        target.countryName,
                        target.continent || 'Europe'
                      )
                    }
                    className="px-2 py-0.5 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] truncate max-w-[200px]"
                  >
                    {item.title}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Category Filter Bar + Search within Indexed Links */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0">
            {(
              [
                'All',
                'webpage_info',
                'citizen_service',
                'document_form',
                'data_api_feed',
                'directory_contact',
                'external_resource',
              ] as WebsiteLinkCategory[]
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
                }`}
              >
                {WEBSITE_LINK_CATEGORY_LABELS[cat]} ({categoryCounts[cat]})
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter indexed links on this website"
                placeholder="Search any link, webpage title, URL path, service, document, or topic on this site..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs shrink-0">
              {(
                [
                  { id: 'all', label: `All Domains (${combinedLinks.length})` },
                  {
                    id: 'internal',
                    label: `Internal Pages (${combinedLinks.filter((l) => l.isInternal).length})`,
                  },
                  {
                    id: 'external',
                    label: `External Links (${
                      combinedLinks.filter((l) => !l.isInternal).length
                    })`,
                  },
                ] as const
              ).map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setScopeFilter(sc.id)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                    scopeFilter === sc.id
                      ? 'bg-[#1E3A8A] text-white'
                      : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Indexed Links List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {isCrawling && combinedLinks.length === 0 ? (
            <div className="bg-white border border-[#DED6C6] rounded-lg p-10 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A] mx-auto" />
              <p className="text-sm font-semibold text-stone-900">
                Crawling and indexing all webpages, services, directories, and resources on{' '}
                {customCrawlUrl}...
              </p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="bg-white border border-[#DED6C6] rounded-lg p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-stone-800">
                No indexed links matched your current filter ("{searchQuery}").
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All');
                  setScopeFilter('all');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Link Filters</span>
              </button>
            </div>
          ) : (
            filteredLinks.slice(0, visibleLimit).map((link) => {
              const inspectState = inspectedLinks[link.id];
              const favId = `link:${link.url}`;
              return (
                <article
                  key={`${link.id}-${link.url}`}
                  className="bg-white border border-[#DED6C6] rounded-lg p-4 space-y-2.5 hover:border-stone-400 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Unboxed Metadata Line */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-stone-500">
                        <span className="font-semibold text-stone-800">
                          {link.resourceFormat}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{WEBSITE_LINK_CATEGORY_LABELS[link.category]}</span>
                        <span aria-hidden="true">·</span>
                        <span>{link.domain}</span>
                        <span aria-hidden="true">·</span>
                        <span>{link.isInternal ? 'Internal Page' : 'External Partner Link'}</span>
                        {link.isLiveCrawled && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-800 font-semibold">Live Crawled</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-stone-900 mt-1">{link.title}</h3>

                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-mono">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1E3A8A] hover:underline inline-flex items-center gap-1 break-all"
                        >
                          <Link2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{link.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      <p className="text-xs text-stone-700 mt-2 leading-relaxed bg-[#FBF9F5] border border-stone-200/80 rounded p-2.5">
                        <strong className="text-stone-900">What Information This Link Gives:</strong>{' '}
                        {link.whatInfoItGives}
                      </p>
                    </div>

                    {/* Action Buttons for Every Indexed Link */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <FavoriteToggleButton
                        compact
                        isSaved={isFavoriteId(favorites, favId)}
                        itemName={link.title}
                        onToggle={() =>
                          onToggleFavorite({
                            id: favId,
                            itemType: 'website_link',
                            title: link.title,
                            subtitle: `${link.websiteTitle} · ${link.resourceFormat}`,
                            countryIso2: link.countryIso2,
                            countryName: link.countryName,
                            url: link.url,
                            categoryLabel: WEBSITE_LINK_CATEGORY_LABELS[link.category],
                          })
                        }
                      />

                      <button
                        type="button"
                        onClick={() => handleInspectAndExplainLink(link)}
                        disabled={inspectState?.loadingInspect || inspectState?.loadingAi}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap"
                      >
                        {inspectState?.loadingInspect || inspectState?.loadingAi ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>Inspect & AI Explain Page</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          runLiveWebsiteCrawl(
                            link.url,
                            link.title,
                            link.countryIso2,
                            link.countryName,
                            link.continent
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Crawl Sub-Links</span>
                      </button>

                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap"
                      >
                        <span>Open Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Inline Live Webpage Content Preview & AI Explanation */}
                  {inspectState && (
                    <div className="mt-3 pt-3 border-t border-stone-200 space-y-3 text-xs">
                      {inspectState.inspection && (
                        <div className="bg-[#F4EFE6] border border-[#DED6C6] rounded p-3 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-stone-600">
                            <span>
                              Live Resource Check: HTTP{' '}
                              {inspectState.inspection.statusCode || 'Verified'} ·{' '}
                              {inspectState.inspection.contentType || 'text/html'}
                            </span>
                            <span>Title: {inspectState.inspection.pageTitle}</span>
                          </div>
                          {inspectState.inspection.extractedTextPreview && (
                            <p className="text-stone-700 leading-relaxed line-clamp-4 font-sans">
                              <strong>Live Extracted Webpage Text:</strong>{' '}
                              {inspectState.inspection.extractedTextPreview.slice(0, 600)}
                            </p>
                          )}
                        </div>
                      )}

                      {inspectState.loadingAi ? (
                        <div className="flex items-center gap-2 text-stone-600 p-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
                          <span>Generating plain-language AI guide for this link...</span>
                        </div>
                      ) : inspectState.aiMarkdown ? (
                        <div className="bg-white border border-[#1E3A8A]/30 rounded p-3.5 space-y-1.5">
                          <div className="font-bold text-[#1E3A8A] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI Plain-Language Guide to This Webpage / Resource</span>
                          </div>
                          <div className="text-stone-800 whitespace-pre-line leading-relaxed">
                            {inspectState.aiMarkdown}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })
          )}

          {visibleLimit < filteredLinks.length && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 50)}
                className="px-5 py-2 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded hover:bg-stone-100"
              >
                Show Next 50 Indexed Links ({filteredLinks.length - visibleLimit} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
