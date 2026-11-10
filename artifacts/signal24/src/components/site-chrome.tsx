import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUp, ArrowUpRight, Check, ChevronDown, Menu, Search, Send, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useSubscribeToNewsletter } from '@workspace/api-client-react';
import { LanguageSwitch, useLang, useLocalHref, useT } from '@/lib/i18n';
import { daysSince, RUNNING_CLOCKS } from '@/lib/key-figures';
import { TOPIC_BRIEFS, type TopicKey } from '@/lib/topic-briefs';

export function BrandMark() {
  return <span className="signal-mark shrink-0" aria-hidden="true" />;
}

const DESKS: TopicKey[] = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'];
const DESK_HI: Record<string, string> = { Latest: 'ताज़ा', 'Courts & Policy': 'अदालत और नीति', States: 'राज्य', History: 'इतिहास', 'Ground Reports': 'ज़मीनी रिपोर्ट', 'Data & Notes': 'आंकड़े और नोट्स' };

type NavItem = { href: string; en: string; hi: string; testId: string };

const PRIMARY: NavItem[] = [
  { href: '/', en: 'Latest', hi: 'ताज़ा', testId: 'link-home' },
  { href: '/states', en: 'States', hi: 'राज्य', testId: 'link-states' },
  { href: '/policies', en: 'Policy ledger', hi: 'नीति रजिस्टर', testId: 'link-policy-ledger' },
  { href: '/data', en: 'Data', hi: 'आंकड़े', testId: 'link-data' },
  { href: '/opinion', en: 'Opinion', hi: 'राय', testId: 'link-opinion' },
  { href: '/answers', en: 'Answers', hi: 'जवाब', testId: 'link-answers' },
  { href: '/community', en: 'Community', hi: 'समुदाय', testId: 'link-community' },
];

const EXPLORE: NavItem[] = [
  { href: '/events', en: 'Evidence', hi: 'सबूत', testId: 'link-evidence-events' },
  { href: '/timeline', en: 'Timeline', hi: 'समयरेखा', testId: 'link-timeline' },
  { href: '/archive', en: 'Archive', hi: 'अभिलेखागार', testId: 'link-archive' },
  { href: '/evidence/search', en: 'Search the evidence', hi: 'सबूतों में खोजें', testId: 'link-evidence-search' },
  { href: '/about', en: 'About us', hi: 'हमारे बारे में', testId: 'link-about' },
  { href: '/editorial-standards', en: 'Editorial standards', hi: 'संपादकीय मानक', testId: 'link-standards' },
  { href: '/methodology', en: 'Methodology', hi: 'कार्यप्रणाली', testId: 'link-methodology' },
];

function isActive(location: string, href: string) {
  if (href === '/') return location === '/' || location === '';
  return location === href || location.startsWith(`${href}/`);
}

/** A disclosure menu that closes on Escape, outside click and navigation. */
function NavMenu({ label, children, wide = false, testId }: { label: string; children: (close: () => void) => ReactNode; wide?: boolean; testId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return <div ref={ref} className="chrome-menu">
    <button type="button" className="chrome-nav-link" aria-expanded={open} onClick={() => setOpen((value) => !value)} data-testid={testId}>{label} <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} /></button>
    {open && <div className={`chrome-menu-panel ${wide ? 'is-wide' : ''}`}>{children(() => setOpen(false))}</div>}
  </div>;
}

/**
 * The site header: a topline with a live accountability counter, then a sticky bar
 * with the primary sections, a Topics mega-menu, an Explore menu, search, the
 * language switch and subscribe. Editor routes get a reduced bar.
 */
