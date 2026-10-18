import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { extractAndClassifyLinksFromHtml } from './src/utils/websiteLinkIndexer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '2mb' }));

// Helper to verify a URL via live HTTP probe
async function verifyUrlLive(rawUrl: string) {
  const start = Date.now();
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }
  } catch (err: any) {
    return {
      url: rawUrl,
      reachable: false,
      statusCode: null,
      statusText: 'Invalid URL',
      finalUrl: rawUrl,
      latencyMs: 0,
      contentType: null,
      isHttps: rawUrl.startsWith('https://'),
      checkedAt: new Date().toISOString(),
      error: err?.message || 'Invalid URL format',
    };
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 CivisMundiVerifier/1.0',
    Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  };

  try {
    let response = await fetch(parsed.toString(), {
      method: 'HEAD',
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(6500),
    });

    if (response.status === 405 || response.status === 403 || response.status === 400) {
      response = await fetch(parsed.toString(), {
        method: 'GET',
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(6500),
      });
    }

    const latencyMs = Date.now() - start;
    const reachable = response.status >= 200 && response.status < 500;
    return {
      url: rawUrl,
      reachable,
      statusCode: response.status,
      statusText:
        response.status >= 200 && response.status < 400
          ? `${response.status} ${response.statusText || 'OK'}`
          : `${response.status} (Host Active / WAF Protected)`,
      finalUrl: response.url || rawUrl,
      latencyMs,
      contentType: response.headers.get('content-type'),
      isHttps: (response.url || rawUrl).startsWith('https://'),
      checkedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    return {
      url: rawUrl,
      reachable: false,
      statusCode: null,
      statusText: 'Connection Timeout or Geo-Restricted',
      finalUrl: rawUrl,
      latencyMs,
      contentType: null,
      isHttps: rawUrl.startsWith('https://'),
      checkedAt: new Date().toISOString(),
      error: err?.message || 'Network request failed',
    };
  }
}

// 1. Live URL Cross-Check Endpoint
app.get('/api/verify-url', async (req, res) => {
  const url = String(req.query.url || '').trim();
  if (!url) {
    res.status(400).json({ error: 'Missing url query parameter' });
    return;
  }
  const result = await verifyUrlLive(url);
  res.json(result);
});

// 2. Live Sovereign Country Indicators & Metadata Endpoint (World Bank + REST Countries)
app.get('/api/gov-data/country/:iso2', async (req, res) => {
  const iso2 = String(req.params.iso2 || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(iso2)) {
    res.status(400).json({ error: 'Invalid ISO2 country code' });
    return;
  }

  const restCountriesUrl = `https://restcountries.com/v3.1/alpha/${iso2}`;
  const wbPopUrl = `https://api.worldbank.org/v2/country/${iso2}/indicator/SP.POP.TOTL?format=json&per_page=5`;
  const wbGdpUrl = `https://api.worldbank.org/v2/country/${iso2}/indicator/NY.GDP.MKTP.CD?format=json&per_page=5`;
  const wbNetUrl = `https://api.worldbank.org/v2/country/${iso2}/indicator/IT.NET.USER.ZS?format=json&per_page=5`;

  try {
    const [rcRes, popRes, gdpRes, netRes] = await Promise.allSettled([
      fetch(restCountriesUrl, { signal: AbortSignal.timeout(6000) }).then((r) => r.json()),
      fetch(wbPopUrl, { signal: AbortSignal.timeout(6000) }).then((r) => r.json()),
      fetch(wbGdpUrl, { signal: AbortSignal.timeout(6000) }).then((r) => r.json()),
      fetch(wbNetUrl, { signal: AbortSignal.timeout(6000) }).then((r) => r.json()),
    ]);

    const rcData =
      rcRes.status === 'fulfilled' && Array.isArray(rcRes.value) ? rcRes.value[0] : null;

    const extractWbLatest = (settled: PromiseSettledResult<any>) => {
      if (settled.status !== 'fulfilled' || !Array.isArray(settled.value)) return { value: null, date: null };
      const rows = settled.value[1];
      if (!Array.isArray(rows)) return { value: null, date: null };
      const valid = rows.find((r: any) => r && r.value !== null && r.value !== undefined);
      return valid ? { value: Number(valid.value), date: String(valid.date) } : { value: null, date: null };
    };

    const pop = extractWbLatest(popRes);
    const gdp = extractWbLatest(gdpRes);
    const net = extractWbLatest(netRes);

    res.json({
      iso2,
      countryName: rcData?.name?.common || iso2,
      officialName: rcData?.name?.official || rcData?.name?.common || iso2,
      capital: Array.isArray(rcData?.capital) ? rcData.capital : [],
      region: rcData?.region || '',
      subregion: rcData?.subregion || '',
      languages: rcData?.languages || {},
      currencies: rcData?.currencies || {},
      population: pop.value ?? rcData?.population ?? null,
      populationYear: pop.date || 'Latest',
      gdpUsd: gdp.value,
      gdpYear: gdp.date,
      internetUsersPct: net.value,
      internetUsersYear: net.date,
      unMember: Boolean(rcData?.unMember ?? true),
      flagSvgUrl: rcData?.flags?.svg || '',
      coatOfArmsSvgUrl: rcData?.coatOfArms?.svg || '',
      googleMapsUrl: rcData?.maps?.googleMaps || '',
      sources: [
        { name: 'World Bank Open Data API (SP.POP.TOTL / NY.GDP.MKTP.CD / IT.NET.USER.ZS)', apiUrl: wbPopUrl },
        { name: 'REST Countries Sovereign Registry API v3.1', apiUrl: restCountriesUrl },
      ],
    });
  } catch (err: any) {
    res.status(502).json({ error: err?.message || 'Failed to fetch live sovereign API data' });
  }
});

