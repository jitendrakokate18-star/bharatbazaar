'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Line,
} from 'recharts';
import { OHLCPoint, Exchange } from '@/types';
import { useI18n } from '@/lib/i18n';
import { formatINR, formatPercent } from '@/lib/currency';
import { calculateCAGR, calculateAbsoluteReturn } from '@/lib/historyUtils';
import { Layers, Database } from 'lucide-react';

interface PerformanceChartProps {
  isin: string;
}

export function PerformanceChart({ isin }: PerformanceChartProps) {
  const { t, locale, useDevanagariDigits } = useI18n();
  const [range, setRange] = useState<string>('5Y');
  const [exchange, setExchange] = useState<Exchange>('NSE');
  const [data, setData] = useState<OHLCPoint[]>([]);
  const [niftyHistory, setNiftyHistory] = useState<{ date: string; adjClose: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNiftyOverlay, setShowNiftyOverlay] = useState(false);
  const [provenance, setProvenance] = useState<{ asOf: string; source: string }>({ asOf: '', source: '' });

  // 1. Fetch stock price history from database
  useEffect(() => {
    let active = true;
    setLoading(true);

    fetch(`/api/companies/${isin}/history?range=${range}&exchange=${exchange}`)
      .then((r) => r.json())
      .then((res) => {
        if (active) {
          setData(res.history || []);
          if (res.asOf) {
            setProvenance({ asOf: res.asOf, source: res.source || 'Exchange Bhavcopy / Real Feeds' });
          }
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
  }, [isin, range, exchange]);

  // 2. Fetch real Nifty 50 history when benchmark overlay is active
  useEffect(() => {
    if (!showNiftyOverlay) return;

    let active = true;
    fetch(`/api/indices?symbol=^NSEI&range=${range}`)
      .then((r) => r.json())
      .then((res) => {
        if (active && res.history) {
          setNiftyHistory(res.history);
        }
      })
      .catch((e) => console.error('Failed to load benchmark index history', e));

    return () => {
      active = false;
    };
  }, [showNiftyOverlay, range]);

  // Compute returns and CAGR from real adjusted closes only
  const startPt = data[0];
  const endPt = data[data.length - 1];

  let years = 5;
  if (range === '1M') years = 1 / 12;
  else if (range === '6M') years = 0.5;
  else if (range === '1Y') years = 1;
  else if (range === '3Y') years = 3;
  else if (range === '5Y' || range === 'MAX') years = 5;

  const absReturn = startPt && endPt ? calculateAbsoluteReturn(startPt.adjClose, endPt.adjClose) : 0;
  const cagr = startPt && endPt ? calculateCAGR(startPt.adjClose, endPt.adjClose, years) : 0;
  const isPositive = absReturn >= 0;

  // Build index history lookup map
  const niftyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of niftyHistory) {
      map.set(item.date, item.adjClose);
    }
    return map;
  }, [niftyHistory]);

  const niftyBase = niftyHistory[0]?.adjClose || 1;
  const stockBase = startPt?.adjClose || 1;

  // Prepare chart series: rebase to 100 if comparing vs benchmark, else plot rupee price
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    let lastKnownNifty = niftyBase;

    return data.map((pt) => {
      if (niftyMap.has(pt.date)) {
        lastKnownNifty = niftyMap.get(pt.date)!;
      }

      const stockRebased = Number(((pt.adjClose / stockBase) * 100).toFixed(2));
      const niftyRebased = Number(((lastKnownNifty / niftyBase) * 100).toFixed(2));

      return {
        date: pt.date,
        close: showNiftyOverlay ? stockRebased : pt.adjClose,
        rawClose: pt.close,
        volume: pt.volume,
        nifty: showNiftyOverlay ? niftyRebased : undefined,
      };
    });
  }, [data, showNiftyOverlay, stockBase, niftyBase, niftyMap]);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-sm">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>{t('company.fiveYearPerformance')}</span>
            {showNiftyOverlay && (
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-normal">
                {locale === 'mr' ? 'मूळ १०० वर पुनर्मापन (Rebased to 100)' : 'Rebased to 100 at start'}
              </span>
            )}
          </h3>

          {/* Return & CAGR badges */}
          <div className="flex items-center space-x-3 mt-1.5 flex-wrap">
            <div
              className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                isPositive
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50'
                  : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50'
              }`}
            >
              <span>{t('charts.absoluteReturn')}: </span>
              <span>{formatPercent(absReturn, 2, useDevanagariDigits)}</span>
            </div>

            {years >= 1 && (
              <div className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                <span>{t('charts.cagr')}: </span>
                <span>{formatPercent(cagr, 2, useDevanagariDigits)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Range Selector & Exchange Filter */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-between sm:justify-start">
          {/* Time Ranges Pill Bar */}
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-700/60 p-1 text-xs font-semibold overflow-x-auto no-scrollbar shrink-0">
            {['1M', '6M', '1Y', '3Y', '5Y', 'MAX'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-2 rounded-lg transition-all min-h-[40px] flex items-center justify-center ${
                  range === r
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t(`charts.range${r}`)}
              </button>
            ))}
          </div>

          {/* Benchmark Compare Toggle */}
          <button
            type="button"
            onClick={() => setShowNiftyOverlay(!showNiftyOverlay)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center space-x-1.5 min-h-[44px] shrink-0 ${
              showNiftyOverlay
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('company.compareWithIndex')}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart with pan-y touch action */}
      <div className="h-64 sm:h-80 md:h-96 w-full" style={{ touchAction: 'pan-y' }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            {t('common.loading')}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400">
            {locale === 'mr' ? 'डेटा उपलब्ध नाही' : 'Data unavailable'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val ? val.substring(2, 7) : '')}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                domain={['auto', 'auto']}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (showNiftyOverlay ? `${Math.round(val)}` : `₹${Math.round(val)}`)}
                orientation="right"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const priceVal = payload[0].value as number;
                    const niftyVal = payload[1]?.value as number | undefined;

                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-mono border border-slate-700">
                        <p className="text-slate-400 mb-1">{label}</p>
                        <p className="text-sm font-bold text-emerald-400">
                          {showNiftyOverlay ? 'Stock (Rebased)' : t('charts.price')}: {showNiftyOverlay ? priceVal.toFixed(2) : formatINR(priceVal, 2, useDevanagariDigits)}
                        </p>
                        {showNiftyOverlay && niftyVal !== undefined && (
                          <p className="text-indigo-300 mt-1">
                            Nifty 50 (Rebased): {niftyVal.toFixed(2)}
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10b981' : '#f43f5e'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorClose)"
              />
              {showNiftyOverlay && (
                <Line
                  type="monotone"
                  dataKey="nifty"
                  stroke="#6366f1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Volume Sub-Chart */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold uppercase tracking-wider">{t('charts.volume')}</span>
          {provenance.asOf && (
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>
                {locale === 'mr' ? 'डेटा तारीख: ' : 'Data as of '}
                <strong>{provenance.asOf}</strong> · {locale === 'mr' ? 'स्रोत: ' : 'Source: '}
                <strong>{provenance.source}</strong>
              </span>
            </span>
          )}
        </div>
        <div className="h-16 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <YAxis hide domain={['auto', 'auto']} />
              <Bar dataKey="volume" fill="#cbd5e1" opacity={0.6} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
