import type {
  ContinentId,
  EnrichedCountryRecord,
  IndexedWebsiteLink,
  WebsiteLinkCategory,
  WebsiteLinkResourceFormat,
} from '../types/registry';

export interface WebsiteSummaryEntry {
  websiteId: string;
  websiteTitle: string;
  websiteUrl: string;
  countryIso2: string;
  countryName: string;
  continent: Exclude<ContinentId, 'All'>;
  stateOrRegion?: string;
  level: string;
  agency: string;
  summary: string;
  indexedLinksCount: number;
}

export const WEBSITE_LINK_CATEGORY_LABELS: Record<WebsiteLinkCategory, string> = {
  All: 'All Indexed Links & Resources',
  webpage_info: 'Webpages, Topic Guides & Information',
  citizen_service: 'Citizen & Business Online Services',
  document_form: 'Official Documents, Forms & Laws',
  data_api_feed: 'Datasets, Open APIs & Feeds',
  directory_contact: 'Ministry Directories, Offices & Contacts',
  external_resource: 'External & Partner Official Resources',
};

/**
 * Safely extracts hostname from a URL string.
 */
export function safeGetHostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./i, '');
  } catch {
    return rawUrl;
  }
}

/**
 * Safely extracts pathname + query from a URL string.
 */
export function safeGetPathSegment(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const full = `${parsed.pathname}${parsed.search}`;
    return full === '/' ? '/ (Root Homepage)' : full;
  } catch {
    return '/';
  }
}

/**
 * Infers a human-readable title from a URL path when anchor text is empty or generic.
 */
