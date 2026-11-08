'use client';

import React from 'react';
import { Brand } from '@/types';
import { useI18n } from '@/lib/i18n';
import { Tag, ArrowUpRight, Award, Sparkles } from 'lucide-react';

interface BrandsGridProps {
  brands: Brand[];
}

export function BrandsGrid({ brands }: BrandsGridProps) {
  const { t, locale, useDevanagariDigits } = useI18n();

  if (!brands || brands.length === 0) {
    return null; // Standalone companies hide this entirely as required by PRD!
  }

  return (
    <div className="my-8 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-3xl p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>{locale === 'mr' ? 'ग्राहक ब्रँड पोर्टफोलिओ' : 'Consumer Brand Portfolio'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('company.brands')}
          </h3>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-full w-fit">
          {brands.length} {t('directory.brandsCount')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={`/brand/${brand.id}`}
            className="group bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-amber-100 dark:border-slate-700/80 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between min-h-[44px]"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                    {brand.name.substring(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {locale === 'mr' ? brand.nameMr : brand.name}
                    </h4>
                    {locale === 'mr' && (
                      <span className="text-xs text-slate-400 block font-normal">
                        ({brand.name})
                      </span>
                    )}
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>

              <span className="inline-block text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md mb-2">
                {locale === 'mr' ? brand.categoryMr : brand.category}
              </span>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {locale === 'mr' ? brand.descriptionMr : brand.descriptionEn}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {locale === 'mr' ? 'सुरू वर्ष: ' : 'Launched: '}
                <strong className="font-mono text-slate-700 dark:text-slate-200">
                  {brand.launchYear}
                </strong>
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                {t('common.viewProfile')} →
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
