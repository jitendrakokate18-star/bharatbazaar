'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, ArrowUpRight, ArrowDownRight, Database, AlertCircle } from 'lucide-react';
import { DualExchangePrice, LivePriceTick } from '@/types';
import { useI18n } from '@/lib/i18n';
import { formatINR, formatPercent } from '@/lib/currency';

interface LivePriceCardProps {
  initialPrice: DualExchangePrice;
  isin: string;
}

export function LivePriceCard({ initialPrice, isin }: LivePriceCardProps) {
  const { t, locale, useDevanagariDigits } = useI18n();
  const [priceData, setPriceData] = useState<DualExchangePrice>(initialPrice);
  const [pulseNse, setPulseNse] = useState<'up' | 'down' | null>(null);
  const [pulseBse, setPulseBse] = useState<'up' | 'down' | null>(null);

  const prevNsePrice = useRef<number | undefined>(initialPrice.nse?.ltp);
  const prevBsePrice = useRef<number | undefined>(initialPrice.bse?.ltp);

  // Subscribe to SSE price ticks
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/stream?isins=${isin}`);

      eventSource.onmessage = (event) => {
        try {
          const updates: DualExchangePrice[] = JSON.parse(event.data);
          const current = updates.find((u) => u.isin === isin);
          if (current) {
            // Check NSE tick pulse
            if (current.nse && prevNsePrice.current !== undefined) {
              if (current.nse.ltp > prevNsePrice.current) {
                setPulseNse('up');
                setTimeout(() => setPulseNse(null), 1200);
              } else if (current.nse.ltp < prevNsePrice.current) {
                setPulseNse('down');
                setTimeout(() => setPulseNse(null), 1200);
              }
              prevNsePrice.current = current.nse.ltp;
            }

            // Check BSE tick pulse
            if (current.bse && prevBsePrice.current !== undefined) {
              if (current.bse.ltp > prevBsePrice.current) {
                setPulseBse('up');
                setTimeout(() => setPulseBse(null), 1200);
              } else if (current.bse.ltp < prevBsePrice.current) {
                setPulseBse('down');
                setTimeout(() => setPulseBse(null), 1200);
              }
              prevBsePrice.current = current.bse.ltp;
            }

            setPriceData(current);
          }
        } catch (err) {
          console.error('Error parsing SSE tick', err);
        }
      };
    } catch (e) {
      console.error('SSE initialization error', e);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isin]);

  const renderSingleQuote = (tick?: LivePriceTick & { as_of?: string; source?: string }, pulse?: 'up' | 'down' | null) => {
    if (!tick) {
      return (
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 flex items-center justify-center h-full min-h-[160px]">
          {locale === 'mr' ? 'या बाजारात नोंदणीकृत नाही (Not Listed on this exchange)' : 'Not listed on this exchange'}
        </div>
      );
    }

    const isPos = tick.change >= 0;
    const pulseBg =
      pulse === 'up'
        ? 'bg-emerald-100/90 dark:bg-emerald-950/60 transition-colors'
        : pulse === 'down'
        ? 'bg-rose-100/90 dark:bg-rose-950/60 transition-colors'
        : 'bg-white dark:bg-slate-800/90';

    return (
      <div
        className={`p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm transition-all duration-300 ${pulseBg} flex flex-col justify-between`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-black tracking-wider rounded-lg bg-slate-900 text-white dark:bg-slate-700">
                {tick.exchange}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {tick.exchange === 'NSE' ? 'National Stock Exchange' : 'Bombay Stock Exchange'}
              </span>
            </div>

            <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3 h-3" />
              <span>
                {tick.timestamp ? (tick.timestamp.includes('T') ? tick.timestamp.substring(11, 19) : tick.timestamp) : ''} IST
              </span>
            </div>
          </div>

          {/* Sample Data Badge if mock */}
          {priceData.isSampleData && (
            <div className="mb-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              <AlertCircle className="w-3 h-3" />
              <span>{t('common.sampleData')}</span>
            </div>
          )}

          {/* Price & Change */}
          <div className="flex items-baseline space-x-3 my-2 flex-wrap">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
              {formatINR(tick.ltp, 2, useDevanagariDigits)}
            </span>

            <div
              className={`flex items-center text-sm sm:text-base font-bold font-mono px-2 py-0.5 rounded-lg ${
                isPos
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50'
                  : 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/50'
              }`}
            >
              {isPos ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
              <span>
                {formatINR(tick.change, 2, useDevanagariDigits)} ({formatPercent(tick.changePct, 2, useDevanagariDigits)})
              </span>
            </div>
          </div>

          {/* Day's Range and 52W stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">
                {locale === 'mr' ? 'आजचा नीचांक' : 'Day Low'}
              </span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                {formatINR(tick.dayLow, 2, useDevanagariDigits)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">
                {locale === 'mr' ? 'आजचा उच्चांक' : 'Day High'}
              </span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                {formatINR(tick.dayHigh, 2, useDevanagariDigits)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">
                {locale === 'mr' ? '५२ आठवडे नीचांक' : '52W Low'}
              </span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                {formatINR(tick.fiftyTwoWeekLow, 2, useDevanagariDigits)}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">
                {locale === 'mr' ? '५२ आठवडे उच्चांक' : '52W High'}
              </span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                {formatINR(tick.fiftyTwoWeekHigh, 2, useDevanagariDigits)}
              </span>
            </div>
          </div>
        </div>

        {/* Delayed & Provenance Footer */}
        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-1">
          <span className="font-medium text-amber-600 dark:text-amber-400">
            {t('common.delayed15Min')}
          </span>
          {tick.source && (
            <span className="flex items-center space-x-1">
              <Database className="w-3 h-3 inline mr-0.5" />
              <span>
                {locale === 'mr' ? 'स्रोत: ' : 'Source: '}
                <strong>{tick.source}</strong>
              </span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      {renderSingleQuote(priceData.nse, pulseNse)}
      {renderSingleQuote(priceData.bse, pulseBse)}
    </div>
  );
}
