'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import {
  Company,
  CompanyProfile,
  Brand,
  DualExchangePrice,
  ShareholdingQuarter,
  CorporateAction,
  FiveYearFinancial,
} from '@/types';
import { LivePriceCard } from '@/components/LivePriceCard';
import { BrandsGrid } from '@/components/BrandsGrid';
import { PerformanceChart } from '@/components/PerformanceChart';
import { FinancialsTable } from '@/components/FinancialsTable';
import { ShareholdingChart } from '@/components/ShareholdingChart';
import { CorporateActionsList } from '@/components/CorporateActionsList';
import { formatMarketCap, formatIndianNumber, formatPercent } from '@/lib/currency';
import { formatDate } from '@/lib/dates';
import {
  Globe,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  ArrowLeft,
  Database,
  Clock,
  Info,
  Copy,
  Check,
  TrendingUp,
  FileText,
  PieChart,
  Tag,
  SlidersHorizontal,
} from 'lucide-react';

export default function CompanyProfilePage() {
  const params = useParams();
  const isin = params.isin as string;
  const { t, locale, useDevanagariDigits } = useI18n();

  const [company, setCompany] = useState<Company | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [livePrice, setLivePrice] = useState<DualExchangePrice | null>(null);
  const [financials, setFinancials] = useState<FiveYearFinancial[]>([]);
  const [shareholding, setShareholding] = useState<ShareholdingQuarter[]>([]);
  const [corporateActions, setCorporateActions] = useState<CorporateAction[]>([]);
  const [trailingDividendYield, setTrailingDividendYield] = useState<number | null>(null);
  const [finProvenance, setFinProvenance] = useState<{ asOf: string; source: string }>({ asOf: '', source: '' });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'overview' | 'chart' | 'financials' | 'shareholding' | 'corporateActions' | 'brands'>('all');

  useEffect(() => {
    if (!isin) return;

    let active = true;
    setLoading(true);

    Promise.all([
      fetch(`/api/companies/${isin}`).then((r) => r.json()),
      fetch(`/api/companies/${isin}/financials`).then((r) => r.json()),
    ])
      .then(([companyData, finData]) => {
        if (active) {
          setCompany(companyData.company || null);
          setProfile(companyData.profile || null);
          setBrands(companyData.brands || []);
          setLivePrice(companyData.livePrice || null);
          setShareholding(companyData.shareholding || []);
          setCorporateActions(companyData.corporateActions || []);
          setTrailingDividendYield(companyData.trailingDividendYield || null);

          setFinancials(finData.financials || []);
          if (finData.asOf) {
            setFinProvenance({ asOf: finData.asOf, source: finData.source || 'Exchange Filings' });
          }
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isin]);

  const handleCopyIsin = () => {
    if (company && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(company.isin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        <p className="text-slate-500 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {locale === 'mr' ? 'कंपनी आढळली नाही' : 'Company not found'}
        </h2>
        <a
          href="/directory"
          className="inline-flex items-center space-x-1.5 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline min-h-[44px] min-w-[44px] px-3 py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </a>
      </div>
    );
  }

  const latestFin = financials[financials.length - 1];
  const listingYear = company.listingDate ? parseInt(company.listingDate.substring(0, 4), 10) : null;
  const isListedUnder5Years = listingYear && listingYear > 2021;
  const unavailableLabel = t('common.dataUnavailable');

  const tabs = [
    { id: 'all', label: locale === 'mr' ? 'सर्व विभाग' : 'All Sections' },
    { id: 'overview', label: t('company.tabs.overview') },
    { id: 'chart', label: t('company.tabs.chart') },
    { id: 'financials', label: t('company.tabs.financials') },
    { id: 'shareholding', label: t('company.tabs.shareholding') },
    { id: 'corporateActions', label: t('company.tabs.corporateActions') },
    ...(company.hasBrands && brands.length > 0 ? [{ id: 'brands', label: t('company.tabs.brands') }] : []),
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
        <a
          href="/directory"
          className="inline-flex items-center space-x-1.5 font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[44px] py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{locale === 'mr' ? 'कंपन्यांची सूची' : 'All Companies'}</span>
        </a>

        {/* Copyable ISIN Pill */}
        <div className="flex items-center space-x-1.5">
          <span className="font-mono text-slate-400">{t('company.isin')}:</span>
          <button
            type="button"
            onClick={handleCopyIsin}
            title={copied ? t('company.copied') : t('company.copyIsin')}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[36px]"
          >
            <span>{company.isin}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 1. Header Card: Name, Exchange Badges, Sector, Live NSE/BSE Prices */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3 min-w-0">
            {/* Sector, Industry & Listing Age */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/sectors/${company.sectorSlug || 'other'}`}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors min-h-[32px] inline-flex items-center"
              >
                {locale === 'mr' ? company.sectorMr : company.sector}
              </a>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                • {locale === 'mr' ? company.industryMr : company.industry}
              </span>
              {isListedUnder5Years && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Info className="w-3.5 h-3.5 mr-1" />
                  <span>
                    {locale === 'mr'
                      ? `${formatDate(company.listingDate, 'mr', useDevanagariDigits)} पासून सूचिबद्ध`
                      : `Listed since ${formatDate(company.listingDate, 'en')}`}
                  </span>
                </span>
              )}
            </div>

            {/* Company Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight break-words">
                {locale === 'mr' ? company.nameMr : company.name}
              </h1>
              {locale === 'mr' && (
                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
                  {company.name}
                </p>
              )}
            </div>

            {/* Exchange identifiers & Official links */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
              {company.nseSymbol && (
                <a
                  href={`https://www.nseindia.com/get-quotes/equity?symbol=${company.nseSymbol}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('company.nseLink')}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors inline-flex items-center space-x-1 min-h-[36px]"
                >
                  <span>{t('company.nseSymbol')}: {company.nseSymbol}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </a>
              )}
              {company.bseCode && (
                <a
                  href={`https://www.bseindia.com/stock-share-price/${company.bseCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('company.bseLink')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors inline-flex items-center space-x-1 min-h-[36px]"
                >
                  <span>{t('company.bseCode')}: {company.bseCode}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-sans font-semibold hover:underline min-h-[36px] px-2 py-1"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('company.officialWebsite')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Live Quotes Component (NSE & BSE side-by-side or stacked on mobile) */}
        {livePrice && <LivePriceCard initialPrice={livePrice} isin={company.isin} />}
      </div>

      {/* Horizontal Scrollable Tabs Bar */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-y border-slate-200 dark:border-slate-800 -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all min-h-[44px] flex items-center justify-center shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION: Key Statistics & Valuation Cards (Shown on 'all' or 'overview') */}
      {(activeTab === 'all' || activeTab === 'overview') && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('company.keyStats')}
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>
                {locale === 'mr' ? 'डेटा तारीख: ' : 'Data as of '}
                <strong>{company.asOf || '2026-11-07'}</strong> · {locale === 'mr' ? 'स्रोत: ' : 'Source: '}
                <strong>{company.source || 'NSE/BSE Corporate Filings'}</strong>
              </span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 text-xs">
            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-slate-400 block text-[11px] mb-1">{t('stats.marketCap')}</span>
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {company.marketCapCr > 0 ? formatMarketCap(company.marketCapCr, locale, useDevanagariDigits) : unavailableLabel}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-slate-400 block text-[11px] mb-1">{t('stats.peRatio')}</span>
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {latestFin && latestFin.ratios?.pe && latestFin.ratios.pe > 0
                  ? formatIndianNumber(latestFin.ratios.pe, 1, useDevanagariDigits)
                  : unavailableLabel}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-slate-400 block text-[11px] mb-1">{t('stats.pbRatio')}</span>
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {latestFin && latestFin.ratios?.pb && latestFin.ratios.pb > 0
                  ? formatIndianNumber(latestFin.ratios.pb, 1, useDevanagariDigits)
                  : unavailableLabel}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-slate-400 block text-[11px] mb-1">{t('stats.roe')}</span>
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {latestFin && latestFin.ratios?.roe !== undefined && latestFin.ratios.roe !== 0
                  ? formatPercent(latestFin.ratios.roe, 1, useDevanagariDigits)
                  : unavailableLabel}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-slate-400 block text-[11px] mb-1">{t('stats.roce')}</span>
              <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {latestFin && latestFin.ratios?.roce !== undefined && latestFin.ratios.roce !== 0
                  ? formatPercent(latestFin.ratios.roce, 1, useDevanagariDigits)
                  : unavailableLabel}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <span className="text-slate-400 block text-[11px] mb-1">{t('stats.dividendYield')} (TTM)</span>
              <span className="font-mono font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                {trailingDividendYield !== null && trailingDividendYield !== undefined
                  ? formatPercent(trailingDividendYield, 2, useDevanagariDigits)
                  : unavailableLabel}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Brands Showcase (Shown on 'all' or 'brands') */}
      {(activeTab === 'all' || activeTab === 'brands') && company.hasBrands && brands.length > 0 && (
        <BrandsGrid brands={brands} />
      )}

      {/* SECTION: 5-Year Performance Interactive Chart (Shown on 'all' or 'chart') */}
      {(activeTab === 'all' || activeTab === 'chart') && (
        <PerformanceChart isin={company.isin} />
      )}

      {/* SECTION: Company Background & Promoters (Shown on 'all' or 'overview') */}
      {(activeTab === 'all' || activeTab === 'overview') && profile && (
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {t('company.background')}
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>
                {locale === 'mr' ? 'डेटा तारीख: ' : 'Data as of '}
                <strong>{profile.asOf || '2026-11-07'}</strong> · {locale === 'mr' ? 'स्रोत: ' : 'Source: '}
                <strong>{profile.source || 'Exchange Master Disclosures'}</strong>
              </span>
            </span>
          </div>

          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {locale === 'mr' ? profile.descriptionMr : profile.descriptionEn}
          </p>

          {/* Quick Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs sm:text-sm">
            <div className="flex items-start space-x-2.5">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-xs">{t('company.founded')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {profile.foundedYear || unavailableLabel}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-xs">{t('company.headquarters')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(locale === 'mr' ? profile.headquartersMr : profile.headquarters) || unavailableLabel}
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-xs">{t('company.founders')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {profile.founders && profile.founders.length > 0
                    ? (locale === 'mr' ? profile.foundersMr.join(', ') : profile.founders.join(', '))
                    : unavailableLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Key Leadership */}
          {profile.management && profile.management.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                {t('company.management')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.management.map((mgr) => (
                  <div key={mgr.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-xs">
                    <span className="text-slate-400 block text-[11px]">
                      {locale === 'mr' ? mgr.titleMr : mgr.title}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {locale === 'mr' ? mgr.nameMr : mgr.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION: 5-Year Financial Statements Table (Shown on 'all' or 'financials') */}
      {(activeTab === 'all' || activeTab === 'financials') && (
        <div className="space-y-2">
          <FinancialsTable financials={financials} />
          {finProvenance.asOf && (
            <div className="text-[11px] text-slate-400 px-2 flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>
                {locale === 'mr' ? 'डेटा तारीख: ' : 'Data as of '}
                <strong>{finProvenance.asOf}</strong> · {locale === 'mr' ? 'स्रोत: ' : 'Source: '}
                <strong>{finProvenance.source}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* SECTION: Shareholding Pattern (Shown on 'all' or 'shareholding') */}
      {(activeTab === 'all' || activeTab === 'shareholding') && (
        <ShareholdingChart data={shareholding} />
      )}

      {/* SECTION: Corporate Actions & Dividends (Shown on 'all' or 'corporateActions') */}
      {(activeTab === 'all' || activeTab === 'corporateActions') && (
        <CorporateActionsList actions={corporateActions} />
      )}
    </div>
  );
}
