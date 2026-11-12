import { useMemo, useState, type FormEvent } from 'react';
import { ArrowUpRight, HelpCircle, MessageCircle, Search } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import {
  getGetCommunityPostsQueryKey,
  getGetEvidenceEventsQueryKey,
  getGetPoliciesQueryKey,
  useGetCommunityPosts,
  useGetEvidenceEvents,
  useGetPolicies,
  type GetCommunityPostsParams,
  type GetPoliciesParams,
} from '@workspace/api-client-react';
import { localizePolicy, useLabel, useLang, useT, type LocalizedStory } from '@/lib/i18n';
import { basePath } from '@/lib/seo';
import { TOPIC_BRIEFS, type TopicKey } from '@/lib/topic-briefs';


export function SectionHead({ kicker, title, link, linkLabel, id }: { kicker: string; title: React.ReactNode; link?: string; linkLabel?: string; id?: string }) {
  return <div className="hp-head">
    <div><p className="signal-kicker text-accent">{kicker}</p><h2 id={id} className="hp-title">{title}</h2></div>
    {link && linkLabel && (link.startsWith('#') ? <a href={link} className="hp-head-link">{linkLabel} <ArrowUpRight size={14} /></a> : <Link href={link} className="hp-head-link">{linkLabel} <ArrowUpRight size={14} /></Link>)}
  </div>;
}

const DESKS: TopicKey[] = ['Latest', 'Courts & Policy', 'States', 'History', 'Ground Reports', 'Data & Notes'];

/** Six desks as a strip: each with its brief line, record count and latest headline. */
export function DeskStrip({ stories }: { stories: LocalizedStory[] }) {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  return <section className="signal-container hp-section" aria-labelledby="desks-title">
    <SectionHead id="desks-title" kicker={t('Read by desk', 'डेस्क के हिसाब से पढ़िए')} title={t(<>Six desks. <em>One rule: show the document.</em></>, <>छह डेस्क। <em>एक नियम: दस्तावेज़ दिखाओ।</em></>)} link="/topics" linkLabel={t('All topic files', 'सभी विषय फ़ाइलें')} />
    <div className="hp-desks">
      {DESKS.map((desk) => {
        const records = stories.filter((story) => story.topic === desk);
        const brief = TOPIC_BRIEFS[desk];
        return <div key={desk}>
          <Link href={`/topics/${encodeURIComponent(desk)}`} className="hp-desk" data-testid={`link-home-desk-${desk.replace(/\W+/g, '-').toLowerCase()}`}>
            <img src={`${basePath}/illustrations/${brief.illustration}.svg`} alt="" width={1600} height={900} loading="lazy" decoding="async" />
            <span className="hp-desk-count">{t(`${records.length} records`, `${records.length} रिकॉर्ड`)}</span>
            <span className="hp-desk-name">{label(desk)}</span>
            <span className="hp-desk-brief">{brief.headline[lang]} {brief.accent[lang]}</span>
            {records[0] && <span lang={records[0].contentLang} className="hp-desk-latest">{records[0].title}</span>}
          </Link>
        </div>;
      })}
    </div>
  </section>;
}

/** Three most recent policy changes, each with its status and court outcome. */
export function LedgerTrio() {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const params = useMemo<GetPoliciesParams>(() => ({ limit: 3 }), []);
  const { data } = useGetPolicies(params, { query: { queryKey: getGetPoliciesQueryKey(params), staleTime: 60_000 } });
  const records = (data?.records ?? []).map((record) => localizePolicy(record, lang));
  if (records.length === 0) return null;
  return <section className="signal-container hp-section" aria-labelledby="ledger-title">
    <SectionHead id="ledger-title" kicker={t('Policy ledger', 'नीति रजिस्टर')} title={t(<>What changed, who decided, <em>and did it survive court?</em></>, <>क्या बदला, किसने तय किया, <em>और क्या वह अदालत में टिका?</em></>)} link="/policies" linkLabel={t('The full ledger', 'पूरा रजिस्टर')} />
    <div className="hp-ledger">
      {records.map((record) => <Link key={record.slug} href={record.canonicalPath} className="hp-ledger-card group" lang={record.contentLang} data-testid="link-home-policy-record">
        <div className="flex flex-wrap items-center justify-between gap-2"><span className={`topic-policy-status is-${record.status.replace(/\s+/g, '-')}`}>{label(record.status)}</span><span className="signal-kicker text-muted-foreground">{label(record.state ?? 'National')}</span></div>
        <h3 className="hp-ledger-title group-hover:text-accent">{record.title}</h3>
        <div className="hp-ledger-shift"><div><p className="hp-ledger-label">{t('Before', 'पहले')}</p><p>{record.previousFramework}</p></div><div><p className="hp-ledger-label is-now">{t('In court', 'अदालत में')}</p><p>{record.courtStatus}</p></div></div>
      </Link>)}
    </div>
  </section>;
}

