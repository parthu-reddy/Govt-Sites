import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enrichCountriesRegistry,
  filterEnrichedCountries,
  filterPortalsWithinCountry,
  getDistinctSubRegions,
  computeRegistryStats,
} from './registryFilter.ts';
import { COUNTRIES_REGISTRY } from '../data/countriesRegistry.ts';
import { SUB_NATIONAL_REGISTRY } from '../data/subNationalRegistry.ts';
import { PUBLIC_GOV_APIS } from '../data/publicGovApis.ts';

const ENRICHED = enrichCountriesRegistry(
  COUNTRIES_REGISTRY,
  SUB_NATIONAL_REGISTRY,
  PUBLIC_GOV_APIS
);

test('registry contains all 195+ sovereign nations across all 5 inhabited continents with zero duplicate ISO2 codes', () => {
  assert.ok(ENRICHED.length >= 195, `Expected at least 195 countries, got ${ENRICHED.length}`);
  const seenIso2 = new Set<string>();
  for (const c of ENRICHED) {
    assert.equal(seenIso2.has(c.iso2), false, `Duplicate ISO2 found: ${c.iso2}`);
    seenIso2.add(c.iso2);
    assert.ok(c.primaryPortalUrl.startsWith('http'), `Invalid URL for ${c.name}: ${c.primaryPortalUrl}`);
    assert.ok(c.portals.length >= 5, `Expected at least 5 portals for ${c.name}`);
  }
});

test('continent and sub-region filtering returns accurate subsets', () => {
  const europe = filterEnrichedCountries(ENRICHED, {
    continent: 'Europe',
    subRegion: 'All',
    category: 'All',
    level: 'All',
    searchQuery: '',
  });
  assert.ok(europe.length >= 44, `Expected at least 44 European countries, got ${europe.length}`);
  assert.ok(europe.every((c) => c.continent === 'Europe'));

  const subRegions = getDistinctSubRegions(ENRICHED, 'Europe');
  assert.ok(subRegions.includes('Western Europe'));
  assert.ok(subRegions.includes('Northern Europe'));
});

test('state and provincial search finds parent country and specific state portal', () => {
  const caSearch = filterEnrichedCountries(ENRICHED, {
    continent: 'All',
    subRegion: 'All',
    category: 'All',
    level: 'All',
    searchQuery: 'California',
  });
  assert.ok(caSearch.some((c) => c.iso2 === 'US'));

  const mahaSearch = filterEnrichedCountries(ENRICHED, {
    continent: 'All',
    subRegion: 'All',
    category: 'All',
    level: 'All',
    searchQuery: 'Maharashtra',
  });
  assert.ok(mahaSearch.some((c) => c.iso2 === 'IN'));

  const bavariaSearch = filterEnrichedCountries(ENRICHED, {
    continent: 'All',
    subRegion: 'All',
    category: 'All',
    level: 'All',
    searchQuery: 'Bayern',
  });
  assert.ok(bavariaSearch.some((c) => c.iso2 === 'DE'));
});

test('filterPortalsWithinCountry filters by level and service category', () => {
  const us = ENRICHED.find((c) => c.iso2 === 'US')!;
  const statePortals = filterPortalsWithinCountry(us.portals, {
    category: 'local_municipal',
    level: 'state_provincial',
    searchQuery: '',
  });
  assert.equal(statePortals.length, 51, 'Expected all 50 US states + Washington, D.C.');

  const stats = computeRegistryStats(ENRICHED);
  assert.ok(stats.totalPortals > 1000);
  assert.ok(stats.totalSubNational > 140);
});
