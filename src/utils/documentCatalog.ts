import type {
  ContinentId,
  EnrichedCountryRecord,
  GovDocumentEntry,
  GovDocumentFormat,
  GovDocumentType,
} from '../types/registry';

export interface CitizenDocGuide {
  targetAudience: string;
  prerequisites: string[];
  stepByStep: string[];
  filingMode: string;
}

export interface EnrichedGovDocument extends GovDocumentEntry {
  citizenGuide: CitizenDocGuide;
}

export interface DocumentFilterCriteria {
  continent: ContinentId;
  countryIso2: string;
  docType: GovDocumentType;
  format: GovDocumentFormat;
  searchQuery: string;
}

export const DOCUMENT_TYPE_LABELS: Record<GovDocumentType, string> = {
  All: 'All Document Categories',
  form_application: 'Citizen Forms & Official Applications',
  tax_customs: 'Tax Returns, Revenue & Customs Filings',
  identity_immigration: 'Passports, Visas, Civil ID & Vital Records',
  business_licensing: 'Corporate Registration, Licenses & Trade Permits',
  legislation_gazette: 'Acts of Parliament, Laws & Official Gazettes',
  budget_statistics: 'National Census, Budgets & Statistical Reports',
  public_health: 'Health, Social Security & Pension Documents',
};

export const DOCUMENT_FORMAT_LABELS: Record<GovDocumentFormat, string> = {
  All: 'All Formats',
  PDF: 'PDF Document (.pdf)',
  FORM: 'Interactive Online Form / e-Filing',
  HTML: 'Official Web Publication / Statute',
  CSV_XLSX: 'Spreadsheet / Tabular Dataset (.csv / .xlsx)',
  JSON_XML: 'Machine-Readable API / Schema (.json / .xml)',
};

/**
 * Curated flagship government documents with direct PDF / official form URLs
 */
