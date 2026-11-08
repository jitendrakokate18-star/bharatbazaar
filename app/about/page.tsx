'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { ShieldCheck, Info, Heart, Database, CheckCircle, Globe } from 'lucide-react';

export default function AboutPage() {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          {locale === 'mr' ? 'प्लॅटफॉर्मबद्दल माहिती आणि वैधानिक नियम' : 'About the Platform & Statutory Disclaimers'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {locale === 'mr'
            ? 'भारतीय सूचिबद्ध कंपन्यांची सखोल माहिती देणारा द्विभाषिक मंच (English / मराठी).'
            : 'Indian Listed Companies Intelligence Platform (BSE + NSE) — Version 1.0.'}
        </p>
      </div>

      {/* Purpose Box */}
      <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-3xl border border-blue-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <span>{locale === 'mr' ? 'उद्दिष्ट आणि निर्मिती' : 'Purpose & Mission'}</span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {locale === 'mr'
            ? 'वडिलांसाठी आणि सर्व भारतीय गुंतवणूकदारांसाठी विशेष भेट'
            : 'Specially Built for Dad & Indian Retail Investors'}
        </h2>

        <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          {locale === 'mr'
            ? 'शेअर बाजारातील माहिती सामान्यतः इंग्रजीत आणि क्लिष्ट असते. एका क्लिकवर संपूर्ण माहिती अस्खलित मराठीत उपलब्ध करून देणे, एका कंपनीच्या अंतर्गत कोणते लोकप्रिय ब्रँड्स येतात हे दाखवणे, आणि ५ वर्षांचा ताळेबंद सहज समजणाऱ्या स्वरूपात मांडणे हे या ॲपचे मुख्य ध्येय आहे.'
            : 'Financial data on Indian stock markets is often jargon-dense and exclusively in English. This platform empowers retail investors to explore company backgrounds, discover which FMCG/automotive brands sit under each parent company, track dual BSE/NSE prices side-by-side, and switch entirely between English and authentic Marathi with zero page reloads.'}
        </p>
      </div>

      {/* Core Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {locale === 'mr' ? 'ISIN मास्टर की' : 'ISIN Master Identity'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'mr'
              ? 'एकाच कंपनीचे एनएसई सिम्बॉल आणि बीएसई कोड एकमेकांशी जोडण्यासाठी युनिक ISIN कोडचा वापर केला आहे.'
              : 'ISIN is used as the master key to seamlessly merge duplicate listings across BSE and NSE without confusion.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {locale === 'mr' ? 'अस्खलित द्विभाषिक अनुभव' : 'Zero Mixed-Language'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'mr'
              ? 'मराठी भाषेची निवड केल्यास केवळ बटणेच नव्हे, तर कंपनीचा इतिहास, आर्थिक संज्ञा आणि आकडेवारीही शुद्ध मराठीत दिसते.'
              : 'Every string, financial ratio, and corporate background is pre-translated using a verified glossary to prevent broken machine text.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            {locale === 'mr' ? 'डेटा प्रदाता मॉडेल' : 'Data Abstraction'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {locale === 'mr'
              ? 'सध्या कौटुंबिक वापरासाठी प्रायोगिक डेटा आहे; भविष्यात अधिकृत परवानाधारक एक्सचेंज फीड जोडण्यासाठी आर्किटेक्चर सज्ज आहे.'
              : 'Built with a clean Provider Interface allowing effortless transition from delayed family feeds to authorized exchange feeds.'}
          </p>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer */}
      <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-6 space-y-3">
        <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <span>{locale === 'mr' ? 'वैधानिक अस्वीकरण (Legal Disclaimer)' : 'Statutory & Regulatory Disclaimer'}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {locale === 'mr'
            ? 'या प्लॅटफॉर्मवरील सर्व माहिती ही केवळ माहिती आणि अभ्यासाच्या उद्देशाने दिलेली आहे. हा कोणताही सेबी (SEBI) नोंदणीकृत गुंतवणूक सल्ला किंवा शेअर्स खरेदी-विक्रीची शिफारस नाही. कोणत्याही शेअर्समध्ये गुंतवणूक करण्यापूर्वी स्वतःचा अभ्यास करा किंवा सेबी नोंदणीकृत सल्लागाराचा सल्ला घ्या.'
            : 'All data and information provided on this platform is strictly for personal educational and intelligence tracking purposes. It does not constitute investment advice, stock recommendation, research report, or solicitation to buy or sell securities. Stock market investments are subject to market risks.'}
        </p>
      </div>
    </div>
  );
}
