'use client';

import React, { useState } from 'react';
import { FiveYearFinancial } from '@/types';
import { useI18n } from '@/lib/i18n';
import { formatIndianNumber, formatPercent } from '@/lib/currency';

interface FinancialsTableProps {
  financials: FiveYearFinancial[];
}

export function FinancialsTable({ financials }: FinancialsTableProps) {
  const { t, locale, useDevanagariDigits } = useI18n();
  const [activeTab, setActiveTab] = useState<'income' | 'ratios'>('income');

  if (!financials || financials.length === 0) {
    return <div className="text-slate-400 text-sm p-4">{t('common.noData')}</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('company.financials')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === 'mr' ? 'सर्व आकडे कोटी रुपयांमध्ये (₹ Cr)' : 'All figures in ₹ Crore unless specified'}
          </p>
        </div>

        {/* Tab switch between Income Statement and Financial Ratios */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex rounded-xl bg-slate-100 dark:bg-slate-700/60 p-1 text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`px-2.5 sm:px-3 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center text-center ${
              activeTab === 'income'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {locale === 'mr' ? 'ताळेबंद व नफा' : 'Financial Statement'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ratios')}
            className={`px-2.5 sm:px-3 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center text-center ${
              activeTab === 'ratios'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {locale === 'mr' ? 'आर्थिक प्रमाणे' : 'Key Ratios'}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar relative rounded-xl border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px] bg-slate-50 dark:bg-slate-900/60">
              <th className="py-3 px-3 min-w-[160px] sticky left-0 bg-slate-50 dark:bg-slate-900 z-10 shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(51,65,85,1)]">
                {locale === 'mr' ? 'तपशील' : 'Particulars'}
              </th>
              {financials.map((f) => (
                <th key={f.period} className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200 min-w-[90px]">
                  {f.period}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
            {activeTab === 'income' ? (
              <>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 font-sans sticky left-0 bg-white dark:bg-slate-800 z-10 shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(51,65,85,1)]">
                    {locale === 'mr' ? 'एकूण महसूल (Revenue)' : 'Total Revenue (₹ Cr)'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹{formatIndianNumber(f.revenueCr, 0, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans sticky left-0 bg-white dark:bg-slate-800 z-10 shadow-[1px_0_0_0_rgba(226,232,240,1)] dark:shadow-[1px_0_0_0_rgba(51,65,85,1)]">
                    {locale === 'mr' ? 'कार्यचालन नफा (Operating Profit)' : 'Operating Profit (₹ Cr)'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      ₹{formatIndianNumber(f.operatingProfitCr, 0, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'कार्यचालन नफा % (OPM %)' : 'Operating Margin (OPM %)'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatPercent(f.operatingMarginPct, 2, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-blue-50/20 dark:bg-blue-950/20">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white font-sans">
                    {locale === 'mr' ? 'निव्वळ नफा (Net Profit / PAT)' : 'Net Profit / PAT (₹ Cr)'}
                  </td>
                  {financials.map((f) => {
                    const isPos = f.netProfitCr >= 0;
                    return (
                      <td
                        key={f.period}
                        className={`py-2.5 px-3 text-right font-bold ${
                          isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        ₹{formatIndianNumber(f.netProfitCr, 0, useDevanagariDigits)}
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'प्रति समभाग नफा (EPS)' : 'EPS (₹)'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      ₹{formatIndianNumber(f.eps, 2, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'एकूण कर्ज (Total Debt)' : 'Total Debt (₹ Cr)'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      ₹{formatIndianNumber(f.totalDebtCr, 0, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'निव्वळ मालमत्ता (Net Worth)' : 'Net Worth (₹ Cr)'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                      ₹{formatIndianNumber(f.netWorthCr, 0, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>
              </>
            ) : (
              <>
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100 font-sans">
                    {locale === 'mr' ? 'पी/ई प्रमाण (P/E Ratio)' : 'P/E Ratio'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-800 dark:text-slate-200">
                      {formatIndianNumber(f.ratios.pe, 1, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'पी/बी प्रमाण (P/B Ratio)' : 'P/B Ratio'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatIndianNumber(f.ratios.pb, 1, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'भांडवलावरील परतावा (ROE %)' : 'Return on Equity (ROE %)'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatPercent(f.ratios.roe, 1, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'वापरलेल्या भांडवलावरील परतावा (ROCE %)' : 'ROCE %'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatPercent(f.ratios.roce, 1, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'कर्ज/भागभांडवल (Debt to Equity)' : 'Debt to Equity'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatIndianNumber(f.ratios.debtToEquity, 2, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>

                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 font-sans">
                    {locale === 'mr' ? 'लाभांश वाटप दर (Dividend Payout %)' : 'Dividend Payout %'}
                  </td>
                  {financials.map((f) => (
                    <td key={f.period} className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300">
                      {formatPercent(f.ratios.dividendPayoutPct, 1, useDevanagariDigits)}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