const FLAGSHIP_DOCUMENTS: EnrichedGovDocument[] = [
  {
    id: 'doc-us-irs-1040-pdf',
    title: 'U.S. Individual Income Tax Return (IRS Form 1040 — Official Fillable PDF)',
    documentCode: 'IRS Form 1040',
    countryIso2: 'US',
    countryName: 'United States',
    continent: 'Americas',
    agency: 'Internal Revenue Service (IRS) · Department of the Treasury',
    portalUrl: 'https://www.irs.gov',
    documentUrl: 'https://www.irs.gov/pub/irs-pdf/f1040.pdf',
    downloadUrl: 'https://www.irs.gov/pub/irs-pdf/f1040.pdf',
    format: 'PDF',
    docType: 'tax_customs',
    publishedDate: '2025–2026 Tax Year',
    summary:
      'Primary federal individual income tax return form used by U.S. citizens and residents to report annual income, deductions, tax credits, and refund or tax liability.',
    whatItIsUsedFor:
      'Calculate and file annual federal income taxes, claim the Standard Deduction or Child Tax Credit, and request a direct deposit tax refund.',
    sourceRepository: 'IRS Official Forms & Publications Repository (irs.gov/pub)',
    citizenGuide: {
      targetAudience: 'U.S. citizens, permanent residents, and tax residents earning annual income',
      prerequisites: [
        'Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN)',
        'Form W-2 from employers and Form 1099 statements for contract/investment income',
        'Prior-year Adjusted Gross Income (AGI) for electronic signature verification',
        'Bank routing and account number for direct deposit refunds',
      ],
      stepByStep: [
        'Download the official fillable Form 1040 PDF or open IRS Free File / Direct File.',
        'Enter personal filing status, dependents, and total wage/salary income from Box 1 of Form W-2.',
        'Apply standard or itemized deductions (Schedule A) and eligible tax credits.',
        'Submit electronically via IRS e-file or mail the signed paper form to your regional Treasury processing center.',
      ],
      filingMode: 'Downloadable Fillable PDF & IRS e-File',
    },
  },
  {
    id: 'doc-us-passport-ds11-pdf',
    title: 'Application for a U.S. Passport (Department of State Form DS-11)',
    documentCode: 'Form DS-11',
    countryIso2: 'US',
    countryName: 'United States',
    continent: 'Americas',
    agency: 'U.S. Department of State · Bureau of Consular Affairs',
    portalUrl: 'https://travel.state.gov',
    documentUrl: 'https://eforms.state.gov/Forms/ds11.pdf',
    downloadUrl: 'https://eforms.state.gov/Forms/ds11.pdf',
    format: 'PDF',
    docType: 'identity_immigration',
    publishedDate: 'Current Consular Edition',
    summary:
      'Official application packet for first-time U.S. passport applicants, children under 16, or replacement of lost/stolen passports.',
    whatItIsUsedFor:
      'Apply for a new U.S. Passport Book or Passport Card at an authorized passport acceptance facility or U.S. Embassy.',
    sourceRepository: 'U.S. Department of State eForms Archive (eforms.state.gov)',
    citizenGuide: {
      targetAudience: 'First-time U.S. passport applicants, minors under 16, or individuals replacing lost passports',
      prerequisites: [
        'Original proof of U.S. citizenship (certified birth certificate, naturalization certificate, or Consular Report of Birth Abroad)',
        'Valid government-issued photo ID (driver license or state ID) plus a front-and-back photocopy',
        'One compliant 2x2 inch (51x51 mm) color passport photograph taken within the last 6 months',
        'Application fee + execution fee payable by check, money order, or at the acceptance facility',
      ],
      stepByStep: [
        'Complete Form DS-11 in black ink or via the State Department Form Filler (do NOT sign the form until instructed by an acceptance agent).',
        'Gather original citizenship evidence, photo ID, photocopies, and compliant 2x2 photo.',
        'Book an in-person appointment at an authorized Post Office, clerk of court, or public library acceptance facility.',
        'Present documents, sign under oath in front of the agent, and track processing online at passportstatus.state.gov.',
      ],
      filingMode: 'Official PDF Form + In-Person Acceptance Verification',
    },
  },
  {
    id: 'doc-us-uscis-i9-pdf',
    title: 'Employment Eligibility Verification (USCIS Form I-9)',
    documentCode: 'USCIS Form I-9',
    countryIso2: 'US',
    countryName: 'United States',
    continent: 'Americas',
    agency: 'U.S. Citizenship and Immigration Services (DHS / USCIS)',
    portalUrl: 'https://www.uscis.gov/i-9',
    documentUrl: 'https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf',
    downloadUrl: 'https://www.uscis.gov/sites/default/files/document/forms/i-9.pdf',
    format: 'PDF',
    docType: 'business_licensing',
    publishedDate: 'Current DHS Edition',
    summary:
      'Mandatory federal verification form used by all U.S. employers to verify the identity and employment authorization of every person hired for employment in the United States.',
    whatItIsUsedFor:
      'Document employee identity and legal authorization to work in the United States using List A, List B, and List C acceptable documents.',
    sourceRepository: 'USCIS Official Forms Repository (uscis.gov)',
    citizenGuide: {
      targetAudience: 'All newly hired employees and employers in the United States',
      prerequisites: [
        'One List A document (e.g. U.S. Passport or Permanent Resident Card) OR',
        'One List B identity document (State Driver License) + One List C work authorization document (Social Security Card or Birth Certificate)',
      ],
      stepByStep: [
        'Employee completes and signs Section 1 no later than the first day of employment.',
        'Employee presents original, unexpired acceptable identity and work authorization documents within 3 business days.',
        'Employer examines original documents, completes Section 2, and retains Form I-9 for statutory inspection.',
      ],
      filingMode: 'Downloadable PDF Form & Employer Recordkeeping',
    },
  },
  {
    id: 'doc-gb-companies-house-in01',
    title: 'Application to Register a Company in the United Kingdom (Companies House Form IN01)',
    documentCode: 'Form IN01',
    countryIso2: 'GB',
    countryName: 'United Kingdom',
    continent: 'Europe',
    agency: 'Companies House · GOV.UK',
    portalUrl: 'https://www.gov.uk/government/organisations/companies-house',
    documentUrl:
      'https://www.gov.uk/government/publications/register-a-private-or-public-company-in01',
    format: 'FORM',
    docType: 'business_licensing',
    publishedDate: 'Current Statutory Edition',
    summary:
      'Official statutory application to incorporate a private limited company (Ltd) or public limited company (PLC) in England, Wales, Scotland, or Northern Ireland.',
    whatItIsUsedFor:
      'Register a new UK company, appoint directors and company secretaries, declare Persons with Significant Control (PSC), and file Articles of Association.',
    sourceRepository: 'GOV.UK Official Publications & Statutory Forms',
    citizenGuide: {
      targetAudience: 'Founders, entrepreneurs, and corporate agents incorporating a UK company',
      prerequisites: [
        'Unique company name checked against the Companies House WebCHeck index',
        'Registered office address in the UK and an official registered email address',
        'Details of at least one director and one shareholder (name, date of birth, nationality, service address)',
        'Standard Industrial Classification (SIC) code describing the nature of business',
        'Memorandum and Articles of Association (Model Articles or custom)',
      ],
      stepByStep: [
        'Verify your proposed company name and SIC business activity code on GOV.UK.',
        'Prepare statement of capital, initial shareholdings, and Person with Significant Control (PSC) register details.',
        'Submit online via the GOV.UK Incorporate a Company digital service (processed within 24 hours) or file paper Form IN01 by post.',
      ],
      filingMode: 'Online Digital Filing & Official PDF Packet (GOV.UK)',
    },
  },
  {
    id: 'doc-in-income-tax-itr1',
    title: 'Indian Individual Income Tax Return — Sahaj (ITR-1) & PAN Application (Form 49A)',
    documentCode: 'ITR-1 (Sahaj) / Form 49A',
    countryIso2: 'IN',
    countryName: 'India',
    continent: 'Asia',
    agency: 'Income Tax Department · Ministry of Finance, Government of India',
    portalUrl: 'https://www.incometax.gov.in',
    documentUrl: 'https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns',
    format: 'FORM',
    docType: 'tax_customs',
    publishedDate: 'Assessment Year 2025–2026',
    summary:
      'Official Income Tax Return schemas, Excel/JSON utilities, and PDF instructions for resident individuals in India with salary, pension, one house property, and interest income.',
    whatItIsUsedFor:
      'File annual income tax returns online, reconcile Annual Information Statement (AIS) and Form 26AS tax credits, and e-verify via Aadhaar OTP.',
    sourceRepository: 'Income Tax e-Filing Downloads Portal (incometax.gov.in)',
    citizenGuide: {
      targetAudience: 'Resident taxpayers in India with total income up to ₹50 Lakh from salary/pension and one house property',
      prerequisites: [
        'Permanent Account Number (PAN) linked with Aadhaar',
        'Form 16 issued by employer and Form 26AS / Annual Information Statement (AIS)',
        'Pre-validated Indian bank account with IFSC code for direct tax refunds',
        'Interest certificates from banks and post offices, plus tax-saving investment proofs (80C/80D)',
      ],
      stepByStep: [
        'Log in to incometax.gov.in using your PAN/Aadhaar or download the offline JSON utility.',
        'Select Assessment Year, filing mode (Online), and ITR-1 (Sahaj) form.',
        'Verify pre-filled salary, TDS, and deduction schedules against Form 16 and AIS.',
        'Submit the return and complete mandatory e-Verification within 30 days using Aadhaar OTP or NetBanking.',
      ],
      filingMode: 'Interactive Online Portal & Downloadable JSON/PDF Schema',
    },
  },
  {
    id: 'doc-ca-t1-income-tax',
    title: 'Canada T1 Income Tax and Benefit Return & Visitor Visa Packet (IMM 5257)',
    documentCode: 'T1 General / IMM 5257',
    countryIso2: 'CA',
    countryName: 'Canada',
    continent: 'Americas',
    agency: 'Canada Revenue Agency (CRA) & Immigration, Refugees and Citizenship Canada (IRCC)',
    portalUrl: 'https://www.canada.ca/en/services/taxes/income-tax/personal-income-tax.html',
    documentUrl:
      'https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years.html',
    format: 'PDF',
    docType: 'tax_customs',
    publishedDate: 'Current Federal Tax & Immigration Cycle',
    summary:
      'Official federal and provincial/territorial T1 personal income tax packages, schedules, and IRCC immigration/visitor visa PDF forms for every Canadian province and territory.',
    whatItIsUsedFor:
      'Report Canadian personal income, claim GST/HST and Canada Child Benefit credits, and access province-specific tax schedules (ON428, BC428, etc.).',
    sourceRepository: 'Government of Canada Forms & Publications Catalogue (canada.ca)',
    citizenGuide: {
      targetAudience: 'Canadian residents, newcomers, and international applicants filing with CRA or IRCC',
      prerequisites: [
        'Social Insurance Number (SIN) or Individual Tax Number (ITN)',
        'T4 (Statement of Remuneration Paid), T5 (Investment Income), and RL-1 slips (for Quebec)',
        'CRA My Account credentials or NETFILE-certified tax software access code',
      ],
      stepByStep: [
        'Select your province or territory of residence on December 31 to download the matching T1 General PDF package.',
        'Complete Steps 1 to 7 covering identification, total income, net income, taxable income, federal tax, and provincial tax.',
        'Transmit electronically via CRA NETFILE or mail to your designated Tax Centre.',
      ],
      filingMode: 'Fillable PDF Package & CRA NETFILE Electronic Transmission',
    },
  },
  {
    id: 'doc-de-elster-gewerbe',
    title: 'German Income Tax Return (Einkommensteuererklärung ESt 1 A) & Business Registration (Gewerbeanmeldung GewA 1)',
    documentCode: 'ESt 1 A / GewA 1',
    countryIso2: 'DE',
    countryName: 'Germany',
    continent: 'Europe',
    agency: 'Bundesministerium der Finanzen (BMF) & ELSTER Portal',
    portalUrl: 'https://www.elster.de',
    documentUrl: 'https://www.formulare-bfinv.de/',
    format: 'FORM',
    docType: 'tax_customs',
    publishedDate: 'Current Federal Statutory Forms',
    summary:
      'Federal German Form Management System (Formular-Management-System der Bundesfinanzverwaltung) providing official fillable tax forms, customs declarations, and business registration templates.',
    whatItIsUsedFor:
      'Access official German federal tax returns, customs clearances (Zoll), child benefit (Kindergeld) forms, and trade registration (Gewerbeanmeldung) forms across all 16 Länder.',
    sourceRepository: 'Bundesfinanzverwaltung Formularcenter (formulare-bfinv.de & elster.de)',
    citizenGuide: {
      targetAudience: 'German residents, employees, freelancers (Freiberufler), and businesses',
      prerequisites: [
        '11-digit Tax Identification Number (Steueridentifikationsnummer / IdNr)',
        'Annual wage tax certificate (Lohnsteuerbescheinigung) from employer',
        'ELSTER digital certificate file (.pfx) or BundID / German eID card',
      ],
      stepByStep: [
        'Open the Federal Form Center (formulare-bfinv.de) or log into Mein ELSTER (elster.de).',
        'Select the main tax return form (Mantelbogen ESt 1 A) and relevant annexes (Anlage N for employees, Anlage Vorsorgeaufwand for insurance).',
        'Validate entries using the built-in plausibility check and submit electronically or print the barcoded PDF.',
      ],
      filingMode: 'Interactive Federal Form Center (Fillable PDF & Mein ELSTER)',
    },
  },
  {
    id: 'doc-au-ato-mygov-pack',
    title: 'Australian Individual Tax Return Instructions & Medicare Enrolment Form (MS004)',
    documentCode: 'ATO NAT 2541 / MS004',
    countryIso2: 'AU',
    countryName: 'Australia',
    continent: 'Oceania',
    agency: 'Australian Taxation Office (ATO) & Services Australia',
    portalUrl: 'https://www.ato.gov.au',
    documentUrl: 'https://www.ato.gov.au/forms-and-instructions',
    format: 'PDF',
    docType: 'tax_customs',
    publishedDate: 'Current Financial Year',
    summary:
      'Official Australian Taxation Office (ATO) printable forms, NAT-numbered statutory declarations, TFN applications, and Services Australia Medicare/Centrelink PDF forms.',
    whatItIsUsedFor:
      'Lodge Australian individual or business tax returns, apply for a Tax File Number (TFN) or Australian Business Number (ABN), and enrol in Medicare.',
    sourceRepository: 'ATO Forms & Instructions Catalog (ato.gov.au)',
    citizenGuide: {
      targetAudience: 'Australian citizens, permanent residents, working holiday makers, and businesses',
      prerequisites: [
        'Tax File Number (TFN) and myGov account linked to the ATO',
        'Income statement from Single Touch Payroll (STP) enabled employers',
        'Private health insurance statement and work-related deduction receipts',
      ],
      stepByStep: [
        'Access ATO online services via myGov or download the paper NAT 2541 Tax Return for Individuals PDF.',
        'Review pre-filled salary, bank interest, and dividend data reported to the ATO.',
        'Declare deductions, calculate Medicare Levy, and submit online for 10-day processing.',
      ],
      filingMode: 'myGov Online Lodgment & NAT PDF Forms',
    },
  },
];