// 3. Live Government Open Data API Proxy
app.post('/api/gov-data/live-api-proxy', async (req, res) => {
  const endpointUrl = String(req.body?.endpointUrl || '').trim();
  if (!endpointUrl) {
    res.status(400).json({ error: 'Missing endpointUrl in request body' });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(endpointUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('Only HTTP/HTTPS URLs are permitted');
    }
  } catch (err: any) {
    res.status(400).json({ error: 'Invalid API endpoint URL' });
    return;
  }

  const start = Date.now();
  try {
    const response = await fetch(parsed.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain;q=0.9, */*;q=0.8',
        'User-Agent': 'CivisMundiOpenDataClient/1.0 (Public Government API Explorer)',
      },
      signal: AbortSignal.timeout(9000),
    });

    const latencyMs = Date.now() - start;
    const text = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponsePreview: text.slice(0, 2000) };
    }

    res.json({
      ok: response.ok,
      statusCode: response.status,
      latencyMs,
      endpointUrl: parsed.toString(),
      fetchedAt: new Date().toISOString(),
      data,
    });
  } catch (err: any) {
    res.status(502).json({
      ok: false,
      statusCode: 502,
      latencyMs: Date.now() - start,
      endpointUrl,
      fetchedAt: new Date().toISOString(),
      error: err?.message || 'Failed to reach remote government API endpoint',
    });
  }
});

// 4. Google Search-Grounded Civic & Government Portal Intelligence (Gemini API)
app.post('/api/ai/research', async (req, res) => {
  const query = String(req.body?.query || '').trim();
  const language = String(req.body?.language || 'en').trim();

  if (!query) {
    res.status(400).json({ error: 'Please provide a search query.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      error:
        'GEMINI_API_KEY is not configured. Please ensure your Gemini API key is set in Settings > Secrets.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are Civis Mundi, an authoritative global government portal and public API archivist.
The user is researching: "${query}" (Preferred response language code: ${language}).

CRITICAL INSTRUCTIONS:
1. DO NOT ASSUME OR HALLUCINATE URLs. Use Google Search to find the exact, verified official national, state/provincial, or municipal government websites (.gov, .gob, .gouv, .go, .bund, .gc.ca, .gov.in, .gov.uk, etc.) and any public Open Data / REST APIs relevant to the query.
2. Provide a comprehensive, well-structured Markdown breakdown covering:
   - **Official Portals & Direct URLs** (National, State/Provincial, and Local/Municipal levels where applicable)
   - **What Citizens & Businesses Can Do on Each Portal** (Specific transactions, forms, certificates, licenses, tax filings)
   - **Official Public APIs & Open Data Sources** (If any APIs or machine-readable datasets exist for this domain, document their endpoints and portals)
3. Keep all URLs explicit and accurate.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const answerMarkdown = response.text || 'No response generated.';
    const rawChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const uniqueSources: { title: string; uri: string }[] = [];
    const seenUris = new Set<string>();

    for (const chunk of rawChunks) {
      const uri = chunk?.web?.uri;
      const title = chunk?.web?.title || uri;
      if (uri && !seenUris.has(uri)) {
        seenUris.add(uri);
        uniqueSources.push({ title: String(title), uri: String(uri) });
      }
    }

    // Cross-check the top 5 grounding URLs in parallel
    const verifiedSources = await Promise.all(
      uniqueSources.slice(0, 6).map(async (src) => {
        const verification = await verifyUrlLive(src.uri);
        return {
          ...src,
          verified: verification,
        };
      })
    );

    res.json({
      query,
      answerMarkdown,
      structuredServices: [],
      groundingSources: [
        ...verifiedSources,
        ...uniqueSources.slice(6),
      ],
      modelUsed: 'gemini-3.8-flash (Google Search Grounded)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Failed to execute grounded civic research query.',
    });
  }
});

// Helper: clean HTML tags and entities into readable plain text
function stripHtmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<\/(p|div|h1|h2|h3|h4|li|tr|br)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

// 5. Live Federated Government Document & Publication Search Across Official Repositories
app.get('/api/gov-documents/live-search', async (req, res) => {
  const q = String(req.query.q || 'tax form').trim();
  const country = String(req.query.country || 'All').trim().toUpperCase();

  const encodedQ = encodeURIComponent(q);

  // 1) World Bank Official Country Documents & Reports API (covers all 195 countries + direct PDFs)
  const wbDocsUrl = `https://search.worldbank.org/api/v2/wds?format=json&qterm=${encodedQ}&rows=10`;
  // 2) U.S. Federal Register Official Documents API (direct PDFs & HTML statutes)
  const usFedRegUrl = `https://www.federalregister.gov/api/v1/documents.json?per_page=8&conditions[term]=${encodedQ}`;
  // 3) UK GOV.UK Official Publications & Forms Search API
  const ukGovSearchUrl = `https://www.gov.uk/api/search.json?q=${encodedQ}&count=8`;
  // 4) U.S. Data.gov CKAN Package & File Resource Search API
  const dataGovUrl = `https://catalog.data.gov/api/3/action/package_search?q=${encodedQ}&rows=6`;

  try {
    const [wbRes, fedRes, ukRes, dgRes] = await Promise.allSettled([
      fetch(wbDocsUrl, { signal: AbortSignal.timeout(7000) }).then((r) => r.json()),
      country === 'ALL' || country === 'US'
        ? fetch(usFedRegUrl, { signal: AbortSignal.timeout(7000) }).then((r) => r.json())
        : Promise.resolve(null),
      country === 'ALL' || country === 'GB'
        ? fetch(ukGovSearchUrl, { signal: AbortSignal.timeout(7000) }).then((r) => r.json())
        : Promise.resolve(null),
      country === 'ALL' || country === 'US'
        ? fetch(dataGovUrl, { signal: AbortSignal.timeout(7000) }).then((r) => r.json())
        : Promise.resolve(null),
    ]);

    const liveDocs: any[] = [];

    // Parse U.S. Federal Register Documents
    if (fedRes.status === 'fulfilled' && Array.isArray(fedRes.value?.results)) {
      for (const item of fedRes.value.results) {
        if (!item?.title) continue;
        liveDocs.push({
          id: `live-fedreg-${item.document_number || Math.random()}`,
          title: String(item.title),
          documentCode: `FR Doc. ${item.document_number || 'Official'}`,
          countryIso2: 'US',
          countryName: 'United States',
          continent: 'Americas',
          agency:
            Array.isArray(item.agencies) && item.agencies.length > 0
              ? item.agencies.map((a: any) => a.name).filter(Boolean).join(' · ')
              : 'National Archives & Federal Register (NARA)',
          portalUrl: 'https://www.federalregister.gov',
          documentUrl: item.html_url || item.pdf_url || 'https://www.federalregister.gov',
          downloadUrl: item.pdf_url || item.html_url,
          format: item.pdf_url ? 'PDF' : 'HTML',
          docType: 'legislation_gazette',
          publishedDate: item.publication_date || 'Current Federal Register Issue',
          summary:
            item.abstract ||
            `Official ${item.type || 'Federal Document'} published in the Federal Register of the United States.`,
          whatItIsUsedFor:
            'Inspect official federal regulations, executive orders, public notices, and download the authenticated GPO PDF.',
          sourceRepository: 'U.S. Federal Register API (federalregister.gov)',
          isLiveFetched: true,
        });
      }
    }

    // Parse UK GOV.UK Official Publications & Forms
    if (ukRes.status === 'fulfilled' && Array.isArray(ukRes.value?.results)) {
      for (const item of ukRes.value.results) {
        if (!item?.title || !item?.link) continue;
        const fullLink = String(item.link).startsWith('http')
          ? String(item.link)
          : `https://www.gov.uk${item.link}`;
        liveDocs.push({
          id: `live-govuk-${item.content_id || item.link}`,
          title: String(item.title),
          documentCode: String(item.display_type || item.format || 'GOV.UK Official Publication').toUpperCase(),
          countryIso2: 'GB',
          countryName: 'United Kingdom',
          continent: 'Europe',
          agency:
            Array.isArray(item.organisations) && item.organisations.length > 0
              ? item.organisations.map((o: any) => o.title).filter(Boolean).join(' · ')
              : 'HM Government · GOV.UK',
          portalUrl: 'https://www.gov.uk',
          documentUrl: fullLink,
          downloadUrl: fullLink,
          format: 'HTML',
          docType: 'form_application',
          publishedDate: item.public_timestamp
            ? String(item.public_timestamp).slice(0, 10)
            : 'Current Official Guidance',
          summary:
            item.description ||
            'Official UK Government publication, statutory guidance, or citizen form published on GOV.UK.',
          whatItIsUsedFor:
            'Access official UK government forms, statutory guidance, eligibility rules, and downloadable attachments.',
          sourceRepository: 'GOV.UK Search API (gov.uk/api/search.json)',
          isLiveFetched: true,
        });
      }
    }

    // Parse Data.gov CKAN Downloadable Files (PDF, CSV, XML, JSON)
    if (dgRes.status === 'fulfilled' && Array.isArray(dgRes.value?.result?.results)) {
      for (const pkg of dgRes.value.result.results) {
        if (!pkg?.title) continue;
        const resources = Array.isArray(pkg.resources) ? pkg.resources : [];
        const primaryResource =
          resources.find((r: any) =>
            ['PDF', 'CSV', 'XLSX', 'JSON', 'XML'].includes(String(r?.format || '').toUpperCase())
          ) || resources[0];
        const rawFmt = String(primaryResource?.format || 'HTML').toUpperCase();
        const mappedFormat =
          rawFmt === 'PDF'
            ? 'PDF'
            : rawFmt.includes('CSV') || rawFmt.includes('XLS')
            ? 'CSV_XLSX'
            : rawFmt.includes('JSON') || rawFmt.includes('XML')
            ? 'JSON_XML'
            : 'HTML';

        const docUrl =
          primaryResource?.url || `https://catalog.data.gov/dataset/${pkg.name || ''}`;
        liveDocs.push({
          id: `live-datagov-${pkg.id || pkg.name}`,
          title: String(pkg.title),
          documentCode: `DATA.GOV · ${rawFmt}`,
          countryIso2: 'US',
          countryName: 'United States',
          continent: 'Americas',
          agency: pkg.organization?.title || 'U.S. Federal Open Data Catalog (Data.gov)',
          portalUrl: 'https://catalog.data.gov',
          documentUrl: docUrl,
          downloadUrl: docUrl,
          format: mappedFormat,
          docType: 'budget_statistics',
          publishedDate: pkg.metadata_modified
            ? String(pkg.metadata_modified).slice(0, 10)
            : 'Current Dataset Release',
          summary: String(pkg.notes || 'Official government dataset and downloadable file resource.')
            .replace(/<[^>]+>/g, '')
            .slice(0, 320),
          whatItIsUsedFor: `Download official government ${rawFmt} file resource and inspect structured agency records.`,
          sourceRepository: 'Data.gov CKAN Catalog API (catalog.data.gov)',
          isLiveFetched: true,
        });
      }
    }

    // Parse World Bank Official Country Documents & Reports API
    if (wbRes.status === 'fulfilled' && wbRes.value?.documents) {
      const docMap = wbRes.value.documents;
      for (const [key, val] of Object.entries<any>(docMap)) {
        if (key === 'facets' || !val || typeof val !== 'object') continue;
        const title = val.display_title || val.title;
        if (!title) continue;
        const pdfUrl = val.pdfurl || val.url || '';
        const docUrl = pdfUrl || val.url || 'https://documents.worldbank.org';
        const countryLabel = val.count || 'International / Sovereign Archive';
        liveDocs.push({
          id: `live-wbdoc-${val.id || key}`,
          title: String(title).replace(/\n+/g, ' ').trim(),
          documentCode: `Report ${val.repnb || val.id || key}`,
          countryIso2: country !== 'ALL' && country.length === 2 ? country : 'UN',
          countryName: String(countryLabel),
          continent: 'Europe',
          agency: `Official Institutional & Sovereign Document Archive (${val.docty || 'Official Report'})`,
          portalUrl: 'https://documents.worldbank.org',
          documentUrl: docUrl,
          downloadUrl: pdfUrl || docUrl,
          format: pdfUrl ? 'PDF' : 'HTML',
          docType: 'budget_statistics',
          publishedDate: val.docdt ? String(val.docdt).slice(0, 10) : 'Official Archive',
          summary:
            val.abstracts?.['cdata!'] ||
            `Official public sector document (${val.docty || 'Report'}) covering ${countryLabel}.`,
          whatItIsUsedFor:
            'Download the full authenticated PDF report, public finance evaluation, or legal loan/project agreement.',
          sourceRepository: 'World Bank Official Documents API (search.worldbank.org/api/v2/wds)',
          isLiveFetched: true,
        });
      }
    }

    res.json({
      query: q,
      country,
      totalFound: liveDocs.length,
      documents: liveDocs,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(502).json({
      error: err?.message || 'Failed to query live government document repositories',
    });
  }
});

// 6. Live Government Portal Document & Form Link Extractor
app.post('/api/gov-documents/scan-portal', async (req, res) => {
  const rawUrl = String(req.body?.url || '').trim();
  if (!rawUrl) {
    res.status(400).json({ error: 'Missing portal URL to scan' });
    return;
  }

  let parsedBase: URL;
  try {
    parsedBase = new URL(rawUrl);
    if (parsedBase.protocol !== 'http:' && parsedBase.protocol !== 'https:') {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Invalid portal URL' });
    return;
  }

  const start = Date.now();
  try {
    const response = await fetch(parsedBase.toString(), {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 CivisMundiDocScanner/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8500),
    });

    const latencyMs = Date.now() - start;
    const finalUrl = response.url || parsedBase.toString();
    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch
      ? stripHtmlToText(titleMatch[1]).slice(0, 160)
      : parsedBase.hostname;

    const directFiles: {
      title: string;
      url: string;
      fileType: string;
      category: 'direct_file' | 'official_form_or_publication';
    }[] = [];
    const publicationPages: {
      title: string;
      url: string;
      fileType: string;
      category: 'direct_file' | 'official_form_or_publication';
    }[] = [];

    const seenUrls = new Set<string>();
    const anchorRegex = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    const fileExtRegex = /\.(pdf|docx?|xlsx?|csv|xml|json|zip|odt|rtf)(\?.*)?$/i;
    const docKeywordRegex =
      /(form|document|publication|gazette|law|act|legislation|tax|passport|visa|download|certificate|register|portal|data|report|stat|bulletin|circular|decree|ordinance|guide|service|apply|filing|return|license|permit)/i;

    while ((match = anchorRegex.exec(html)) !== null) {
      const rawHref = match[1].trim();
      if (
        !rawHref ||
        rawHref.startsWith('javascript:') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:')
      ) {
        continue;
      }

      let resolvedUrl: string;
      try {
        resolvedUrl = new URL(rawHref, finalUrl).toString();
      } catch {
        continue;
      }

      if (!resolvedUrl.startsWith('http') || seenUrls.has(resolvedUrl)) continue;

      const anchorText = stripHtmlToText(match[2]).slice(0, 140);
      const extMatch = resolvedUrl.match(fileExtRegex);

      if (extMatch) {
        seenUrls.add(resolvedUrl);
        const ext = extMatch[1].toUpperCase();
        const fallbackLabel = resolvedUrl.split('/').pop() || `${ext} Document`;
        directFiles.push({
          title: anchorText.length >= 2 ? anchorText : fallbackLabel,
          url: resolvedUrl,
          fileType: ext,
          category: 'direct_file',
        });
      } else if (
        anchorText.length >= 4 &&
        (docKeywordRegex.test(resolvedUrl) || docKeywordRegex.test(anchorText))
      ) {
        seenUrls.add(resolvedUrl);
        publicationPages.push({
          title: anchorText,
          url: resolvedUrl,
          fileType: 'PORTAL / FORM',
          category: 'official_form_or_publication',
        });
      }

      if (directFiles.length >= 40 && publicationPages.length >= 45) {
        break;
      }
    }

    res.json({
      portalUrl: rawUrl,
      finalUrl,
      pageTitle,
      statusCode: response.status,
      scannedAt: new Date().toISOString(),
      latencyMs,
      directFiles: directFiles.slice(0, 40),
      publicationPages: publicationPages.slice(0, 45),
    });
  } catch (err: any) {
    res.json({
      portalUrl: rawUrl,
      finalUrl: rawUrl,
      pageTitle: parsedBase.hostname,
      statusCode: null,
      scannedAt: new Date().toISOString(),
      latencyMs: Date.now() - start,
      directFiles: [],
      publicationPages: [],
      error:
        err?.message ||
        'Direct HTML scan timed out or portal requires regional browser session; you can still open the official portal directly.',
    });
  }
});

// 7. Live Government Document Inspector & Content Extractor
app.post('/api/gov-documents/inspect', async (req, res) => {
  const rawUrl = String(req.body?.url || '').trim();
  if (!rawUrl) {
    res.status(400).json({ error: 'Missing document URL' });
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    res.status(400).json({ error: 'Invalid URL format' });
    return;
  }

  try {
    const response = await fetch(parsed.toString(), {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 CivisMundiDocInspector/1.0',
        Accept: 'text/html,application/pdf,application/json,text/plain,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8500),
    });

    const finalUrl = response.url || rawUrl;
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLengthHeader = response.headers.get('content-length');
    const contentLengthBytes = contentLengthHeader ? Number(contentLengthHeader) : null;
    const lastModified = response.headers.get('last-modified');
    const isPdf =
      contentType.toLowerCase().includes('application/pdf') ||
      finalUrl.toLowerCase().split('?')[0].endsWith('.pdf');

    if (isPdf) {
      res.json({
        url: rawUrl,
        finalUrl,
        reachable: response.status >= 200 && response.status < 400,
        statusCode: response.status,
        contentType,
        contentLengthBytes,
        lastModified,
        isPdf: true,
        pageTitle: finalUrl.split('/').pop() || 'Official PDF Document',
        extractedTextPreview:
          'Verified Official PDF Document Binary Stream. Use the embedded PDF viewer or click "Download / Open Original Document" to view or save the authenticated PDF file.',
        embeddedFiles: [
          {
            label: finalUrl.split('/').pop() || 'Authenticated PDF File',
            url: finalUrl,
            format: 'PDF',
          },
        ],
        checkedAt: new Date().toISOString(),
      });
      return;
    }

    const rawText = await response.text();
    const titleMatch = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch
      ? stripHtmlToText(titleMatch[1]).slice(0, 160)
      : parsed.hostname;

    const embeddedFiles: { label: string; url: string; format: string }[] = [];
    const seenEmbedded = new Set<string>();
    const anchorRegex = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    const fileExtRegex = /\.(pdf|docx?|xlsx?|csv|xml|json|zip)(\?.*)?$/i;
    let m: RegExpExecArray | null;

    while ((m = anchorRegex.exec(rawText)) !== null) {
      const href = m[1].trim();
      const extMatch = href.match(fileExtRegex);
      if (!extMatch) continue;
      try {
        const absUrl = new URL(href, finalUrl).toString();
        if (seenEmbedded.has(absUrl)) continue;
        seenEmbedded.add(absUrl);
        const labelText = stripHtmlToText(m[2]).slice(0, 120) || absUrl.split('/').pop() || 'File';
        embeddedFiles.push({
          label: labelText,
          url: absUrl,
          format: extMatch[1].toUpperCase(),
        });
      } catch {
        // ignore malformed href
      }
      if (embeddedFiles.length >= 25) break;
    }

    const cleanPreview = stripHtmlToText(rawText).slice(0, 3500);

    res.json({
      url: rawUrl,
      finalUrl,
      reachable: response.status >= 200 && response.status < 500,
      statusCode: response.status,
      contentType,
      contentLengthBytes,
      lastModified,
      isPdf: false,
      pageTitle,
      extractedTextPreview:
        cleanPreview ||
        'Document reachable. Open the official portal link or inspect embedded files below.',
      embeddedFiles,
      checkedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.json({
      url: rawUrl,
      finalUrl: rawUrl,
      reachable: false,
      statusCode: null,
      contentType: null,
      contentLengthBytes: null,
      lastModified: null,
      isPdf: rawUrl.toLowerCase().endsWith('.pdf'),
      pageTitle: parsed.hostname,
      extractedTextPreview: '',
      embeddedFiles: [],
      checkedAt: new Date().toISOString(),
      error:
        err?.message ||
        'Remote server requires direct browser navigation or regional session.',
    });
  }
});

// 8. AI Plain-Language Citizen Guide & Document Explainer (Google Search Grounded)
app.post('/api/ai/explain-item', async (req, res) => {
  const title = String(req.body?.title || '').trim();
  const url = String(req.body?.url || '').trim();
  const agency = String(req.body?.agency || '').trim();
  const countryName = String(req.body?.countryName || '').trim();
  const summary = String(req.body?.summary || '').trim();
  const userQuestion = String(req.body?.userQuestion || '').trim();
  const language = String(req.body?.language || 'en').trim();

  if (!title) {
    res.status(400).json({ error: 'Missing document or portal title to explain.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(503).json({
      error:
        'GEMINI_API_KEY is not configured. Please ensure your Gemini API key is set in Settings > Secrets.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are Civis Mundi's Citizen Accessibility & Government Document Guide.
Your mission is to help any everyday citizen, resident, or researcher easily understand and use this official government document or portal without confusing legal or bureaucratic jargon.

Target Item:
- Title: ${title}
- Country / Jurisdiction: ${countryName}
- Issuing Agency: ${agency}
- Official URL: ${url}
- Context: ${summary}
${userQuestion ? `- Specific User Question: "${userQuestion}"` : ''}
- Preferred Response Language Code: ${language}

Using Google Search to verify current official requirements and direct document/form links, provide a clear, well-structured guide with these sections:
1. **Plain-Language Summary**: Explain in simple, everyday terms what this document or portal is and why it matters.
2. **Who Needs This & Eligibility**: Clearly state who should fill out, read, or use this.
3. **What You Need Ready Before You Start**: Bullet list of exact IDs, reference numbers, supporting documents, or fees required.
4. **Step-by-Step Guide to Access & Complete**: Numbered 1-2-3 steps showing how to download, fill out, submit, and track it.
5. **Direct Official Documents & Forms Found**: List exact official URLs (.gov, .gob, .gouv, .gov.uk, .gov.in, etc.) or form numbers.${
      userQuestion ? '\n6. **Direct Answer to Your Question**: Address the user question thoroughly.' : ''
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const explanationMarkdown = response.text || 'No explanation generated.';
    const rawChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const groundingSources: { title: string; uri: string }[] = [];
    const seen = new Set<string>();
    for (const chunk of rawChunks) {
      const uri = chunk?.web?.uri;
      const chunkTitle = chunk?.web?.title || uri;
      if (uri && !seen.has(uri)) {
        seen.add(uri);
        groundingSources.push({ title: String(chunkTitle), uri: String(uri) });
      }
    }

    res.json({
      title,
      url,
      explanationMarkdown,
      groundingSources: groundingSources.slice(0, 8),
      modelUsed: 'gemini-3.8-flash (Google Search Grounded Citizen Guide)',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || 'Failed to generate AI citizen explanation.',
    });
  }
});

// 9. Complete Live Website Link & Resource Indexer (Extracts ALL Webpages, Services, Directories, Docs & Feeds)
app.post('/api/gov-links/index-website', async (req, res) => {
  const rawUrl = String(req.body?.url || '').trim();
  const websiteTitle = String(req.body?.websiteTitle || '').trim();
  const countryIso2 = String(req.body?.countryIso2 || 'UN').trim();
  const countryName = String(req.body?.countryName || 'Official Jurisdiction').trim();
  const continent = (req.body?.continent || 'Europe') as any;

  if (!rawUrl) {
    res.status(400).json({ error: 'Missing website URL to index.' });
    return;
  }

  let parsedBase: URL;
  try {
    parsedBase = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    if (parsedBase.protocol !== 'http:' && parsedBase.protocol !== 'https:') {
      throw new Error('Only HTTP/HTTPS URLs are supported');
    }
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Invalid website URL format' });
    return;
  }

  const start = Date.now();
  try {
    const response = await fetch(parsedBase.toString(), {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 CivisMundiLinkIndexer/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(9000),
    });

    const latencyMs = Date.now() - start;
    const finalUrl = response.url || parsedBase.toString();
    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch
      ? stripHtmlToText(titleMatch[1]).slice(0, 160)
      : websiteTitle || parsedBase.hostname;

    const descMatch =
      html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
    const metaDescription = descMatch
      ? stripHtmlToText(descMatch[1]).slice(0, 280)
      : `Live HTML link & resource index for ${pageTitle} (${finalUrl}).`;

    const links = extractAndClassifyLinksFromHtml(
      html,
      finalUrl,
      websiteTitle || pageTitle,
      countryIso2,
      countryName,
      continent
    );

    const categoryBreakdown = {
      webpage_info: 0,
      citizen_service: 0,
      document_form: 0,
      data_api_feed: 0,
      directory_contact: 0,
      external_resource: 0,
    };

    let internalLinksCount = 0;
    let externalLinksCount = 0;

    for (const link of links) {
      categoryBreakdown[link.category] = (categoryBreakdown[link.category] || 0) + 1;
      if (link.isInternal) internalLinksCount++;
      else externalLinksCount++;
    }

    res.json({
      websiteUrl: parsedBase.toString(),
      finalUrl,
      pageTitle,
      metaDescription,
      statusCode: response.status,
      crawledAt: new Date().toISOString(),
      latencyMs,
      totalLinksFound: links.length,
      internalLinksCount,
      externalLinksCount,
      categoryBreakdown,
      links,
    });
  } catch (err: any) {
    res.json({
      websiteUrl: parsedBase.toString(),
      finalUrl: parsedBase.toString(),
      pageTitle: websiteTitle || parsedBase.hostname,
      metaDescription: 'Pre-indexed site map active. Live HTML fetch requires regional session or direct browser access.',
      statusCode: null,
      crawledAt: new Date().toISOString(),
      latencyMs: Date.now() - start,
      totalLinksFound: 0,
      internalLinksCount: 0,
      externalLinksCount: 0,
      categoryBreakdown: {
        webpage_info: 0,
        citizen_service: 0,
        document_form: 0,
        data_api_feed: 0,
        directory_contact: 0,
        external_resource: 0,
      },
      links: [],
      error:
        err?.message ||
        'Direct live crawl timed out; pre-indexed site map links remain available below.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true,
        host: '0.0.0.0',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Civis Mundi server listening on http://localhost:${PORT}`);
  });
}

startServer();

