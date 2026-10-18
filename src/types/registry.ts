export type ContinentId =
  | 'All'
  | 'Africa'
  | 'Americas'
  | 'Asia'
  | 'Europe'
  | 'Oceania';

export type ServiceCategoryId =
  | 'All'
  | 'executive'
  | 'tax_finance'
  | 'identity_civil'
  | 'business_trade'
  | 'health_social'
  | 'justice_law'
  | 'open_data_api'
  | 'local_municipal';

export type GovLevelId = 'All' | 'national' | 'state_provincial' | 'municipal' | 'api';

export type LanguageCode = 'en' | 'es' | 'fr' | 'ar' | 'zh' | 'hi' | 'de' | 'pt';

export interface GovPortalEntry {
  id: string;
  title: string;
  agency: string;
  url: string;
  category: Exclude<ServiceCategoryId, 'All'>;
  level: Exclude<GovLevelId, 'All'>;
  summary: string;
  capabilities: string[];
  languagesSupported: string[];
  hasPublicApi?: boolean;
  apiEndpoint?: string;
  apiDocsUrl?: string;
  stateOrRegionName?: string;
}

export interface SubNationalRegion {
  id: string;
  countryIso2: string;
  name: string;
  nativeName?: string;
  type: 'State' | 'Province' | 'Territory' | 'Bundesland' | 'Prefecture' | 'Canton' | 'Autonomous Community' | 'Devolved Nation' | 'Emirate' | 'Municipality';
  capitalOrSeat: string;
  officialUrl: string;
  summary: string;
  localServices: {
    name: string;
    category: Exclude<ServiceCategoryId, 'All'>;
    url: string;
    whatYouCanDo: string;
  }[];
  openDataUrl?: string;
}

export interface CountryBaseRecord {
  iso2: string;
  iso3: string;
  name: string;
  nativeName: string;
  continent: Exclude<ContinentId, 'All'>;
  subRegion: string;
  capital: string;
  govTld: string;
  primaryPortalUrl: string;
  primaryPortalName: string;
  officialLanguages: string[];
  eGovSummary: string;
  openDataPortalUrl?: string;
  statisticalOfficeUrl?: string;
  taxAuthorityUrl?: string;
  immigrationPortalUrl?: string;
  businessRegistryUrl?: string;
  legislationPortalUrl?: string;
  healthMinistryUrl?: string;
  customPortals?: GovPortalEntry[];
}

export interface EnrichedCountryRecord extends CountryBaseRecord {
  portals: GovPortalEntry[];
  subNationalRegions: SubNationalRegion[];
  totalPortalsCount: number;
  subNationalCount: number;
  publicApiCount: number;
}

export interface PublicGovApiSpec {
  id: string;
  title: string;
  countryIso2: string;
  countryName: string;
  agency: string;
  category: Exclude<ServiceCategoryId, 'All'>;
  endpointUrl: string;
  docsUrl: string;
  method: 'GET';
  authRequired: false;
  responseFormat: 'JSON';
  description: string;
  whatCanBeFetched: string[];
  sampleQueryLabel: string;
}

export interface UrlVerificationResult {
  url: string;
  reachable: boolean;
  statusCode: number | null;
  statusText: string;
  finalUrl: string;
  latencyMs: number;
  contentType: string | null;
  isHttps: boolean;
  checkedAt: string;
  error?: string;
}

export interface LiveCountryIndicators {
  iso2: string;
  countryName: string;
  officialName: string;
  capital: string[];
  region: string;
  subregion: string;
  languages: Record<string, string>;
  currencies: Record<string, { name: string; symbol: string }>;
  population: number | null;
  populationYear: string | null;
  gdpUsd: number | null;
  gdpYear: string | null;
  internetUsersPct: number | null;
  internetUsersYear: string | null;
  unMember: boolean;
  flagSvgUrl: string;
  coatOfArmsSvgUrl?: string;
  googleMapsUrl?: string;
  sources: {
    name: string;
    apiUrl: string;
  }[];
}

