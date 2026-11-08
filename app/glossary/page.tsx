'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { FINANCIAL_GLOSSARY, GlossaryTerm } from '@/lib/glossary';
import { BookOpen, Search, HelpCircle } from 'lucide-react';

export default function GlossaryPage() {
  const { t, locale } = useI18n();
  const [search, setSearch] = useState('');

  const terms = Object.values(FINANCIAL_GLOSSARY);

  const filtered = terms.filter((term) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      term.en.toLowerCase().includes(q) ||
      term.mr.includes(q) ||
      term.definitionEn.toLowerCase().includes(q) ||
      term.definitionMr.includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>{locale === 'mr' ? 'शेअर बाजार ज्ञानकोश' : 'Finance Knowledge Base'}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {locale === 'mr' ? 'आर्थिक संज्ञा आणि संकल्पनांचा शब्दकोश' : 'Stock Market & Finance Glossary'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {locale === 'mr'
            ? 'शेअर बाजारातील महत्त्वाचे शब्द, प्रमाणे (Ratios) आणि संज्ञांची सोप्या मराठी व इंग्रजी भाषेत माहिती.'
            : 'Standard financial metrics, ratios, and valuation terminology explained in plain English and authentic Marathi.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={locale === 'mr' ? 'संज्ञा किंवा शब्द शोधा (उदा. P/E, बाजार भांडवल, ROE)...' : 'Search financial term or ratio...'}
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm shadow-sm"
        />
      </div>

      {/* Glossary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.key}
            className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {locale === 'mr' ? item.mr : item.en}
                </h3>
              </div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                {locale === 'mr' ? item.en : item.mr}
              </p>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {locale === 'mr' ? item.definitionMr : item.definitionEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
