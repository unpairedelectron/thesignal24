// "Check it yourself" tools and the glossary. One lazy chunk, loaded only on these pages.
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, CheckCircle2, ExternalLink, HelpCircle, RotateCcw, XCircle } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { Header } from '@/components/site-chrome';
import { WhatsAppShare } from '@/components/share';
import NotFound from '@/pages/not-found';
import { answerById } from '@/lib/answers';
import { GLOSSARY_CHECKED_ON, glossarySorted, termsIn } from '@/lib/glossary';
import { useLang, useT } from '@/lib/i18n';
import { PAGE_META } from '@/lib/page-meta';
import { useSeo } from '@/lib/seo';
import { glossaryStructuredData, toolPageStructuredData, toolsHubStructuredData } from '@/lib/structured-data';
import { evaluateCheck, TOOLS, TOOLS_CHECKED_ON, toolById, toolTitle, type Category, type CheckAnswer, type CheckTool, type GuideTool, type Purpose, type ToolSource } from '@/lib/tools';

function formatChecked(date: string, lang: 'en' | 'hi') {
  return new Date(`${date}T12:00:00`).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

function Sources({ sources }: { sources: ToolSource[] }) {
  return <ul className="answer-sources">{sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer" lang="en">{source.name} <ExternalLink size={12} /></a></li>)}</ul>;
}

function RelatedAnswers({ ids }: { ids: string[] }) {
  const t = useT();
  const lang = useLang();
  const items = ids.map(answerById).filter((item): item is NonNullable<typeof item> => Boolean(item));
  if (!items.length) return null;
  return <section className="answer-related"><p className="signal-kicker text-accent">{t('Read the full answers', 'पूरे जवाब पढ़िए')}</p><div className="answers-grid mt-4">{items.map((item) => <Link key={item.id} href={`/answers/${item.id}`} className="answer-card is-compact"><h3 className="answer-card-q">{item.question[lang]}</h3><span className="answer-card-more">{t('Read', 'पढ़ें')} <ArrowUpRight size={14} /></span></Link>)}</div></section>;
}

/** /tools: the three checks. */
export function ToolsPage() {
  const t = useT();
  const lang = useLang();
  const title = t(PAGE_META.tools.title.en, PAGE_META.tools.title.hi);
  const description = t(PAGE_META.tools.description.en, PAGE_META.tools.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: '/tools',
    structuredData: toolsHubStructuredData(lang, { title, description }, TOOLS.map((tool) => ({ url: `/tools/${tool.id}`, name: tool.title[lang] }))),
  });
  return <main className="signal-page">
    <Header />
    <section className="signal-container answer-detail">
      <p className="signal-kicker text-accent">{t('Check it yourself', 'ख़ुद जाँचिए')}</p>
      <h1 className="answer-detail-q">{t('The rules decide. Here they are, one question at a time.', 'नियम फ़ैसला करते हैं। ये रहे, एक-एक सवाल करके।')}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{description}</p>
      <div className="answers-grid mt-10">{TOOLS.map((tool) => <Link key={tool.id} href={`/tools/${tool.id}`} className="answer-card" data-testid={`link-tool-${tool.id}`}><h2 className="answer-card-q">{tool.title[lang]}</h2><p className="answer-card-short">{tool.description[lang]}</p><span className="answer-card-more">{t('Start', 'शुरू करें')} <ArrowUpRight size={14} /></span></Link>)}</div>
      <p className="mt-8 text-sm text-muted-foreground">{t('Also see the', 'यह भी देखिए:')} <Link href="/glossary" className="signal-link text-accent">{t('glossary of terms', 'शब्दावली')}</Link> {t('and the', 'और')} <Link href="/answers" className="signal-link text-accent">{t('Answers', 'जवाब')}</Link>.</p>
    </section>
  </main>;
}

/** /tools/:id */
export function ToolPage() {
  const t = useT();
  const lang = useLang();
  const params = useParams<{ id?: string }>();
  const tool = toolById(params.id);
  const path = `/tools/${params.id ?? ''}`;
  useSeo({
    title: tool ? toolTitle(tool, lang) : t(PAGE_META.notFound.title.en, PAGE_META.notFound.title.hi),
    description: tool?.description[lang] ?? PAGE_META.notFound.description.en,
    canonicalPath: tool ? path : undefined,
    robots: tool ? 'index, follow' : 'noindex, nofollow',
    structuredData: tool ? toolPageStructuredData(path, lang, toolTitle(tool, lang), tool.description[lang], tool.title[lang]) : undefined,
  });
  if (!tool) return <NotFound />;
  return <main className="signal-page">
    <Header />
    <article className="signal-container answer-detail">
      <nav className="article-crumbs" aria-label={t('Breadcrumb', 'ब्रेडक्रंब')}><Link href="/tools"><ArrowLeft size={12} className="mr-1 inline" />{t('Tools', 'टूल')}</Link></nav>
      <h1 className="answer-detail-q">{tool.title[lang]}</h1>
      <div className="answer-detail-grid">
        <div>
          <section className="answer-block is-short"><p className="answer-block-label">{t('How it works', 'यह कैसे काम करता है')}</p><p className="answer-block-text">{tool.intro[lang]}</p></section>
          {tool.kind === 'check' ? <CheckRunner tool={tool} /> : <GuideRunner tool={tool} />}
          <section className="answer-block is-law"><p className="answer-block-label">{t('What the rules say', 'नियम क्या कहते हैं')}</p><p className="answer-block-text">{tool.basis[lang]}</p></section>
          <ul className="tool-caveats">{tool.caveats.map((item) => <li key={item.en}>{item[lang]}</li>)}</ul>
        </div>
        <aside className="answer-detail-rail">
          <p className="article-rail-heading">{t('Official sources', 'आधिकारिक स्रोत')}</p>
          <Sources sources={tool.sources} />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t('Rules last checked', 'नियमों की आख़िरी जाँच')} {formatChecked(TOOLS_CHECKED_ON, lang)}. {t('Nothing you enter leaves your device.', 'आप जो भी भरते हैं, वह आपके डिवाइस से बाहर नहीं जाता।')}</p>
          <div className="mt-5"><WhatsAppShare title={tool.title[lang]} summary={tool.description[lang]} path={path} testId={`link-share-whatsapp-${tool.id}`} /></div>
        </aside>
      </div>
      <RelatedAnswers ids={tool.answers} />
    </article>
  </main>;
}

