'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Sun,
  Moon,
  Clock,
  Type,
  Hash,
  Menu,
  X,
  Search,
  SlidersHorizontal,
  Building2,
  Tag,
  Layers,
  BookOpen,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { GlobalSearch } from './GlobalSearch';
import { MarketStatus, IndexData } from '@/types';
import { formatIndianNumber, formatPercent } from '@/lib/currency';

export function Header() {
  const {
    t,
    locale,
    setLocale,
    toggleLocale,
    fontSize,
    cycleFontSize,
    setFontSize,
    useDevanagariDigits,
    toggleDevanagariDigits,
  } = useI18n();
  const { theme, toggleTheme, setTheme } = useTheme();
  const pathname = usePathname();

  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [settingsPopoverOpen, setSettingsPopoverOpen] = useState(false);

  useEffect(() => {
    fetch('/api/market/status')
      .then((r) => r.json())
      .then((data) => setMarketStatus(data))
      .catch((e) => console.error(e));

    fetch('/api/indices')
      .then((r) => r.json())
      .then((data) => setIndices(data.indices || []))
      .catch((e) => console.error(e));

    const interval = setInterval(() => {
      fetch('/api/market/status')
        .then((r) => r.json())
        .then((data) => setMarketStatus(data))
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const isMarketOpen = marketStatus?.status === 'OPEN';

  const navLinks = [
    { href: '/directory', label: t('nav.directory') },
    { href: '/sectors', label: t('nav.sectors') },
    { href: '/glossary', label: t('nav.glossary') },
    { href: '/about', label: t('nav.about') },
    { href: '/admin/data-health', label: locale === 'mr' ? 'डेटा आरोग्य' : 'Data Health' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors safe-top">
        {/* Main Header Container */}
        <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-4">
            {/* 1. Left: Branding & Logo */}
            <a href="/" className="flex items-center space-x-2 sm:space-x-3 shrink-0 group py-1 min-h-[44px]">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <span className="font-extrabold text-lg sm:text-xl font-devanagari">भा</span>
              </div>
              <div className="hidden sm:block min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {locale === 'mr' ? 'भारतीय बाजार' : 'Bharatiya Bajar'}
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 uppercase tracking-wider shrink-0">
                    BSE • NSE
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block truncate max-w-xs">
                  {t('common.madeForDad')}
                </p>
              </div>
            </a>

            {/* 2. Middle: Flexible Search Bar (Tablet & Desktop >= 640px) */}
            <div className="hidden sm:flex flex-1 min-w-[260px] max-w-xl mx-2 sm:mx-4">
              <GlobalSearch />
            </div>

            {/* 3. Desktop Navigation Links (>= 1024px) */}
            <nav className="hidden xl:flex items-center space-x-4 text-xs lg:text-sm font-medium text-slate-600 dark:text-slate-300">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1 ${
                    pathname === link.href ? 'text-blue-600 dark:text-blue-400 font-bold' : ''
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* 4. Right Controls Container */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              {/* Mobile Search Button (< 640px) */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                title={t('search.title')}
                className="sm:hidden p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors active:scale-95"
              >
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </button>

              {/* Bilingual Segmented Toggle (Always Visible across Mobile, Tablet, Desktop) */}
              <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center justify-center ${
                    locale === 'en'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('mr')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[40px] flex items-center justify-center font-devanagari ${
                    locale === 'mr'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* Desktop Text Size Control (>= 1024px) */}
              <button
                type="button"
                onClick={cycleFontSize}
                title={`Text Size: ${fontSize.toUpperCase()}`}
                className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px] min-w-[44px] items-center justify-center transition-colors font-bold text-xs"
              >
                <Type className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="uppercase text-[11px] font-semibold">
                  {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
                </span>
              </button>

              {/* Desktop Devanagari Digits Toggle (>= 1024px) */}
              <button
                type="button"
                onClick={toggleDevanagariDigits}
                title={useDevanagariDigits ? 'इंग्रजी अंक वापरा (1 2 3)' : 'मराठी अंक वापरा (१ २ ३)'}
                className={`hidden lg:flex p-2 rounded-xl border text-xs font-bold transition-colors min-h-[44px] min-w-[44px] items-center justify-center ${
                  useDevanagariDigits
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Hash className="w-4 h-4 inline mr-0.5" />
                <span className="font-devanagari">{useDevanagariDigits ? '१२३' : '123'}</span>
              </button>

              {/* Desktop Theme Toggle (>= 1024px) */}
              <button
                type="button"
                onClick={toggleTheme}
                title="Toggle Light/Dark Theme"
                className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px] min-w-[44px] items-center justify-center transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Mobile / Tablet Menu Button (< 1280px) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                title="Menu"
                className="xl:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors active:scale-95"
              >
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Slim Second Row Ticker: Dedicated horizontal strip for Sensex & Nifty */}
        <div className="w-full overflow-hidden bg-slate-900 text-slate-200 border-t border-slate-800/80">
          <div className="w-full px-3 sm:px-6 lg:px-8 py-1.5 overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs">
              {/* Indices Ticker */}
              <div className="flex items-center space-x-6 shrink-0">
                {indices.map((idx) => {
                  const isPos = idx.change >= 0;
                  return (
                    <div key={idx.symbol} className="flex items-center space-x-2 shrink-0">
                      <span className="font-semibold text-slate-300 text-xs">
                        {locale === 'mr' ? idx.nameMr : idx.name}
                      </span>
                      <span className="font-mono text-white font-semibold">
                        {formatIndianNumber(idx.ltp, 2, useDevanagariDigits)}
                      </span>
                      <span
                        className={`flex items-center font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                          isPos ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3 mr-0.5 inline" /> : <TrendingDown className="w-3 h-3 mr-0.5 inline" />}
                        {formatPercent(idx.changePct, 2, useDevanagariDigits)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Market Status & IST Time */}
              {marketStatus && (
                <div className="hidden sm:flex items-center space-x-3 shrink-0 text-slate-400 text-[11px] font-medium">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-slate-300 font-semibold">
                      {locale === 'mr' ? marketStatus.messageMr : marketStatus.messageEn}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{marketStatus.istTime} IST</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Search Overlay */}
      {mobileSearchOpen && (
        <GlobalSearch
          isMobileOverlay={true}
          onCloseOverlay={() => setMobileSearchOpen(false)}
        />
      )}

      {/* Slide-over Mobile / Tablet Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200 dark:border-slate-800 safe-top safe-bottom">
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-700 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm font-devanagari">
                      भा
                    </div>
                    <span className="font-black text-lg text-slate-900 dark:text-white">
                      {t('menu.title')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    title={t('search.close')}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Market Status Card */}
                {marketStatus && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {t('menu.marketStatus')}
                      </span>
                      <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{marketStatus.istTime} IST</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {locale === 'mr' ? marketStatus.messageMr : marketStatus.messageEn}
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 block mb-1">
                    {locale === 'mr' ? 'नेव्हिगेशन' : 'Navigation'}
                  </span>
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-colors min-h-[44px] ${
                        pathname === link.href
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </a>
                  ))}
                </div>

                {/* Dad & Investor Settings */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 block">
                    {locale === 'mr' ? 'वैयक्तिकरण सेटिंग्ज' : 'Preferences'}
                  </span>

                  {/* Theme Switcher */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('menu.theme')}
                    </span>
                    <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 min-h-[40px] ${
                          theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Light</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 min-h-[40px] ${
                          theme === 'dark' ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* Font Size Adjuster for Dad */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('menu.fontSize')}
                    </span>
                    <div className="inline-flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {(['normal', 'large', 'xlarge'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFontSize(size)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold min-h-[40px] ${
                            fontSize === size
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Devanagari Numerals Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('menu.numerals')}
                    </span>
                    <button
                      type="button"
                      onClick={toggleDevanagariDigits}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors min-h-[40px] flex items-center space-x-1.5 ${
                        useDevanagariDigits
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" />
                      <span className="font-devanagari">{useDevanagariDigits ? 'मराठी (१२३)' : 'English (123)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {t('common.appName')} · BSE & NSE
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {t('common.madeForDad')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
