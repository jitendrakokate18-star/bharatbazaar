'use client';

import React from 'react';
import { ShareholdingQuarter } from '@/types';
import { useI18n } from '@/lib/i18n';
import { formatPercent } from '@/lib/currency';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ShareholdingChartProps {
  data: ShareholdingQuarter[];
}

export function ShareholdingChart({ data }: ShareholdingChartProps) {
  const { t, locale, useDevanagariDigits } = useI18n();

  if (!data || data.length === 0) {
    return null;
  }

  const latest = data[data.length - 1];

  const pieData = [
    { name: locale === 'mr' ? 'प्रवर्तक (Promoter)' : 'Promoter', value: latest.promoter, color: '#2563eb' },
    { name: locale === 'mr' ? 'परदेशी संस्था (FII)' : 'FII', value: latest.fii, color: '#059669' },
    { name: locale === 'mr' ? 'देशांतर्गत संस्था (DII)' : 'DII', value: latest.dii, color: '#d97706' },
    { name: locale === 'mr' ? 'सर्वसामान्य जनता (Public)' : 'Public', value: latest.public, color: '#64748b' },
  ].filter((item) => item.value > 0);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('company.shareholding')}
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {locale === 'mr' ? `शेवटचे तिमाही: ${latest.quarter}` : `Latest Quarter: ${latest.quarter}`}
          </span>
        </div>

        {latest.pledgePct > 0 && (
          <div className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 rounded-lg">
            {locale === 'mr' ? 'गहाण ठेवलेले शेअर्स (Pledge): ' : 'Promoter Pledge: '}
            <span className="font-mono">{formatPercent(latest.pledgePct, 2, useDevanagariDigits)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Pie Chart */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [
                  formatPercent(val as number, 2, useDevanagariDigits),
                  locale === 'mr' ? 'वाटा' : 'Holding',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Breakdown List */}
        <div className="space-y-3">
          {pieData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40">
              <div className="flex items-center space-x-2.5">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  {item.name}
                </span>
              </div>
              <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                {formatPercent(item.value, 2, useDevanagariDigits)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