/** Seventy-five years of dated events, oldest to newest, as a horizontal strip. */
export function TimelineStrip() {
  const t = useT();
  const lang = useLang();
  const params = useMemo(() => ({ limit: 100 }), []);
  const { data } = useGetEvidenceEvents(params, { query: { queryKey: getGetEvidenceEventsQueryKey(params), staleTime: 60_000 } });
  const events = (data?.events ?? []).filter((item) => item.event.recordDate).sort((a, b) => (a.event.recordDate ?? '').localeCompare(b.event.recordDate ?? ''));
  if (events.length === 0) return null;
  return <section className="hp-section" aria-labelledby="strip-title">
    <div className="signal-container"><SectionHead id="strip-title" kicker={t('The record, in order', 'रिकॉर्ड, क्रम से')} title={t(<>Seventy-five years. <em>Scroll through them.</em></>, <>पचहत्तर साल। <em>इन्हें स्क्रॉल कीजिए।</em></>)} link="/timeline" linkLabel={t('Full timeline', 'पूरी समयरेखा')} /></div>
    <div className="hp-strip" tabIndex={0} aria-label={t('Dated events, oldest first; scroll sideways', 'तारीख़वार घटनाएँ, सबसे पुरानी पहले; बगल में स्क्रॉल कीजिए')}>
      <ol className="hp-strip-track">
        {events.map((item) => <li key={item.event.id} className="hp-strip-item">
          <span className="hp-strip-year">{item.event.recordDate?.slice(0, 4)}</span>
          <span className="hp-strip-dot" aria-hidden="true" />
          <Link href={`/events/${item.event.id}`} className="hp-strip-card">
            <time className="hp-strip-date" dateTime={item.event.recordDate ?? undefined}>{new Date(`${item.event.recordDate}T12:00:00`).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions)}</time>
            <span lang="en" className="hp-strip-title">{item.event.title}</span>
          </Link>
        </li>)}
      </ol>
    </div>
  </section>;
}

/** The latest community questions, and an anonymous way in. */
export function CommunityTeaser() {
  const t = useT();
  const lang = useLang();
  const params = useMemo<GetCommunityPostsParams>(() => ({ sort: 'trending', limit: 4 }), []);
  const { data } = useGetCommunityPosts(params, { query: { queryKey: getGetCommunityPostsQueryKey(params), staleTime: 30_000 } });
  const posts = data?.posts ?? [];
  const prompts = [
    { en: 'Have you filed an RTI for caste-wise representation data? What came back?', hi: 'क्या आपने जाति-वार प्रतिनिधित्व के आंकड़ों के लिए आरटीआई दाख़िल की? जवाब में क्या मिला?' },
    { en: 'Has a certificate date or format ever cost you a seat or a job?', hi: 'क्या प्रमाणपत्र की तारीख़ या प्रारूप के कारण कभी आपकी सीट या नौकरी गई?' },
    { en: 'What should Census 2027 publish for you to trust its caste tables?', hi: 'जनगणना 2027 को क्या प्रकाशित करना चाहिए कि आप उसकी जाति तालिकाओं पर भरोसा करें?' },
  ];
  return <section className="signal-container hp-section" aria-labelledby="community-title">
    <div className="hp-community">
      <div>
        <p className="signal-kicker text-accent">{t('The people’s floor', 'जनता का मंच')}</p>
        <h2 id="community-title" className="hp-title">{t(<>Ask anything. <em>Name nobody.</em></>, <>कुछ भी पूछिए। <em>किसी का नाम नहीं।</em></>)}</h2>
        <p className="mt-4 max-w-md text-[.98rem] leading-relaxed text-muted-foreground">{t('Questions about the government, answered by people who have been through it. Anonymous by default: no account, no email. Hard on institutions, never on communities.', 'सरकार के बारे में सवाल, उन लोगों के जवाबों के साथ जो इससे गुज़रे हैं। डिफ़ॉल्ट रूप से गुमनाम: न खाता, न ईमेल। संस्थाओं पर सख़्त, समुदायों पर कभी नहीं।')}</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href="/community#ask" className="signal-button">{t('Ask anonymously', 'गुमनाम रूप से पूछिए')}</Link><Link href="/community" className="signal-button is-ghost">{t('Read the floor', 'मंच पढ़िए')}</Link></div>
      </div>
      <div className="grid gap-3">
        {posts.length > 0 ? posts.map((post) => <Link key={post.id} href={`/community/${post.id}`} className="hp-community-row">
          <span className={`cm-kind-badge is-${post.kind === 'question' ? 'question' : 'discussion'}`}>{post.kind === 'question' ? t('Question', 'सवाल') : t('Discussion', 'चर्चा')}</span>
          <span className="hp-community-title">{post.title}</span>
          <span className="hp-community-meta">{post.authorName} · {t(`${post.replyCount} answers`, `${post.replyCount} जवाब`)} · {t(`${post.likeCount} votes`, `${post.likeCount} वोट`)}</span>
        </Link>) : prompts.map((prompt) => <Link key={prompt.en} href={`/community?ask=${encodeURIComponent(lang === 'hi' ? prompt.hi : prompt.en)}`} className="hp-community-row is-prompt">
          <span className="hp-community-meta"><MessageCircle size={13} className="mr-1 inline" />{t('Prompt from the desk · be the first to answer', 'डेस्क का सवाल · सबसे पहले जवाब दीजिए')}</span>
          <span className="hp-community-title">{lang === 'hi' ? prompt.hi : prompt.en}</span>
        </Link>)}
      </div>
    </div>
  </section>;
}
