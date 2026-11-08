'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { Company } from '@/types';
import { formatMarketCap, formatPercent, formatIndianNumber } from '@/lib/currency';
import {
  Search,
  Filter,
  Building2,
  Tag,
  ArrowUpDown,
  Sparkles,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  X,
  ChevronRight,
} from 'lucide-react';

export default function DirectoryPage() {
  const { t, locale, useDevanagariDigits } = useI18n();

  const [search, setSearch] = useState('');
  const [exchange, setExchange] = useState<'ALL' | 'NSE' | 'BSE'>('ALL');
  const [sector, setSector] = useState('ALL');
  const [marketCapCategory, setMarketCapCategory] = useState<'all' | 'large' | 'mid' | 'small'>('all');
  const [hasBrandsOnly, setHasBrandsOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'marketCapDesc' | 'marketCapAsc' | 'nameAsc' | 'gainers' | 'losers'>('marketCapDesc');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const [loading, setLoading] = useState(true);
  const [sectorsList, setSectorsList] = useState<Array<{ slug: string; nameEn: string; nameMr: string }>>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Fetch real sectors dynamically from database
  useEffect(() => {
    fetch('/api/sectors')
      .then((r) => r.json())
      .then((d) => {
        if (d.sectors) setSectorsList(d.sectors);
      })
      .catch(console.error);
  }, []);

  // Read URL query params on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const secParam = urlParams.get('sector');
      if (secParam) setSector(secParam);
      const qParam = urlParams.get('q');
      if (qParam) setSearch(qParam);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const queryParams = new URLSearchParams();
    if (search.trim()) queryParams.set('q', search.trim());
    if (exchange !== 'ALL') queryParams.set('exchange', exchange);
    if (sector !== 'ALL') queryParams.set('sector', sector);
    if (marketCapCategory !== 'all') queryParams.set('marketCap', marketCapCategory);
    if (hasBrandsOnly) queryParams.set('hasBrands', 'true');
    queryParams.set('sortBy', sortBy);
    queryParams.set('page', String(page));
    queryParams.set('pageSize', String(pageSize));

    fetch(`/api/companies?${queryParams.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setCompanies(data.companies || []);
          setTotal(data.total || 0);
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
  }, [search, exchange, sector, marketCapCategory, hasBrandsOnly, sortBy, page]);

  const clearFilters = () => {
    setSearch('');
    setExchange('ALL');
    setSector('ALL');
    setMarketCapCategory('all');
    setHasBrandsOnly(false);
    setSortBy('marketCapDesc');
    setPage(1);
  };

  // Active filter count
  let activeFilterCount = 0;
  if (exchange !== 'ALL') activeFilterCount++;
  if (sector !== 'ALL') activeFilterCount++;
  if (marketCapCategory !== 'all') activeFilterCount++;
  if (hasBrandsOnly) activeFilterCount++;

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('directory.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          {t('directory.subtitle')}
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search input + Mobile Filter Button */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 min-w-0">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t('directory.search')}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[44px]"
            />
          </div>

          {/* Mobile Filter Button (< 640px) */}
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className={`sm:hidden px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 min-h-[44px] shrink-0 transition-colors ${
              activeFilterCount > 0
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('directory.filterButton')}</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-mono flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls Grid (Tablet & Desktop >= 640px) */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Exchange Filter */}
          <div>
            <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t('directory.exchange')}
            </label>
            <select
              value={exchange}
              onChange={(e) => {
                setExchange(e.target.value as any);
                setPage(1);
              }}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              <option value="ALL">{t('directory.allExchanges')}</option>
              <option value="NSE">{t('directory.nseOnly')}</option>
              <option value="BSE">{t('directory.bseOnly')}</option>
            </select>
          </div>

          {/* Sector Filter */}
          <div>
            <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t('directory.sector')}
            </label>
            <select
              value={sector}
              onChange={(e) => {
                setSector(e.target.value);
                setPage(1);
              }}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              <option value="ALL">{t('common.allSectors')}</option>
              {sectorsList.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {locale === 'mr' ? s.nameMr : s.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Market Cap Band */}
          <div>
            <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t('directory.marketCapBand')}
            </label>
            <select
              value={marketCapCategory}
              onChange={(e) => {
                setMarketCapCategory(e.target.value as any);
                setPage(1);
              }}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              <option value="all">{t('common.all')}</option>
              <option value="large">{t('directory.largeCap')}</option>
              <option value="mid">{t('directory.midCap')}</option>
              <option value="small">{t('directory.smallCap')}</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">
              {t('directory.sortBy')}
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            >
              <option value="marketCapDesc">{t('directory.sortMarketCapDesc')}</option>
              <option value="marketCapAsc">{t('directory.sortMarketCapAsc')}</option>
              <option value="nameAsc">{t('directory.sortNameAsc')}</option>
              <option value="gainers">{t('directory.sortGainers')}</option>
              <option value="losers">{t('directory.sortLosers')}</option>
            </select>
          </div>
        </div>

        {/* Toggle 'Has Brands' & Summary Row */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 gap-3">
          <label className="inline-flex items-center space-x-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 min-h-[44px]">
            <input
              type="checkbox"
              checked={hasBrandsOnly}
              onChange={(e) => {
                setHasBrandsOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center space-x-1">
              <Tag className="w-3.5 h-3.5 text-amber-500 inline" />
              <span>{t('directory.hasBrandsFilter')}</span>
            </span>
          </label>

          <div className="flex items-center space-x-3 text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {t('directory.totalCompanies')}:{' '}
              <strong className="font-mono text-slate-900 dark:text-white">
                {formatIndianNumber(total, 0, useDevanagariDigits)}
              </strong>
            </span>

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1 min-h-[44px] min-w-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('directory.clearFilters')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet (Slide up Bottom Sheet) */}
      {filterSheetOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setFilterSheetOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl space-y-5 max-h-[85dvh] overflow-y-auto safe-bottom border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                <span>{t('directory.filterButton')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Exchange */}
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {t('directory.exchange')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ALL', 'NSE', 'BSE'] as const).map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setExchange(ex)}
                      className={`py-2.5 rounded-xl font-bold border transition-colors min-h-[44px] ${
                        exchange === ex
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ex === 'ALL' ? t('common.all') : ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sector */}
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {t('directory.sector')}
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm min-h-[44px]"
                >
                  <option value="ALL">{t('common.allSectors')}</option>
                  {sectorsList.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {locale === 'mr' ? s.nameMr : s.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Market Cap */}
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {t('directory.marketCapBand')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: t('common.all') },
                    { id: 'large', label: t('directory.largeCap') },
                    { id: 'mid', label: t('directory.midCap') },
                    { id: 'small', label: t('directory.smallCap') },
                  ].map((band) => (
                    <button
                      key={band.id}
                      type="button"
                      onClick={() => setMarketCapCategory(band.id as any)}
                      className={`py-2 px-2 rounded-xl font-bold text-[11px] border text-center transition-colors min-h-[44px] ${
                        marketCapCategory === band.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {band.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {t('directory.sortBy')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm min-h-[44px]"
                >
                  <option value="marketCapDesc">{t('directory.sortMarketCapDesc')}</option>
                  <option value="marketCapAsc">{t('directory.sortMarketCapAsc')}</option>
                  <option value="nameAsc">{t('directory.sortNameAsc')}</option>
                  <option value="gainers">{t('directory.sortGainers')}</option>
                  <option value="losers">{t('directory.sortLosers')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs min-h-[44px]"
              >
                {t('directory.resetFilters')}
              </button>
              <button
                type="button"
                onClick={() => setFilterSheetOpen(false)}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 min-h-[44px]"
              >
                {t('directory.applyFilters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Companies Presentation */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400 space-y-2">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>{t('common.loading')}</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('directory.noResults')}
          </div>
        ) : (
          <>
            {/* 1. MOBILE CARDS VIEW (< 640px) */}
            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {companies.map((comp) => (
                <a
                  key={comp.isin}
                  href={`/company/${comp.isin}`}
                  className="p-4 block hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400 shrink-0">
                        {comp.name.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                          {locale === 'mr' ? comp.nameMr : comp.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 flex-wrap text-[11px] font-mono text-slate-400">
                          <span>{comp.isin}</span>
                          {comp.nseSymbol && (
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              NSE: {comp.nseSymbol}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                  </div>

                  {/* Card Metadata Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                      {locale === 'mr' ? comp.sectorMr : comp.sector}
                    </span>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">{t('stats.marketCap')}</span>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {formatMarketCap(comp.marketCapCr, locale, useDevanagariDigits)}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* 2. TABLET & DESKTOP TABLE VIEW (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">{t('directory.tableHeaderName')} / ISIN</th>
                    <th className="py-3.5 px-4">{t('directory.tableHeaderSector')}</th>
                    <th className="py-3.5 px-4">{t('directory.exchange')}</th>
                    <th className="py-3.5 px-4 text-right">{t('stats.marketCap')}</th>
                    <th className="py-3.5 px-4 text-center">{locale === 'mr' ? 'ब्रँड्स' : 'Brands'}</th>
                    <th className="py-3.5 px-4 text-right"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {companies.map((comp) => (
                    <tr
                      key={comp.isin}
                      className="hover:bg-blue-50/40 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        window.location.href = `/company/${comp.isin}`;
                      }}
                    >
                      {/* Name & ISIN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400 shrink-0">
                            {comp.name.substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {locale === 'mr' ? comp.nameMr : comp.name}
                            </h4>
                            <span className="text-xs font-mono text-slate-400">
                              {comp.isin}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {locale === 'mr' ? comp.sectorMr : comp.sector}
                      </td>

                      {/* Exchanges badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5 font-mono text-xs">
                          {comp.nseSymbol && (
                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
                              NSE: {comp.nseSymbol}
                            </span>
                          )}
                          {comp.bseCode && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-600">
                              BSE: {comp.bseCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatMarketCap(comp.marketCapCr, locale, useDevanagariDigits)}
                      </td>

                      {/* Brands Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {comp.hasBrands ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Tag className="w-3 h-3 mr-1" />
                            {locale === 'mr' ? 'ब्रँड्स आहेत' : 'Has Brands'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">
                            {locale === 'mr' ? 'नाहीत' : 'None'}
                          </span>
                        )}
                      </td>

                      {/* Arrow action */}
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/company/${comp.isin}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform min-h-[44px] min-w-[44px] justify-end"
                        >
                          <span>{t('common.viewProfile')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {total > pageSize && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-500 flex-wrap gap-3">
            <div>
              {locale === 'mr' ? 'दर्शवत आहे: ' : 'Showing '}
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)}
              </strong>
              {locale === 'mr' ? ` (एकूण ${total})` : ` of ${total}`}
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {locale === 'mr' ? 'मागील' : 'Previous'}
              </button>

              <span className="font-mono font-bold px-2 text-slate-700 dark:text-slate-300">
                {page} / {Math.ceil(total / pageSize)}
              </span>

              <button
                disabled={page >= Math.ceil(total / pageSize)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {locale === 'mr' ? 'पुढील' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
