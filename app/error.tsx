'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useI18n();

  return (
    <div className="py-16 sm:py-24 text-center max-w-lg mx-auto px-4 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
          Error Encountered
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {locale === 'mr' ? 'काहीतरी त्रुटी आली आहे' : 'Something went wrong'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {locale === 'mr'
            ? 'कृपया पुन्हा प्रयत्न करा किंवा मुख्य पृष्ठावर जा.'
            : 'An unexpected error occurred while loading this view. Please try again.'}
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 transition-all min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{locale === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Try Again'}</span>
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all min-h-[44px]"
        >
          <Home className="w-4 h-4" />
          <span>{locale === 'mr' ? 'मुख्य पृष्ठावर जा' : 'Back to Home'}</span>
        </Link>
      </div>
    </div>
  );
}
