'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import enMessages from '@/messages/en.json';
import mrMessages from '@/messages/mr.json';
import { Locale } from '@/types';

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (path: string, fallback?: string) => string;
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  cycleFontSize: () => void;
  useDevanagariDigits: boolean;
  setUseDevanagariDigits: (val: boolean) => void;
  toggleDevanagariDigits: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const messagesMap: Record<Locale, any> = {
  en: enMessages,
  mr: mrMessages,
};

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === undefined || curr === null) return undefined;
    curr = curr[part];
  }
  return typeof curr === 'string' ? curr : undefined;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [fontSize, setFontSizeState] = useState<FontSizeOption>('large'); // Dad friendly default
  const [useDevanagariDigits, setUseDevanagariDigitsState] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem('app_locale') as Locale;
    if (savedLocale === 'mr' || savedLocale === 'en') {
      setLocaleState(savedLocale);
    }

    const savedFontSize = localStorage.getItem('app_font_size') as FontSizeOption;
    if (savedFontSize === 'normal' || savedFontSize === 'large' || savedFontSize === 'xlarge') {
      setFontSizeState(savedFontSize);
    }

    const savedDigits = localStorage.getItem('app_devanagari_digits');
    if (savedDigits !== null) {
      setUseDevanagariDigitsState(savedDigits === 'true');
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_locale', newLocale);
      document.cookie = `app_locale=${newLocale}; path=/; max-age=31536000`;
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'mr' : 'en');
  };

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_font_size', size);
    }
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const setUseDevanagariDigits = (val: boolean) => {
    setUseDevanagariDigitsState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_devanagari_digits', String(val));
    }
  };

  const toggleDevanagariDigits = () => {
    setUseDevanagariDigits(!useDevanagariDigits);
  };

  const t = (path: string, fallback?: string): string => {
    const currentDict = messagesMap[locale];
    const val = getNestedValue(currentDict, path);

    if (val !== undefined && val !== '') {
      return val;
    }

    // Fallback to English dictionary if currently in Marathi
    if (locale === 'mr') {
      const enVal = getNestedValue(messagesMap.en, path);
      if (enVal !== undefined && enVal !== '') {
        return enVal;
      }
    }

    return fallback || path;
  };

  const fontSizeClass =
    fontSize === 'xlarge'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-base leading-normal'
      : 'text-sm leading-normal';

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t,
        fontSize,
        setFontSize,
        cycleFontSize,
        useDevanagariDigits,
        setUseDevanagariDigits,
        toggleDevanagariDigits,
      }}
    >
      <div className={`transition-all duration-150 ${fontSizeClass}`}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
