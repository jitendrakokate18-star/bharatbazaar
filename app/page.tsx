'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { BRANDS } from '@/data/brands';
import { formatMarketCap, formatPercent, formatIndianNumber } from '@/lib/currency';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';

export default function HomePage() {
  const { t, locale, useDevanagariDigits } = useI18n();
  const [topCompanies, setTopCompanies] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  useEffect(() => {
    fetch('/api/companies?pageSize=8&sortBy=marketCapDesc')
      .then((r) => r.json())
      .then((data) => {
        setTopCompanies(data.companies || []);
        setLoadingCompanies(false);
      })
      .catch((e) => {
        console.error('Failed to load top companies', e);
        setLoadingCompanies(false);
      });
  }, []);

  const featuredBrands = BRANDS.slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto pt-6 pb-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-4">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t('common.madeForDad')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {t('common.appName')}:{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600">
            {t('common.appTagline')}
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {locale === 'mr'
            ? 'सर्व भारतीय कंपन्या, त्यांचे लोकप्रिय ब्रँड्स, थेट शेअर भाव आणि ५ वर्षांचा कामगिरी आलेख — एकाच ठिकाणी, मराठी आणि इंग्रजीत.'
            : 'Track every company listed on BSE & NSE, explore consumer brand hierarchies, and review 5-year financials in English and Marathi.'}
        </p>

        {/* Quick Action Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <a
            href="/directory"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center space-x-2 transition-all"
          >
            <Building2 className="w-4 h-4" />
            <span>{t('nav.directory')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <a
            href="/glossary"
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 transition-all flex items-center space-x-2"
          >
            <span>{t('nav.glossary')}</span>
          </a>
        </div>
      </section>

      {/* Featured Companies by Market Cap */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {locale === 'mr' ? 'भारतातील अग्रगण्य महाकाय कंपन्या' : 'Market Leaders by Market Capitalization'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {locale === 'mr' ? 'बीएसई व एनएसईवरील सर्वोच्च बाजार भांडवल असणाऱ्या कंपन्या' : 'Top companies actively traded on BSE & NSE with dual listings'}
            </p>
          </div>

          <a
            href="/directory"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>{t('common.all')}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {loadingCompanies ? (
          <div className="py-12 text-center text-sm text-slate-400">
            {t('common.loading')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topCompanies.map((comp) => {
              const ltp = comp.livePriceNse || comp.livePriceBse || 0;
              const chgPct = comp.dayChangePct || 0;
              const isPos = chgPct >= 0;

              return (
                <a
                  key={comp.isin}
                  href={`/company/${comp.isin}`}
                  className="group bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-base text-blue-600 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 transition-colors">
                        {comp.name.substring(0, 2)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {comp.nseSymbol && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono">
                            NSE
                          </span>
                        )}
                        {comp.bseCode && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
                            BSE
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {locale === 'mr' ? comp.nameMr : comp.name}
                    </h3>

                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {locale === 'mr' ? comp.sectorMr : comp.sector}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">
                        {t('stats.marketCap')}
                      </span>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {comp.marketCapCr > 0 ? formatMarketCap(comp.marketCapCr, locale, useDevanagariDigits) : t('common.dataUnavailable')}
                      </span>
                    </div>

                    {ltp > 0 && (
                      <div className="flex items-baseline justify-between mt-1 text-xs">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          ₹{formatIndianNumber(ltp, 2, useDevanagariDigits)}
                        </span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {formatPercent(chgPct, 2, useDevanagariDigits)}
                        </span>
                      </div>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Brand to Listed Company Intelligence */}
      <section className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-950/20 p-6 sm:p-8 rounded-3xl border border-amber-200/50 dark:border-amber-900/30 space-y-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>{locale === 'mr' ? 'ब्रँड आणि मूळ कंपनी संबंध' : 'Brand-to-Company Intelligence'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {locale === 'mr'
              ? 'आपण रोज वापरत असलेले ब्रँड्स कोणाच्या मालकीचे आहेत?'
              : 'Which Listed Parent Company Owns Your Everyday Brands?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            {locale === 'mr'
              ? 'मॅगी, तनिष्क, सर्फ एक्सेल, फेविकॉल, व्हिक्स, जिओ, बुलेट — या लोकप्रिय ब्रँड्समागे कोणती सूचिबद्ध कंपनी आहे ते पहा.'
              : 'Discover how beloved household names map directly to listed entities traded on BSE and NSE.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredBrands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {locale === 'mr' ? brand.categoryMr : brand.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Est. {brand.launchYear}
                  </span>
                </div>

                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  {locale === 'mr' ? brand.nameMr : brand.name}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                  {locale === 'mr' ? brand.positioningMr : brand.positioningEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 block">
                  {locale === 'mr' ? 'मूळ सूचिबद्ध मालक कंपनी:' : 'Parent Listed Entity:'}
                </span>
                <a
                  href={`/company/${brand.parentIsin}`}
                  className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between group mt-0.5"
                >
                  <span className="truncate">
                    {locale === 'mr' ? brand.parentCompanyNameMr : brand.parentCompanyName}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0 ml-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sector Overview Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {locale === 'mr' ? 'प्रमुख उद्योग क्षेत्रे (Sectors)' : 'Explore by Industry Sectors'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {locale === 'mr' ? 'उद्योग क्षेत्रानुसार कंपन्यांची पाहणी करा' : 'Browse companies categorised by key industrial domains'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { en: 'FMCG', mr: 'दैनिक वस्तू (FMCG)' },
            { en: 'Automobile', mr: 'ऑटोमोबाईल' },
            { en: 'Information Technology', mr: 'आयटी तंत्रज्ञान' },
            { en: 'Financial Services', mr: 'वित्तीय व बँकिंग' },
            { en: 'Consumer Goods', mr: 'ग्राहक उपयोगी वस्तू' },
            { en: 'Energy & Conglomerate', mr: 'ऊर्जा व महामंडळ' },
          ].map((sec) => (
            <a
              key={sec.en}
              href={`/directory?sector=${encodeURIComponent(sec.en)}`}
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 text-center transition-all group shadow-sm"
            >
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {locale === 'mr' ? sec.mr : sec.en}
              </h4>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
