import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';
import { CountUp } from '@/components/count-up';
import type { LocalizedStory } from '@/lib/i18n';
import { useLabel, useLang, useLocalHref, useT } from '@/lib/i18n';
import { daysSince, RUNNING_CLOCKS } from '@/lib/key-figures';
import { illustration, imageForStory, storyPath } from '@/lib/stories';

function dateLabel(value: string | null | undefined, lang: 'en' | 'hi', options: Intl.DateTimeFormatOptions) {
  if (!value) return '';
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { ...options, numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

/**
 * The front page, set like a broadsheet: a dateline rule, the lead record with its
 * art, and the running clocks along the foot. It fills the first screen on desktop
 * and enters once on load (CSS only, removed under reduced motion).
 */
export function HomeFront({ lead, recordCount }: { lead?: LocalizedStory; recordCount: number }) {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const localHref = useLocalHref();
  const today = new Date();
  const art = lead ? imageForStory(lead) : illustration('magnifier-hero');

  return <section className="hf" aria-labelledby="hf-title" data-testid="home-front">
    <div className="signal-container hf-inner">
      <div className="hf-dateline hf-enter" style={{ ['--d' as string]: 0 }}>
        <time dateTime={today.toISOString().slice(0, 10)}>{dateLabel(today.toISOString(), lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</time>
        <span className="hf-dateline-mid">{t(`${recordCount} published records, each linked to its source`, `${recordCount} प्रकाशित रिकॉर्ड, हर एक अपने स्रोत से जुड़ा`)}</span>
        <span className="hf-motto">{t('Power, on the record.', 'सत्ता, दस्तावेज़ों के आईने में।')}</span>
      </div>

      <div className="hf-grid">
        <div className="hf-copy">
          {lead ? <>
            <p className="hf-kicker hf-enter" style={{ ['--d' as string]: 1 }}><span className="hf-kicker-tag">{t('The lead', 'मुख्य ख़बर')}</span>{label(lead.topic)} / {label(lead.kind)}</p>
            <h1 id="hf-title" lang={lead.contentLang} className="hf-title hf-enter" style={{ ['--d' as string]: 2 }} data-testid="heading-hero">
              <Link href={storyPath(lead)} className="hf-title-link">{lead.title}</Link>
            </h1>
            <p lang={lead.contentLang} className="hf-dek hf-enter" style={{ ['--d' as string]: 3 }}>{lead.dek}</p>
            <p className="hf-meta hf-enter" style={{ ['--d' as string]: 3 }}>
              <span>{dateLabel(lead.publishedOn ?? lead.recordDate, lang, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              <span>{t(`${lead.read} min read`, `${lead.read} मिनट`)}</span>
              <span>{t(`${lead.sourceCount ?? 0} sources`, `${lead.sourceCount ?? 0} स्रोत`)}</span>
              <span className="hf-meta-status">{label(lead.verificationStatus)}</span>
            </p>
            <div className="hf-actions hf-enter" style={{ ['--d' as string]: 4 }}>
              <Link href={storyPath(lead)} className="hf-button is-primary" data-testid="link-read-briefing">{t('Read the record', 'पूरा रिकॉर्ड पढ़ें')} <ArrowUpRight size={15} aria-hidden="true" /></Link>
              <a href="#accountability" className="hf-button" data-testid="link-front-withheld">{t('See what is withheld', 'देखिए क्या रोका गया है')} <ArrowDownRight size={15} aria-hidden="true" /></a>
            </div>
          </> : <>
            <p className="hf-kicker hf-enter" style={{ ['--d' as string]: 1 }}>{t('For the people, by the people. Someone has to be.', 'जनता के लिए, जनता की ओर से। किसी को तो होना होगा।')}</p>
            <h1 id="hf-title" className="hf-title hf-enter" style={{ ['--d' as string]: 2 }}>{t('The government has plenty of explanations. We have the documents.', 'सरकार के पास सफ़ाइयाँ बहुत हैं। हमारे पास दस्तावेज़ हैं।')}</h1>
            <p className="hf-dek hf-enter" style={{ ['--d' as string]: 3 }}>{t('We track what India’s governments, courts and commissions promise on reservation and representation, then check what they actually file, publish and quietly forget.', 'आरक्षण और प्रतिनिधित्व पर भारत की सरकारें, अदालतें और आयोग क्या वादा करते हैं, हम इसका हिसाब रखते हैं, और फिर देखते हैं कि वे असल में क्या दर्ज करते हैं, क्या छापते हैं और क्या चुपचाप भूल जाते हैं।')}</p>
            <div className="hf-actions hf-enter" style={{ ['--d' as string]: 4 }}>
              <a href="#accountability" className="hf-button is-primary">{t('See what is withheld', 'देखिए क्या रोका गया है')} <ArrowDownRight size={15} aria-hidden="true" /></a>
              <Link href="/archive" className="hf-button">{t('Browse the archive', 'अभिलेखागार देखें')} <ArrowUpRight size={15} aria-hidden="true" /></Link>
            </div>
          </>}
        </div>

        <figure className={`hf-art hf-enter ${art.kind === 'illustration' ? 'is-illustration' : 'is-photo'}`} style={{ ['--d' as string]: 2 }}>
          {lead
            ? <Link href={storyPath(lead)} tabIndex={-1} aria-hidden="true" className="hf-art-frame"><img src={art.src} alt="" width={art.width} height={art.height} fetchPriority="high" decoding="async" /></Link>
            : <div className="hf-art-frame"><img src={art.src} alt={art.alt} width={art.width} height={art.height} fetchPriority="high" decoding="async" /></div>}
          {/* Editorial rule: an archive photograph is context, never evidence, and says so. */}
          {art.kind === 'photo' && <figcaption className="hf-art-credit">{art.credit} · {t('contextual, not evidence for this record', 'संदर्भ के लिए, इस रिकॉर्ड का सबूत नहीं')}</figcaption>}
        </figure>
      </div>

      <ul className="hf-clocks" aria-label={t('Running clocks', 'चलती घड़ियाँ')}>
        {RUNNING_CLOCKS.map((clock, index) => {
          const body = <>
            <span className="hf-clock-value"><CountUp to={daysSince(clock.since)} /></span>
            <span className="hf-clock-unit">{clock.unit[lang]}</span>
            <span className="hf-clock-label">{clock.label[lang]}</span>
          </>;
          return <li key={clock.id} className="hf-enter" style={{ ['--d' as string]: 5 + index * 0.5 }}>
            {clock.href.startsWith('/#')
              ? <a href={localHref(clock.href)} className="hf-clock" data-testid={`link-front-clock-${clock.id}`}>{body}</a>
              : <Link href={clock.href} className="hf-clock" data-testid={`link-front-clock-${clock.id}`}>{body}</Link>}
          </li>;
        })}
      </ul>
    </div>
  </section>;
}
