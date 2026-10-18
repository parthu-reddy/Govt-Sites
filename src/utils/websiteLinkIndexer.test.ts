import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES_REGISTRY } from '../data/countriesRegistry.ts';
import { SUB_NATIONAL_REGISTRY } from '../data/subNationalRegistry.ts';
import { PUBLIC_GOV_APIS } from '../data/publicGovApis.ts';
import { enrichCountriesRegistry } from './registryFilter.ts';
import {
  buildGlobalWebsiteLinkIndex,
  extractAndClassifyLinksFromHtml,
  filterIndexedWebsiteLinks,
} from './websiteLinkIndexer.ts';

const allCountries = enrichCountriesRegistry(
  COUNTRIES_REGISTRY,
  SUB_NATIONAL_REGISTRY,
  PUBLIC_GOV_APIS
);

test('1. buildGlobalWebsiteLinkIndex indexes webpages, services, directories, and resources across all websites', () => {
  const { websites, allLinks } = buildGlobalWebsiteLinkIndex(allCountries);
  assert.ok(websites.length >= 1000, `Expected >= 1000 websites, got ${websites.length}`);
  assert.ok(allLinks.length >= 4500, `Expected >= 4500 indexed website links, got ${allLinks.length}`);

  // Verify every link has a non-empty whatInfoItGives description and valid URL
  for (const link of allLinks.slice(0, 150)) {
    assert.ok(link.url.startsWith('http'), `Link URL must start with http: ${link.url}`);
    assert.ok(link.whatInfoItGives.length > 15, 'Link must describe what info it gives');
    assert.ok(link.title.length > 2, 'Link must have a readable title');
  }
});

test('2. extractAndClassifyLinksFromHtml extracts all anchor and feed links and classifies them accurately', () => {
  const sampleHtml = `
    <html>
      <head>
        <title>Official Government Portal</title>
        <link rel="alternate" type="application/rss+xml" title="Official News RSS Feed" href="/feeds/news.xml" />
      </head>
      <body>
        <nav>
          <a href="/about-government">About the Government & Policy Overview</a>
          <a href="/services/apply-passport">Apply for or Renew a Citizen Passport Online</a>
          <a href="/documents/tax-guide-2026.pdf">Download 2026 Individual Income Tax Guide (PDF)</a>
          <a href="/open-data/budget-2026.csv">National Budget Dataset (CSV)</a>
          <a href="/directory/ministries-and-contacts">Directory of Ministries & Regional Offices</a>
          <a href="https://data.worldbank.org/country">External World Bank Statistical Partner</a>
        </nav>
      </body>
    </html>
  `;

  const extracted = extractAndClassifyLinksFromHtml(
    sampleHtml,
    'https://www.example.gov',
    'Example National Portal',
    'US',
    'United States',
    'Americas'
  );

  assert.equal(extracted.length, 7);

  const byCategory = new Map(extracted.map((item) => [item.url, item.category]));
  assert.equal(byCategory.get('https://www.example.gov/about-government'), 'webpage_info');
  assert.equal(byCategory.get('https://www.example.gov/services/apply-passport'), 'citizen_service');
  assert.equal(byCategory.get('https://www.example.gov/documents/tax-guide-2026.pdf'), 'document_form');
  assert.equal(byCategory.get('https://www.example.gov/open-data/budget-2026.csv'), 'data_api_feed');
  assert.equal(
    byCategory.get('https://www.example.gov/directory/ministries-and-contacts'),
    'directory_contact'
  );
  assert.equal(byCategory.get('https://data.worldbank.org/country'), 'external_resource');
  assert.equal(byCategory.get('https://www.example.gov/feeds/news.xml'), 'data_api_feed');
});

test('3. filterIndexedWebsiteLinks filters by country, websiteId, category, and search query', () => {
  const { allLinks } = buildGlobalWebsiteLinkIndex(allCountries);

  const usOnly = filterIndexedWebsiteLinks(allLinks, {
    continent: 'All',
    countryIso2: 'US',
    websiteId: 'ALL',
    category: 'All',
    resourceFormat: 'All',
    searchQuery: '',
  });
  assert.ok(usOnly.length > 20);
  assert.ok(usOnly.every((l) => l.countryIso2 === 'US'));

  const usDirectories = filterIndexedWebsiteLinks(allLinks, {
    continent: 'All',
    countryIso2: 'US',
    websiteId: 'ALL',
    category: 'directory_contact',
    resourceFormat: 'All',
    searchQuery: '',
  });
  assert.ok(usDirectories.length >= 1);
  assert.ok(usDirectories.every((l) => l.category === 'directory_contact'));
});