export function inferReadableTitleFromUrl(rawUrl: string, fallbackHost: string): string {
  try {
    const parsed = new URL(rawUrl);
    const cleanPath = parsed.pathname.replace(/\/+$/, '');
    if (!cleanPath || cleanPath === '') {
      return `${parsed.hostname} — Official Homepage & Main Index`;
    }
    const lastSeg = decodeURIComponent(cleanPath.split('/').filter(Boolean).pop() || '');
    if (!lastSeg) return `${parsed.hostname} — Resource Page`;
    const formatted = lastSeg
      .replace(/\.(html?|php|aspx?|jsp|pdf|docx?|xlsx?|csv|json|xml)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
    return formatted.length >= 2 ? formatted : `${fallbackHost} — ${cleanPath}`;
  } catch {
    return fallbackHost;
  }
}

/**
 * Classifies any discovered URL + anchor text into a WebsiteLinkCategory, WebsiteLinkResourceFormat,
 * and generates a plain-language description of what information or capability that link provides.
 */
export function classifyDiscoveredLink(
  resolvedUrl: string,
  anchorText: string,
  baseHost: string,
  parentSiteTitle: string
): {
  category: Exclude<WebsiteLinkCategory, 'All'>;
  resourceFormat: Exclude<WebsiteLinkResourceFormat, 'All'>;
  isInternal: boolean;
  whatInfoItGives: string;
} {
  const lowerUrl = resolvedUrl.toLowerCase();
  const lowerText = anchorText.toLowerCase();
  const combined = `${lowerUrl} ${lowerText}`;

  const linkHost = safeGetHostname(resolvedUrl).toLowerCase();
  const normalizedBase = baseHost.replace(/^www\./i, '').toLowerCase();
  const isInternal =
    linkHost === normalizedBase ||
    linkHost.endsWith(`.${normalizedBase}`) ||
    normalizedBase.endsWith(`.${linkHost}`);

  // 1. Direct Document / Form / Legal Publication
  if (
    /\.(pdf|docx?|rtf|odt)(\?.*)?$/i.test(lowerUrl) ||
    /(form|application-form|gazette|legislation|statute|decree|ordinance|circular|act-|publication|whitepaper|handbook|manual|brochure|leaflet|constitution|charter)/i.test(
      combined
    )
  ) {
    const isPdf = /\.pdf(\?.*)?$/i.test(lowerUrl);
    return {
      category: 'document_form',
      resourceFormat: 'PDF / Document',
      isInternal,
      whatInfoItGives: isPdf
        ? `Official downloadable PDF document, statutory form, or publication hosted on ${linkHost} (${anchorText}).`
        : `Official government publication, legal instrument, or downloadable form page on ${parentSiteTitle} providing regulatory text, filing instructions, or downloadable records.`,
    };
  }

  // 2. Data, API, Spreadsheet, Feed, or Statistical Resource
  if (
    /\.(csv|xlsx?|json|xml|rss|atom|zip|geojson)(\?.*)?$/i.test(lowerUrl) ||
    /(api|dataset|open-data|opendata|statistics|census|indicator|budget-data|catalog|sparql|graphql|swagger|openapi|rss|feed|dashboard|metrics)/i.test(
      combined
    )
  ) {
    return {
      category: 'data_api_feed',
      resourceFormat: 'Data / API / Feed',
      isInternal,
      whatInfoItGives: `Structured data resource, machine-readable feed, statistical series, or developer API endpoint from ${parentSiteTitle} (${linkHost}) for querying public records and datasets.`,
    };
  }

  // 3. Ministry Directory, Contact, Office Locator, Embassy, or Organizational Index
  if (
    /(contact|directory|ministries|ministry|agencies|agency|department|embassy|consulate|office|locations|helpdesk|ombu|staff|leadership|cabinet|organization|organisation|local-gov|municipality|council)/i.test(
      combined
    )
  ) {
    return {
      category: 'directory_contact',
      resourceFormat: 'Directory / Index',
      isInternal,
      whatInfoItGives: `Official institutional directory, department index, regional office locator, or citizen contact channel for ${parentSiteTitle}, listing responsible agencies, addresses, and official communication links.`,
    };
  }

  // 4. Online Citizen or Business Transactional Service
  if (
    /(service|apply|register|portal|login|sign-in|account|e-gov|egov|tax|passport|visa|license|permit|benefit|pension|health|insurance|claim|payment|pay|renew|appointment|verify|status|check|business|company|customs|driver|vehicle)/i.test(
      combined
    )
  ) {
    return {
      category: 'citizen_service',
      resourceFormat: 'Service Portal',
      isInternal,
      whatInfoItGives: `Interactive government service page on ${parentSiteTitle} enabling citizens, residents, or businesses to check eligibility, complete online transactions, submit applications, or access digital civic services.`,
    };
  }

  // 5. External Partner / Cross-Domain Resource
  if (!isInternal) {
    return {
      category: 'external_resource',
      resourceFormat: 'Web Resource',
      isInternal: false,
      whatInfoItGives: `Cross-referenced official external website or partner government resource (${linkHost}) linked from ${parentSiteTitle} providing specialized inter-agency or international public information.`,
    };
  }

  // 6. Default: Informational Webpage, Policy Guide, News, FAQ, or Topic Resource
  return {
    category: 'webpage_info',
    resourceFormat: 'HTML Webpage',
    isInternal: true,
    whatInfoItGives: `Official informational webpage, topic guide, policy overview, or public announcement on ${parentSiteTitle} (${linkHost}) providing verified civic, administrative, or regulatory information.`,
  };
}

/**
 * Pure HTML parser that extracts and indexes ALL links (<a href>, <link href>, <area href>)
 * from a website's HTML source so no webpage or resource link is missed.
 */
export function extractAndClassifyLinksFromHtml(
  html: string,
  finalUrl: string,
  websiteTitle: string,
  countryIso2: string = 'UN',
  countryName: string = 'Global Jurisdiction',
  continent: Exclude<ContinentId, 'All'> = 'Europe'
): IndexedWebsiteLink[] {
  let baseParsed: URL;
  try {
    baseParsed = new URL(finalUrl);
  } catch {
    return [];
  }

  const baseHost = baseParsed.hostname;
  const results: IndexedWebsiteLink[] = [];
  const seenUrls = new Set<string>();

  const pushCandidate = (rawHref: string, rawLabel: string) => {
    const trimmedHref = rawHref.trim();
    if (
      !trimmedHref ||
      trimmedHref.startsWith('#') ||
      trimmedHref.toLowerCase().startsWith('javascript:') ||
      trimmedHref.toLowerCase().startsWith('mailto:') ||
      trimmedHref.toLowerCase().startsWith('tel:') ||
      trimmedHref.toLowerCase().startsWith('data:')
    ) {
      return;
    }

    let resolved: URL;
    try {
      resolved = new URL(trimmedHref, finalUrl);
      if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return;
      // Strip hash fragments so same page isn't duplicated 10 times, unless hash is routing
      if (resolved.hash && !resolved.hash.startsWith('#/') && !resolved.hash.startsWith('#!')) {
        resolved.hash = '';
      }
    } catch {
      return;
    }

    const normalizedUrl = resolved.toString();
    if (seenUrls.has(normalizedUrl)) return;
    seenUrls.add(normalizedUrl);

    // Skip raw CSS/JS/font/icon assets
    if (/\.(css|js|mjs|ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot)(\?.*)?$/i.test(resolved.pathname)) {
      return;
    }

    const cleanAnchor = rawLabel
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);

    const inferredFromPath = inferReadableTitleFromUrl(normalizedUrl, resolved.hostname);
    const isGenericAnchor = /^(menu|home|read more|learn more|click here|more|link|view|go)$/i.test(
      cleanAnchor
    );

    const finalTitle =
      cleanAnchor.length >= 2 && !isGenericAnchor
        ? cleanAnchor
        : cleanAnchor.length >= 2 && isGenericAnchor
        ? `${cleanAnchor} — ${inferredFromPath} (${safeGetPathSegment(normalizedUrl)})`
        : inferredFromPath;

    const classification = classifyDiscoveredLink(
      normalizedUrl,
      finalTitle,
      baseHost,
      websiteTitle
    );

    results.push({
      id: `live-link-${results.length + 1}-${normalizedUrl.slice(0, 60)}`,
      websiteId: `live:${baseHost}`,
      websiteTitle,
      websiteUrl: finalUrl,
      countryIso2,
      countryName,
      continent,
      url: normalizedUrl,
      title: finalTitle,
      category: classification.category,
      resourceFormat: classification.resourceFormat,
      pathSegment: safeGetPathSegment(normalizedUrl),
      domain: safeGetHostname(normalizedUrl),
      isInternal: classification.isInternal,
      whatInfoItGives: classification.whatInfoItGives,
      isLiveCrawled: true,
    });
  };

  // 1. Extract all <a ... href="...">...</a>
  const anchorRegex = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    const attrs = match[1];
    const innerHtml = match[2];
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const ariaLabelMatch = attrs.match(/aria-label=["']([^"']+)["']/i);
    const titleAttrMatch = attrs.match(/title=["']([^"']+)["']/i);
    const innerText = innerHtml.replace(/<[^>]+>/g, ' ').trim();
    const bestLabel =
      innerText.length >= 2
        ? innerText
        : ariaLabelMatch?.[1] || titleAttrMatch?.[1] || '';
    pushCandidate(hrefMatch[1], bestLabel);
    if (results.length >= 250) break;
  }

  // 2. Also extract alternate RSS/Atom/JSON feeds or canonical/sitemap links in <link> tags
  const linkTagRegex = /<link\s+([^>]*?)\/?>/gi;
  while ((match = linkTagRegex.exec(html)) !== null) {
    const attrs = match[1];
    const relMatch = attrs.match(/rel=["']([^"']+)["']/i);
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    const rel = (relMatch?.[1] || '').toLowerCase();
    if (rel.includes('alternate') || rel.includes('feed') || rel.includes('sitemap')) {
      const titleMatch = attrs.match(/title=["']([^"']+)["']/i);
      pushCandidate(hrefMatch[1], titleMatch?.[1] || `Official ${rel.toUpperCase()} Feed / Index`);
    }
  }

  // Sort substantive links (services, documents, data, directories, topic guides) ahead of cookie/utility links
  const utilityRegex = /(cookie|privacy-policy|terms-and-conditions|accessibility-statement|skip-to)/i;
  const categoryPriority: Record<Exclude<WebsiteLinkCategory, 'All'>, number> = {
    citizen_service: 1,
    document_form: 2,
    data_api_feed: 3,
    directory_contact: 4,
    webpage_info: 5,
    external_resource: 6,
  };

  return results.sort((a, b) => {
    const aIsUtility = utilityRegex.test(`${a.url} ${a.title}`) ? 1 : 0;
    const bIsUtility = utilityRegex.test(`${b.url} ${b.title}`) ? 1 : 0;
    if (aIsUtility !== bIsUtility) return aIsUtility - bIsUtility;
    return (categoryPriority[a.category] || 9) - (categoryPriority[b.category] || 9);
  });
}

