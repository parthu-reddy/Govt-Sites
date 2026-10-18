import React, { useMemo, useState } from 'react';
import { Compass, ExternalLink, Search } from 'lucide-react';
import { SUB_NATIONAL_REGISTRY } from '../data/subNationalRegistry';
import { TranslationStrings } from '../data/i18n';
import { isFavoriteId, SavedFavoriteItem } from '../utils/favoritesStorage';
import { FavoriteToggleButton } from './FavoritesQuickAccessModal';
import { InlineUrlVerifier } from './LiveUrlVerifierModal';

interface SubNationalExplorerSectionProps {
  t: TranslationStrings;
  favorites: SavedFavoriteItem[];
  onToggleFavorite: (candidate: Omit<SavedFavoriteItem, 'savedAt'>) => void;
  onOpenWebsiteLinkIndexer?: (target: {
    websiteId?: string;
    websiteTitle: string;
    websiteUrl: string;
    countryIso2: string;
    countryName: string;
  }) => void;
}

const FEDERATION_FILTERS = [
  { iso2: 'ALL', label: 'All Countries & Regions' },
  { iso2: 'US', label: 'United States (51 States & DC)' },
  { iso2: 'IN', label: 'India (31 States & UTs)' },
  { iso2: 'DE', label: 'Germany (16 Bundesländer)' },
  { iso2: 'CA', label: 'Canada (13 Provinces & Territories)' },
  { iso2: 'AU', label: 'Australia (8 States & Territories)' },
  { iso2: 'BR', label: 'Brazil (States & Distrito Federal)' },
  { iso2: 'JP', label: 'Japan (Prefectures / 都道府県)' },
  { iso2: 'GB', label: 'United Kingdom (Devolved Nations)' },
  { iso2: 'MX', label: 'Mexico (States & CDMX)' },
  { iso2: 'ES', label: 'Spain (Autonomous Communities)' },
  { iso2: 'CH', label: 'Switzerland (Cantons)' },
  { iso2: 'AE', label: 'UAE (Emirates)' },
  { iso2: 'NG', label: 'Nigeria (States & FCT)' },
  { iso2: 'ZA', label: 'South Africa (Provinces)' },
  { iso2: 'CN', label: 'China (Municipalities, Provinces & SAR)' },
];