export function Header({ editor = false }: { editor?: boolean }) {
  const t = useT();
  const lang = useLang();
  const href = useLocalHref();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [drawerTop, setDrawerTop] = useState(0);
  useEffect(() => {
    if (mobileOpen && headerRef.current) setDrawerTop(Math.max(0, headerRef.current.getBoundingClientRect().bottom));
  }, [mobileOpen, compact]);
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [location]);
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);
  const rohini = RUNNING_CLOCKS[0];
  const today = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);

  const searchForm = (id: string) => <form id={id} role="search" action={href('/search')} method="get" className="chrome-search-form">
    <Search size={18} aria-hidden="true" />
    <label className="sr-only" htmlFor={`${id}-input`}>{t('Search the record', 'रिकॉर्ड में खोजें')}</label>
    <input id={`${id}-input`} autoFocus type="search" name="q" placeholder={t('Search judgments, laws, states, commissions…', 'फ़ैसले, क़ानून, राज्य, आयोग खोजें…')} data-testid="input-site-search" />
    <button type="submit" className="chrome-search-submit">{t('Search', 'खोजें')}</button>
  </form>;

  return <>
    <div className="chrome-topline">
      <div className="signal-container chrome-topline-inner">
        <p className="chrome-topline-left"><span className="chrome-live-dot" aria-hidden="true" /> <span className="hidden sm:inline">{today} ·</span> <a href={href(rohini.href)} className="chrome-topline-link">{t(`Rohini report unpublished: ${daysSince(rohini.since).toLocaleString('en-IN')} days`, `रोहिणी रिपोर्ट अप्रकाशित: ${daysSince(rohini.since).toLocaleString('en-IN')} दिन`)}</a></p>
        <p className="chrome-topline-right hidden md:block">{t('We read the government’s paperwork so you don’t have to believe its press releases.', 'सरकार की प्रेस रिलीज़ पर भरोसा न करना पड़े, इसलिए हम उसके काग़ज़ पढ़ते हैं।')}</p>
      </div>
    </div>
    <header ref={headerRef} className={`chrome-header ${compact ? 'is-compact' : ''}`} onKeyDown={(event) => { if (event.key === 'Escape' && (mobileOpen || searchOpen)) { setMobileOpen(false); setSearchOpen(false); mobileToggleRef.current?.focus(); } }}>
      <div className="signal-container chrome-bar">
        <Link href="/" className="chrome-brand" data-testid="link-brand" lang="en" aria-label="The Signal 24 — home">
          <BrandMark />
          <span className="chrome-wordmark">The Signal <span>24</span></span>
        </Link>
        <nav className="chrome-nav" aria-label={t('Main navigation', 'मुख्य नेविगेशन')}>
          {editor ? <>
            <Link href="/" className="chrome-nav-link" data-testid="link-back-publication">Back to publication</Link>
            <Link href="/editor" className="chrome-nav-link" data-testid="link-editorial-desk">Editorial desk</Link>
            <Link href="/editor/evidence" className="chrome-nav-link" data-testid="link-editor-evidence">Evidence graph</Link>
          </> : <>
            <Link href={PRIMARY[0].href} className={`chrome-nav-link ${isActive(location, '/') ? 'is-active' : ''}`} aria-current={isActive(location, '/') ? 'page' : undefined} data-testid={PRIMARY[0].testId}>{t(PRIMARY[0].en, PRIMARY[0].hi)}</Link>
            <NavMenu label={t('Topics', 'विषय')} wide testId="button-topics-menu">{(close) => <div className="chrome-mega">
              <ul className="chrome-mega-list">
                {DESKS.map((desk) => <li key={desk}><Link href={`/topics/${encodeURIComponent(desk)}`} onClick={close} className="chrome-mega-item">
                  <span className="chrome-mega-title">{t(desk, DESK_HI[desk])}</span>
                  <span className="chrome-mega-dek">{TOPIC_BRIEFS[desk].headline[lang]} {TOPIC_BRIEFS[desk].accent[lang]}</span>
                </Link></li>)}
              </ul>
              <div className="chrome-mega-side">
                <Link href="/topics/open-category-competition" onClick={close} className="chrome-mega-feature"><span className="chrome-mega-kicker">{t('Topic file', 'विषय फ़ाइल')}</span><span className="chrome-mega-title">{t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा')}</span><span className="chrome-mega-dek">{t('UGC equity rules, EWS eligibility, and who open seats are open to.', 'यूजीसी समता नियम, ईडब्ल्यूएस पात्रता, और खुली सीटें किसके लिए खुली हैं।')}</span></Link>
                <Link href="/topics" onClick={close} className="chrome-mega-all">{t('All topic files', 'सभी विषय फ़ाइलें')} <ArrowUpRight size={14} /></Link>
              </div>
            </div>}</NavMenu>
            {PRIMARY.slice(1).map((item) => <Link key={item.href} href={item.href} className={`chrome-nav-link ${isActive(location, item.href) ? 'is-active' : ''}`} aria-current={isActive(location, item.href) ? 'page' : undefined} data-testid={item.testId}>{t(item.en, item.hi)}</Link>)}
            <NavMenu label={t('Explore', 'और')} testId="button-explore-menu">{(close) => <ul className="chrome-menu-list">
              {EXPLORE.map((item) => <li key={item.href}><Link href={item.href} onClick={close} className="chrome-menu-item" data-testid={item.testId}>{t(item.en, item.hi)}</Link></li>)}
            </ul>}</NavMenu>
          </>}
        </nav>
        <div className="chrome-actions">
          {!editor && <button type="button" className="chrome-icon-button" aria-label={searchOpen ? t('Close search', 'खोज बंद करें') : t('Open search', 'खोज खोलें')} aria-expanded={searchOpen} aria-controls="site-search-panel" onClick={() => setSearchOpen((value) => !value)} data-testid="button-open-search">{searchOpen ? <X size={18} /> : <Search size={18} />}<span className="chrome-icon-label">{t('Search', 'खोजें')}</span></button>}
          {!editor && <LanguageSwitch className="chrome-lang" />}
          {!editor && <a href={href('/#newsletter')} className="chrome-subscribe" data-testid="link-subscribe">{t('Subscribe', 'सदस्यता')}</a>}
          <button ref={mobileToggleRef} type="button" className="chrome-icon-button chrome-burger" aria-label={mobileOpen ? t('Close navigation', 'मेन्यू बंद करें') : t('Open navigation', 'मेन्यू खोलें')} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((value) => !value)} data-testid="button-mobile-navigation">{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {!editor && searchOpen && <div id="site-search-panel" className="chrome-search-panel"><div className="signal-container py-4">{searchForm('site-search')}</div></div>}
    </header>
    {/* Outside <header>: its backdrop-filter would otherwise trap this fixed drawer. */}
      <nav id="mobile-navigation" hidden={!mobileOpen} onKeyDown={(event) => { if (event.key === 'Escape') { setMobileOpen(false); mobileToggleRef.current?.focus(); } }} className="chrome-drawer" style={{ top: drawerTop }} aria-label={t('Mobile navigation', 'मोबाइल नेविगेशन')}>
        <div className="signal-container chrome-drawer-inner">
          {editor ? <div className="chrome-drawer-group">
            <Link href="/" className="chrome-drawer-link">Back to publication</Link>
            <Link href="/editor" className="chrome-drawer-link">Editorial desk</Link>
            <Link href="/editor/evidence" className="chrome-drawer-link">Evidence graph</Link>
          </div> : <>
            {searchForm('mobile-search')}
            <div className="chrome-drawer-group">
              <p className="chrome-drawer-heading">{t('Sections', 'खंड')}</p>
              {PRIMARY.map((item) => <Link key={item.href} href={item.href} className={`chrome-drawer-link ${isActive(location, item.href) ? 'is-active' : ''}`} data-testid={`${item.testId}-mobile`}>{t(item.en, item.hi)}</Link>)}
            </div>
            <div className="chrome-drawer-group">
              <p className="chrome-drawer-heading">{t('Topic files', 'विषय फ़ाइलें')}</p>
              {DESKS.map((desk) => <Link key={desk} href={`/topics/${encodeURIComponent(desk)}`} className="chrome-drawer-link is-small">{t(desk, DESK_HI[desk])}</Link>)}
              <Link href="/topics/open-category-competition" className="chrome-drawer-link is-small">{t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा')}</Link>
            </div>
            <div className="chrome-drawer-group">
              <p className="chrome-drawer-heading">{t('Explore', 'और')}</p>
              {EXPLORE.map((item) => <Link key={item.href} href={item.href} className="chrome-drawer-link is-small" data-testid={`${item.testId}-mobile`}>{t(item.en, item.hi)}</Link>)}
            </div>
            <div className="chrome-drawer-actions"><LanguageSwitch className="chrome-lang" /><a href={href('/#newsletter')} className="chrome-subscribe">{t('Subscribe', 'सदस्यता')}</a></div>
          </>}
        </div>
      </nav>
  </>;
}

function FooterNewsletter() {
  const t = useT();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const subscribe = useSubscribeToNewsletter();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    subscribe.mutate({ data: { email } }, { onSuccess: () => setDone(true) });
  };
  if (done) return <p className="chrome-footer-done" role="status"><Check size={16} /> {t('You are on the list. Sources attached, spin removed.', 'आप सूची में हैं। स्रोत साथ में, लीपापोती हटाकर।')}</p>;
  return <form id="newsletter" className="chrome-footer-form" onSubmit={submit} data-testid="form-footer-newsletter">
    <label htmlFor="footer-email" className="sr-only">{t('Email address', 'ईमेल पता')}</label>
    <input id="footer-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" lang="en" />
    <button type="submit" disabled={subscribe.isPending}>{subscribe.isPending ? t('Sending…', 'भेज रहे हैं…') : t('Get the briefing', 'ब्रीफ़िंग पाएँ')} <Send size={14} /></button>
    {subscribe.isError && <p className="chrome-footer-error" role="alert">{t('That address could not be added. Try again.', 'यह पता जोड़ा नहीं जा सका। फिर कोशिश करें।')}</p>}
  </form>;
}

