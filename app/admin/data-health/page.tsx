'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Database,
  Building2,
  TrendingUp,
  FileText,
  Clock,
  RefreshCw,
  PieChart,
  Calendar,
  Layers,
} from 'lucide-react';

export default function DataHealthDashboardPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    fetch('/api/admin/data-health')
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3" />
        <p className="text-slate-500 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center text-rose-500">
        Failed to load data health metrics.
      </div>
    );
  }

  const isMock = data.dataProviderMode.includes('MOCK');

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Data Health & Ingestion Observability
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time status of all 15 SQLite database tables, ingestion freshness, and provider operational mode.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Provider Mode Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
          isMock
            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
            : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isMock ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <div>
            <span className="text-xs uppercase tracking-wider font-bold block">
              Active Data Provider Engine
            </span>
            <strong className="text-base font-extrabold font-mono">
              {data.dataProviderMode}
            </strong>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">SYSTEM DATE</span>
            <strong className="text-slate-800 dark:text-slate-200">{data.systemDate}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">MARKET STATUS</span>
            <strong className="text-slate-800 dark:text-slate-200">{data.marketStatus?.messageEn}</strong>
          </div>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Company Master */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Master</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {data.companyMaster.total.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Listed Companies Ingested</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Dual Listed (NSE+BSE):</span>
              <strong>{data.companyMaster.dualListed.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>NSE Only:</span>
              <strong>{data.companyMaster.nseOnly.toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span>BSE Only:</span>
              <strong>{data.companyMaster.bseOnly.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* Bhavcopy & History */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Price History</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {data.priceHistory.totalRows.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">5-Year Daily OHLCV Records</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Latest Close Date:</span>
              <strong>{data.priceHistory.latestCloseDate || '-'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Live Price Ticks:</span>
              <strong>{data.livePrices.count}</strong>
            </div>
            <div className="flex justify-between">
              <span>Latest Quote:</span>
              <strong>{data.livePrices.latestQuoteTime ? data.livePrices.latestQuoteTime.substring(11, 19) + ' IST' : '-'}</strong>
            </div>
          </div>
        </div>

        {/* Financials & Fundamentals */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fundamentals</span>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {data.financials.annualCount}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Annual Filings (FY22 - FY26)</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Quarterly Statements:</span>
              <strong>{data.financials.quarterlyCount}</strong>
            </div>
            <div className="flex justify-between">
              <span>Latest Quarter Ingested:</span>
              <strong>{data.financials.byQuarter?.[0]?.quarter_label || '-'}</strong>
            </div>
            <div className="flex justify-between">
              <span>Shareholding Quarters:</span>
              <strong>{data.shareholding.count}</strong>
            </div>
          </div>
        </div>

        {/* Corporate Actions & Benchmark Indices */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Actions</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {data.corporateActions.total}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Dividends, Splits & Bonuses</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-mono pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Dividends:</span>
              <strong>{data.corporateActions.dividends}</strong>
            </div>
            <div className="flex justify-between">
              <span>Splits / Bonus Issues:</span>
              <strong>{data.corporateActions.splitsAndBonus}</strong>
            </div>
            <div className="flex justify-between">
              <span>Exchange Holidays:</span>
              <strong>{data.holidaysCount}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Data Freshness Table */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-500" />
          <span>Ingestion Freshness Registry (`data_freshness` Table)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Record Count</th>
                <th className="py-2.5 px-3">Latest As Of</th>
                <th className="py-2.5 px-3">Last Successful Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {data.freshness.map((row: any) => (
                <tr key={row.dataset} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/40">
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white capitalize">
                    {row.dataset.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                    {row.record_count.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                    {row.latest_as_of || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {row.last_successful_run ? row.last_successful_run.substring(0, 19).replace('T', ' ') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
