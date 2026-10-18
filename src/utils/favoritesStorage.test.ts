import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeFavoritesCounts,
  filterSavedFavorites,
  isFavoriteId,
  parseFavoritesJson,
  removeFavoriteById,
  serializeFavoritesJson,
  toggleFavoriteItem,
} from './favoritesStorage.ts';

test('1. toggleFavoriteItem adds and removes portals and APIs deterministically', () => {
  const initial = parseFavoritesJson(null);
  assert.equal(initial.length, 0);

  const portalCandidate = {
    id: 'country:US',
    itemType: 'country_portal' as const,
    title: 'United States — USA.gov Official National Portal',
    subtitle: 'Washington, D.C. · .gov',
    countryIso2: 'US',
    countryName: 'United States',
    url: 'https://www.usa.gov',
    categoryLabel: 'National E-Gov & Executive Gateway',
  };

  const step1 = toggleFavoriteItem(initial, portalCandidate, '2026-10-18T00:00:00.000Z');
  assert.equal(step1.isSaved, true);
  assert.equal(step1.nextItems.length, 1);
  assert.equal(isFavoriteId(step1.nextItems, 'country:US'), true);

  const apiCandidate = {
    id: 'api:us-treasury-fiscal',
    itemType: 'gov_api' as const,
    title: 'U.S. Treasury Fiscal Data API',
    subtitle: 'U.S. Department of the Treasury',
    countryIso2: 'US',
    countryName: 'United States',
    url: 'https://fiscaldata.treasury.gov/api-documentation/',
    apiEndpoint:
      'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?page[size]=5&sort=-record_date',
    categoryLabel: 'Taxation, Revenue & Customs',
  };

  const step2 = toggleFavoriteItem(step1.nextItems, apiCandidate, '2026-10-18T00:01:00.000Z');
  assert.equal(step2.isSaved, true);
  assert.equal(step2.nextItems.length, 2);

  // Serialize and re-parse to verify localStorage round-trip fidelity
  const rawJson = serializeFavoritesJson(step2.nextItems);
  const restored = parseFavoritesJson(rawJson);
  assert.equal(restored.length, 2);
  assert.equal(restored[0].id, 'api:us-treasury-fiscal');
  assert.equal(restored[1].id, 'country:US');

  // Toggle again to remove
  const step3 = toggleFavoriteItem(restored, portalCandidate);
  assert.equal(step3.isSaved, false);
  assert.equal(step3.nextItems.length, 1);
  assert.equal(isFavoriteId(step3.nextItems, 'country:US'), false);
});

test('2. filterSavedFavorites and computeFavoritesCounts filter by itemType and query', () => {
  const sampleItems = [
    {
      id: 'country:IN',
      itemType: 'country_portal' as const,
      title: 'India — National Portal of India (india.gov.in)',
      subtitle: 'New Delhi · .gov.in',
      countryIso2: 'IN',
      countryName: 'India',
      url: 'https://www.india.gov.in',
      categoryLabel: 'National E-Gov Gateway',
      savedAt: '2026-10-18T00:00:00Z',
    },
    {
      id: 'api:uk-parliament-bills',
      itemType: 'gov_api' as const,
      title: 'UK Parliament Bills & Legislative Activity REST API',
      subtitle: 'UK Parliament',
      countryIso2: 'GB',
      countryName: 'United Kingdom',
      url: 'https://bills-api.parliament.uk',
      apiEndpoint: 'https://bills-api.parliament.uk/api/v1/Bills?Take=5',
      categoryLabel: 'Programmatic Open Data & APIs',
      savedAt: '2026-10-18T00:01:00Z',
    },
  ];

  const counts = computeFavoritesCounts(sampleItems);
  assert.equal(counts.All, 2);
  assert.equal(counts.country_portal, 1);
  assert.equal(counts.gov_api, 1);

  const onlyApis = filterSavedFavorites(sampleItems, 'gov_api', '');
  assert.equal(onlyApis.length, 1);
  assert.equal(onlyApis[0].id, 'api:uk-parliament-bills');

  const queryMatch = filterSavedFavorites(sampleItems, 'All', 'india.gov.in');
  assert.equal(queryMatch.length, 1);
  assert.equal(queryMatch[0].countryIso2, 'IN');

  const afterRemove = removeFavoriteById(sampleItems, 'country:IN');
  assert.equal(afterRemove.length, 1);
});
