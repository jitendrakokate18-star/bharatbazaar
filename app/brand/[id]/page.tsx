'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Brand, Company, DualExchangePrice } from '@/types';
import { LivePriceCard } from '@/components/LivePriceCard';
import { formatMarketCap, formatIndianNumber } from '@/lib/currency';
import {
  Tag,
  Building2,
  Calendar,
  Sparkles,
  Award,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function BrandProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { t, locale, useDevanagariDigits } = useI18n();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [parentCompany, setParentCompany] = useState<Company | null>(null);
  const [livePrice, setLivePrice] = useState<DualExchangePrice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);

    fetch(`/api/brands/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (active) {
          setBrand(data.brand || null);
          setParentCompany(data.parentCompany || null);
          setLivePrice(data.livePrice || null);
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
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-500 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {locale === 'mr' ? 'ब्रँड आढळला नाही' : 'Brand not found'}
        </h2>
        <a
          href="/"
          className="inline-flex items-center space-x-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.back')}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <a
          href={parentCompany ? `/company/${parentCompany.isin}` : '/directory'}
          className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors min-h-[44px] py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {locale === 'mr'
              ? `मूळ कंपनीकडे परत जा (${brand.parentCompanyNameMr})`
              : `Back to ${brand.parentCompanyName}`}
          </span>
        </a>
      </div>

      {/* Brand Header Banner */}
      <div className="bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent rounded-3xl border border-amber-200/80 dark:border-amber-800/40 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-amber-500/30">
              {brand.name.substring(0, 1)}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  {locale === 'mr' ? brand.categoryMr : brand.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {t('brand.launchYear')} {brand.launchYear}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1">
                {locale === 'mr' ? brand.nameMr : brand.name}
              </h1>
              {locale === 'mr' && (
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {brand.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed max-w-3xl">
          {locale === 'mr' ? brand.descriptionMr : brand.descriptionEn}
        </p>

        {/* Brand Positioning */}
        <div className="mt-4 p-4 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-amber-200/60 dark:border-slate-700">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
            {t('brand.positioning')}
          </span>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            "{locale === 'mr' ? brand.positioningMr : brand.positioningEn}"
          </p>
        </div>
      </div>

      {/* Parent Company Card with Live Price (Clearly labelled as required by PRD) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-blue-200 dark:border-blue-900/60 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>{t('brand.parentCompany')}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {locale === 'mr' ? brand.parentCompanyNameMr : brand.parentCompanyName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('brand.parentCompanyNotice')}
            </p>
          </div>

          {parentCompany && (
            <a
              href={`/company/${parentCompany.isin}`}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center space-x-1.5 shrink-0 shadow-sm transition-all min-h-[44px]"
            >
              <span>{t('brand.viewParentCompany')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Parent Company Live Quotes on BSE & NSE */}
        {livePrice && parentCompany && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              {t('brand.parentPriceTitle')}
            </h4>
            <LivePriceCard initialPrice={livePrice} isin={parentCompany.isin} />
          </div>
        )}
      </div>

      {/* Key Products & Notable Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Products */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('brand.keyProducts')}</span>
          </h3>

          <ul className="space-y-2.5">
            {(locale === 'mr' ? brand.keyProductsMr : brand.keyProductsEn).map((prod) => (
              <li
                key={prod}
                className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{prod}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notable Facts */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 text-blue-500" />
            <span>{t('brand.notableFacts')}</span>
          </h3>

          <ul className="space-y-3">
            {(locale === 'mr' ? brand.notableFactsMr : brand.notableFactsEn).map((fact, idx) => (
              <li
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
