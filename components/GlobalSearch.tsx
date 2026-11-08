'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  Tag,
  Layers,
  ArrowRight,
  ArrowLeft,
  Loader2,
  X,
  History,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { SearchResult } from '@/lib/providers/dataProvider';

export interface GlobalSearchProps {
  isMobileOverlay?: boolean;
  onCloseOverlay?: () => void;
}

const POPULAR_SECTORS = [
  { slug: 'banking-financial', nameEn: 'Banking & Financials', nameMr: 'बँकिंग आणि वित्त', symbol: 'HDFCBANK' },
  { slug: 'information-technology', nameEn: 'Information Tech', nameMr: 'माहिती तंत्रज्ञान', symbol: 'TCS' },
  { slug: 'automobile', nameEn: 'Automobile', nameMr: 'वाहन उद्योग', symbol: 'TATAMOTORS' },
  { slug: 'consumer-goods-fmcg', nameEn: 'Consumer Goods (FMCG)', nameMr: 'ग्राहक वस्तू (FMCG)', symbol: 'HINDUNILVR' },
  { slug: 'pharmaceuticals-healthcare', nameEn: 'Pharma & Health', nameMr: 'औषध निर्माण', symbol: 'SUNPHARMA' },
  { slug: 'energy-power', nameEn: 'Energy & Power', nameMr: 'ऊर्जा आणि शक्ती', symbol: 'RELIANCE' },
];

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim() || !text) return text;
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + q.length);
  const after = text.slice(idx + q.length);

  return (
    <>
      {before}
      <mark className="bg-amber-200 dark:bg-amber-900/70 text-amber-950 dark:text-amber-100 rounded px-0.5 font-bold">
        {match}
      </mark>
      {highlightText(after, query)}
    </>
  );
}

export function GlobalSearch({ isMobileOverlay = false, onCloseOverlay }: GlobalSearchProps) {
  const router = useRouter();
  const { t, locale, useDevanagariDigits } = useI18n();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bb_recent_searches');
      if (raw) {
        setRecentSearches(JSON.parse(raw).slice(0, 8));
      }
    } catch (e) {}
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter((s) => s.toLowerCase() !== term.trim().toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem('bb_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setRecentSearches([]);
      localStorage.removeItem('bb_recent_searches');
    } catch (e) {}
  };

  // Lock body scroll on mobile overlay
  useEffect(() => {
    if (isMobileOverlay) {
      document.body.style.overflow = 'hidden';
      // autofocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobileOverlay]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&lang=${locale}`);
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(-1);
        if (!isMobileOverlay) {
          setIsOpen(true);
        }
      } catch (e) {
        console.error('Search query error:', e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, locale, isMobileOverlay]);

  // Click outside to close desktop dropdown
  useEffect(() => {
    if (isMobileOverlay) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOverlay]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveRecentSearch(result.name);
      setIsOpen(false);
      setQuery('');
      if (onCloseOverlay) onCloseOverlay();
      router.push(result.url);
    },
    [router, onCloseOverlay, recentSearches]
  );

  const handleSelectSector = (slug: string, name: string) => {
    saveRecentSearch(name);
    setIsOpen(false);
    setQuery('');
    if (onCloseOverlay) onCloseOverlay();
    router.push(`/sectors/${slug}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      if (onCloseOverlay) onCloseOverlay();
      return;
    }

    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-search-item]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Content for search results list
  const renderResultsList = () => {
    if (loading) {
      return (
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse p-2 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-2/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Empty query state: Recent searches & popular sector pills
    if (!query.trim()) {
      return (
        <div className="p-4 sm:p-5 space-y-6">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className="flex items-center space-x-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>{t('search.recentSearches')}</span>
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-blue-600 dark:text-blue-400 hover:underline capitalize font-semibold min-h-[44px] min-w-[44px] flex items-center justify-end"
                >
                  {t('search.clearHistory')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors min-h-[44px]"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center space-x-1.5 mb-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>{t('search.popularSectors')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_SECTORS.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => handleSelectSector(s.slug, locale === 'mr' ? s.nameMr : s.nameEn)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-all text-left group min-h-[48px]"
                >
                  <div className="min-w-0 pr-1">
                    <span className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {locale === 'mr' ? s.nameMr : s.nameEn}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{s.symbol}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Zero results state
    if (results.length === 0) {
      return (
        <div className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {t('search.noResultsFound')} &ldquo;{query}&rdquo;
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {t('search.noResultsSub')}
            </p>
          </div>

          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              {t('search.popularSectors')}
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SECTORS.slice(0, 4).map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => handleSelectSector(s.slug, locale === 'mr' ? s.nameMr : s.nameEn)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors min-h-[44px]"
                >
                  {locale === 'mr' ? s.nameMr : s.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Results List
    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-800" ref={listRef}>
        <div className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 uppercase tracking-wider flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
          <span>{locale === 'mr' ? 'शोध निकाल' : 'Search Results'}</span>
          <span className="font-mono text-[11px] font-normal lowercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
            {results.length} {locale === 'mr' ? 'सापडले' : 'found'}
          </span>
        </div>

        {results.map((res, index) => {
          const isSelected = index === selectedIndex;
          const isSector = res.type === 'SECTOR';
          const isBrand = res.type === 'BRAND';

          return (
            <div
              key={`${res.type}-${res.id}`}
              data-search-item
              onClick={() => handleSelect(res)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3.5 sm:py-3 cursor-pointer flex items-center justify-between transition-colors min-h-[56px] ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-l-4 border-blue-600 dark:border-blue-400'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0 pr-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSector
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : isBrand
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                  }`}
                >
                  {isSector ? (
                    <Layers className="w-5 h-5" />
                  ) : isBrand ? (
                    <Tag className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {highlightText(res.name, query)}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isSector
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : isBrand
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      {res.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-2 flex-wrap">
                    {(locale === 'mr' ? res.subtitleMr : res.subtitleEn) && (
                      <span>{highlightText(locale === 'mr' ? res.subtitleMr : res.subtitleEn, query)}</span>
                    )}
                    {res.badge && (
                      <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
                        • {res.badge}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <ArrowRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected
                      ? 'text-blue-600 dark:text-blue-400 translate-x-1'
                      : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // 1. MOBILE FULL-SCREEN OVERLAY MODE
  if (isMobileOverlay) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col h-[100dvh] safe-top safe-bottom">
        {/* Top input bar */}
        <div className="flex items-center space-x-2 p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20">
          <button
            type="button"
            onClick={onCloseOverlay}
            title={t('search.close')}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1 flex items-center min-w-0">
            <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className="w-full pl-11 pr-10 py-3 bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onCloseOverlay}
            className="px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 min-h-[44px] flex items-center justify-center shrink-0"
          >
            {t('search.cancel')}
          </button>
        </div>

        {/* Scrollable results */}
        <div className="flex-1 overflow-y-auto">{renderResultsList()}</div>
      </div>
    );
  }

  // 2. DESKTOP & TABLET INLINE DROPDOWN MODE
  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
          {loading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-500" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('search.placeholder')}
          className="w-full pl-10 sm:pl-11 pr-10 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm sm:text-base min-h-[44px]"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 sm:left-auto sm:right-0 lg:left-0 lg:right-auto sm:w-[420px] md:w-[460px] lg:w-[540px] xl:w-[600px] max-w-[calc(100vw-2rem)] top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[30rem] overflow-y-auto">
          {renderResultsList()}
        </div>
      )}
    </div>
  );
}
