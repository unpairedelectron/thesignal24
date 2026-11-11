import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react';
import type { PolicyRecord, Story } from '@workspace/api-client-react';
import { basePath, localizePath, setActiveLang, stripLangPrefix, type Lang } from './seo';
import { AUTHORS } from './authors';

export type { Lang } from './seo';

const LangContext = createContext<Lang>('en');

/**
 * Wraps one language edition of the site. Everything rendered inside reads its
 * language from here, and URL helpers in ./seo localize against it.
 */
export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  // Set synchronously so URL helpers called during render see the right edition.
  setActiveLang(lang);
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    root.classList.toggle('lang-hi', lang === 'hi');
  }, [lang]);
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** Inline bilingual copy: t('English', 'हिंदी'). Works for strings and JSX. */
export function useT() {
  const lang = useLang();
  return useCallback(<T,>(en: T, hi: T): T => (lang === 'hi' ? hi : en), [lang]);
}

/** Hindi names for the fixed vocabulary that comes from the API. */
const HINDI_LABELS: Record<string, string> = {
  // Topics
  Latest: 'ताज़ा',
  'Courts & Policy': 'अदालत और नीति',
  States: 'राज्य',
  History: 'इतिहास',
  'Ground Reports': 'ज़मीनी रिपोर्ट',
  'Data & Notes': 'आंकड़े और नोट्स',
  // Record kinds
  Article: 'रिपोर्ट',
  'Paper note': 'दस्तावेज़ नोट',
  Archive: 'अभिलेख',
  Explainer: 'व्याख्या',
  Opinion: 'राय',
  // Verification
  verified: 'सत्यापित',
  'source-linked': 'स्रोत से जुड़ा',
  unverified: 'असत्यापित',
  // Policy status
  current: 'लागू',
  historical: 'ऐतिहासिक',
  proposed: 'प्रस्तावित',
  challenged: 'अदालत में चुनौती',
  stayed: 'रोक लगी',
  'struck down': 'रद्द',
  unavailable: 'अनुपलब्ध',
  // Places
  National: 'राष्ट्रीय',
  India: 'भारत',
  'All states': 'सभी राज्य',
  'Andhra Pradesh': 'आंध्र प्रदेश',
  'Arunachal Pradesh': 'अरुणाचल प्रदेश',
  Assam: 'असम',
  Bihar: 'बिहार',
  Chhattisgarh: 'छत्तीसगढ़',
  Delhi: 'दिल्ली',
  Goa: 'गोवा',
  Gujarat: 'गुजरात',
  Haryana: 'हरियाणा',
  'Himachal Pradesh': 'हिमाचल प्रदेश',
  'Jammu and Kashmir': 'जम्मू और कश्मीर',
  Jharkhand: 'झारखंड',
  Karnataka: 'कर्नाटक',
  Kerala: 'केरल',
  Ladakh: 'लद्दाख',
  'Madhya Pradesh': 'मध्य प्रदेश',
  Maharashtra: 'महाराष्ट्र',
  Manipur: 'मणिपुर',
  Meghalaya: 'मेघालय',
  Mizoram: 'मिज़ोरम',
  Nagaland: 'नगालैंड',
  Odisha: 'ओडिशा',
  Punjab: 'पंजाब',
  Rajasthan: 'राजस्थान',
  Sikkim: 'सिक्किम',
  'Tamil Nadu': 'तमिलनाडु',
  Telangana: 'तेलंगाना',
  Tripura: 'त्रिपुरा',
  'Uttar Pradesh': 'उत्तर प्रदेश',
  Uttarakhand: 'उत्तराखंड',
  'West Bengal': 'पश्चिम बंगाल',
  'Andaman and Nicobar Islands': 'अंडमान और निकोबार द्वीपसमूह',
  Chandigarh: 'चंडीगढ़',
  'Dadra and Nagar Haveli and Daman and Diu': 'दादरा और नगर हवेली और दमन और दीव',
  Lakshadweep: 'लक्षद्वीप',
  Puducherry: 'पुडुचेरी',
  // Desk bylines
  'The Signal 24 editorial board': 'द सिग्नल 24 संपादकीय बोर्ड',
  'The Signal 24 editorial desk': 'द सिग्नल 24 संपादकीय डेस्क',
  // Named bylines
  ...Object.fromEntries(AUTHORS.map((author) => [author.name.en, author.name.hi])),
};

