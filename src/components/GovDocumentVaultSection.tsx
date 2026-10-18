import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileSearch,
  FolderSearch,
  Globe,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import type {
  ContinentId,
  EnrichedCountryRecord,
  GovDocumentFormat,
  GovDocumentType,
  LanguageCode,
} from '../types/registry';
import {
  buildGlobalDocumentCatalog,
  computeDocumentCatalogStats,
  DOCUMENT_FORMAT_LABELS,
  DOCUMENT_TYPE_LABELS,
  EnrichedGovDocument,
  filterDocuments,
} from '../utils/documentCatalog';
import { DocumentReaderModal } from './DocumentReaderModal';
import { isFavoriteId, SavedFavoriteItem } from '../utils/favoritesStorage';
import { FavoriteToggleButton } from './FavoritesQuickAccessModal';

interface GovDocumentVaultSectionProps {
  allCountries: EnrichedCountryRecord[];
  language: LanguageCode;
  favorites: SavedFavoriteItem[];
  onToggleFavorite: (candidate: Omit<SavedFavoriteItem, 'savedAt'>) => void;
  onJumpToAiResearch: (query: string) => void;
}

export const GovDocumentVaultSection: React.FC<GovDocumentVaultSectionProps> = ({
  allCountries,
  language,
  favorites,
  onToggleFavorite,
  onJumpToAiResearch,
}) => {
  const allDocuments = useMemo(
    () => buildGlobalDocumentCatalog(allCountries),
    [allCountries]
  );

  const catalogStats = useMemo(
    () => computeDocumentCatalogStats(allDocuments),
    [allDocuments]
  );

  // Filter States
  const [continent, setContinent] = useState<ContinentId>('All');
  const [countryIso2, setCountryIso2] = useState<string>('All');
  const [docType, setDocType] = useState<GovDocumentType>('All');
  const [format, setFormat] = useState<GovDocumentFormat>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Live Federated Repository Search State
  const [liveDocs, setLiveDocs] = useState<EnrichedGovDocument[]>([]);
  const [loadingLiveDocs, setLoadingLiveDocs] = useState<boolean>(false);
  const [liveSearchExecuted, setLiveSearchExecuted] = useState<string | null>(null);

  // Custom Portal URL Document Scanner Input
  const [customPortalUrl, setCustomPortalUrl] = useState<string>('https://www.irs.gov/forms-instructions');

  // Selected Document for Reader & AI Citizen Guide Modal
  const [selectedDoc, setSelectedDoc] = useState<EnrichedGovDocument | null>(null);
  const [modalInitialTab, setModalInitialTab] = useState<'guide' | 'inspect' | 'portal_scan'>(
    'guide'
  );

  const countriesForDropdown = useMemo(() => {
    const list =
      continent === 'All'
        ? allCountries
        : allCountries.filter((c) => c.continent === continent);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [allCountries, continent]);

  const filteredDocuments = useMemo(
    () =>
      filterDocuments(allDocuments, {
        continent,
        countryIso2,
        docType,
        format,
        searchQuery,
      }),
    [allDocuments, continent, countryIso2, docType, format, searchQuery]
  );

  const displayedDocuments = filteredDocuments.slice(0, visibleCount);

  const handleResetFilters = () => {
    setContinent('All');
    setCountryIso2('All');
    setDocType('All');
    setFormat('All');
    setSearchQuery('');
    setVisibleCount(12);
  };

  const handleRunLiveRepositorySearch = async (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim() || 'tax form passport legislation';
    setLoadingLiveDocs(true);
    setLiveSearchExecuted(q);
    try {
      const res = await fetch(
        `/api/gov-documents/live-search?q=${encodeURIComponent(q)}&country=${encodeURIComponent(
          countryIso2
        )}`
      );
      const data = await res.json();
      if (Array.isArray(data?.documents)) {
        const enrichedLive: EnrichedGovDocument[] = data.documents.map((d: any) => ({
          ...d,
          citizenGuide: {
            targetAudience: `Citizens, businesses, and researchers accessing ${d.agency}`,
            prerequisites: [
              'Review official eligibility and statutory instructions inside the document',
              'Prepare relevant government reference or identification numbers if filing',
            ],
            stepByStep: [
              `Open the live document preview or download directly from ${d.sourceRepository}.`,
              'Use the AI Citizen Guide tab to translate bureaucratic or legal clauses into plain language.',
              'Click "Scan Portal for All Documents" to extract any accompanying schedules or forms.',
            ],
            filingMode: `Live Repository Document (${d.format})`,
          },
        }));
        setLiveDocs(enrichedLive);
      }
    } catch {
      setLiveDocs([]);
    } finally {
      setLoadingLiveDocs(false);
    }
  };

  const handleScanCustomPortal = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customPortalUrl.trim();
    if (!trimmed) return;
    const normalizedUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const syntheticDoc: EnrichedGovDocument = {
      id: `custom-portal-scan-${Date.now()}`,
      title: `Live Portal Document Extraction — ${normalizedUrl}`,
      documentCode: 'LIVE-PORTAL-SCAN',
      countryIso2: countryIso2 !== 'All' ? countryIso2 : 'GLOBAL',
      countryName: 'Official Government Portal',
      continent: continent !== 'All' ? continent : 'Europe',
      agency: normalizedUrl,
      portalUrl: normalizedUrl,
      documentUrl: normalizedUrl,
      format: 'HTML',
      docType: 'form_application',
      publishedDate: 'Real-Time Scan',
      summary: `Live extraction of all downloadable PDFs, spreadsheets, forms, and official publications linked from ${normalizedUrl}.`,
      whatItIsUsedFor:
        'Discover and download every official document, form, or statutory publication hosted on this government webpage.',
      sourceRepository: normalizedUrl,
      citizenGuide: {
        targetAudience: 'Anyone looking for downloadable forms or publications on this government website',
        prerequisites: ['Valid HTTP/HTTPS government portal address'],
        stepByStep: [
          'Review the extracted Direct Downloadable Files (.pdf, .csv, .xlsx, .doc) in Tab 3.',
          'Click any sub-portal link to crawl deeper or open the AI Citizen Explainer in Tab 1.',
        ],
        filingMode: 'Live HTML Document Crawler',
      },
    };
    setModalInitialTab('portal_scan');
    setSelectedDoc(syntheticDoc);
  };

  return (
    <section
      id="official-document-vault"
      aria-labelledby="document-vault-heading"
      className="py-14 scroll-mt-16 bg-[#F4EFE6] border-t border-b border-[#DED6C6]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 font-mono block">
              02. Global Official Document, Form & Publication Vault · AI Citizen Guide
            </span>
            <h2
              id="document-vault-heading"
              className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1"
            >
              Search, Access & Understand Every Government Document Worldwide
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-3xl leading-relaxed">
              Search and access <strong>{catalogStats.totalDocuments.toLocaleString()}</strong>{' '}
              indexed official forms, tax returns, passport/visa packets, business incorporation
              filings, parliamentary acts, and statistical datasets across all 195+ countries and
              states—plus query live government document APIs or scan any government website for
              downloadable PDFs with plain-language AI explanations.
            </p>
          </div>

          <div className="text-xs font-mono tabular-nums text-stone-700 bg-white border border-[#DED6C6] rounded px-4 py-2.5 shrink-0">
            <span>Matched Documents: </span>
            <strong>{filteredDocuments.length.toLocaleString()}</strong>
            <span> / {catalogStats.totalDocuments.toLocaleString()}</span>
          </div>
        </div>

        {/* Unified Document Search, Filter & Live Repository Console */}
        <div className="bg-white border border-[#DED6C6] rounded-lg p-6 space-y-5 shadow-2xs">
          {/* Primary Search Input + Live Federated API Search Button */}
          <div>
            <label
              htmlFor="document-vault-search-input"
              className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
            >
              Search by Document Name, Form Number (e.g. Form 1040, DS-11, ITR-1, IN01), Country, State, or Purpose
            </label>
            <div className="flex flex-col md:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="document-vault-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(12);
                  }}
                  placeholder="Search e.g. 'Form 1040', 'passport application', 'company registration', 'California', 'India tax', 'official gazette'..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleRunLiveRepositorySearch()}
                disabled={loadingLiveDocs}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                {loadingLiveDocs ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Live Repositories...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Fetch Live Documents from Gov APIs</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onJumpToAiResearch(
                    `Find official downloadable government documents, PDF forms, and plain-language filing steps for: ${
                      searchQuery.trim() || 'tax return, passport, and business registration forms'
                    }${countryIso2 !== 'All' ? ` in ${countryIso2}` : ''}`
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-stone-900 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                <span>AI Deep Document Finder</span>
              </button>
            </div>

            {/* Quick Document Category Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2.5 text-xs">
              <span className="text-stone-500 mr-1">Popular Document Searches:</span>
              {[
                { label: 'IRS Form 1040 (PDF)', query: 'Form 1040', type: 'tax_customs' as GovDocumentType },
                { label: 'U.S. Passport DS-11 (PDF)', query: 'DS-11', type: 'identity_immigration' as GovDocumentType },
                { label: 'UK Company Form IN01', query: 'IN01', type: 'business_licensing' as GovDocumentType },
                { label: 'India ITR-1 & PAN Form', query: 'ITR-1', type: 'tax_customs' as GovDocumentType },
                { label: 'Canada T1 Tax Package', query: 'T1 General', type: 'tax_customs' as GovDocumentType },
                { label: 'Germany ELSTER & Gewerbe', query: 'ESt 1 A', type: 'tax_customs' as GovDocumentType },
                { label: 'All National Official Gazettes', query: 'Official Gazette', type: 'legislation_gazette' as GovDocumentType },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSearchQuery(item.query);
                    setDocType('All');
                    setContinent('All');
                    setCountryIso2('All');
                    setFormat('All');
                  }}
                  className="px-2.5 py-1 text-xs text-stone-700 bg-[#FBF9F5] border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5-Column Filter Bar (Continent, Country, Document Category, Format, Reset) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4 border-t border-stone-200">
            <div>
              <label
                htmlFor="doc-filter-continent"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Continent
              </label>
              <select
                id="doc-filter-continent"
                value={continent}
                onChange={(e) => {
                  setContinent(e.target.value as ContinentId);
                  setCountryIso2('All');
                  setVisibleCount(12);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="All">All Continents</option>
                <option value="Africa">Africa</option>
                <option value="Americas">Americas</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="doc-filter-country"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Sovereign Country ({countriesForDropdown.length})
              </label>
              <select
                id="doc-filter-country"
                value={countryIso2}
                onChange={(e) => {
                  setCountryIso2(e.target.value);
                  setVisibleCount(12);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="All">All Countries ({countriesForDropdown.length})</option>
                {countriesForDropdown.map((c) => (
                  <option key={c.iso2} value={c.iso2}>
                    {c.name} ({c.iso2})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="doc-filter-type"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Document Category
              </label>
              <select
                id="doc-filter-type"
                value={docType}
                onChange={(e) => {
                  setDocType(e.target.value as GovDocumentType);
                  setVisibleCount(12);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="doc-filter-format"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                File / Access Format
              </label>
              <select
                id="doc-filter-format"
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value as GovDocumentFormat);
                  setVisibleCount(12);
                }}
                className="w-full px-3 py-2 text-xs bg-[#FBF9F5] border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                {Object.entries(DOCUMENT_FORMAT_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-[#FBF9F5] border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Document Filters</span>
              </button>
            </div>
          </div>

          {/* Direct Portal URL Document Scanner Bar */}
          <form
            onSubmit={handleScanCustomPortal}
            className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center gap-2.5"
          >
            <div className="text-xs font-semibold text-stone-700 shrink-0">
              Live Portal Document Scanner:
            </div>
            <input
              type="text"
              value={customPortalUrl}
              onChange={(e) => setCustomPortalUrl(e.target.value)}
              aria-label="Enter any government portal URL to extract all downloadable documents"
              placeholder="Paste any government URL (e.g. https://www.irs.gov/forms-instructions or https://www.gov.uk)..."
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
            >
              <FolderSearch className="w-3.5 h-3.5" />
              <span>Extract All Documents from Site</span>
            </button>
          </form>
        </div>

        {/* Live Federated Repository Results (When Triggered) */}
        {liveSearchExecuted && (
          <div className="bg-white border border-[#1E3A8A]/40 rounded-lg p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#1E3A8A] font-mono block">
                  Live Federated Government Document API Results
                </span>
                <h3 className="text-lg font-bold text-stone-900">
                  Real-Time Documents Fetched for "{liveSearchExecuted}" ({liveDocs.length} records)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLiveSearchExecuted(null)}
                className="text-xs text-stone-600 hover:text-stone-900 underline"
              >
                Clear Live Results
              </button>
            </div>

            {loadingLiveDocs ? (
              <div className="py-8 text-center text-xs text-stone-600 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#1E3A8A]" />
                <span>
                  Querying U.S. Federal Register, GOV.UK Official Publications, World Bank Sovereign
                  Document Archive & Data.gov...
                </span>
              </div>
            ) : liveDocs.length === 0 ? (
              <p className="text-xs text-stone-600">
                No live external repository records returned for "{liveSearchExecuted}". Browse the
                indexed sovereign documents below or click "AI Deep Document Finder".
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveDocs.slice(0, 8).map((doc) => (
                  <article
                    key={doc.id}
                    className="p-4 bg-[#FBF9F5] border border-stone-200 rounded flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-mono text-stone-500">
                        <span>{doc.documentCode}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{doc.countryName}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{doc.format}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{doc.publishedDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 mt-1">{doc.title}</h4>
                      <p className="text-xs text-stone-600 mt-1 line-clamp-2">{doc.summary}</p>
                      <div className="text-[11px] font-mono text-stone-500 mt-1">
                        Source: {doc.sourceRepository}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200">
                      <button
                        type="button"
                        onClick={() => {
                          setModalInitialTab('guide');
                          setSelectedDoc(doc);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 whitespace-nowrap"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Read & AI Explain</span>
                      </button>

                      <a
                        href={doc.downloadUrl || doc.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap"
                      >
                        <span>Open Official File</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Indexed Global Government Document Catalog Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white border border-[#DED6C6] rounded-lg p-10 text-center space-y-3">
            <p className="text-base font-semibold text-stone-900">
              No pre-indexed documents matched your current filter combination.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2]"
              >
                Reset Document Filters
              </button>
              <button
                type="button"
                onClick={() => handleRunLiveRepositorySearch(searchQuery)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554]"
              >
                Query Live Government Document APIs for "{searchQuery}"
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedDocuments.map((doc) => (
              <article
                key={doc.id}
                className="bg-white border border-[#DED6C6] rounded-lg p-6 flex flex-col justify-between hover:border-stone-400 transition-colors"
              >
                <div>
                  {/* Clean Unboxed Metadata Line (Zero-Pill Rule) */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-stone-500">
                    <span className="font-semibold text-stone-800">{doc.documentCode}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {doc.countryName} ({doc.countryIso2})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{doc.format}</span>
                  </div>

                  {/* Document Title */}
                  <h3 className="text-base font-bold text-stone-900 mt-1.5 leading-snug">
                    {doc.title}
                  </h3>

                  {/* Issuing Agency */}
                  <div className="text-xs text-stone-600 mt-1">
                    <strong>Authority:</strong> {doc.agency}
                  </div>

                  {/* Direct Document URL */}
                  <div className="mt-2.5 pt-2.5 border-t border-stone-100">
                    <a
                      href={doc.downloadUrl || doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#1E3A8A] hover:underline break-all"
                    >
                      <span>{doc.downloadUrl || doc.documentUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  {/* Plain-Language Citizen Orientation Box */}
                  <div className="mt-3 bg-[#FBF9F5] border border-stone-200 rounded p-3 space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-stone-900">What You Use This For: </span>
                      <span className="text-stone-700 leading-relaxed">{doc.whatItIsUsedFor}</span>
                    </div>
                    <div className="pt-1.5 border-t border-stone-200/80 text-stone-600">
                      <span className="font-semibold text-stone-800">Before You Start: </span>
                      <span>{doc.citizenGuide.prerequisites[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Read & AI Explain + Scan Portal + Direct Access */}
                <div className="mt-5 pt-3.5 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Read & AI Guide for ${doc.documentCode}`}
                      onClick={() => {
                        setModalInitialTab('guide');
                        setSelectedDoc(doc);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Read & AI Guide</span>
                    </button>

                    <button
                      type="button"
                      aria-label={`Scan Site Files for ${doc.documentCode}`}
                      onClick={() => {
                        setModalInitialTab('portal_scan');
                        setSelectedDoc(doc);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
                    >
                      <FolderSearch className="w-3.5 h-3.5" />
                      <span>Scan Site Files</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <FavoriteToggleButton
                      compact
                      isSaved={isFavoriteId(favorites, `doc:${doc.id}`)}
                      itemName={doc.title}
                      onToggle={() =>
                        onToggleFavorite({
                          id: `doc:${doc.id}`,
                          itemType: 'gov_document',
                          title: doc.title,
                          subtitle: `${doc.documentCode} · ${doc.agency}`,
                          countryIso2: doc.countryIso2,
                          countryName: doc.countryName,
                          url: doc.downloadUrl || doc.documentUrl,
                          categoryLabel: DOCUMENT_TYPE_LABELS[doc.docType],
                        })
                      }
                    />
                    <a
                      href={doc.downloadUrl || doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Access or download ${doc.title}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Access</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {visibleCount < filteredDocuments.length && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 24)}
              className="px-6 py-2.5 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors"
            >
              Show Next 24 Official Documents ({filteredDocuments.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Document Reader, Live Inspector & AI Citizen Guide Modal */}
      <DocumentReaderModal
        document={selectedDoc}
        initialTab={modalInitialTab}
        language={language}
        onClose={() => setSelectedDoc(null)}
      />
    </section>
  );
};