/**
 * Deterministically builds a comprehensive global document catalog covering
 * EVERY country (all 195+ countries) and sub-national states/provinces so users
 * can immediately search, filter, inspect, and understand every category of
 * official document across the entire world.
 */
export function buildGlobalDocumentCatalog(
  countries: EnrichedCountryRecord[]
): EnrichedGovDocument[] {
  const docs: EnrichedGovDocument[] = [...FLAGSHIP_DOCUMENTS];

  for (const c of countries) {
    // 1. National Executive & Official Gazette / Constitutional Legislation Archive
    const legUrl = c.legislationPortalUrl || c.primaryPortalUrl;
    docs.push({
      id: `doc-${c.iso2.toLowerCase()}-legislation-gazette`,
      title: `${c.name} — Official Gazette, Acts of Parliament & Statutory Legislation Archive`,
      documentCode: `${c.iso2}-GAZETTE-LEX`,
      countryIso2: c.iso2,
      countryName: c.name,
      continent: c.continent,
      agency: `National Legislature & Official Gazette Office of ${c.name}`,
      portalUrl: c.primaryPortalUrl,
      documentUrl: legUrl,
      format: 'HTML',
      docType: 'legislation_gazette',
      publishedDate: 'Continuously Updated Official Register',
      summary: `Authenticated national legal repository of ${c.name} (${c.nativeName}) publishing constitutional texts, enacted laws, executive decrees, ministerial regulations, and official gazette notices in ${c.officialLanguages.join(', ')}.`,
      whatItIsUsedFor: `Search enacted statutes, download official gazette PDF issues, verify regulatory compliance, and cite official legal codes of ${c.name}.`,
      sourceRepository: `${c.primaryPortalName} (${c.govTld})`,
      citizenGuide: {
        targetAudience: `Citizens, legal practitioners, businesses, and researchers operating in ${c.name}`,
        prerequisites: [
          `Act number, decree date, or subject keyword (in ${c.officialLanguages.join(' or ')})`,
          'No login or fee required — public statutory right of access',
        ],
        stepByStep: [
          `Open the official legislative or executive portal of ${c.name} (${legUrl}).`,
          'Search by publication year, statute number, or ministry keyword.',
          'Use the "Scan Portal for Documents" tool in Civis Mundi to extract all direct PDF gazette issues from the page.',
        ],
        filingMode: 'Public Statutory Publication & Downloadable Gazette PDFs',
      },
    });

    // 2. National Tax Return, Customs Declarations & Revenue Forms
    const taxUrl = c.taxAuthorityUrl || c.primaryPortalUrl;
    docs.push({
      id: `doc-${c.iso2.toLowerCase()}-tax-customs-forms`,
      title: `${c.name} — Individual & Corporate Tax Filing Forms, VAT & Customs Declarations`,
      documentCode: `${c.iso2}-REV-TAX-01`,
      countryIso2: c.iso2,
      countryName: c.name,
      continent: c.continent,
      agency: `National Tax & Customs Administration of ${c.name}`,
      portalUrl: c.primaryPortalUrl,
      documentUrl: taxUrl,
      format: 'FORM',
      docType: 'tax_customs',
      publishedDate: 'Current Fiscal Year',
      summary: `Official tax and customs document suite for ${c.name}, including personal income tax returns, corporate tax schedules, VAT/GST registration forms, and import/export customs tariff declarations.`,
      whatItIsUsedFor: `Register for a national Taxpayer Identification Number (TIN), download printable tax return PDFs, submit electronic tax filings, and obtain tax clearance certificates in ${c.name}.`,
      sourceRepository: `Revenue & Treasury Portal (${taxUrl})`,
      citizenGuide: {
        targetAudience: `Tax residents, salaried employees, businesses, and importers/exporters in ${c.name}`,
        prerequisites: [
          `National Taxpayer Identification Number (TIN) or Civil ID issued by ${c.name}`,
          'Annual employer wage statements, bank interest certificates, and deductible expense invoices',
          'Local bank account details for tax payment or refund settlement',
        ],
        stepByStep: [
          `Access the official tax authority portal at ${taxUrl}.`,
          'Navigate to the Forms / e-Services section to download the current fiscal year return or log into the taxpayer e-filing portal.',
          'Complete income and deduction schedules, attach supporting certificates, and download your stamped filing receipt.',
        ],
        filingMode: 'Online Taxpayer e-Filing & Printable PDF Forms',
      },
    });

    // 3. Passports, Visas, Civil Registry & Vital Certificates Application Packet
    const immUrl = c.immigrationPortalUrl || c.primaryPortalUrl;
    docs.push({
      id: `doc-${c.iso2.toLowerCase()}-passport-visa-civil`,
      title: `${c.name} — Passport Application, Visa/e-Visa Forms & Civil Registry Certificates`,
      documentCode: `${c.iso2}-CIV-PASS-02`,
      countryIso2: c.iso2,
      countryName: c.name,
      continent: c.continent,
      agency: `Ministry of Interior, Civil Registry & Consular Affairs of ${c.name}`,
      portalUrl: c.primaryPortalUrl,
      documentUrl: immUrl,
      format: 'PDF',
      docType: 'identity_immigration',
      publishedDate: 'Current Consular & Civil Edition',
      summary: `Official application forms and documentary checklists for ${c.name} national passports, foreign entry visas / e-Visas, residency permits, and certified birth, marriage, and citizenship records.`,
      whatItIsUsedFor: `Apply for or renew a ${c.name} passport, submit an international visitor/work visa application, and request certified civil status certificates.`,
      sourceRepository: `Consular & Civil Identity Portal (${immUrl})`,
      citizenGuide: {
        targetAudience: `Citizens of ${c.name} applying for passports/IDs and international travelers applying for entry visas`,
        prerequisites: [
          `National Identity Card or certified Birth Certificate (for ${c.name} citizens)`,
          'Valid passport with at least 6 months validity (for foreign visa applicants)',
          'Biometric passport-size photographs meeting ICAO standards',
          'Proof of fee payment, travel itinerary, or residency address',
        ],
        stepByStep: [
          `Open the official immigration and civil registry portal (${immUrl}).`,
          'Select the required application packet (Passport Renewal, e-Visa Application, or Civil Certificate Request).',
          'Fill out the application form online or in PDF, upload required identity scans, and book a biometric appointment if required.',
        ],
        filingMode: 'e-Visa / Civil Portal & Consular PDF Application Forms',
      },
    });

    // 4. Business Incorporation, Commercial Registry & Licensing Packet
    const bizUrl = c.businessRegistryUrl || c.primaryPortalUrl;
    docs.push({
      id: `doc-${c.iso2.toLowerCase()}-business-incorporation`,
      title: `${c.name} — Company Incorporation Packet, Trade License & Beneficial Ownership Forms`,
      documentCode: `${c.iso2}-CORP-REG-03`,
      countryIso2: c.iso2,
      countryName: c.name,
      continent: c.continent,
      agency: `Registrar of Companies & Ministry of Commerce of ${c.name}`,
      portalUrl: c.primaryPortalUrl,
      documentUrl: bizUrl,
      format: 'FORM',
      docType: 'business_licensing',
      publishedDate: 'Current Commercial Registry Standard',
      summary: `Official corporate registration documents for ${c.name}, covering new company formation, sole proprietorship registration, annual statutory filings, trademark applications, and commercial extracts.`,
      whatItIsUsedFor: `Reserve a company name, file Articles of Incorporation, obtain an official Certificate of Good Standing, and search public corporate filings in ${c.name}.`,
      sourceRepository: `Commercial & Corporate Registry (${bizUrl})`,
      citizenGuide: {
        targetAudience: `Entrepreneurs, domestic companies, and foreign investors registering an entity in ${c.name}`,
        prerequisites: [
          'Proposed company name and standard business activity classification',
          'Articles of Association / Memorandum of Incorporation',
          'Notarized or digital identity documents of directors and beneficial owners',
          `Registered office address within ${c.name} (${c.capital} or regional jurisdiction)`,
        ],
        stepByStep: [
          `Visit the official business registry of ${c.name} (${bizUrl}).`,
          'Run a company name availability search in the public corporate index.',
          'Complete the incorporation application form, attach constitutional documents, and download the digital Certificate of Incorporation.',
        ],
        filingMode: 'Single-Window Business Portal & Statutory Filing PDFs',
      },
    });

    // 5. National Statistics, Census Yearbook & Open Data Datasets
    const statsUrl = c.openDataPortalUrl || c.statisticalOfficeUrl || c.primaryPortalUrl;
    docs.push({
      id: `doc-${c.iso2.toLowerCase()}-statistics-opendata`,
      title: `${c.name} — National Statistical Yearbook, Census Tables & Machine-Readable Datasets`,
      documentCode: `${c.iso2}-STAT-DATA-04`,
      countryIso2: c.iso2,
      countryName: c.name,
      continent: c.continent,
      agency: `National Statistical Office & Open Data Directorate of ${c.name}`,
      portalUrl: c.primaryPortalUrl,
      documentUrl: statsUrl,
      format: 'CSV_XLSX',
      docType: 'budget_statistics',
      publishedDate: 'Annual & Quarterly Releases',
      summary: `Official demographic census tables, macroeconomic indicators (CPI, GDP, trade balance), public budget execution reports, and downloadable CSV/XLSX/PDF statistical bulletins for ${c.name}.`,
      whatItIsUsedFor: `Download official population census spreadsheets, economic bulletins, geographic shapefiles, and public sector budget execution tables for ${c.name}.`,
      sourceRepository: `Official Statistics & Open Data Catalog (${statsUrl})`,
      citizenGuide: {
        targetAudience: 'Economists, journalists, students, policymakers, and civic software developers',
        prerequisites: [
          'Open public license — no registration required for standard CSV, XLSX, JSON, and PDF bulletins',
        ],
        stepByStep: [
          `Access the statistical or open data portal for ${c.name} at ${statsUrl}.`,
          'Browse by theme (Demographics, Economy, Health, Education, Environment) or query via Civis Mundi Live Document Search.',
          'Download the dataset in CSV, XLSX, JSON, or PDF Statistical Yearbook format.',
        ],
        filingMode: 'Direct Open Data Download (CSV / XLSX / PDF / JSON)',
      },
    });

    // 6. Sub-National State / Provincial Documents (for every indexed state/province)
    for (const region of c.subNationalRegions) {
      docs.push({
        id: `doc-${region.id.toLowerCase()}-state-services-packet`,
        title: `${region.name} (${c.name}) — ${region.type} Official Forms, Local Permits, Land Records & Public Certificates`,
        documentCode: `${region.id}-STATE-DOCS`,
        countryIso2: c.iso2,
        countryName: c.name,
        continent: c.continent,
        stateOrRegion: `${region.name} (${region.type})`,
        agency: `Government of ${region.name} · Seat: ${region.capitalOrSeat}`,
        portalUrl: region.officialUrl,
        documentUrl: region.officialUrl,
        format: 'FORM',
        docType: 'form_application',
        publishedDate: 'Current Regional Edition',
        summary: `Official sub-national document and form directory for ${region.name}, ${c.name} (${region.officialUrl}), covering state/provincial tax filings, driver/vehicle licensing, property & land cadastre extracts, and municipal permits.`,
        whatItIsUsedFor: region.localServices
          .map((s) => `${s.name}: ${s.whatYouCanDo}`)
          .join(' · '),
        sourceRepository: `${region.name} Official ${region.type} Portal (${region.officialUrl})`,
        citizenGuide: {
          targetAudience: `Residents, property owners, and local businesses in ${region.name}, ${c.name}`,
          prerequisites: [
            `Proof of residence or property parcel ID in ${region.name} (Capital/Seat: ${region.capitalOrSeat})`,
            `National or ${region.type} government-issued photo identification`,
          ],
          stepByStep: [
            `Open the ${region.name} official portal (${region.officialUrl}) or click "Scan Portal for Documents" to extract all live PDFs and forms from the page.`,
            `Select your local department (${region.localServices.map((s) => s.name).join(', ')}).`,
            'Download the state form or complete the online regional transaction.',
          ],
          filingMode: `${region.type} e-Services Portal & Downloadable Local Forms`,
        },
      });
    }
  }

  return docs;
}