function CheckRunner({ tool }: { tool: CheckTool }) {
  const t = useT();
  const lang = useLang();
  const [answers, setAnswers] = useState<Partial<Record<string, CheckAnswer>>>({});
  const outcome = evaluateCheck(tool, answers);
  // Show questions up to the first unanswered one, and none after an excluding answer.
  const visible = useMemo(() => {
    const list = [];
    for (const question of tool.questions) {
      list.push(question);
      const answer = answers[question.id];
      if (!answer || answer === question.excludesOn) break;
    }
    return list;
  }, [answers, tool.questions]);
  const choose = (id: string, value: CheckAnswer) => setAnswers((current) => {
    // Changing an earlier answer clears the ones after it, which may no longer apply.
    const index = tool.questions.findIndex((question) => question.id === id);
    const next: Partial<Record<string, CheckAnswer>> = {};
    tool.questions.slice(0, index).forEach((question) => { next[question.id] = current[question.id]; });
    next[id] = value;
    return next;
  });
  const options = (unsure: boolean): Array<[CheckAnswer, string]> => [['yes', t('Yes', 'हाँ')], ['no', t('No', 'नहीं')], ...(unsure ? [['unsure', t('Not sure', 'पता नहीं')] as [CheckAnswer, string]] : [])];
  return <section className="tool-runner" aria-label={t('The check', 'जाँच')}>
    <ol className="tool-questions">
      {visible.map((question, index) => <li key={question.id} className="tool-q">
        <p className="tool-q-number" aria-hidden="true">{String(index + 1).padStart(2, '0')} / {String(tool.questions.length).padStart(2, '0')}</p>
        <fieldset>
          <legend className="tool-q-text">{question.text[lang]}</legend>
          {question.help && <p className="tool-q-help">{question.help[lang]}</p>}
          <div className="tool-options">{options(Boolean(question.unsure)).map(([value, label]) => <label key={value} className={`tool-option${answers[question.id] === value ? ' is-chosen' : ''}`}>
            <input type="radio" name={`${tool.id}-${question.id}`} value={value} checked={answers[question.id] === value} onChange={() => choose(question.id, value)} data-testid={`radio-${question.id}-${value}`} />
            <span>{label}</span>
          </label>)}</div>
        </fieldset>
      </li>)}
    </ol>
    <div aria-live="polite">
      {outcome.state === 'excluded' && <div className="tool-result is-no" data-testid="tool-result"><p className="tool-result-head"><XCircle size={20} aria-hidden="true" /> {t('Result', 'नतीजा')}</p><p className="tool-result-text">{tool.excluded[lang]}</p><p className="tool-result-why"><strong>{t('Why:', 'क्यों:')}</strong> {outcome.question.exclusion[lang]}</p></div>}
      {outcome.state === 'unsure' && <div className="tool-result is-unsure" data-testid="tool-result"><p className="tool-result-head"><HelpCircle size={20} aria-hidden="true" /> {t('Check this first', 'पहले यह जाँचिए')}</p><ul className="tool-result-list">{outcome.questions.map((question) => <li key={question.id}>{question.unsure?.[lang] ?? question.text[lang]}</li>)}</ul><p className="tool-result-why">{t('Nothing else in your answers rules you out.', 'आपके बाक़ी जवाबों में कुछ भी आपको बाहर नहीं करता।')}</p></div>}
      {outcome.state === 'clear' && <div className="tool-result is-yes" data-testid="tool-result"><p className="tool-result-head"><CheckCircle2 size={20} aria-hidden="true" /> {t('Result', 'नतीजा')}</p><p className="tool-result-text">{tool.clear[lang]}</p></div>}
      {Object.keys(answers).length > 0 && <button type="button" className="tool-reset" onClick={() => setAnswers({})} data-testid="button-tool-reset"><RotateCcw size={13} /> {t('Start again', 'फिर से शुरू करें')}</button>}
    </div>
  </section>;
}

