import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  AiGroundedResearchResult,
  EnrichedCountryRecord,
  LanguageCode,
} from '../types/registry';
import { TranslationStrings } from '../data/i18n';
import { filterEnrichedCountries } from '../utils/registryFilter';

interface AiCivicResearchPanelProps {
  t: TranslationStrings;
  language: LanguageCode;
  externalQuery: string | null;
  onClearExternalQuery: () => void;
  allCountries: EnrichedCountryRecord[];
  onSelectCountry: (country: EnrichedCountryRecord) => void;
}

const SAMPLE_CIVIC_QUERIES = [
  'How to register an LLC, file franchise taxes, and check DMV services in California & Texas (USA)',
  'Official land records (Bhulekh), GST registration, and e-District portals in Maharashtra & Karnataka (India)',
  'e-Residency, digital company incorporation, and tax portals in Estonia, Singapore, and UAE',
  'Bürgeramt registration (Anmeldung), ELSTER tax filing, and BayernPortal in Germany',
  'ServiceOntario, Revenu Québec, and federal CRA / IRCC portals in Canada',
];

export const AiCivicResearchPanel: React.FC<AiCivicResearchPanelProps> = ({
  t,
  language,
  externalQuery,
  onClearExternalQuery,
  allCountries,
  onSelectCountry,
}) => {
  const [query, setQuery] = useState(SAMPLE_CIVIC_QUERIES[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AiGroundedResearchResult | null>(null);
  const [registryMatches, setRegistryMatches] = useState<EnrichedCountryRecord[]>([]);

  const executeResearch = async (searchText: string) => {
    const trimmed = searchText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a government portal, state, or service query.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    // 1. Compute instant cross-checked matches from our verified 195-country + sub-national registry
    const words = trimmed
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);

    const matchedMap = new Map<string, EnrichedCountryRecord>();
    const directMatches = filterEnrichedCountries(allCountries, {
      continent: 'All',
      subRegion: 'All',
      category: 'All',
      level: 'All',
      searchQuery: trimmed,
    });
    for (const m of directMatches.slice(0, 4)) {
      matchedMap.set(m.iso2, m);
    }

    if (matchedMap.size === 0) {
      for (const word of words) {
        const subMatches = filterEnrichedCountries(allCountries, {
          continent: 'All',
          subRegion: 'All',
          category: 'All',
          level: 'All',
          searchQuery: word,
        });
        for (const m of subMatches.slice(0, 3)) {
          matchedMap.set(m.iso2, m);
        }
      }
    }
    setRegistryMatches(Array.from(matchedMap.values()).slice(0, 6));

    // 2. Call our server-side Gemini 3.8 Flash + Google Search Grounding + Live HTTP Verifier
    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'AI Grounded Research returned an error.');
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while contacting Civic AI server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (externalQuery) {
      setQuery(externalQuery);
      executeResearch(externalQuery);
      onClearExternalQuery();
    }
  }, [externalQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeResearch(query);
  };

  return (
    <section
      id="civic-ai-intelligence"
      aria-labelledby="civic-ai-heading"
      className="py-12 border-t border-[#DED6C6] bg-[#F4EFE6]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest text-stone-500 block">
            04. Google Search-Grounded Civic & Local Service Intelligence
          </span>
          <h2
            id="civic-ai-heading"
            className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1"
          >
            AI-Assisted Government Portal Discovery & Live URL Cross-Check
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
            Search for any national ministry, state/provincial agency, municipal service, or open
            data API. Our server queries Google Search-grounded Gemini intelligence alongside the
            verified sovereign registry and performs live HTTP probes on discovered URLs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 bg-white border border-[#DED6C6] rounded-lg p-5">
          <label
            htmlFor="ai-civic-query-input"
            className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2"
          >
            Describe the Country, State/Region, or Government Service You Need
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="ai-civic-query-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Property tax, vehicle registration, and business permits in Ontario or Bavaria..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching & Cross-Checking URLs...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.aiSearchButton}</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-stone-500 mr-1">Sample Civic Queries:</span>
            {SAMPLE_CIVIC_QUERIES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(sample);
                  executeResearch(sample);
                }}
                className="px-2.5 py-1 text-xs text-stone-700 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors text-left"
              >
                {sample.length > 58 ? sample.slice(0, 58) + '...' : sample}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900"
            >
              <strong>Note:</strong> {errorMsg} Showing verified matches from our built-in
              Sovereign & State Registry below.
            </div>
          )}
        </form>

        {/* Cross-Checked Registry Matches for the Query */}
        {registryMatches.length > 0 && (
          <div className="mt-6 bg-white border border-[#DED6C6] rounded-lg p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3">
              Verified Sovereign & Sub-National Registry Matches ({registryMatches.length})
            </h3>
            <div className="divide-y divide-stone-200">
              {registryMatches.map((country) => (
                <div
                  key={country.iso2}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs text-stone-500 font-mono">
                      {country.iso2} · {country.continent} · {country.govTld} ·{' '}
                      {country.totalPortalsCount} Portals ({country.subNationalCount} States/Regions)
                    </div>
                    <div className="text-sm font-bold text-stone-900 mt-0.5">
                      {country.name} — {country.primaryPortalName}
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
                      {country.eGovSummary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={country.primaryPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-[#1E3A8A] bg-[#F4EFE6] border border-[#D6CEBE] rounded hover:bg-[#E7E0D2]"
                    >
                      <span>{country.primaryPortalUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => onSelectCountry(country)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 whitespace-nowrap"
                    >
                      Open {country.name} Registry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grounded AI Result + Live HTTP-Verified Grounding Sources */}
        {result && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white border border-[#DED6C6] rounded-lg p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-4 text-xs text-stone-500 font-mono">
                <span>Engine: {result.modelUsed}</span>
                <span>Query: "{result.query}"</span>
              </div>
              <div className="prose prose-stone max-w-none text-sm text-stone-800 whitespace-pre-wrap leading-relaxed">
                {result.answerMarkdown}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white border border-[#DED6C6] rounded-lg p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-500 border-b border-stone-200 pb-2.5 mb-3">
                Google Search Grounding Citations & Live HTTP Cross-Checks (
                {result.groundingSources.length})
              </h3>
              {result.groundingSources.length === 0 ? (
                <p className="text-xs text-stone-500">
                  All URLs cited directly in the grounded report on the left.
                </p>
              ) : (
                <div className="divide-y divide-stone-200">
                  {result.groundingSources.map((src, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 text-xs space-y-1">
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#1E3A8A] hover:underline flex items-start justify-between gap-1.5"
                      >
                        <span className="line-clamp-2">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      </a>
                      <div className="font-mono text-[11px] text-stone-500 break-all">
                        {src.uri}
                      </div>
                      {src.verified && (
                        <div className="flex items-center gap-2 font-mono text-[11px] pt-0.5">
                          {src.verified.reachable ? (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{src.verified.statusText}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
                              <ShieldAlert className="w-3 h-3" />
                              <span>{src.verified.statusText}</span>
                            </span>
                          )}
                          <span>·</span>
                          <span>{src.verified.latencyMs}ms</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