/**
 * Builds the comprehensive pre-indexed directory of websites and their sub-links/webpages/resources
 * across all 195+ countries, ministries, and sub-national portals.
 */
export function buildGlobalWebsiteLinkIndex(allCountries: EnrichedCountryRecord[]): {
  websites: WebsiteSummaryEntry[];
  allLinks: IndexedWebsiteLink[];
} {
  const websites: WebsiteSummaryEntry[] = [];
  const allLinks: IndexedWebsiteLink[] = [];

  for (const country of allCountries) {
    for (const portal of country.portals) {
      const baseHost = safeGetHostname(portal.url);
      const baseOrigin = portal.url.replace(/\/+$/, '');
      const portalLinks: IndexedWebsiteLink[] = [];

      // 1. Root Official Portal Homepage & Main Index
      portalLinks.push({
        id: `${portal.id}-link-root`,
        websiteId: portal.id,
        websiteTitle: portal.title,
        websiteUrl: portal.url,
        countryIso2: country.iso2,
        countryName: country.name,
        continent: country.continent,
        url: portal.url,
        title: `${portal.title} — Main Homepage & Executive Index`,
        category: 'webpage_info',
        resourceFormat: 'HTML Webpage',
        pathSegment: '/ (Root Homepage)',
        domain: baseHost,
        isInternal: true,
        whatInfoItGives: `${portal.summary} Provides top-level navigation to all ${country.name} public services, news, ministries, and official announcements.`,
      });

      // 2. Capabilities -> Specific Service & Topic Webpages on that Website
      portal.capabilities.forEach((cap, idx) => {
        const isDoc = /(form|gazette|law|legislation|certificate|act|report|pdf|return)/i.test(cap);
        const isData = /(api|dataset|statistic|census|indicator|json|csv|open data)/i.test(cap);
        const isDir = /(directory|ministries|department|contact|office|agency)/i.test(cap);

        const category: Exclude<WebsiteLinkCategory, 'All'> = isData
          ? 'data_api_feed'
          : isDoc
          ? 'document_form'
          : isDir
          ? 'directory_contact'
          : 'citizen_service';

        const resourceFormat: Exclude<WebsiteLinkResourceFormat, 'All'> = isData
          ? 'Data / API / Feed'
          : isDoc
          ? 'PDF / Document'
          : isDir
          ? 'Directory / Index'
          : 'Service Portal';

        const slug = cap
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 36);

        portalLinks.push({
          id: `${portal.id}-cap-${idx}`,
          websiteId: portal.id,
          websiteTitle: portal.title,
          websiteUrl: portal.url,
          countryIso2: country.iso2,
          countryName: country.name,
          continent: country.continent,
          url: portal.url,
          title: `${country.name}: ${cap.slice(0, 95)}${cap.length > 95 ? '...' : ''}`,
          category,
          resourceFormat,
          pathSegment: `/services/${slug || `section-${idx + 1}`}`,
          domain: baseHost,
          isInternal: true,
          whatInfoItGives: `Official webpage and service resource on ${portal.title} (${baseHost}) where users can: ${cap}.`,
        });
      });

      // 3. Agency Directory, Contact & Public Information Guide Link for every primary national portal
      if (portal.id.endsWith('-primary')) {
        portalLinks.push({
          id: `${portal.id}-directory-guide`,
          websiteId: portal.id,
          websiteTitle: portal.title,
          websiteUrl: country.ministryDirectoryUrl || portal.url,
          countryIso2: country.iso2,
          countryName: country.name,
          continent: country.continent,
          url: country.ministryDirectoryUrl || baseOrigin,
          title: `${country.name} — Complete Directory of Ministries, Agencies & Public Contacts`,
          category: 'directory_contact',
          resourceFormat: 'Directory / Index',
          pathSegment: '/government/ministries-and-agencies',
          domain: safeGetHostname(country.ministryDirectoryUrl || portal.url),
          isInternal: true,
          whatInfoItGives: `Lists all cabinet ministries, executive agencies, public authorities, ombudsman offices, and official contact details for ${country.name}.`,
        });

        portalLinks.push({
          id: `${portal.id}-citizen-info-hub`,
          websiteId: portal.id,
          websiteTitle: portal.title,
          websiteUrl: portal.url,
          countryIso2: country.iso2,
          countryName: country.name,
          continent: country.continent,
          url: baseOrigin,
          title: `${country.name} — Citizen & Resident A–Z Information Guide (${country.officialLanguages.join(', ')})`,
          category: 'webpage_info',
          resourceFormat: 'HTML Webpage',
          pathSegment: '/information-and-services/a-z',
          domain: baseHost,
          isInternal: true,
          whatInfoItGives: `Comprehensive A–Z informational guide covering life events, residency, healthcare, education, housing, employment, and legal rights in ${country.name}.`,
        });
      }

      // 4. If the portal has a live API endpoint or documentation URL, index those resource links too
      if (portal.apiEndpoint) {
        portalLinks.push({
          id: `${portal.id}-api-endpoint`,
          websiteId: portal.id,
          websiteTitle: portal.title,
          websiteUrl: portal.url,
          countryIso2: country.iso2,
          countryName: country.name,
          continent: country.continent,
          url: portal.apiEndpoint,
          title: `${portal.title} — Direct Machine-Readable API / Data Resource`,
          category: 'data_api_feed',
          resourceFormat: 'Data / API / Feed',
          pathSegment: safeGetPathSegment(portal.apiEndpoint),
          domain: safeGetHostname(portal.apiEndpoint),
          isInternal: safeGetHostname(portal.apiEndpoint) === baseHost,
          whatInfoItGives: `Live programmatic REST API / JSON endpoint providing real-time structured data from ${portal.agency} (${country.name}).`,
        });
      }

      websites.push({
        websiteId: portal.id,
        websiteTitle: portal.title,
        websiteUrl: portal.url,
        countryIso2: country.iso2,
        countryName: country.name,
        continent: country.continent,
        level: portal.level,
        agency: portal.agency,
        summary: portal.summary,
        indexedLinksCount: portalLinks.length,
      });

      allLinks.push(...portalLinks);
    }
  }

  return { websites, allLinks };
}

