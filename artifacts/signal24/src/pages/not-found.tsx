import { useEffect } from 'react';
import { ArrowLeft, Radio } from 'lucide-react';
import { useT, useLocalHref } from '@/lib/i18n';

export default function NotFound() {
  const t = useT();
  const href = useLocalHref();
  useEffect(() => {
    document.title = t('Page not found — The Signal 24', 'पेज नहीं मिला — द सिग्नल 24');
    const updateMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
      let meta = document.head.querySelector<HTMLMetaElement>(selector);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    updateMeta('meta[name="description"]', 'name', 'description', 'The requested page could not be found on The Signal 24.');
    updateMeta('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
    updateMeta('meta[property="og:title"]', 'property', 'og:title', 'Page not found — The Signal 24');
    updateMeta('meta[property="og:description"]', 'property', 'og:description', 'The requested page could not be found on The Signal 24.');
    document.head.querySelectorAll('link[rel="canonical"]').forEach((element) => element.remove());
  }, [t]);

  return (
    <main className="signal-page min-h-[100dvh]">
      <div className="signal-container flex min-h-[100dvh] items-center justify-center py-16">
        <section className="w-full max-w-xl border-y border-foreground/20 py-12 sm:py-16">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-accent text-accent"><Radio size={17} /></span>
            <p className="signal-kicker text-accent">{t('Page not found', 'पेज नहीं मिला')}</p>
          </div>
          <h1 className="mt-7 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">{t(<>No record<br /><em className="font-normal text-accent">at this address.</em></>, <>इस पते पर<br /><em className="font-normal text-accent">कोई रिकॉर्ड नहीं।</em></>)}</h1>
          <p className="mt-7 max-w-md text-sm leading-relaxed text-muted-foreground">{t('The link may be wrong, or the record may have moved. Nothing is deleted from the record without a note saying so.', 'लिंक ग़लत हो सकता है, या रिकॉर्ड हट गया हो सकता है। रिकॉर्ड से कुछ भी बिना सूचना के नहीं हटाया जाता।')}</p>
          <a href={href('/')} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-[.68rem] font-bold uppercase tracking-[.13em] text-primary-foreground">
            <ArrowLeft size={14} /> {t('Back to the front page', 'पहले पन्ने पर लौटें')}
          </a>
        </section>
      </div>
    </main>
  );
}