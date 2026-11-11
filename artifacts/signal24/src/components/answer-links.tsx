// Answer links shown outside the Answers hub (home page teaser, article footers).
// A separate chunk, so the 35 answers' text loads only where it is shown.
import { useState, type FormEvent } from 'react';
import { ArrowUpRight, HelpCircle, Search } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { ANSWERS, ANSWER_CATEGORIES, ANSWERS_FOR_TOPIC, answerById } from '@/lib/answers';
import { useLang, useT } from '@/lib/i18n';

/** Ask the state: a search box into the Answers hub and the most-needed answers. */
export function AnswersTeaser() {
  const t = useT();
  const lang = useLang();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState('');
  const picks = ['how-to-file-an-rti', 'rti-no-reply', 'creamy-layer', 'stay-vs-struck-down', 'report-caste-discrimination', 'ask-your-mp'].map((id) => ANSWERS.find((answer) => answer.id === id)).filter((answer): answer is (typeof ANSWERS)[number] => Boolean(answer));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const match = ANSWERS.find((answer) => [answer.question.en, answer.question.hi, answer.short.en, answer.short.hi].some((text) => text.toLowerCase().includes(query.trim().toLowerCase())));
    setLocation(match && query.trim() ? `/answers/${match.id}` : '/answers');
  };
  return <section className="hp-answers" aria-labelledby="answers-title">
    <div className="signal-container hp-answers-grid">
      <div>
        <p className="signal-kicker hp-answers-kicker">{t('Answers', 'जवाब')}</p>
        <h2 id="answers-title" className="hp-answers-title">{t(<>Ask the state. <em>Here is what it won’t say plainly.</em></>, <>सरकार से पूछिए। <em>यह रहा जो वह सीधे नहीं कहती।</em></>)}</h2>
        <p className="hp-answers-dek">{t(`${ANSWERS.length} straight answers on RTI, reservation, courts, Parliament and where to complain. Each with the hard truth, the steps, and the official source.`, `आरटीआई, आरक्षण, अदालतों, संसद और शिकायत के ${ANSWERS.length} सीधे जवाब। हर एक कड़वे सच, क़दमों और आधिकारिक स्रोत के साथ।`)}</p>
        <form className="hp-answers-search" onSubmit={submit} role="search">
          <Search size={18} aria-hidden="true" />
          <label htmlFor="home-answers-search" className="sr-only">{t('Search the answers', 'जवाबों में खोजें')}</label>
          <input id="home-answers-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('“RTI appeal”, “creamy layer”, “stay order”…', '“आरटीआई अपील”, “क्रीमी लेयर”, “रोक आदेश”…')} />
          <button type="submit">{t('Find', 'खोजें')}</button>
        </form>
        <div className="hp-answers-areas">{ANSWER_CATEGORIES.map((area) => <Link key={area.id} href={`/answers?area=${area.id}`}>{area.label[lang]}</Link>)}</div>
      </div>
      <ol className="hp-answers-list">
        {picks.map((answer) => <li key={answer.id}><Link href={`/answers/${answer.id}`} className="hp-answer-row"><HelpCircle size={18} aria-hidden="true" /><span>{answer.question[lang]}</span><ArrowUpRight size={16} aria-hidden="true" /></Link></li>)}
      </ol>
    </div>
  </section>;
}

/** "Answers on this": the three answers listed for an article's desk. */
export function TopicAnswers({ topic }: { topic: string }) {
  const t = useT();
  const lang = useLang();
  const items = (ANSWERS_FOR_TOPIC[topic] ?? []).map(answerById).filter((item): item is NonNullable<ReturnType<typeof answerById>> => Boolean(item));
  if (!items.length) return null;
  return <section className="signal-container answer-related article-answers" aria-labelledby="article-answers-title">
    <p id="article-answers-title" className="signal-kicker text-accent">{t('Answers on this', 'इस पर जवाब')}</p>
    <div className="answers-grid mt-4">{items.map((item) => <Link key={item.id} href={`/answers/${item.id}`} className="answer-card is-compact" data-testid={`link-article-answer-${item.id}`}><h3 className="answer-card-q">{item.question[lang]}</h3><p className="answer-card-short">{item.short[lang]}</p><span className="answer-card-more">{t('Read the answer', 'जवाब पढ़िए')} <ArrowUpRight size={14} /></span></Link>)}</div>
  </section>;
}