/** Translate a fixed API value (topic, kind, status, state) outside React. Unknown values pass through. */
export function translateLabel(value: string | null | undefined, lang: Lang) {
  if (!value) return value ?? '';
  return lang === 'hi' ? HINDI_LABELS[value] ?? value : value;
}

/** Translate a fixed API value (topic, kind, status, state). Unknown values pass through. */
export function useLabel() {
  const lang = useLang();
  return useCallback((value: string | null | undefined) => translateLabel(value, lang), [lang]);
}

export type LocalizedStory = Story & { contentLang: Lang; isTranslated: boolean };

/** Swap in the Hindi edition of a story where one exists; keep English (marked) otherwise. */
export function localizeStory(story: Story, lang: Lang): LocalizedStory {
  if (lang !== 'hi') return { ...story, contentLang: 'en', isTranslated: true };
  const hi = story.hi;
  if (!hi?.title || !hi.dek || !hi.body) return { ...story, contentLang: 'en', isTranslated: false };
  return {
    ...story,
    eyebrow: hi.eyebrow || story.eyebrow,
    title: hi.title,
    dek: hi.dek,
    body: hi.body,
    contentLang: 'hi',
    isTranslated: true,
  };
}

export type LocalizedPolicy = PolicyRecord & { contentLang: Lang; isTranslated: boolean };

export function localizePolicy(record: PolicyRecord, lang: Lang): LocalizedPolicy {
  if (lang !== 'hi') return { ...record, contentLang: 'en', isTranslated: true };
  const hi = record.hi;
  if (!hi?.title || !hi.summary) return { ...record, contentLang: 'en', isTranslated: false };
  return {
    ...record,
    title: hi.title,
    summary: hi.summary,
    sector: hi.sector || record.sector,
    authority: hi.authority || record.authority,
    previousFramework: hi.previousFramework || record.previousFramework,
    newFramework: hi.newFramework || record.newFramework,
    legalBasis: hi.legalBasis || record.legalBasis,
    courtStatus: hi.courtStatus || record.courtStatus,
    contentLang: 'hi',
    isTranslated: true,
  };
}

/** href for a plain <a> (hash links, form actions) in the current edition. */
export function useLocalHref() {
  const lang = useLang();
  return useCallback((path: string) => `${basePath}${localizePath(path, lang)}`, [lang]);
}

/** Links to the same page in the other language edition. */
export function LanguageSwitch({ className = '' }: { className?: string }) {
  const lang = useLang();
  const pathname = typeof window === 'undefined' ? '/' : window.location.pathname;
  const withoutBase = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || '/' : pathname;
  const neutral = stripLangPrefix(withoutBase);
  const search = typeof window === 'undefined' ? '' : window.location.search;
  const target = lang === 'hi' ? neutral : localizePath(neutral, 'hi');
  return (
    <a
      href={`${basePath}${target}${search}`}
      hrefLang={lang === 'hi' ? 'en-IN' : 'hi-IN'}
      lang={lang === 'hi' ? 'en' : 'hi'}
      className={`signal-lang-switch ${className}`}
      data-testid="link-language-switch"
      aria-label={lang === 'hi' ? 'Read this page in English' : 'यह पेज हिंदी में पढ़ें'}
    >
      {lang === 'hi' ? 'English' : 'हिंदी'}
    </a>
  );
}

/** Localize a list of stories for the current edition. */
export function useLocalizeStories() {
  const lang = useLang();
  return useCallback((stories: Story[]) => stories.map((story) => localizeStory(story, lang)), [lang]);
}