export const SubNationalExplorerSection: React.FC<SubNationalExplorerSectionProps> = ({
  t,
  favorites,
  onToggleFavorite,
  onOpenWebsiteLinkIndexer,
}) => {
  const [selectedCountryIso2, setSelectedCountryIso2] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleLimit, setVisibleLimit] = useState<number>(12);

  const filteredRegions = useMemo(() => {
    const rawQ = searchQuery.trim().toLowerCase();
    const q = rawQ
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/+$/, '');
    return SUB_NATIONAL_REGISTRY.filter((reg) => {
      if (selectedCountryIso2 !== 'ALL' && reg.countryIso2 !== selectedCountryIso2) {
        return false;
      }
      if (!q) return true;
      return (
        reg.name.toLowerCase().includes(q) ||
        (reg.nativeName && reg.nativeName.toLowerCase().includes(q)) ||
        reg.capitalOrSeat.toLowerCase().includes(q) ||
        reg.type.toLowerCase().includes(q) ||
        reg.officialUrl.toLowerCase().includes(q) ||
        reg.summary.toLowerCase().includes(q) ||
        reg.localServices.some(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.whatYouCanDo.toLowerCase().includes(q) ||
            s.url.toLowerCase().includes(q)
        )
      );
    });
  }, [selectedCountryIso2, searchQuery]);

  const displayedRegions = filteredRegions.slice(0, visibleLimit);

  return (
    <section
      id="state-local-portals"
      aria-labelledby="subnational-heading"
      className="py-12 border-t border-[#DED6C6] bg-[#F4EFE6]/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-3xl">
            <span className="text-xs uppercase tracking-widest text-stone-500 block">
              02. Sub-National, State, Provincial & Municipal Governance
            </span>
            <h2
              id="subnational-heading"
              className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1"
            >
              State, Provincial, Regional & Local Government Services Directory
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-2 leading-relaxed">
              Explore official state, provincial, Bundesland, prefectural, cantonal, and municipal
              portals—including local property taxation, DMV/vehicle licensing, land cadastre
              (Bhulekh), vital records, and regional business registries.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-stone-600 shrink-0">
            Showing {displayedRegions.length} of {filteredRegions.length} Verified Regional Portals
          </div>
        </div>

        {/* Sub-National Filter Bar */}
        <div className="mt-6 bg-white border border-[#DED6C6] rounded-lg p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleLimit(24);
                }}
                aria-label="Search state, provincial, or local government services"
                placeholder="Search state/province (e.g. California, Maharashtra, Ontario, Bavaria, Tokyo, Lagos) or local service (DMV, Bhulekh, tax, vital records)..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#FBF9F5] border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <select
              aria-label="Filter sub-national portals by country"
              value={selectedCountryIso2}
              onChange={(e) => {
                setSelectedCountryIso2(e.target.value);
                setVisibleLimit(20);
              }}
              className="px-3.5 py-2 text-xs font-medium bg-[#FBF9F5] border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              {FEDERATION_FILTERS.map((fed) => (
                <option key={fed.iso2} value={fed.iso2}>
                  {fed.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Federation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {FEDERATION_FILTERS.slice(0, 9).map((fed) => (
              <button
                key={fed.iso2}
                type="button"
                onClick={() => {
                  setSelectedCountryIso2(fed.iso2);
                  setVisibleLimit(20);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                  selectedCountryIso2 === fed.iso2
                    ? 'bg-stone-900 text-white'
                    : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
                }`}
              >
                {fed.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-National Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {displayedRegions.map((reg) => (
            <article
              key={reg.id}
              className="bg-white border border-[#DED6C6] rounded-lg p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-stone-500 font-mono">
                  <span>
                    {reg.id} · {reg.type} · Seat: {reg.capitalOrSeat}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 mt-1">
                  {reg.name}{' '}
                  {reg.nativeName && (
                    <span className="text-sm font-normal text-stone-500">({reg.nativeName})</span>
                  )}
                </h3>

                <div className="text-xs font-mono text-[#1E3A8A] mt-1 break-all">
                  <a
                    href={reg.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-flex items-center gap-1"
                  >
                    <span>{reg.officialUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">{reg.summary}</p>

                <div className="mt-3 pt-3 border-t border-stone-100 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
                    Local & Regional Services Available:
                  </span>
                  {reg.localServices.map((srv, idx) => (
                    <div key={idx} className="text-xs">
                      <a
                        href={srv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-stone-800 hover:text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
                      >
                        <span>{srv.name}</span>
                        <ExternalLink className="w-3 h-3 text-stone-400" />
                      </a>
                      <p className="text-[11px] text-stone-600 leading-snug mt-0.5">
                        {srv.whatYouCanDo}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                <InlineUrlVerifier
                  url={reg.officialUrl}
                  verifyLabel={t.verifyLiveStatus}
                  verifyingLabel={t.verifying}
                  verifiedLabel={t.verifiedOnline}
                />
                <div className="flex items-center gap-1.5">
                  <FavoriteToggleButton
                    compact
                    isSaved={isFavoriteId(favorites, `state:${reg.id}`)}
                    itemName={`${reg.name} (${reg.type})`}
                    onToggle={() =>
                      onToggleFavorite({
                        id: `state:${reg.id}`,
                        itemType: 'subnational_portal',
                        title: `${reg.name} — Official ${reg.type} Government Portal`,
                        subtitle: `Seat: ${reg.capitalOrSeat} · ${reg.id}`,
                        countryIso2: reg.countryIso2,
                        countryName: reg.countryIso2,
                        url: reg.officialUrl,
                        categoryLabel: `${reg.type} Portal`,
                      })
                    }
                  />
                  {onOpenWebsiteLinkIndexer && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenWebsiteLinkIndexer({
                          websiteId: `state-${reg.id}`,
                          websiteTitle: `${reg.name} (${reg.type})`,
                          websiteUrl: reg.officialUrl,
                          countryIso2: reg.countryIso2,
                          countryName: reg.countryIso2,
                        })
                      }
                      aria-label={`Index all links on ${reg.name}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-800 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors whitespace-nowrap shrink-0"
                    >
                      <Compass className="w-3.5 h-3.5 text-[#1E3A8A]" />
                      <span>Index Links</span>
                    </button>
                  )}
                  <a
                    href={reg.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 text-xs font-medium text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    Open Portal
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {visibleLimit < filteredRegions.length && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 24)}
              className="px-5 py-2.5 text-xs font-semibold text-stone-900 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors"
            >
              Load More State & Regional Portals ({filteredRegions.length - visibleLimit} remaining)
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