export interface WebsiteLinkFilterCriteria {
  continent: ContinentId;
  countryIso2: string; // 'ALL' or ISO2
  websiteId: string; // 'ALL' or specific websiteId
  category: WebsiteLinkCategory;
  resourceFormat: WebsiteLinkResourceFormat;
  searchQuery: string;
}

/**
 * Pure multi-axis filter for indexed website links & resources.
 */
export function filterIndexedWebsiteLinks(
  links: IndexedWebsiteLink[],
  criteria: WebsiteLinkFilterCriteria
): IndexedWebsiteLink[] {
  const rawQ = criteria.searchQuery.trim().toLowerCase();
  const normQ = rawQ
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/+$/, '');

  return links.filter((link) => {
    if (criteria.continent !== 'All' && link.continent !== criteria.continent) {
      return false;
    }
    if (criteria.countryIso2 !== 'ALL' && link.countryIso2 !== criteria.countryIso2) {
      return false;
    }
    if (criteria.websiteId !== 'ALL' && link.websiteId !== criteria.websiteId) {
      return false;
    }
    if (criteria.category !== 'All' && link.category !== criteria.category) {
      return false;
    }
    if (criteria.resourceFormat !== 'All' && link.resourceFormat !== criteria.resourceFormat) {
      return false;
    }

    if (!normQ) return true;

    const haystack = [
      link.title,
      link.url,
      link.websiteTitle,
      link.websiteUrl,
      link.countryName,
      link.countryIso2,
      link.domain,
      link.pathSegment,
      link.whatInfoItGives,
      link.resourceFormat,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normQ) || haystack.includes(rawQ);
  });
}

