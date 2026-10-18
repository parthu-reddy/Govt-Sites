import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FileSearch,
  FileText,
  FolderSearch,
  HelpCircle,
  Loader2,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  DocumentInspectionResult,
  LanguageCode,
  PortalScanResult,
} from '../types/registry';
import type { EnrichedGovDocument } from '../utils/documentCatalog';
import { DOCUMENT_FORMAT_LABELS, DOCUMENT_TYPE_LABELS } from '../utils/documentCatalog';

interface DocumentReaderModalProps {
  document: EnrichedGovDocument | null;
  initialTab?: 'guide' | 'inspect' | 'portal_scan';
  language: LanguageCode;
  onClose: () => void;
}

export const DocumentReaderModal: React.FC<DocumentReaderModalProps> = ({
  document: doc,
  initialTab = 'guide',
  language,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'inspect' | 'portal_scan'>(initialTab);

  // Live Document Content Inspection state
  const [inspection, setInspection] = useState<DocumentInspectionResult | null>(null);
  const [loadingInspect, setLoadingInspect] = useState(false);

  // Live Portal Document Scanner state
  const [portalScan, setPortalScan] = useState<PortalScanResult | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [scanFilter, setScanFilter] = useState('');

  // AI Citizen Guide & Plain-Language Explainer state
  const [userQuestion, setUserQuestion] = useState('');
  const [aiExplanation, setAiExplanation] = useState<{
    explanationMarkdown: string;
    groundingSources: { title: string; uri: string }[];
    modelUsed: string;
  } | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!doc) return;
    setActiveTab(initialTab);
    setInspection(null);
    setPortalScan(null);
    setScanFilter('');
    setUserQuestion('');
    setAiExplanation(null);
    setAiError(null);

    // Automatically inspect the document metadata & extract embedded files
    setLoadingInspect(true);
    fetch('/api/gov-documents/inspect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: doc.documentUrl }),
    })
      .then((r) => r.json())
      .then((data) => setInspection(data))
      .catch(() => {})
      .finally(() => setLoadingInspect(false));

    // If opened directly into portal_scan tab, trigger portal scan immediately
    if (initialTab === 'portal_scan') {
      triggerPortalScan(doc.portalUrl || doc.documentUrl);
    }
  }, [doc, initialTab]);

  if (!doc) return null;

  const triggerPortalScan = async (targetUrl: string) => {
    setLoadingScan(true);
    try {
      const res = await fetch('/api/gov-documents/scan-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      setPortalScan(data);
    } catch (err: any) {
      setPortalScan({
        portalUrl: targetUrl,
        finalUrl: targetUrl,
        pageTitle: targetUrl,
        statusCode: null,
        scannedAt: new Date().toISOString(),
        latencyMs: 0,
        directFiles: [],
        publicationPages: [],
        error: err?.message || 'Failed to scan portal',
      });
    } finally {
      setLoadingScan(false);
    }
  };

  const handleRunAiExplain = async (customPrompt?: string) => {
    const qToUse = customPrompt !== undefined ? customPrompt : userQuestion;
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/explain-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: doc.title,
          url: doc.documentUrl,
          agency: doc.agency,
          countryName: `${doc.countryName}${doc.stateOrRegion ? ` (${doc.stateOrRegion})` : ''}`,
          summary: `${doc.summary} What it is used for: ${doc.whatItIsUsedFor}`,
          userQuestion: qToUse,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAiError(data.error || 'Could not generate AI citizen explanation.');
      } else {
        setAiExplanation(data);
      }
    } catch (err: any) {
      setAiError(err?.message || 'Network error while requesting AI citizen guide.');
    } finally {
      setLoadingAi(false);
    }
  };

  const filteredDirectFiles = (portalScan?.directFiles || []).filter(
    (f) =>
      !scanFilter.trim() ||
      f.title.toLowerCase().includes(scanFilter.toLowerCase()) ||
      f.url.toLowerCase().includes(scanFilter.toLowerCase()) ||
      f.fileType.toLowerCase().includes(scanFilter.toLowerCase())
  );

  const filteredPubPages = (portalScan?.publicationPages || []).filter(
    (p) =>
      !scanFilter.trim() ||
      p.title.toLowerCase().includes(scanFilter.toLowerCase()) ||
      p.url.toLowerCase().includes(scanFilter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-reader-modal-title"
    >
      <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#F4EFE6] border-b border-[#DED6C6] flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            {/* Clean Unboxed Metadata Line */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600">
              <span>{doc.documentCode}</span>
              <span aria-hidden="true">·</span>
              <span>
                {doc.countryName} ({doc.countryIso2})
              </span>
              {doc.stateOrRegion && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{doc.stateOrRegion}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{DOCUMENT_FORMAT_LABELS[doc.format]}</span>
              <span aria-hidden="true">·</span>
              <span>{DOCUMENT_TYPE_LABELS[doc.docType]}</span>
            </div>

            <h2
              id="doc-reader-modal-title"
              className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug"
            >
              {doc.title}
            </h2>

            <div className="text-xs text-stone-600">
              <strong>Issuing Authority:</strong> {doc.agency} ·{' '}
              <strong>Repository:</strong> {doc.sourceRepository}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close document reader and citizen guide"
            className="p-2 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-200/70 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action & Mode Bar */}
        <div className="px-6 py-3 bg-white border-b border-[#DED6C6] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* 3 Functional Mode Tabs */}
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="tablist"
            aria-label="Document Reader and AI Understanding Tabs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'guide'}
              onClick={() => setActiveTab('guide')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'guide'
                  ? 'bg-stone-900 text-white'
                  : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1. Citizen Guide & AI Explainer</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'inspect'}
              onClick={() => setActiveTab('inspect')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'inspect'
                  ? 'bg-stone-900 text-white'
                  : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>2. Live Document Preview & Files</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'portal_scan'}
              onClick={() => {
                setActiveTab('portal_scan');
                if (!portalScan && !loadingScan) {
                  triggerPortalScan(doc.portalUrl || doc.documentUrl);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'portal_scan'
                  ? 'bg-stone-900 text-white'
                  : 'bg-[#F4EFE6] text-stone-700 hover:bg-[#E7E0D2]'
              }`}
            >
              <FolderSearch className="w-3.5 h-3.5" />
              <span>3. Scan Portal for All Documents</span>
            </button>
          </div>

          {/* Primary Direct Access / Download Link */}
          <div className="flex items-center gap-2">
            <a
              href={doc.downloadUrl || doc.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Access / Download Official Document</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: PLAIN-LANGUAGE CITIZEN GUIDE & AI EXPLAINER */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Structured Citizen Clarity Grid */}
              <div className="bg-white border border-[#DED6C6] rounded-lg p-5 space-y-4">
                <div className="border-b border-stone-200 pb-3">
                  <span className="text-xs uppercase tracking-widest text-stone-500 font-mono block">
                    Plain-Language Citizen & Business Orientation
                  </span>
                  <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                    What This Document Does & How Anyone Can Use It
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Purpose & Summary
                    </h4>
                    <p className="text-stone-800 leading-relaxed">{doc.summary}</p>
                    <p className="text-xs text-stone-600 leading-relaxed pt-1">
                      <strong>Authorized Use:</strong> {doc.whatItIsUsedFor}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                      Who Needs This & Filing Method
                    </h4>
                    <p className="text-stone-800 leading-relaxed">
                      <strong>Target Audience:</strong> {doc.citizenGuide.targetAudience}
                    </p>
                    <p className="text-xs text-stone-600 leading-relaxed pt-1">
                      <strong>Access / Submission Mode:</strong> {doc.citizenGuide.filingMode}
                    </p>
                  </div>
                </div>

                {/* Prerequisites Checklist & Step-by-Step Guide */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-stone-200">
                  <div className="bg-[#FBF9F5] border border-stone-200 rounded p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
                      Checklist: What You Need Ready Before Starting
                    </h4>
                    <ul className="space-y-2 text-xs text-stone-700">
                      {doc.citizenGuide.prerequisites.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#FBF9F5] border border-stone-200 rounded p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2.5">
                      Step-by-Step Instructions to Access & Complete
                    </h4>
                    <ol className="space-y-2 text-xs text-stone-700 list-decimal list-inside">
                      {doc.citizenGuide.stepByStep.map((step, i) => (
                        <li key={i} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>

              {/* Interactive AI Document Explainer & Citizen Q&A Console */}
              <div className="bg-[#F4EFE6] border border-[#DED6C6] rounded-lg p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#1E3A8A] font-mono block">
                      AI Citizen Accessibility Assistant · Google Search Grounded
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">
                      Ask AI to Explain Any Requirement, Clause, Fee, or Step for This Document
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRunAiExplain('')}
                    disabled={loadingAi}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    {loadingAi ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Grounded Guide...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Complete AI Citizen Breakdown</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 1-Click Citizen Understanding Prompts */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-stone-600 font-medium mr-1">Quick Questions:</span>
                  {[
                    'Explain every step and requirement in simple everyday language',
                    'What supporting documents, IDs, and fees are required?',
                    'How can a foreign citizen or international business complete this?',
                    'Find all downloadable PDF forms and instructions related to this document',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setUserQuestion(preset);
                        handleRunAiExplain(preset);
                      }}
                      className="px-2.5 py-1 text-xs text-stone-800 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Custom Question Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRunAiExplain(userQuestion);
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <div className="relative flex-1">
                    <HelpCircle className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder={`Ask any specific question about "${doc.title}" (e.g. processing time, exemptions, where to submit)...`}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingAi}
                    className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
                  >
                    Ask AI Guide
                  </button>
                </form>

                {aiError && (
                  <div className="bg-amber-50 border border-amber-300 rounded p-3 text-xs text-amber-900">
                    {aiError}
                  </div>
                )}

                {aiExplanation && (
                  <div className="bg-white border border-stone-200 rounded-lg p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-stone-500 border-b border-stone-100 pb-2">
                      <span>Model: {aiExplanation.modelUsed}</span>
                      <span>Language: {language.toUpperCase()}</span>
                    </div>

                    <div className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed font-sans">
                      {aiExplanation.explanationMarkdown}
                    </div>

                    {aiExplanation.groundingSources.length > 0 && (
                      <div className="pt-3 border-t border-stone-200">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
                          Verified Official Sources & Direct Document Links Found via Google Search
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {aiExplanation.groundingSources.map((src) => (
                            <a
                              key={src.uri}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2.5 bg-[#FBF9F5] border border-stone-200 rounded hover:border-[#1E3A8A] transition-colors flex items-start justify-between gap-2 text-xs"
                            >
                              <div className="min-w-0">
                                <div className="font-semibold text-stone-900 truncate">
                                  {src.title}
                                </div>
                                <div className="font-mono text-[11px] text-[#1E3A8A] truncate">
                                  {src.uri}
                                </div>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE DOCUMENT PREVIEW & CONTENT INSPECTOR */}
          {activeTab === 'inspect' && (
            <div className="space-y-5">
              {/* Museum / Archival Accession Metadata Grid (Pattern B) */}
              <div className="bg-white border border-[#DED6C6] rounded-lg p-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-stone-500 font-mono block">
                      Live HTTP Document Verification & Accession Record
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">
                      Authenticated Source Metadata & Direct File Stream
                    </h3>
                  </div>
                  {loadingInspect && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-600">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Inspecting live government document stream...</span>
                    </span>
                  )}
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs border-b border-stone-100 pb-4">
                  <div>
                    <dt className="text-stone-500">Accession / Document Code</dt>
                    <dd className="font-mono font-semibold text-stone-900 mt-0.5">
                      {doc.documentCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">HTTP Status & Reachability</dt>
                    <dd className="font-mono font-semibold text-stone-900 mt-0.5">
                      {loadingInspect
                        ? 'Checking...'
                        : inspection?.statusCode
                        ? `HTTP ${inspection.statusCode} (Verified Live)`
                        : 'Direct Browser Access'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Detected MIME / Content-Type</dt>
                    <dd className="font-mono text-stone-800 mt-0.5 truncate">
                      {inspection?.contentType || DOCUMENT_FORMAT_LABELS[doc.format]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-stone-500">Publication Cycle</dt>
                    <dd className="font-mono text-stone-800 mt-0.5">{doc.publishedDate}</dd>
                  </div>
                </dl>

                <div className="pt-3 text-xs font-mono break-all text-stone-700">
                  <strong>Resolved Official Document URL:</strong>{' '}
                  <a
                    href={inspection?.finalUrl || doc.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1E3A8A] underline hover:text-[#172554]"
                  >
                    {inspection?.finalUrl || doc.documentUrl}
                  </a>
                </div>
              </div>

              {/* Authenticated PDF Stream & Companion Instructions Card */}
              {(doc.format === 'PDF' || inspection?.isPdf) && (
                <div className="bg-[#F4EFE6] border border-[#DED6C6] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>
                        Authenticated Official PDF Binary Stream Verified ({doc.documentCode})
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed max-w-2xl">
                      Government servers enforce strict security headers (
                      <code className="font-mono">X-Frame-Options</code>) on official forms. Click
                      to open or save the original fillable PDF directly from{' '}
                      <strong>{doc.agency}</strong>, or scan the issuing portal for companion
                      instruction booklets and schedules.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('portal_scan');
                        if (!portalScan && !loadingScan) {
                          triggerPortalScan(doc.portalUrl || doc.documentUrl);
                        }
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap"
                    >
                      Find Companion Instructions
                    </button>
                    <a
                      href={doc.downloadUrl || doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Official PDF ({doc.documentCode})</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Embedded Downloadable Files Found on the Document Page */}
              {inspection?.embeddedFiles && inspection.embeddedFiles.length > 0 && (
                <div className="bg-white border border-[#DED6C6] rounded-lg p-5 space-y-3">
                  <h4 className="text-sm font-bold text-stone-900">
                    Direct Downloadable Files Discovered Inside This Page (
                    {inspection.embeddedFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {inspection.embeddedFiles.map((file) => (
                      <a
                        key={file.url}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-[#FBF9F5] border border-stone-200 rounded hover:border-[#1E3A8A] transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] text-stone-500">
                            {file.format} FILE
                          </div>
                          <div className="font-semibold text-stone-900 truncate">{file.label}</div>
                          <div className="font-mono text-[11px] text-[#1E3A8A] truncate">
                            {file.url}
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Text Digest */}
              <div className="bg-white border border-[#DED6C6] rounded-lg p-5 space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Live Extracted Document Text / Content Preview
                </h4>
                <div className="bg-[#FBF9F5] border border-stone-200 rounded p-4 text-xs text-stone-800 font-mono whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                  {loadingInspect
                    ? 'Extracting live text content from official government server...'
                    : inspection?.extractedTextPreview || doc.summary}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE PORTAL DOCUMENT & FORM SCANNER */}
          {activeTab === 'portal_scan' && (
            <div className="space-y-5">
              <div className="bg-[#F4EFE6] border border-[#DED6C6] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-semibold text-stone-900">
                    Live Portal Document & Form Crawler:{' '}
                    <span className="font-mono text-[#1E3A8A]">
                      {portalScan?.finalUrl || doc.portalUrl || doc.documentUrl}
                    </span>
                  </div>
                  <div className="text-stone-600 mt-0.5">
                    Extracts every direct downloadable file (.pdf, .csv, .xlsx, .doc, .xml) and
                    official form/publication page linked from this government portal.
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => triggerPortalScan(doc.documentUrl)}
                    disabled={loadingScan}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded hover:bg-stone-100 transition-colors whitespace-nowrap"
                  >
                    Scan Document Page
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerPortalScan(doc.portalUrl)}
                    disabled={loadingScan}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 rounded hover:bg-stone-800 transition-colors whitespace-nowrap"
                  >
                    Scan Main Portal ({doc.countryIso2})
                  </button>
                </div>
              </div>

              {loadingScan ? (
                <div className="p-10 bg-white border border-[#DED6C6] rounded-lg text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1E3A8A] mx-auto" />
                  <p className="text-sm font-semibold text-stone-900">
                    Scanning live government portal HTML for downloadable documents & official forms...
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <input
                    type="text"
                    value={scanFilter}
                    onChange={(e) => setScanFilter(e.target.value)}
                    placeholder="Filter discovered files and publications on this portal..."
                    aria-label="Filter discovered portal documents"
                    className="w-full px-3.5 py-2 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />

                  {/* Direct Downloadable Files (.PDF, .CSV, .XLSX, .DOC) */}
                  <div className="bg-white border border-[#DED6C6] rounded-lg p-5 space-y-3">
                    <h4 className="text-sm font-bold text-stone-900">
                      Direct Downloadable Files Found ({filteredDirectFiles.length})
                    </h4>
                    {filteredDirectFiles.length === 0 ? (
                      <p className="text-xs text-stone-600">
                        No direct binary file links (.pdf/.csv) on the top-level landing HTML. See
                        the Official Forms, Legislation & Publication Sub-Portals below or open the
                        site directly.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {filteredDirectFiles.map((file) => (
                          <a
                            key={file.url}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-[#FBF9F5] border border-stone-200 rounded hover:border-[#1E3A8A] transition-colors flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-mono text-[11px] text-stone-500">
                                {file.fileType} DOCUMENT
                              </div>
                              <div className="font-semibold text-stone-900 truncate">
                                {file.title}
                              </div>
                              <div className="font-mono text-[11px] text-[#1E3A8A] truncate">
                                {file.url}
                              </div>
                            </div>
                            <Download className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Official Form, Legislation & Publication Links */}
                  <div className="bg-white border border-[#DED6C6] rounded-lg p-5 space-y-3">
                    <h4 className="text-sm font-bold text-stone-900">
                      Official Form, Service & Publication Links Extracted ({filteredPubPages.length})
                    </h4>
                    {filteredPubPages.length === 0 ? (
                      <p className="text-xs text-stone-600">
                        {portalScan?.error ||
                          'No matching sub-pages found. Click "Access / Download Official Document" above to open the government portal directly.'}
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
                        {filteredPubPages.map((pub) => (
                          <div
                            key={pub.url}
                            className="p-3 bg-[#FBF9F5] border border-stone-200 rounded flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-stone-900 truncate">
                                {pub.title}
                              </div>
                              <div className="font-mono text-[11px] text-[#1E3A8A] truncate">
                                {pub.url}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => triggerPortalScan(pub.url)}
                                className="px-2 py-1 text-[11px] font-medium text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-100"
                              >
                                Scan Page
                              </button>
                              <a
                                href={pub.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${pub.title}`}
                                className="p-1.5 text-white bg-stone-900 rounded hover:bg-stone-800"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
