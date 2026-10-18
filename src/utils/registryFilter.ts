import type {
  ContinentId,
  CountryBaseRecord,
  EnrichedCountryRecord,
  GovLevelId,
  GovPortalEntry,
  PublicGovApiSpec,
  ServiceCategoryId,
  SubNationalRegion,
} from '../types/registry';

export interface FilterCriteria {
  continent: ContinentId;
  subRegion: string;
  category: ServiceCategoryId;
  level: GovLevelId;
  searchQuery: string;
}

/**
 * Builds structured, documented government portal entries for a sovereign country
 * across all core civic and commercial service categories.
 */
export function buildCountryPortals(
  country: CountryBaseRecord,
  subRegions: SubNationalRegion[],
  publicApis: PublicGovApiSpec[]
): GovPortalEntry[] {
  const portals: GovPortalEntry[] = [];

  // 1. Primary Executive & National E-Government Gateway
  portals.push({
    id: `${country.iso2}-exec`,
    title: country.primaryPortalName,
    agency: `Central Government & Executive Digital Authority of ${country.name}`,
    url: country.primaryPortalUrl,
    category: 'executive',
    level: 'national',
    summary: country.eGovSummary,
    capabilities: [
      `Authenticate with national digital identity and access central citizen & resident services in ${country.name}`,
      'Browse official directory of ministries, executive agencies, embassies, and public authorities',
      'Submit administrative applications, download official forms, and verify public notices',
      'Track service requests, public consultations, and digital mailbox notifications',
    ],
    languagesSupported: country.officialLanguages,
  });

  // 2. Taxation, Revenue & Customs Portal
  const taxUrl = country.taxAuthorityUrl || country.primaryPortalUrl;
  portals.push({
    id: `${country.iso2}-tax`,
    title: `${country.name} Revenue, Taxation & Customs Portal`,
    agency: `National Tax & Customs Administration (${country.govTld})`,
    url: taxUrl,
    category: 'tax_finance',
    level: 'national',
    summary: `Official fiscal and revenue portal of ${country.name} for personal income tax, corporate tax, VAT/GST e-invoicing, customs declarations, and taxpayer identification registration.`,
    capabilities: [
      'Register for Taxpayer Identification Number (TIN / NIF / CPF / PAN / UTR / SSN equivalent)',
      'File annual personal and corporate income tax returns and pay assessed liabilities online',
      'Submit Value Added Tax (VAT / GST) returns, electronic invoices, and withholding statements',
      'Download official tax clearance certificates and customs import/export tariff declarations',
    ],
    languagesSupported: country.officialLanguages,
  });

  // 3. Civil Registry, Passports, Visas & Immigration
  const immUrl = country.immigrationPortalUrl || country.primaryPortalUrl;
  portals.push({
    id: `${country.iso2}-civil`,
    title: `${country.name} Civil Registry, Passports & Immigration e-Services`,
    agency: `Ministry of Interior / Civil Registration & Immigration Authority`,
    url: immUrl,
    category: 'identity_civil',
    level: 'national',
    summary: `Official portal for national identity cards, biometric passport applications, birth/marriage/death certificates, residency permits, and electronic visas (e-Visa / eTA) for ${country.name}.`,
    capabilities: [
      'Apply for or renew biometric passports and National Identity Cards',
      'Request certified copies of birth, marriage, civil union, and family register certificates',
      'Submit electronic visa (e-Visa / eTA), work permit, and permanent residency applications',
      'Verify citizen/resident civil status and apostille/legalization requirements',
    ],
    languagesSupported: [...country.officialLanguages, 'English'],
  });

  // 4. Business Registration, Corporate Registry & Trade
  const bizUrl = country.businessRegistryUrl || country.primaryPortalUrl;
  portals.push({
    id: `${country.iso2}-biz`,
    title: `${country.name} Corporate Registry, Trade & Licensing Single Window`,
    agency: `Ministry of Commerce / Registrar of Companies & Intellectual Property`,
    url: bizUrl,
    category: 'business_trade',
    level: 'national',
    summary: `Official commercial registry and one-stop investment portal for incorporating companies, searching corporate records, filing annual statutory returns, and registering trademarks/patents in ${country.name}.`,
    capabilities: [
      'Incorporate limited liability companies, sole proprietorships, and foreign branches online',
      'Search the official register of companies, directors, beneficial owners, and insolvency filings',
      'Apply for sector-specific trade licenses, import/export permits, and public procurement tenders',
      'Register trademarks, patents, industrial designs, and copyrights',
    ],
    languagesSupported: country.officialLanguages,
  });

  // 5. Health, Pensions & Social Security
  if (country.healthMinistryUrl) {
    portals.push({
      id: `${country.iso2}-health`,
      title: `${country.name} Public Health, Social Insurance & Pension Portal`,
      agency: `Ministry of Health & National Social Security Institution`,
      url: country.healthMinistryUrl,
      category: 'health_social',
      level: 'national',
      summary: `National portal for electronic health records, public healthcare coverage, vaccination registries, state pensions, maternity/family allowances, and unemployment insurance in ${country.name}.`,
      capabilities: [
        'View personal contribution history, pension projections, and social insurance enrollment',
        'Access electronic health records, e-prescriptions, and national health insurance cards',
        'Apply for family benefits, disability support, parental leave, and employment assistance',
      ],
      languagesSupported: country.officialLanguages,
    });
  }

  // 6. Legislation, Judiciary & Official Gazette
  if (country.legislationPortalUrl) {
    portals.push({
      id: `${country.iso2}-law`,
      title: `${country.name} Official Gazette, Legislation & Judicial Portal`,
      agency: `Ministry of Justice / Parliamentary & Statutory Publications Office`,
      url: country.legislationPortalUrl,
      category: 'justice_law',
      level: 'national',
      summary: `Authentic repository of the Constitution, consolidated statutes, parliamentary bills, decrees, Official Gazette publications, and court case lookup for ${country.name}.`,
      capabilities: [
        'Search full consolidated texts of national laws, acts of parliament, and executive decrees',
        'Read daily issues of the Official State Gazette and statutory notices',
        'Request criminal record clearance certificates and verify judicial docket schedules',
      ],
      languagesSupported: country.officialLanguages,
    });
  }

  // 7. National Statistics & Open Data API Portal
  const dataUrl =
    country.openDataPortalUrl ||
    country.statisticalOfficeUrl ||
    `https://data.worldbank.org/country/${country.iso2.toLowerCase()}`;
  portals.push({
    id: `${country.iso2}-data`,
    title: `${country.name} National Statistical Office & Open Data API Portal`,
    agency:
      country.openDataPortalUrl || country.statisticalOfficeUrl
        ? `National Statistical & Open Data Authority of ${country.name}`
        : `National Statistics & Sovereign Open Data Feed (${country.name})`,
    url: dataUrl,
    category: 'open_data_api',
    level: 'api',
    summary: `Machine-readable open government datasets, national census tables, macroeconomic indicators, geospatial layers, and programmatic REST APIs for ${country.name}.`,
    capabilities: [
      'Download official demographic census, inflation (CPI), GDP, trade, and labor force series',
      'Query programmatic REST / JSON / SDMX APIs for automated data integration',
      'Access administrative boundary shapefiles, GeoJSON maps, and public budget datasets',
    ],
    languagesSupported: [...country.officialLanguages, 'English'],
    hasPublicApi: true,
    apiEndpoint: `https://api.worldbank.org/v2/country/${country.iso2}/indicator/SP.POP.TOTL?format=json&per_page=5`,
    apiDocsUrl: dataUrl,
  });

  // 8. Country-specific Public Government APIs from catalog
  for (const api of publicApis) {
    portals.push({
      id: `api-${api.id}`,
      title: api.title,
      agency: api.agency,
      url: api.docsUrl,
      category: api.category,
      level: 'api',
      summary: api.description,
      capabilities: api.whatCanBeFetched,
      languagesSupported: country.officialLanguages,
      hasPublicApi: true,
      apiEndpoint: api.endpointUrl,
      apiDocsUrl: api.docsUrl,
    });
  }

  // 9. Sub-National (State, Provincial, Regional & Municipal) Portals + Specialized State Agencies/High Courts
  const seenPortalUrls = new Set<string>(portals.map((p) => p.url.toLowerCase().replace(/\/+$/, '')));
  for (const reg of subRegions) {
    const regNormUrl = reg.officialUrl.toLowerCase().replace(/\/+$/, '');
    seenPortalUrls.add(regNormUrl);

    portals.push({
      id: `reg-${reg.id}`,
      title: `${reg.name} (${reg.type}) — Official Government & Local Services Portal`,
      agency: `Government of ${reg.name} · Capital: ${reg.capitalOrSeat}`,
      url: reg.officialUrl,
      category: 'local_municipal',
      level: reg.type === 'Municipality' ? 'municipal' : 'state_provincial',
      summary: reg.summary,
      capabilities: reg.localServices.map((s) => `${s.name} (${s.url}): ${s.whatYouCanDo}`),
      languagesSupported: country.officialLanguages,
      hasPublicApi: Boolean(reg.openDataUrl),
      apiDocsUrl: reg.openDataUrl,
      stateOrRegionName: reg.name,
    });

    // Also register each distinct specialized state/regional portal (High Courts, e-Sevai, DMV, Bhulekh, State Tax, Open Data)
    reg.localServices.forEach((srv, idx) => {
      const srvNorm = srv.url.toLowerCase().replace(/\/+$/, '');
      if (!srvNorm || seenPortalUrls.has(srvNorm)) return;
      seenPortalUrls.add(srvNorm);

      portals.push({
        id: `reg-${reg.id}-srv-${idx}`,
        title: `${reg.name}: ${srv.name}`,
        agency: `${reg.name} (${reg.type}) · ${country.name}`,
        url: srv.url,
        category: srv.category,
        level: reg.type === 'Municipality' ? 'municipal' : 'state_provincial',
        summary: srv.whatYouCanDo,
        capabilities: [
          srv.whatYouCanDo,
          `Official ${reg.name} regional portal (${srv.url}) under ${country.name} (${country.govTld})`,
          `Access online forms, public records, status verification, and official notices from ${srv.name}`,
        ],
        languagesSupported: country.officialLanguages,
        hasPublicApi: srv.category === 'open_data_api',
        apiDocsUrl: srv.category === 'open_data_api' ? srv.url : undefined,
        stateOrRegionName: reg.name,
      });
    });
  }

  return portals;
}

