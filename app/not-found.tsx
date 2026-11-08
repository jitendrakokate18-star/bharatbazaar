'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { AlertCircle, ArrowLeft, Home, Building2, Layers } from 'lucide-react';

export default function NotFound() {
  const { t, locale } = useI18n();

  return (
    <div className="py-16 sm:py-24 text-center max-w-lg mx-auto px-4 space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          404 · Page Not Found
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {locale === 'mr' ? 'पृष्ठ आढळले नाही' : 'Page Not Found'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {locale === 'mr'
            ? 'आपण शोधत असलेले पृष्ठ उपलब्ध नाही किंवा बदलण्यात आले आहे.'
            : 'The page or company profile you are looking for does not exist or has been moved.'}
        </p>
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 transition-all min-h-[44px]"
        >
          <Home className="w-4 h-4" />
          <span>{locale === 'mr' ? 'मुख्य पृष्ठावर जा' : 'Back to Home'}</span>
        </Link>
        <Link
          href="/directory"
          className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all min-h-[44px]"
        >
          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{t('nav.directory')}</span>
        </Link>
      </div>
    </div>
  );
}