export interface AiGroundedResearchResult {
  query: string;
  answerMarkdown: string;
  structuredServices: {
    portalName: string;
    officialUrl: string;
    jurisdiction: string;
    level: string;
    whatYouCanDo: string;
    apiInfo?: string;
  }[];
  groundingSources: {
    title: string;
    uri: string;
    verified?: UrlVerificationResult;
  }[];
  modelUsed: string;
  timestamp: string;
}

export type GovDocumentFormat =
  | 'All'
  | 'PDF'
  | 'HTML'
  | 'CSV_XLSX'
  | 'JSON_XML'
  | 'FORM';

export type GovDocumentType =
  | 'All'
  | 'form_application'
  | 'legislation_gazette'
  | 'tax_customs'
  | 'identity_immigration'
  | 'business_licensing'
  | 'budget_statistics'
  | 'public_health';

export interface GovDocumentEntry {
  id: string;
  title: string;
  documentCode: string;
  countryIso2: string;
  countryName: string;
  continent: Exclude<ContinentId, 'All'>;
  stateOrRegion?: string;
  agency: string;
  portalUrl: string;
  documentUrl: string;
  downloadUrl?: string;
  format: Exclude<GovDocumentFormat, 'All'>;
  docType: Exclude<GovDocumentType, 'All'>;
  publishedDate: string;
  summary: string;
  whatItIsUsedFor: string;
  sourceRepository: string;
  isLiveFetched?: boolean;
}

export interface DiscoveredPortalDoc {
  title: string;
  url: string;
  fileType: string;
  category: 'direct_file' | 'official_form_or_publication';
}

export interface PortalScanResult {
  portalUrl: string;
  finalUrl: string;
  pageTitle: string;
  statusCode: number | null;
  scannedAt: string;
  latencyMs: number;
  directFiles: DiscoveredPortalDoc[];
  publicationPages: DiscoveredPortalDoc[];
  error?: string;
}

export interface DocumentInspectionResult {
  url: string;
  finalUrl: string;
  reachable: boolean;
  statusCode: number | null;
  contentType: string | null;
  contentLengthBytes: number | null;
  lastModified: string | null;
  isPdf: boolean;
  pageTitle: string;
  extractedTextPreview: string;
  embeddedFiles: {
    label: string;
    url: string;
    format: string;
  }[];
  checkedAt: string;
  error?: string;
}

export type WebsiteLinkCategory =
  | 'All'
  | 'webpage_info'
  | 'citizen_service'
  | 'document_form'
  | 'data_api_feed'
  | 'directory_contact'
  | 'external_resource';

export type WebsiteLinkResourceFormat =
  | 'All'
  | 'HTML Webpage'
  | 'Service Portal'
  | 'PDF / Document'
  | 'Data / API / Feed'
  | 'Directory / Index'
  | 'Web Resource';

export interface IndexedWebsiteLink {
  id: string;
  websiteId: string;
  websiteTitle: string;
  websiteUrl: string;
  countryIso2: string;
  countryName: string;
  continent: Exclude<ContinentId, 'All'>;
  stateOrRegion?: string;
  url: string;
  title: string;
  category: Exclude<WebsiteLinkCategory, 'All'>;
  resourceFormat: Exclude<WebsiteLinkResourceFormat, 'All'>;
  pathSegment: string;
  domain: string;
  isInternal: boolean;
  whatInfoItGives: string;
  isLiveCrawled?: boolean;
}

export interface LiveWebsiteLinkCrawlResult {
  websiteUrl: string;
  finalUrl: string;
  pageTitle: string;
  metaDescription: string;
  statusCode: number | null;
  crawledAt: string;
  latencyMs: number;
  totalLinksFound: number;
  internalLinksCount: number;
  externalLinksCount: number;
  categoryBreakdown: Record<Exclude<WebsiteLinkCategory, 'All'>, number>;
  links: IndexedWebsiteLink[];
  error?: string;
}


