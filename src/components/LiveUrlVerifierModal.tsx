import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, Globe, Loader2, ShieldAlert, X } from 'lucide-react';
import { UrlVerificationResult } from '../types/registry';

interface InlineVerifierProps {
  url: string;
  verifyLabel: string;
  verifyingLabel: string;
  verifiedLabel: string;
}

export const InlineUrlVerifier: React.FC<InlineVerifierProps> = ({
  url,
  verifyLabel,
  verifyingLabel,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlVerificationResult | null>(null);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/verify-url?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({
        url,
        reachable: false,
        statusCode: null,
        statusText: 'Check Failed',
        finalUrl: url,
        latencyMs: 0,
        contentType: null,
        isHttps: url.startsWith('https://'),
        checkedAt: new Date().toISOString(),
        error: err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="inline-flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums text-stone-700">
        {result.reachable ? (
          <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>HTTP {result.statusCode || 200}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>{result.statusText}</span>
          </span>
        )}
        <span aria-hidden="true">·</span>
        <span>{result.latencyMs}ms</span>
        <span aria-hidden="true">·</span>
        <span>{result.isHttps ? 'TLS/HTTPS' : 'HTTP'}</span>
        <button
          type="button"
          onClick={handleVerify}
          className="underline text-stone-500 hover:text-stone-900 ml-1"
        >
          Re-check
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleVerify}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-700 bg-[#F4EFE6] border border-[#D6CEBE] rounded hover:bg-[#EBE3D5] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{verifyingLabel}</span>
        </>
      ) : (
        <>
          <Globe className="w-3.5 h-3.5 text-[#1E3A8A]" />
          <span>{verifyLabel}</span>
        </>
      )}
    </button>
  );
};

interface LiveUrlVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_URLS = [
  { label: 'USA.gov (United States)', url: 'https://www.usa.gov' },
  { label: 'GOV.UK (United Kingdom)', url: 'https://www.gov.uk' },
  { label: 'India.gov.in (India)', url: 'https://www.india.gov.in' },
  { label: 'CA.gov (State of California)', url: 'https://www.ca.gov' },
  { label: 'Service-Public.fr (France)', url: 'https://www.service-public.fr' },
  { label: 'e-Gov.go.jp (Japan)', url: 'https://www.e-gov.go.jp' },
];

export const LiveUrlVerifierModal: React.FC<LiveUrlVerifierModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [inputUrl, setInputUrl] = useState('https://www.usa.gov');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<UrlVerificationResult[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a valid HTTP or HTTPS government portal URL to verify.');
      return;
    }
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setErrorMsg('URL must start with https:// or http://');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/verify-url?url=${encodeURIComponent(trimmed)}`);
      const data: UrlVerificationResult = await res.json();
      setHistory((prev) => [data, ...prev.filter((item) => item.url !== data.url)]);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verifier-modal-title"
    >
      <div className="bg-[#FBF9F5] border border-[#D6CEBE] rounded-lg max-w-2xl w-full p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 block">
              Real-Time Server HTTP/TLS Inspector
            </span>
            <h2 id="verifier-modal-title" className="text-xl font-bold text-stone-900 mt-1">
              Cross-Check Any Government Website or API Endpoint
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close URL Verifier Modal"
            className="p-2 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-stone-600 mt-4 leading-relaxed">
          Performs a live server-side HTTP HEAD/GET handshake to verify domain resolution, TLS
          encryption status, redirect chain, and response latency without assuming availability.
        </p>

        <form onSubmit={handleSubmit} className="mt-4">
          <label htmlFor="verify-url-input" className="block text-xs font-medium text-stone-700 mb-1.5">
            Official Portal or API Endpoint URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="verify-url-input"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://www.gov.uk"
              className="flex-1 px-3.5 py-2 text-sm font-mono bg-white border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-[#1E3A8A] rounded hover:bg-[#172554] transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {loading ? 'Probing Endpoint...' : 'Run Live HTTP Check'}
            </button>
          </div>
          {errorMsg && (
            <p className="text-xs text-red-700 mt-2 font-medium" role="alert">
              {errorMsg}
            </p>
          )}
        </form>

        <div className="mt-4">
          <span className="text-xs text-stone-500 block mb-2">Quick-Test Sovereign Portals:</span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_URLS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => setInputUrl(preset.url)}
                className="px-2.5 py-1 text-xs text-stone-700 bg-[#F4EFE6] border border-[#DED6C6] rounded hover:bg-[#E7E0D2] transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-6 border-t border-stone-200 pt-4 max-h-72 overflow-y-auto">
            <h3 className="text-xs uppercase tracking-widest text-stone-500 mb-3">
              Live Inspection Log ({history.length})
            </h3>
            <div className="divide-y divide-stone-200 border border-stone-200 rounded bg-white">
              {history.map((item) => (
                <div key={item.url + item.checkedAt} className="p-3.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-stone-900 break-all">
                      {item.url}
                    </span>
                    <span
                      className={`font-mono font-semibold whitespace-nowrap shrink-0 ${
                        item.reachable ? 'text-emerald-800' : 'text-amber-800'
                      }`}
                    >
                      {item.reachable ? `Verified (${item.statusText})` : item.statusText}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-stone-500 font-mono tabular-nums mt-1.5">
                    <span>Latency: {item.latencyMs}ms</span>
                    <span aria-hidden="true">·</span>
                    <span>Protocol: {item.isHttps ? 'HTTPS (TLS)' : 'HTTP'}</span>
                    {item.contentType && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Type: {item.contentType.split(';')[0]}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <a
                      href={item.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#1E3A8A] hover:underline"
                    >
                      <span>Open Resolved Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