/** One footer for every public page. Rendered once by the app frame, after the page. */
export function SiteFooter() {
  const t = useT();
  const columns: Array<{ heading: string; links: Array<[string, string]> }> = [
    { heading: t('Topic files', 'विषय फ़ाइलें'), links: [...DESKS.map((desk) => [`/topics/${encodeURIComponent(desk)}`, t(desk, DESK_HI[desk])] as [string, string]), ['/topics/open-category-competition', t('Open-category competition', 'खुली श्रेणी की प्रतिस्पर्धा')]] },
    { heading: t('Read', 'पढ़ें'), links: [['/', t('Latest reporting', 'ताज़ा रिपोर्टिंग')], ['/opinion', t('Opinion', 'राय')], ['/policies', t('Policy ledger', 'नीति रजिस्टर')], ['/data', t('Data room', 'आंकड़ा कक्ष')], ['/timeline', t('Timeline', 'समयरेखा')], ['/archive', t('Archive', 'अभिलेखागार')]] },
    { heading: t('Use it', 'इस्तेमाल करें'), links: [['/answers', t('Answers: ask the state', 'जवाब: सरकार से पूछिए')], ['/states', t('State by state', 'राज्य-दर-राज्य')], ['/community', t('Community questions', 'समुदाय के सवाल')], ['/events', t('Evidence events', 'सबूत घटनाएँ')], ['/evidence/search', t('Search the evidence', 'सबूतों में खोजें')], ['/search', t('Search everything', 'सब कुछ खोजें')]] },
    { heading: t('The Signal 24', 'द सिग्नल 24'), links: [['/about', t('About us', 'हमारे बारे में')], ['/editorial-standards', t('Editorial standards', 'संपादकीय मानक')], ['/editorial-standards#corrections', t('Corrections', 'सुधार')], ['/methodology', t('Methodology', 'कार्यप्रणाली')], ['/authors/signal-24', t('The editorial desk', 'संपादकीय डेस्क')]] },
  ];
  return <footer className="chrome-footer" data-testid="site-footer">
    <div className="signal-container">
      <div className="chrome-footer-top">
        <div>
          <Link href="/" className="chrome-brand is-footer" lang="en"><BrandMark /><span className="chrome-wordmark">The Signal <span>24</span></span></Link>
          <p className="chrome-footer-motto">{t(<>Power, <em>on the record.</em></>, <>सत्ता, <em>दस्तावेज़ों के आईने में।</em></>)}</p>
          <p className="chrome-footer-about">{t('A public-interest newsroom that reads what India’s governments publish and notices what they don’t. Every record carries its source. Every correction is logged in public. For the people, by the people.', 'एक जनहित न्यूज़रूम, जो पढ़ता है कि भारत की सरकारें क्या छापती हैं, और यह भी देखता है कि क्या नहीं छापतीं। हर रिकॉर्ड के साथ उसका स्रोत। हर सुधार सार्वजनिक रूप से दर्ज। जनता के लिए, जनता की ओर से।')}</p>
        </div>
        <div className="chrome-footer-signup">
          <p className="chrome-footer-heading">{t('The briefing', 'ब्रीफ़िंग')}</p>
          <p className="chrome-footer-pitch">{t('A short note when a court rules, a notification sneaks out, or a promised report goes missing again.', 'जब कोई अदालत फ़ैसला दे, कोई अधिसूचना चुपके से निकले, या कोई वादा की गई रिपोर्ट फिर ग़ायब हो जाए, तब एक छोटा नोट।')}</p>
          <FooterNewsletter />
        </div>
      </div>
      <div className="chrome-footer-columns">
        {columns.map((column) => <nav key={column.heading} aria-label={column.heading}>
          <p className="chrome-footer-heading">{column.heading}</p>
          <ul>{column.links.map(([to, text]) => <li key={to}><Link href={to}>{text}</Link></li>)}</ul>
        </nav>)}
      </div>
      <div className="chrome-footer-bottom">
        <p lang="en">© {new Date().getFullYear()} The Signal 24</p>
        <p>{t('Independent. Source-first. Bilingual.', 'स्वतंत्र। स्रोत पहले। द्विभाषी।')}</p>
        <div className="chrome-footer-bottom-actions"><LanguageSwitch className="chrome-lang is-dark" /><button type="button" className="chrome-top-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={14} /> {t('Back to top', 'ऊपर जाएँ')}</button></div>
      </div>
    </div>
  </footer>;
}

/** Renders the footer on every public route; editor and sign-in screens keep their own frame. */
export function GlobalFooter() {
  const [location] = useLocation();
  if (/^\/(editor|sign-in|sign-up)(\/|$)/.test(location)) return null;
  return <SiteFooter />;
}
