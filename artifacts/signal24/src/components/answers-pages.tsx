import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, ExternalLink, MessageCircle, Search } from 'lucide-react';
import { Link, useParams, useSearch } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import { Header } from '@/components/site-chrome';
import { TopicHero } from '@/components/topic-stage';
import NotFound from '@/pages/not-found';
import { ANSWER_CATEGORIES, ANSWERS, ANSWERS_CHECKED_ON, answerById, type AnswerCategory } from '@/lib/answers';
import { useLang, useT } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { answerPageStructuredData, breadcrumbNode, collectionPageNode, organizationRef, siteGraph, webPageNode } from '@/lib/structured-data';
import { PAGE_META } from '@/lib/page-meta';
import { answerDepth } from '@/lib/answers-depth';

function checkedOn(lang: 'en' | 'hi') {
  return new Date(`${ANSWERS_CHECKED_ON}T12:00:00`).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

/** The Answers hub: every answer, searchable, grouped by area. */
export function AnswersPage() {
  const t = useT();
  const lang = useLang();
  const reduce = useReducedMotion() ?? false;
  const search = useSearch();
  const initialCategory = new URLSearchParams(search).get('area') as AnswerCategory | null;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<AnswerCategory | 'all'>(initialCategory && ANSWER_CATEGORIES.some((item) => item.id === initialCategory) ? initialCategory : 'all');
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => ANSWERS.filter((answer) => {
    if (category !== 'all' && answer.category !== category) return false;
    if (!normalized) return true;
    return [answer.question.en, answer.question.hi, answer.short.en, answer.short.hi, answer.truth.en, answer.truth.hi].some((text) => text.toLowerCase().includes(normalized));
  }), [category, normalized]);
  const title = t(PAGE_META.answers.title.en, PAGE_META.answers.title.hi);
  const description = t(PAGE_META.answers.description.en, PAGE_META.answers.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: '/answers',
    structuredData: siteGraph(
      collectionPageNode('/answers', { name: title, description, publisher: organizationRef }, ANSWERS.map((answer) => ({ url: `/answers/${answer.id}`, name: answer.question[lang] }))),
      {
        '@type': 'FAQPage',
        '@id': '/answers#faq',
        mainEntity: ANSWERS.map((answer) => ({ '@type': 'Question', name: answer.question[lang], acceptedAnswer: { '@type': 'Answer', text: answer.short[lang] } })),
      },
      breadcrumbNode('/answers', [[t('Answers', 'जवाब'), '/answers']]),
    ),
  });
  return <main className="signal-page">
    <Header />
    <TopicHero
      kicker={t('The Signal 24 / answers', 'द सिग्नल 24 / जवाब')}
      headline={t('Ask the state.', 'सरकार से पूछिए।')}
      accent={t('Here is what it won’t say plainly.', 'यह रहा जो वह सीधे नहीं कहती।')}
      standfirst={t('Straight answers to the questions people actually ask about the Indian government: how to make it show you its files, who decides who gets reservation, what a court order really means, and where to go when the system fails you. Every answer has the hard truth, the steps, and the official source.', 'भारत सरकार के बारे में लोग जो असल में पूछते हैं, उनके सीधे जवाब: उससे उसकी फ़ाइलें कैसे दिखवाएँ, आरक्षण कौन तय करता है, किसी अदालती आदेश का असल मतलब क्या है, और जब व्यवस्था साथ न दे तो कहाँ जाएँ। हर जवाब में कड़वा सच, क़दम, और आधिकारिक स्रोत।')}
      stats={[
        { value: ANSWERS.length, label: t('Answers', 'जवाब') },
        { value: ANSWER_CATEGORIES.length, label: t('Areas', 'क्षेत्र') },
        { value: new Set(ANSWERS.flatMap((answer) => answer.sources.map((source) => source.url))).size, label: t('Official sources', 'आधिकारिक स्रोत') },
      ]}
      illustration="magnifier-hero"
      illustrationAlt={t('Illustration: a magnifying glass over government filings, next to a pile of press releases', 'चित्रण: सरकारी दस्तावेज़ों पर आवर्धक लेंस, पास में प्रेस विज्ञप्तियों का ढेर')}
      exhibits={ANSWERS.slice(0, 2).map((answer) => ({ title: answer.question[lang], meta: ANSWER_CATEGORIES.find((item) => item.id === answer.category)?.label[lang] ?? '' }))}
    />
    <section className="signal-container answers-toolbar" aria-label={t('Find an answer', 'जवाब खोजें')}>
      <label className="answers-search">
        <Search size={20} aria-hidden="true" />
        <span className="sr-only">{t('Search the answers', 'जवाबों में खोजें')}</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Try “RTI appeal”, “creamy layer”, “stay order”…', '“आरटीआई अपील”, “क्रीमी लेयर”, “रोक आदेश” खोजिए…')} data-testid="input-answers-search" />
      </label>
      <div className="answers-chips" role="group" aria-label={t('Areas', 'क्षेत्र')}>
        <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{t('All', 'सभी')} <span>{ANSWERS.length}</span></button>
        {ANSWER_CATEGORIES.map((item) => <button key={item.id} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)} data-testid={`button-answers-area-${item.id}`}>{item.label[lang]} <span>{ANSWERS.filter((answer) => answer.category === item.id).length}</span></button>)}
      </div>
    </section>
    <section className="signal-container mt-10" aria-live="polite">
      {results.length === 0 ? <div className="answers-empty">
        <p className="font-display text-3xl">{t('No answer yet. That’s a question worth asking.', 'अभी कोई जवाब नहीं। यह पूछने लायक सवाल है।')}</p>
        <Link href={`/community?ask=${encodeURIComponent(query)}`} className="signal-button mt-5 inline-flex">{t('Ask the community', 'समुदाय से पूछिए')}</Link>
      </div> : ANSWER_CATEGORIES.filter((group) => results.some((answer) => answer.category === group.id)).map((group) => <div key={group.id} className="answers-group">
        <div className="answers-group-head"><h2 className="font-display text-3xl sm:text-4xl">{group.label[lang]}</h2><p className="text-sm text-muted-foreground">{group.blurb[lang]}</p></div>
        <div className="answers-grid">
          {results.filter((answer) => answer.category === group.id).map((answer, index) => <motion.div key={answer.id} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 3) * 0.06, duration: 0.5 }}>
            <Link href={`/answers/${answer.id}`} className="answer-card" data-testid={`link-answer-${answer.id}`}>
              <h3 className="answer-card-q">{answer.question[lang]}</h3>
              <p className="answer-card-short">{answer.short[lang]}</p>
              <p className="answer-card-truth"><span>{t('The hard truth', 'कड़वा सच')}</span> {answer.truth[lang]}</p>
              <span className="answer-card-more">{t('Full answer and steps', 'पूरा जवाब और क़दम')} <ArrowUpRight size={14} /></span>
            </Link>
          </motion.div>)}
        </div>
      </div>)}
    </section>
    <section className="signal-container mt-16">
      <div className="answers-cta">
        <MessageCircle size={28} aria-hidden="true" />
        <div><h2 className="font-display text-3xl leading-tight">{t('Didn’t find your question?', 'आपका सवाल नहीं मिला?')}</h2><p className="mt-2 text-sm leading-relaxed opacity-80">{t('Ask it in the community room, anonymously. Others who have been through it can answer, and the desk turns the best questions into new answers.', 'उसे समुदाय कक्ष में, गुमनाम रूप से, पूछिए। जो इससे गुज़र चुके हैं वे जवाब दे सकते हैं, और डेस्क सबसे अच्छे सवालों को नए जवाबों में बदलता है।')}</p></div>
        <Link href="/community?ask=" className="answers-cta-button">{t('Ask a question', 'सवाल पूछिए')} <ArrowUpRight size={15} /></Link>
      </div>
      <p className="mt-4 signal-kicker text-muted-foreground">{t('Answers last checked', 'जवाबों की आख़िरी जाँच')} {checkedOn(lang)} · {t('Statutory details restate the Acts and official portals linked in each answer.', 'क़ानूनी ब्योरे हर जवाब में दिए अधिनियमों और आधिकारिक पोर्टलों से लिए गए हैं।')}</p>
    </section>
  </main>;
}

