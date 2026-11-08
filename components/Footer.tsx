'use client';

import React from 'react';
import { ShieldCheck, Info, Heart, ArrowUpRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t, locale } = useI18n();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Statutory Disclaimer Box */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 mb-8">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white block mb-1">
                {locale === 'mr' ? 'महत्त्वाची सूचना व वैधानिक अस्वीकरण' : 'Important Notice & Statutory Disclaimer'}
              </span>
              <p>{t('common.disclaimer')}</p>
              <p className="mt-1 text-slate-400 text-xs">{t('market.delayedNotice')}</p>
            </div>
          </div>
        </div>

        {/* Links & Attribution */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-amber-500 flex items-center justify-center text-white font-black text-sm">
                भा
              </div>
              <span className="text-lg font-bold text-white">
                {locale === 'mr' ? 'भारतीय बाजार' : 'Bharatiya Bajar'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('common.appTagline')}. {t('common.madeForDad')}.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {locale === 'mr' ? 'द्रुत लिंक्स' : 'Quick Links'}
            </h4>
            <ul className="space-y-1 text-xs">
              <li>
                <a href="/directory" className="hover:text-white transition-colors min-h-[44px] flex items-center py-1">
                  {t('nav.directory')}
                </a>
              </li>
              <li>
                <a href="/sectors" className="hover:text-white transition-colors min-h-[44px] flex items-center py-1">
                  {t('nav.sectors')}
                </a>
              </li>
              <li>
                <a href="/glossary" className="hover:text-white transition-colors min-h-[44px] flex items-center py-1">
                  {t('nav.glossary')}
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-white transition-colors min-h-[44px] flex items-center py-1">
                  {t('nav.about')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {locale === 'mr' ? 'शेअर बाजार विनिमय' : 'Exchanges & Data'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>National Stock Exchange (NSE)</li>
              <li>Bombay Stock Exchange (BSE)</li>
              <li>ISIN Master Integration</li>
              <li>Corporate Action Normalisation</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Bharatiya Bajar Intelligence Platform. Version 1.0.</p>
          <p className="flex items-center space-x-1">
            <span>Built with devotion for Dad</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
            <span>by Jitendra</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
