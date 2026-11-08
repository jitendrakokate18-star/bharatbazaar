'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { formatMarketCap } from '@/lib/currency';
import {
  Layers,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

interface SectorSummary {
  slug: string;
  nameEn: string;
  nameMr: string;
  descriptionEn: string;
  descriptionMr: string;
  companyCount: number;
  totalMarketCapCr: number;
}

export default function SectorsPage() {
  const { t, locale, useDevanagariDigits } = useI18n();
  const [sectors, setSectors] = useState<SectorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sectors')
      .then((r) => r.json())
      .then((d) => {
        if (d.sectors) setSectors(d.sectors);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-white via-slate-50/80 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
            <Layers className="w-3.5 h-3.5 mr-1" />
            <span>{locale === 'mr' ? 'वर्गीकरण निर्देशांक' : 'Sector Taxonomy Index'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('sectors.title')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('sectors.subtitle')}
          </p>

          <div className="pt-2 flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>
              {locale === 'mr'
                ? '१००% सूचिबद्ध कंपन्यांचे प्रमाणीकृत वर्गीकरण'
                : '100% of listed universe classified into standardized sectors'}
            </span>
          </div>
        </div>
      </div>

      {/* Sectors Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
          <p className="text-slate-500 text-sm font-medium">{t('common.loading')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((s) => (
            <Link
              key={s.slug}
              href={`/sectors/${s.slug}`}
              className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 hover:shadow-xl hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {s.companyCount} {locale === 'mr' ? 'कंपन्या' : 'stocks'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {locale === 'mr' ? s.nameMr : s.nameEn}
                  </h3>
                  {locale === 'mr' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {s.nameEn}
                    </p>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {locale === 'mr' ? s.descriptionMr : s.descriptionEn}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500 block">
                    {locale === 'mr' ? 'बाजार भांडवल' : 'Market Cap'}
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                    {s.totalMarketCapCr > 0
                      ? formatMarketCap(s.totalMarketCapCr, locale, useDevanagariDigits)
                      : '—'}
                  </span>
                </div>

                <span className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  <span>{t('sectors.exploreSector')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