export function enrichCountriesRegistry(
  countries: CountryBaseRecord[],
  subNationalRegions: SubNationalRegion[],
  publicApis: PublicGovApiSpec[]
): EnrichedCountryRecord[] {
  const regionsByCountry = new Map<string, SubNationalRegion[]>();
  for (const reg of subNationalRegions) {
    const list = regionsByCountry.get(reg.countryIso2) || [];
    list.push(reg);
    regionsByCountry.set(reg.countryIso2, list);
  }

  const apisByCountry = new Map<string, PublicGovApiSpec[]>();
  for (const api of publicApis) {
    const list = apisByCountry.get(api.countryIso2) || [];
    list.push(api);
    apisByCountry.set(api.countryIso2, list);
  }

  return countries.map((country) => {
    const subRegions = regionsByCountry.get(country.iso2) || [];
    const countryApis = apisByCountry.get(country.iso2) || [];
    const portals = buildCountryPortals(country, subRegions, countryApis);

    return {
      ...country,
      portals,
      subNationalRegions: subRegions,
      totalPortalsCount: portals.length,
      subNationalCount: subRegions.length,
      publicApiCount: portals.filter((p) => p.hasPublicApi).length,
    };
  });
}

export function getDistinctSubRegions(
  countries: EnrichedCountryRecord[],
  continent: ContinentId
): string[] {
  const set = new Set<string>();
  for (const c of countries) {
    if (continent === 'All' || c.continent === continent) {
      set.add(c.subRegion);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Normalizes a search query or URL so trailing slashes, protocol prefixes, and www. never break matching.
 */
export function normalizeSearchQueryToken(raw: string): {
  rawLower: string;
  cleanToken: string;
  hostnameOnly: string;
  isUrlLike: boolean;
} {
  const rawLower = raw.trim().toLowerCase();
  if (!rawLower) {
    return { rawLower: '', cleanToken: '', hostnameOnly: '', isUrlLike: false };
  }
  const isUrlLike =
    rawLower.startsWith('http://') ||
    rawLower.startsWith('https://') ||
    /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(rawLower);

  const withoutProto = rawLower
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');

  const hostnameOnly = withoutProto.split('/')[0] || withoutProto;
  return {
    rawLower,
    cleanToken: withoutProto || rawLower,
    hostnameOnly,
    isUrlLike,
  };
}

/**
 * Checks whether a candidate URL or text matches the normalized search token, including subdomain parent matching.
 */
function urlOrTextMatchesToken(
  candidateUrl: string,
  token: ReturnType<typeof normalizeSearchQueryToken>
): boolean {
  const normCandidate = candidateUrl
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');

  if (normCandidate.includes(token.cleanToken) || normCandidate.includes(token.rawLower)) {
    return true;
  }

  // If user searched a subdomain URL (e.g. hcmadras.tn.gov.in), also match its parent domain (tn.gov.in)
  if (token.isUrlLike && token.hostnameOnly.includes('.')) {
    const candidateHost = normCandidate.split('/')[0];
    if (
      candidateHost &&
      candidateHost.includes('.') &&
      (token.hostnameOnly === candidateHost ||
        token.hostnameOnly.endsWith(`.${candidateHost}`))
    ) {
      return true;
    }
  }
  return false;
}

export function filterEnrichedCountries(
  countries: EnrichedCountryRecord[],
  criteria: FilterCriteria
): EnrichedCountryRecord[] {
  const token = normalizeSearchQueryToken(criteria.searchQuery);
  const q = token.cleanToken;

  return countries
    .filter((country) => {
      if (criteria.continent !== 'All' && country.continent !== criteria.continent) {
        return false;
      }
      if (criteria.subRegion !== 'All' && country.subRegion !== criteria.subRegion) {
        return false;
      }

      // Check if at least one portal matches the category & level filter
      if (criteria.category !== 'All' || criteria.level !== 'All') {
        const hasMatchingPortal = country.portals.some((p) => {
          const catMatch = criteria.category === 'All' || p.category === criteria.category;
          const lvlMatch = criteria.level === 'All' || p.level === criteria.level;
          return catMatch && lvlMatch;
        });
        if (!hasMatchingPortal) {
          return false;
        }
      }

      if (!q) {
        return true;
      }

      // Search across country fields
      const tldParts = country.govTld
        .toLowerCase()
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean);

      const tldSubdomainMatch =
        token.isUrlLike &&
        tldParts.some((tld) => token.hostnameOnly.endsWith(tld));

      const countryFieldsMatch =
        country.name.toLowerCase().includes(q) ||
        country.nativeName.toLowerCase().includes(q) ||
        country.iso2.toLowerCase() === q ||
        country.iso3.toLowerCase() === q ||
        country.capital.toLowerCase().includes(q) ||
        country.govTld.toLowerCase().includes(q) ||
        tldSubdomainMatch ||
        country.subRegion.toLowerCase().includes(q) ||
        country.eGovSummary.toLowerCase().includes(q) ||
        country.officialLanguages.some((l) => l.toLowerCase().includes(q));

      if (countryFieldsMatch) {
        return true;
      }

      // Search across sub-national regions (states, provinces, local services)
      const subNationalMatch = country.subNationalRegions.some(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.nativeName && r.nativeName.toLowerCase().includes(q)) ||
          r.capitalOrSeat.toLowerCase().includes(q) ||
          urlOrTextMatchesToken(r.officialUrl, token) ||
          r.summary.toLowerCase().includes(q) ||
          r.localServices.some(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.whatYouCanDo.toLowerCase().includes(q) ||
              urlOrTextMatchesToken(s.url, token)
          )
      );

      if (subNationalMatch) {
        return true;
      }

      // Search across national & state portals & capabilities
      return country.portals.some(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.agency.toLowerCase().includes(q) ||
          urlOrTextMatchesToken(p.url, token) ||
          p.summary.toLowerCase().includes(q) ||
          p.capabilities.some((cap) => cap.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (q) {
        const aExactPortal = a.portals.some((p) =>
          p.url.toLowerCase().includes(token.cleanToken)
        )
          ? 1
          : 0;
        const bExactPortal = b.portals.some((p) =>
          p.url.toLowerCase().includes(token.cleanToken)
        )
          ? 1
          : 0;
        if (aExactPortal !== bExactPortal) return bExactPortal - aExactPortal;

        const aExactName = a.name.toLowerCase().startsWith(q) ? 1 : 0;
        const bExactName = b.name.toLowerCase().startsWith(q) ? 1 : 0;
        if (aExactName !== bExactName) return bExactName - aExactName;

        const aStateMatch = a.subNationalRegions.some((r) =>
          r.name.toLowerCase().includes(q)
        )
          ? 1
          : 0;
        const bStateMatch = b.subNationalRegions.some((r) =>
          r.name.toLowerCase().includes(q)
        )
          ? 1
          : 0;
        if (aStateMatch !== bStateMatch) return bStateMatch - aStateMatch;
      }
      return a.name.localeCompare(b.name);
    });
}

export function filterPortalsWithinCountry(
  portals: GovPortalEntry[],
  criteria: Pick<FilterCriteria, 'category' | 'level' | 'searchQuery'>
): GovPortalEntry[] {
  const token = normalizeSearchQueryToken(criteria.searchQuery);
  const q = token.cleanToken;

  return portals.filter((p) => {
    if (criteria.category !== 'All' && p.category !== criteria.category) {
      return false;
    }
    if (criteria.level !== 'All' && p.level !== criteria.level) {
      return false;
    }
    if (!q) {
      return true;
    }
    return (
      p.title.toLowerCase().includes(q) ||
      p.agency.toLowerCase().includes(q) ||
      urlOrTextMatchesToken(p.url, token) ||
      p.summary.toLowerCase().includes(q) ||
      (p.stateOrRegionName && p.stateOrRegionName.toLowerCase().includes(q)) ||
      p.capabilities.some((c) => c.toLowerCase().includes(q))
    );
  });
}

/**
 * Finds specific portals across all countries that directly match a search query or URL (e.g. https://hcmadras.tn.gov.in/).
 */
export function searchMatchingPortalsGlobally(
  countries: EnrichedCountryRecord[],
  rawQuery: string,
  limit: number = 12
): {
  portal: GovPortalEntry;
  country: EnrichedCountryRecord;
  isExactUrlMatch: boolean;
}[] {
  const token = normalizeSearchQueryToken(rawQuery);
  if (!token.cleanToken || token.cleanToken.length < 2) return [];

  const matches: {
    portal: GovPortalEntry;
    country: EnrichedCountryRecord;
    isExactUrlMatch: boolean;
    score: number;
  }[] = [];

  for (const country of countries) {
    for (const portal of country.portals) {
      const normUrl = portal.url
        .toLowerCase()
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/+$/, '');

      const isExactUrlMatch =
        normUrl === token.cleanToken ||
        normUrl === token.hostnameOnly ||
        normUrl.includes(token.cleanToken);

      const titleMatch = portal.title.toLowerCase().includes(token.cleanToken);
      const summaryMatch = portal.summary.toLowerCase().includes(token.cleanToken);
      const agencyMatch = portal.agency.toLowerCase().includes(token.cleanToken);
      const parentDomainMatch = urlOrTextMatchesToken(portal.url, token);

      if (isExactUrlMatch || titleMatch || summaryMatch || agencyMatch || parentDomainMatch) {
        const score = isExactUrlMatch
          ? 100
          : titleMatch
          ? 80
          : agencyMatch
          ? 60
          : summaryMatch
          ? 40
          : 20;
        matches.push({
          portal,
          country,
          isExactUrlMatch,
          score,
        });
      }
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function computeRegistryStats(countries: EnrichedCountryRecord[]) {
  let totalPortals = 0;
  let totalSubNational = 0;
  let totalApis = 0;

  for (const c of countries) {
    totalPortals += c.totalPortalsCount;
    totalSubNational += c.subNationalCount;
    totalApis += c.publicApiCount;
  }

  return {
    totalCountries: countries.length,
    totalPortals,
    totalSubNational,
    totalApis,
  };
}
