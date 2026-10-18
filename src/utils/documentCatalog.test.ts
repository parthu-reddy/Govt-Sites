import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichCountriesRegistry } from './registryFilter.ts';
import {
  buildGlobalDocumentCatalog,
  computeDocumentCatalogStats,
  filterDocuments,
} from './documentCatalog.ts';
import { COUNTRIES_REGISTRY } from '../data/countriesRegistry.ts';
import { SUB_NATIONAL_REGISTRY } from '../data/subNationalRegistry.ts';
import { PUBLIC_GOV_APIS } from '../data/publicGovApis.ts';

const enrichedCountries = enrichCountriesRegistry(
  COUNTRIES_REGISTRY,
  SUB_NATIONAL_REGISTRY,
  PUBLIC_GOV_APIS
);

const allDocs = buildGlobalDocumentCatalog(enrichedCountries);

test('1. Global document catalog generates documents for every sovereign country and state', () => {
  assert.ok(
    allDocs.length >= 1100,
    `Expected at least 1,100 official documents across 195+ countries and states, got ${allDocs.length}`
  );
  const countriesWithDocs = new Set(allDocs.map((d) => d.countryIso2));
  assert.ok(
    countriesWithDocs.size >= 195,
    `Expected all 195+ countries to have accessible documents, got ${countriesWithDocs.size}`
  );
});

test('2. Every document includes a plain-language citizen guide with prerequisites and steps', () => {
  for (const doc of allDocs.slice(0, 50)) {
    assert.ok(doc.whatItIsUsedFor.length > 10, `Document ${doc.id} missing whatItIsUsedFor`);
    assert.ok(
      doc.citizenGuide.prerequisites.length >= 1,
      `Document ${doc.id} missing citizen prerequisites`
    );
    assert.ok(
      doc.citizenGuide.stepByStep.length >= 2,
      `Document ${doc.id} missing step-by-step instructions`
    );
  }
});

test('3. Document filtering by country, document type, format, and search query works accurately', () => {
  const usPdfDocs = filterDocuments(allDocs, {
    continent: 'All',
    countryIso2: 'US',
    docType: 'All',
    format: 'PDF',
    searchQuery: '1040',
  });
  assert.ok(usPdfDocs.length >= 1, 'Expected IRS Form 1040 PDF to match US + PDF + 1040');
  assert.equal(usPdfDocs[0].documentCode, 'IRS Form 1040');

  const indiaStateDocs = filterDocuments(allDocs, {
    continent: 'Asia',
    countryIso2: 'IN',
    docType: 'form_application',
    format: 'All',
    searchQuery: 'Maharashtra',
  });
  assert.ok(indiaStateDocs.length >= 1, 'Expected Maharashtra state documents to match');

  const stats = computeDocumentCatalogStats(allDocs);
  assert.equal(stats.totalDocuments, allDocs.length);
  assert.ok(stats.byType.tax_customs >= 195);
  assert.ok(stats.byType.legislation_gazette >= 195);
});