function GuideRunner({ tool }: { tool: GuideTool }) {
  const t = useT();
  const lang = useLang();
  const [category, setCategory] = useState<Category | null>(null);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const advice = category && purpose ? tool.advice(category, purpose) : null;
  const toolFor = category === 'obc' ? 'creamy-layer-check' : category === 'ews' ? 'ews-check' : null;
  return <section className="tool-runner" aria-label={t('The guide', 'गाइड')}>
    <ol className="tool-questions">
      <li className="tool-q"><p className="tool-q-number" aria-hidden="true">01 / 02</p><fieldset><legend className="tool-q-text">{t('Which category are you applying under?', 'आप किस श्रेणी के तहत आवेदन कर रहे हैं?')}</legend><div className="tool-options">{tool.categories.map((item) => <label key={item.id} className={`tool-option${category === item.id ? ' is-chosen' : ''}`}><input type="radio" name="category" value={item.id} checked={category === item.id} onChange={() => setCategory(item.id)} data-testid={`radio-category-${item.id}`} /><span>{item.label[lang]}</span></label>)}</div></fieldset></li>
      {category && <li className="tool-q"><p className="tool-q-number" aria-hidden="true">02 / 02</p><fieldset><legend className="tool-q-text">{t('What are you applying for?', 'आप किसके लिए आवेदन कर रहे हैं?')}</legend><div className="tool-options">{tool.purposes.map((item) => <label key={item.id} className={`tool-option${purpose === item.id ? ' is-chosen' : ''}`}><input type="radio" name="purpose" value={item.id} checked={purpose === item.id} onChange={() => setPurpose(item.id)} data-testid={`radio-purpose-${item.id}`} /><span>{item.label[lang]}</span></label>)}</div></fieldset></li>}
    </ol>
    <div aria-live="polite">{advice && <div className="tool-result is-yes" data-testid="tool-result">
      <p className="tool-result-head"><CheckCircle2 size={20} aria-hidden="true" /> {t('Ask for', 'यह माँगिए')}</p>
      <p className="tool-result-text">{advice.name[lang]}</p>
      <p className="tool-result-why"><strong>{t('Who issues it:', 'कौन जारी करता है:')}</strong> {advice.issuer[lang]}</p>
      <p className="tool-result-subhead">{t('Before you apply', 'आवेदन से पहले')}</p>
      <ul className="tool-result-list">{advice.checks.map((item) => <li key={item.en}>{item[lang]}</li>)}</ul>
      {toolFor && <Link href={`/tools/${toolFor}`} className="tool-result-link">{toolFor === 'ews-check' ? t('Run the EWS check', 'ईडब्ल्यूएस जाँच कीजिए') : t('Run the creamy-layer check', 'क्रीमी लेयर जाँच कीजिए')} <ArrowUpRight size={14} /></Link>}
      <div className="tool-result-answers">{advice.answers.map(answerById).filter((item): item is NonNullable<typeof item> => Boolean(item)).map((item) => <Link key={item.id} href={`/answers/${item.id}`}>{item.question[lang]} <ArrowUpRight size={12} /></Link>)}</div>
    </div>}</div>
  </section>;
}

