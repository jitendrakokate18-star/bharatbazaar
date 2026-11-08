'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { CompanyWithPrice } from '@/lib/dbService';
import { formatMarketCap, formatINR, formatPercent } from '@/lib/currency';
import {
  Layers,
  Building2,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Search,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SectorData {
  sector: {
    slug: string;
    nameEn: string;
    nameMr: string;
    descriptionEn: string;
    descriptionMr: string;
    aliasesEn: string[];
    aliasesMr: string[];
  } | null;
  companyCount: number;
  totalMarketCapCr: number;
  averagePe: number | null;
  dayChangePct: number;
  companies: CompanyWithPrice[];
}

export default function SectorDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t, locale, useDevanagariDigits } = useI18n();

  const [data, setData] = useState<SectorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'capDesc' | 'capAsc' | 'gainers' | 'losers' | 'nameAsc'>('capDesc');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/sectors/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-500 text-sm font-medium">{t('common.loading')}</p>
      </div>
    );
  }

  if (!data?.sector) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {locale === 'mr' ? 'हे औद्योगिक क्षेत्र आढळले नाही' : 'Sector not found'}
        </h2>
        <Link
          href="/directory"
          className="inline-flex items-center space-x-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </Link>
      </div>
    );
  }

  const { sector, companyCount, totalMarketCapCr, averagePe, dayChangePct, companies } = data;

  // Filter and sort companies
  let filtered = companies.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.nameMr && c.nameMr.toLowerCase().includes(q)) ||
      (c.nseSymbol && c.nseSymbol.toLowerCase().includes(q)) ||
      (c.bseCode && c.bseCode.includes(q)) ||
      c.industry.toLowerCase().includes(q)
    );
  });

  filtered.sort((a, b) => {
    if (sortBy === 'capDesc') return b.marketCapCr - a.marketCapCr;
    if (sortBy === 'capAsc') return a.marketCapCr - b.marketCapCr;
    if (sortBy === 'gainers') return (b.dayChangePct || 0) - (a.dayChangePct || 0);
    if (sortBy === 'losers') return (a.dayChangePct || 0) - (b.dayChangePct || 0);
    if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
    return 0;
  });

  const isPositiveDay = dayChangePct >= 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/directory"
          className="inline-flex items-center space-x-1 font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'mr' ? 'सर्व कंपन्या' : 'Company Directory'}</span>
        </Link>
        <span className="font-mono text-slate-400">{sector.slug}</span>
      </div>

      {/* Sector Header Card */}
      <div className="bg-gradient-to-br from-white via-slate-50/80 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              <Layers className="w-3.5 h-3.5 mr-1" />
              <span>{locale === 'mr' ? 'औद्योगिक क्षेत्र' : 'Market Sector'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {locale === 'mr' ? sector.nameMr : sector.nameEn}
            </h1>
            {locale === 'mr' && (
              <p className="text-base font-medium text-slate-500 dark:text-slate-400">
                {sector.nameEn}
              </p>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              {locale === 'mr' ? sector.descriptionMr : sector.descriptionEn}
            </p>

            {/* Aliases chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1">
                {locale === 'mr' ? 'पर्यायी नावे:' : 'Search Aliases:'}
              </span>
              {(locale === 'mr' ? sector.aliasesMr : sector.aliasesEn).slice(0, 6).map((alias) => (
                <span
                  key={alias}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                >
                  {alias}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Aggregate Stats Box */}
          <div className="grid grid-cols-2 gap-3 shrink-0 bg-white dark:bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm min-w-[280px]">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {locale === 'mr' ? 'एकूण बाजार भांडवल' : 'Total Market Cap'}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {formatMarketCap(totalMarketCapCr, locale, useDevanagariDigits)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {locale === 'mr' ? 'एकूण कंपन्या' : 'Total Companies'}
              </p>
              <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 font-mono">
                {companyCount}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {locale === 'mr' ? 'आजचा बदल' : "Today's Change"}
              </p>
              <p
                className={`text-lg font-black mt-0.5 flex items-center space-x-1 ${
                  isPositiveDay ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isPositiveDay ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{formatPercent(dayChangePct, 2, useDevanagariDigits)}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {locale === 'mr' ? 'सरासरी पी/ई' : 'Average P/E'}
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {averagePe ? averagePe.toFixed(1) : t('common.dataUnavailable')}
              </p>
            </div>
          </div>
        </div>

        {/* Provenance Footnote */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {locale === 'mr'
                ? 'डेटा दिनांक: ०६ नोव्हेंबर २०२६ · स्रोत: BSE/NSE अधिकृत वर्गीकरण व भावकॉपी'
                : 'Data as of 06 Nov 2026 · Source: BSE/NSE Official Classifications & Bhavcopy'}
            </span>
          </div>
          <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{t('common.delayed15Min')}</span>
          </span>
        </div>
      </div>

      {/* Constituents Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === 'mr' ? 'या क्षेत्रातील कंपनी शोधा...' : 'Search within this sector...'}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{t('directory.sortBy')}:</span>
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="capDesc">{t('directory.sortMarketCapDesc')}</option>
            <option value="capAsc">{t('directory.sortMarketCapAsc')}</option>
            <option value="gainers">{t('directory.sortGainers')}</option>
            <option value="losers">{t('directory.sortLosers')}</option>
            <option value="nameAsc">{t('directory.sortNameAsc')}</option>
          </select>
        </div>
      </div>

      {/* Constituents Presentation */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {/* Mobile Cards List (< 640px) */}
        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-700/60">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              {t('directory.noResults')}
            </div>
          ) : (
            filtered.map((c) => {
              const ltp = c.livePriceNse || c.livePriceBse || 0;
              const isPos = (c.dayChangePct || 0) >= 0;

              return (
                <Link
                  key={c.isin}
                  href={`/company/${c.isin}`}
                  className="p-4 block hover:bg-slate-50 dark:hover:bg-slate-700/40 active:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">
                        {locale === 'mr' ? c.nameMr : c.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mt-0.5 flex-wrap">
                        {c.nseSymbol && (
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            NSE: {c.nseSymbol}
                          </span>
                        )}
                        {c.bseCode && <span>BSE: {c.bseCode}</span>}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {ltp > 0 ? (
                        <>
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white block">
                            {formatINR(ltp, 2, useDevanagariDigits)}
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${
                              isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {formatPercent(c.dayChangePct || 0, 2, useDevanagariDigits)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">{t('common.dataUnavailable')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {locale === 'mr' ? c.industryMr : c.industry}
                    </span>

                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {c.marketCapCr > 0 ? formatMarketCap(c.marketCapCr, locale, useDevanagariDigits) : '—'}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Tablet & Desktop Table (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">{locale === 'mr' ? 'कंपनीचे नाव व चिन्ह' : 'Company & Symbol'}</th>
                <th className="px-4 py-3.5">{locale === 'mr' ? 'उद्योग शाखा' : 'Industry'}</th>
                <th className="px-4 py-3.5 text-right">{locale === 'mr' ? 'किंमत (₹)' : 'Price (₹)'}</th>
                <th className="px-4 py-3.5 text-right">{locale === 'mr' ? 'आजचा बदल' : "Today's Change"}</th>
                <th className="px-5 py-3.5 text-right">{locale === 'mr' ? 'बाजार भांडवल' : 'Market Cap'}</th>
                <th className="px-4 py-3.5 text-center">{locale === 'mr' ? 'तपशील' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    {t('directory.noResults')}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const ltp = c.livePriceNse || c.livePriceBse || 0;
                  const isPos = (c.dayChangePct || 0) >= 0;

                  return (
                    <tr
                      key={c.isin}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors group cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/company/${c.isin}`}
                          className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 block transition-colors"
                        >
                          {locale === 'mr' ? c.nameMr : c.name}
                        </Link>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mt-0.5">
                          {c.nseSymbol && (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                              NSE: {c.nseSymbol}
                            </span>
                          )}
                          {c.bseCode && <span>BSE: {c.bseCode}</span>}
                          <span>•</span>
                          <span>{c.isin}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {locale === 'mr' ? c.industryMr : c.industry}
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {ltp > 0 ? (
                          <>
                            {formatINR(ltp, 2, useDevanagariDigits)}
                            <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-sans font-normal">
                              {t('common.delayed15Min')}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400">{t('common.dataUnavailable')}</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-bold">
                        {c.dayChangePct !== undefined ? (
                          <span
                            className={`inline-flex items-center space-x-0.5 ${
                              isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            <span>{formatPercent(c.dayChangePct, 2, useDevanagariDigits)}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {c.marketCapCr > 0
                          ? formatMarketCap(c.marketCapCr, locale, useDevanagariDigits)
                          : t('common.dataUnavailable')}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/company/${c.isin}`}
                          className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:hover:bg-blue-900/70 dark:text-blue-300 transition-colors min-h-[44px] min-w-[44px]"
                        >
                          <span>{t('common.viewProfile')}</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
