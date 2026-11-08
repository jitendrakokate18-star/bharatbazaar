'use client';

import React from 'react';
import { CorporateAction } from '@/types';
import { useI18n } from '@/lib/i18n';
import { formatDate } from '@/lib/dates';
import { Calendar, Gift, Split, Award } from 'lucide-react';

interface CorporateActionsListProps {
  actions: CorporateAction[];
}

export function CorporateActionsList({ actions }: CorporateActionsListProps) {
  const { t, locale, useDevanagariDigits } = useI18n();

  if (!actions || actions.length === 0) {
    return null;
  }

  const getTypeBadge = (type: CorporateAction['type']) => {
    switch (type) {
      case 'DIVIDEND':
        return {
          icon: <Gift className="w-3.5 h-3.5 mr-1" />,
          label: locale === 'mr' ? 'लाभांश (Dividend)' : 'Dividend',
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        };
      case 'SPLIT':
        return {
          icon: <Split className="w-3.5 h-3.5 mr-1" />,
          label: locale === 'mr' ? 'स्टॉक स्प्लिट' : 'Stock Split',
          color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        };
      case 'BONUS':
        return {
          icon: <Award className="w-3.5 h-3.5 mr-1" />,
          label: locale === 'mr' ? 'बोनस शेअर्स' : 'Bonus Issue',
          color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        };
      default:
        return {
          icon: <Calendar className="w-3.5 h-3.5 mr-1" />,
          label: type,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm my-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        {t('company.corporateActions')}
      </h3>

      <div className="space-y-3">
        {actions.map((act) => {
          const badge = getTypeBadge(act.type);
          return (
            <div
              key={act.id}
              className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-start space-x-3">
                <span
                  className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-lg border ${badge.color} shrink-0 mt-0.5`}
                >
                  {badge.icon}
                  {badge.label}
                </span>

                <div>
                  <h5 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {locale === 'mr' ? act.descriptionMr : act.descriptionEn}
                  </h5>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    {locale === 'mr' ? 'नोंदणी / एक्स-डेट: ' : 'Ex-Date: '}
                    <strong className="font-mono text-slate-700 dark:text-slate-300">
                      {formatDate(act.exDate, locale, useDevanagariDigits)}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                  {act.ratioOrAmount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