/** /glossary */
export function GlossaryPage() {
  const t = useT();
  const lang = useLang();
  const title = t(PAGE_META.glossary.title.en, PAGE_META.glossary.title.hi);
  const description = t(PAGE_META.glossary.description.en, PAGE_META.glossary.description.hi);
  const terms = useMemo(() => glossarySorted(lang), [lang]);
  useSeo({
    title,
    description,
    canonicalPath: '/glossary',
    structuredData: glossaryStructuredData(lang, { title, description }, terms.map((item) => ({ id: item.id, name: item.term[lang], description: item.definition[lang] }))),
  });
  // Deep links (/glossary#creamy-layer) land on the term once the page has rendered.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ block: 'start' });
  }, []);
  return <main className="signal-page">
    <Header />
    <section className="signal-container answer-detail">
      <p className="signal-kicker text-accent">{t('Glossary', 'शब्दावली')}</p>
      <h1 className="answer-detail-q">{t('The words power hides behind, in plain language.', 'वे शब्द जिनके पीछे सत्ता छिपती है, सीधी भाषा में।')}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{description}</p>
      <nav className="glossary-index" aria-label={t('Terms', 'शब्द')}>{terms.map((item) => <a key={item.id} href={`#${item.id}`}>{item.term[lang]}</a>)}</nav>
      <dl className="glossary-list">{terms.map((item) => {
        const answer = item.answer ? answerById(item.answer) : undefined;
        return <div key={item.id} id={item.id} className="glossary-item">
          <dt>{item.term[lang]}</dt>
          <dd>
            <p>{item.definition[lang]}</p>
            <p className="glossary-meta"><a href={item.source.url} target="_blank" rel="noopener noreferrer" lang="en">{item.source.name} <ExternalLink size={11} /></a>{answer && <> · <Link href={`/answers/${answer.id}`}>{answer.question[lang]}</Link></>}</p>
          </dd>
        </div>;
      })}</dl>
      <p className="mt-8 text-xs text-muted-foreground">{t('Last checked', 'आख़िरी जाँच')} {formatChecked(GLOSSARY_CHECKED_ON, lang)}.</p>
    </section>
  </main>;
}

/** "Terms in this record": glossary entries an article uses, collapsed by default. */
export function ArticleTerms({ text }: { text: string }) {
  const t = useT();
  const lang = useLang();
  const terms = termsIn(text, lang);
  if (!terms.length) return null;
  return <section className="signal-container article-terms" aria-labelledby="article-terms-title">
    <p id="article-terms-title" className="signal-kicker text-accent">{t('Terms in this record', 'इस रिकॉर्ड के शब्द')}</p>
    <div className="article-terms-list">{terms.map((item) => <details key={item.id} className="article-term"><summary>{item.term[lang]}</summary><p>{item.definition[lang]} <Link href={`/glossary#${item.id}`} className="text-accent">{t('Glossary', 'शब्दावली')}</Link></p></details>)}</div>
  </section>;
}