/**
 * Pure filtering logic for the Global Government Document Catalog
 */
export function filterDocuments(
  docs: EnrichedGovDocument[],
  criteria: DocumentFilterCriteria
): EnrichedGovDocument[] {
  const q = criteria.searchQuery.trim().toLowerCase();

  return docs.filter((doc) => {
    if (criteria.continent !== 'All' && doc.continent !== criteria.continent) {
      return false;
    }
    if (criteria.countryIso2 !== 'All' && doc.countryIso2 !== criteria.countryIso2) {
      return false;
    }
    if (criteria.docType !== 'All' && doc.docType !== criteria.docType) {
      return false;
    }
    if (criteria.format !== 'All' && doc.format !== criteria.format) {
      return false;
    }
    if (!q) return true;

    const haystack = [
      doc.title,
      doc.documentCode,
      doc.countryName,
      doc.countryIso2,
      doc.stateOrRegion || '',
      doc.agency,
      doc.summary,
      doc.whatItIsUsedFor,
      doc.portalUrl,
      doc.documentUrl,
      doc.citizenGuide.targetAudience,
      ...doc.citizenGuide.prerequisites,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

export function computeDocumentCatalogStats(docs: EnrichedGovDocument[]) {
  const byType: Record<Exclude<GovDocumentType, 'All'>, number> = {
    form_application: 0,
    legislation_gazette: 0,
    tax_customs: 0,
    identity_immigration: 0,
    business_licensing: 0,
    budget_statistics: 0,
    public_health: 0,
  };

  for (const d of docs) {
    byType[d.docType] = (byType[d.docType] || 0) + 1;
  }

  return {
    totalDocuments: docs.length,
    byType,
  };
}