/** One answer: the short answer, the hard truth, what you can do, and the sources. */
export function AnswerDetailPage() {
  const t = useT();
  const lang = useLang();
  const params = useParams<{ id?: string }>();
  const answer = answerById(params.id);
  const category = ANSWER_CATEGORIES.find((item) => item.id === answer?.category);
  const path = `/answers/${params.id ?? ''}`;
  const name = answer ? `${answer.question[lang]} — ${t('The Signal 24', 'द सिग्नल 24')}` : t('Answer — The Signal 24', 'जवाब — द सिग्नल 24');
  // An unknown id renders NotFound, whose effect runs first; keep its not-found tags.
  useSeo({
    title: answer ? name : t(PAGE_META.notFound.title.en, PAGE_META.notFound.title.hi),
    description: answer?.short[lang] ?? PAGE_META.notFound.description.en,
    canonicalPath: answer ? path : undefined,
    robots: answer ? 'index, follow' : 'noindex, nofollow',
    structuredData: answer ? answerPageStructuredData(answer, lang) : undefined,
  });
  if (!answer || !category) return <NotFound />;
  const depth = answerDepth(answer.id);
  const related = (answer.related ?? []).map(answerById).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <main className="signal-page">
    <Header />
    <article className="signal-container answer-detail">
      <nav className="article-crumbs" aria-label={t('Breadcrumb', 'ब्रेडक्रंब')}><Link href="/answers"><ArrowLeft size={12} className="mr-1 inline" />{t('Answers', 'जवाब')}</Link><span aria-hidden="true">/</span><Link href={`/answers?area=${category.id}`}>{category.label[lang]}</Link></nav>
      <h1 className="answer-detail-q">{answer.question[lang]}</h1>
      <div className="answer-detail-grid">
        <div>
          <section className="answer-block is-short" aria-labelledby="short-answer"><p id="short-answer" className="answer-block-label">{t('The short answer', 'सीधा जवाब')}</p><p className="answer-block-text">{answer.short[lang]}</p></section>
          <section className="answer-block is-truth" aria-labelledby="hard-truth"><p id="hard-truth" className="answer-block-label">{t('The hard truth', 'कड़वा सच')}</p><p className="answer-block-text">{answer.truth[lang]}</p></section>
          {depth && <section className="answer-block is-law" aria-labelledby="what-the-law-says"><p id="what-the-law-says" className="answer-block-label">{t('What the law actually says', 'क़ानून असल में क्या कहता है')}</p><p className="answer-block-text">{depth.law[lang]}</p></section>}
          <section className="record-panel is-check" aria-labelledby="what-you-can-do"><p id="what-you-can-do" className="record-panel-title">{t('What you can do', 'आप क्या कर सकते हैं')}</p><ol>{answer.steps[lang].map((step, index) => <li key={step}><span className="record-panel-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{step}</span></li>)}</ol></section>
          {depth && <section className="record-panel is-questions" aria-labelledby="caught-out"><p id="caught-out" className="record-panel-title">{t('Where people get caught out', 'लोग कहाँ चूक जाते हैं')}</p><ol>{depth.mistakes[lang].map((item, index) => <li key={item}><span className="record-panel-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span>{item}</span></li>)}</ol></section>}
        </div>
        <aside className="answer-detail-rail">
          <p className="article-rail-heading">{t('Official sources', 'आधिकारिक स्रोत')}</p>
          <ul className="answer-sources">{answer.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" lang="en">{source.name} <ExternalLink size={12} /></a></li>)}</ul>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t('Last checked', 'आख़िरी जाँच')} {checkedOn(lang)}. {t('Fees, deadlines and portals change; the official source is the final word.', 'शुल्क, समय-सीमाएँ और पोर्टल बदलते हैं; अंतिम शब्द आधिकारिक स्रोत का है।')}</p>
          <Link href={`/community?ask=${encodeURIComponent(answer.question[lang])}`} className="article-rail-cta">{t('Ask a follow-up, anonymously', 'आगे का सवाल पूछिए, गुमनाम रूप से')} <ArrowUpRight size={14} /></Link>
        </aside>
      </div>
      {related.length > 0 && <section className="answer-related"><p className="signal-kicker text-accent">{t('Related answers', 'जुड़े जवाब')}</p><div className="answers-grid mt-4">{related.map((item) => <Link key={item.id} href={`/answers/${item.id}`} className="answer-card is-compact"><h3 className="answer-card-q">{item.question[lang]}</h3><span className="answer-card-more">{t('Read', 'पढ़ें')} <ArrowUpRight size={14} /></span></Link>)}</div></section>}
    </article>
  </main>;
}
