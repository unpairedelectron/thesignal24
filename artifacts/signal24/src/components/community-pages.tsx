import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowUpRight, Flag, HelpCircle, MessageCircle, MessagesSquare, ShieldCheck, ThumbsUp } from 'lucide-react';
import { Link, useLocation, useParams, useSearch } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCommunityPostQueryKey,
  getGetCommunityPostsQueryKey,
  useCreateCommunityPost,
  useCreateCommunityReply,
  useGetCommunityPost,
  useGetCommunityPosts,
  useReportCommunityPost,
  useReportCommunityReply,
  useToggleCommunityPostLike,
  useToggleCommunityReplyHelpful,
  type CommunityPost,
  type CommunityPostKind,
  type CommunityReportInputReason,
  type CommunityTopic,
  type GetCommunityPostsParams,
  type GetCommunityPostsSort,
} from '@workspace/api-client-react';
import { Header } from '@/components/site-chrome';
import { TopicHero } from '@/components/topic-stage';
import { useLabel, useLang, useT } from '@/lib/i18n';
import { useSeo } from '@/lib/seo';
import { REGIONS } from '@/lib/states';
import { breadcrumbNode, collectionPageNode, organizationRef, siteGraph, webPageNode } from '@/lib/structured-data';
import { PAGE_META } from '@/lib/page-meta';

const TOPICS: Array<[CommunityTopic, string, string]> = [
  ['general', 'General', 'सामान्य'],
  ['policy', 'Policy and law', 'नीति और क़ानून'],
  ['education', 'Education and campuses', 'शिक्षा और कैंपस'],
  ['work', 'Jobs and recruitment', 'नौकरी और भर्ती'],
  ['representation', 'Representation', 'प्रतिनिधित्व'],
  ['caste', 'Caste', 'जाति'],
  ['violence', 'Violence and justice', 'हिंसा और न्याय'],
  ['migration', 'Migration', 'पलायन'],
  ['culture', 'Culture', 'संस्कृति'],
];

const REPORT_REASONS: Array<[CommunityReportInputReason, string, string]> = [
  ['abuse', 'Abuse or a slur', 'अपशब्द या गाली'],
  ['personal-information', 'Names or exposes a private person', 'किसी निजी व्यक्ति का नाम या जानकारी'],
  ['misinformation', 'False or misleading', 'झूठ या भ्रामक'],
  ['spam', 'Spam or advertising', 'स्पैम या विज्ञापन'],
  ['other', 'Something else', 'कुछ और'],
];

/** Conversation starters from the desk, tied to current reporting. They prefill the composer; they are not posts. */
const DESK_PROMPTS: Array<{ topic: CommunityTopic; en: string; hi: string }> = [
  { topic: 'policy', en: 'Have you filed an RTI for caste-wise representation in a government department? What came back?', hi: 'क्या आपने किसी सरकारी विभाग में जाति-वार प्रतिनिधित्व के लिए आरटीआई दाख़िल की? जवाब में क्या मिला?' },
  { topic: 'education', en: 'Students: does your college actually have the anti-discrimination officer the 2012 UGC rules require?', hi: 'छात्र: क्या आपके कॉलेज में सचमुच वह भेदभाव-विरोधी अधिकारी है जो 2012 के यूजीसी नियम माँगते हैं?' },
  { topic: 'work', en: 'Applicants: has a certificate date or format ever cost you a seat or a job?', hi: 'उम्मीदवार: क्या प्रमाणपत्र की तारीख़ या प्रारूप के कारण कभी आपकी सीट या नौकरी गई?' },
  { topic: 'representation', en: 'What would Census 2027 have to publish for you to trust its caste tables?', hi: 'जनगणना 2027 को क्या प्रकाशित करना होगा कि आप उसकी जाति तालिकाओं पर भरोसा करें?' },
];

function relativeTime(value: string, lang: 'en' | 'hi') {
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat(lang === 'hi' ? 'hi-IN' : 'en-IN', { numeric: 'auto' });
  const steps: Array<[Intl.RelativeTimeFormatUnit, number]> = [['year', 31_536_000], ['month', 2_592_000], ['week', 604_800], ['day', 86_400], ['hour', 3_600], ['minute', 60]];
  for (const [unit, size] of steps) if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  return lang === 'hi' ? 'अभी' : 'just now';
}

function errorMessage(error: unknown, fallback: string) {
  const data = (error as { data?: { message?: unknown } } | null)?.data;
  return typeof data?.message === 'string' ? data.message : fallback;
}

function useTopicLabel() {
  const lang = useLang();
  return (topic: string) => {
    const entry = TOPICS.find(([id]) => id === topic);
    return entry ? (lang === 'hi' ? entry[2] : entry[1]) : topic;
  };
}

function ReportButton({ onReport, pending, done }: { onReport: (reason: CommunityReportInputReason) => void; pending: boolean; done: boolean }) {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<CommunityReportInputReason>('abuse');
  if (done) return <span className="cm-report-done">{t('Reported. Thank you.', 'रिपोर्ट हुई। धन्यवाद।')}</span>;
  return <div className="cm-report">
    <button type="button" className="cm-action is-quiet" aria-expanded={open} onClick={() => setOpen((value) => !value)}><Flag size={14} /> {t('Report', 'रिपोर्ट')}</button>
    {open && <form className="cm-report-form" onSubmit={(event) => { event.preventDefault(); onReport(reason); setOpen(false); }}>
      <label className="sr-only" htmlFor="report-reason">{t('Reason', 'कारण')}</label>
      <select id="report-reason" value={reason} onChange={(event) => setReason(event.target.value as CommunityReportInputReason)}>{REPORT_REASONS.map(([value, en, hi]) => <option key={value} value={value}>{lang === 'hi' ? hi : en}</option>)}</select>
      <button type="submit" disabled={pending}>{t('Send report', 'रिपोर्ट भेजें')}</button>
    </form>}
  </div>;
}

function HouseRules() {
  const t = useT();
  return <aside className="cm-rules" aria-labelledby="house-rules-title">
    <p id="house-rules-title" className="cm-rules-title"><ShieldCheck size={16} /> {t('House rules', 'हमारे नियम')}</p>
    <ul>
      <li>{t('Criticise governments, institutions and decisions as hard as you like.', 'सरकारों, संस्थाओं और फ़ैसलों की जितनी चाहें कड़ी आलोचना कीजिए।')}</li>
      <li>{t('Never attack a caste, religion, region or community. No slurs.', 'किसी जाति, धर्म, क्षेत्र या समुदाय पर कभी हमला नहीं। कोई गाली नहीं।')}</li>
      <li>{t('Never name or expose a private person. Officials acting in office are fair game.', 'किसी निजी व्यक्ति का नाम या जानकारी कभी नहीं। पद पर काम कर रहे अधिकारी पर सवाल ठीक है।')}</li>
      <li>{t('Documents beat anecdotes. Link the order, the notice, the RTI reply.', 'दस्तावेज़ क़िस्सों से बेहतर। आदेश, सूचना, आरटीआई जवाब का लिंक दीजिए।')}</li>
    </ul>
    <p className="cm-rules-note">{t('Posts reported by three different people are hidden until reviewed. Community posts are not Signal 24 reporting.', 'तीन अलग लोगों द्वारा रिपोर्ट की गई पोस्ट समीक्षा तक छिप जाती है। समुदाय की पोस्ट द सिग्नल 24 की रिपोर्टिंग नहीं हैं।')}</p>
  </aside>;
}

function Composer({ handle, initialTitle, initialState, initialTopic, focusKey }: { handle: string; initialTitle: string; initialState: string; initialTopic: CommunityTopic; focusKey: number }) {
  const t = useT();
  const lang = useLang();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [kind, setKind] = useState<CommunityPostKind>('question');
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState<CommunityTopic>(initialTopic);
  const [state, setState] = useState(initialState);
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const create = useCreateCommunityPost();
  useEffect(() => { setTitle(initialTitle); setTopic(initialTopic); setState(initialState); if (focusKey > 0) titleRef.current?.focus(); }, [initialTitle, initialTopic, initialState, focusKey]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    create.mutate({ data: { kind, topic, title: title.trim(), body: body.trim(), state: state || null, authorName: name.trim() || undefined } }, {
      onSuccess: (post) => {
        void queryClient.invalidateQueries({ queryKey: getGetCommunityPostsQueryKey() });
        setLocation(`/community/${post.id}`);
      },
    });
  };
  return <form className="cm-composer" onSubmit={submit} data-testid="form-community-composer" id="ask">
    <div className="cm-kind" role="radiogroup" aria-label={t('What are you posting?', 'आप क्या पोस्ट कर रहे हैं?')}>
      <button type="button" role="radio" aria-checked={kind === 'question'} onClick={() => setKind('question')}><HelpCircle size={16} /> {t('Ask a question', 'सवाल पूछिए')}</button>
      <button type="button" role="radio" aria-checked={kind === 'thought'} onClick={() => setKind('thought')}><MessagesSquare size={16} /> {t('Start a discussion', 'चर्चा शुरू कीजिए')}</button>
    </div>
    <label className="cm-field"><span>{kind === 'question' ? t('Your question', 'आपका सवाल') : t('Title', 'शीर्षक')}</span><input ref={titleRef} required minLength={4} maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={kind === 'question' ? t('What do you want to know about the government?', 'आप सरकार के बारे में क्या जानना चाहते हैं?') : t('What do you want to discuss?', 'आप किस पर चर्चा करना चाहते हैं?')} data-testid="input-community-title" /></label>
    <label className="cm-field"><span>{t('Details', 'विवरण')}</span><textarea required minLength={10} maxLength={10000} rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder={t('Context, dates, what you have already tried. Link documents if you have them. Do not name private people.', 'संदर्भ, तारीख़ें, आपने क्या-क्या आज़माया। दस्तावेज़ हों तो लिंक दीजिए। निजी लोगों के नाम मत लिखिए।')} data-testid="input-community-body" /></label>
    <div className="cm-row">
      <label className="cm-field"><span>{t('Topic', 'विषय')}</span><select value={topic} onChange={(event) => setTopic(event.target.value as CommunityTopic)}>{TOPICS.map(([id, en, hi]) => <option key={id} value={id}>{lang === 'hi' ? hi : en}</option>)}</select></label>
      <label className="cm-field"><span>{t('State (optional)', 'राज्य (वैकल्पिक)')}</span><select value={state} onChange={(event) => setState(event.target.value)}><option value="">{t('All India', 'पूरा भारत')}</option>{REGIONS.map((region) => <option key={region.name} value={region.name}>{lang === 'hi' ? region.hi : region.name}</option>)}</select></label>
      <label className="cm-field"><span>{t('Name (optional)', 'नाम (वैकल्पिक)')}</span><input maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder={t(`Posting as ${handle}`, `${handle} के रूप में`)} /></label>
    </div>
    <label className="cm-agree"><input type="checkbox" required checked={agreed} onChange={(event) => setAgreed(event.target.checked)} /> {t('I will follow the house rules. No slurs, no attacks on communities, no private names.', 'मैं नियमों का पालन करूँगा/करूँगी। कोई गाली नहीं, समुदायों पर हमला नहीं, निजी नाम नहीं।')}</label>
    {create.isError && <p className="cm-error" role="alert">{errorMessage(create.error, t('That could not be posted. Please try again.', 'यह पोस्ट नहीं हो सका। फिर कोशिश करें।'))}</p>}
    <div className="cm-submit-row">
      <p className="cm-anon"><ShieldCheck size={15} /> {t(`Anonymous by default. You will appear as ${name.trim() || handle}. No account, no email.`, `डिफ़ॉल्ट रूप से गुमनाम। आप ${name.trim() || handle} के रूप में दिखेंगे। न खाता, न ईमेल।`)}</p>
      <button type="submit" className="cm-post-button" disabled={create.isPending} data-testid="button-community-submit">{create.isPending ? t('Posting…', 'पोस्ट हो रहा है…') : kind === 'question' ? t('Post question', 'सवाल पोस्ट करें') : t('Post discussion', 'चर्चा पोस्ट करें')}</button>
    </div>
  </form>;
}

function PostCard({ post }: { post: CommunityPost }) {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const topicLabel = useTopicLabel();
  const isQuestion = post.kind === 'question';
  return <Link href={`/community/${post.id}`} className="cm-card" data-testid={`card-community-post-${post.id}`}>
    <div className="cm-card-votes" aria-hidden="true"><span>{post.likeCount}</span><small>{t('votes', 'वोट')}</small><span className={post.replyCount === 0 ? 'is-zero' : 'is-answered'}>{post.replyCount}</span><small>{isQuestion ? t('answers', 'जवाब') : t('replies', 'जवाब')}</small></div>
    <div className="min-w-0">
      <div className="cm-card-meta"><span className={`cm-kind-badge is-${isQuestion ? 'question' : 'discussion'}`}>{isQuestion ? t('Question', 'सवाल') : t('Discussion', 'चर्चा')}</span><span>{topicLabel(post.topic)}</span>{post.state && <span>{label(post.state)}</span>}{isQuestion && post.replyCount === 0 && <span className="cm-open">{t('Unanswered', 'अनुत्तरित')}</span>}</div>
      <h3 className="cm-card-title">{post.title}</h3>
      <p className="cm-card-body">{post.body}</p>
      <p className="cm-card-foot">{post.authorName} · <time dateTime={post.createdAt}>{relativeTime(post.createdAt, lang)}</time>{post.ownedByViewer ? ` · ${t('you', 'आप')}` : ''}</p>
    </div>
  </Link>;
}

/** The people's floor: anonymous questions, answers and discussion. */
export function CommunityPage() {
  const t = useT();
  const lang = useLang();
  const search = useSearch();
  const urlParams = new URLSearchParams(search);
  const [prefill, setPrefill] = useState({ title: urlParams.get('ask') ?? '', state: urlParams.get('state') ?? '', topic: 'general' as CommunityTopic, focus: urlParams.has('ask') ? 1 : 0 });
  const [sort, setSort] = useState<GetCommunityPostsSort>('trending');
  const [kind, setKind] = useState<CommunityPostKind | 'all'>('all');
  const [topic, setTopic] = useState<CommunityTopic | 'all'>('all');
  const [state, setState] = useState(urlParams.get('state') ?? '');
  const params = useMemo<GetCommunityPostsParams>(() => ({ sort, limit: 50, ...(kind !== 'all' ? { kind } : {}), ...(topic !== 'all' ? { topic } : {}), ...(state ? { state } : {}) }), [sort, kind, topic, state]);
  const { data, isLoading, isError, refetch } = useGetCommunityPosts(params, { query: { queryKey: getGetCommunityPostsQueryKey(params) } });
  const allParams = useMemo<GetCommunityPostsParams>(() => ({ limit: 50 }), []);
  const all = useGetCommunityPosts(allParams, { query: { queryKey: getGetCommunityPostsQueryKey(allParams) } });
  const posts = data?.posts ?? [];
  const everything = all.data?.posts ?? [];
  const handle = data?.viewerHandle ?? all.data?.viewerHandle ?? t('an anonymous citizen', 'एक गुमनाम नागरिक');
  const title = t(PAGE_META.community.title.en, PAGE_META.community.title.hi);
  const description = t(PAGE_META.community.description.en, PAGE_META.community.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: '/community',
    structuredData: siteGraph(collectionPageNode('/community', { name: title, description, publisher: organizationRef }), breadcrumbNode('/community', [[t('Community', 'समुदाय'), '/community']])),
  });
  const applyPrompt = (prompt: (typeof DESK_PROMPTS)[number]) => {
    setPrefill((current) => ({ title: lang === 'hi' ? prompt.hi : prompt.en, state: current.state, topic: prompt.topic, focus: current.focus + 1 }));
    document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return <main className="signal-page">
    <Header />
    <TopicHero
      kicker={t('The Signal 24 / community', 'द सिग्नल 24 / समुदाय')}
      headline={t('The people’s floor.', 'जनता का मंच।')}
      accent={t('Ask anything. Name nobody.', 'कुछ भी पूछिए। किसी का नाम नहीं।')}
      standfirst={t('Ask what the government won’t explain, answer what you have lived through, and argue about what it means. Anonymous by default: no account, no email, no name unless you choose one. Hard on institutions, never on communities.', 'वह पूछिए जो सरकार नहीं समझाती, उसका जवाब दीजिए जो आपने झेला है, और बहस कीजिए कि इसका मतलब क्या है। डिफ़ॉल्ट रूप से गुमनाम: न खाता, न ईमेल, जब तक आप ख़ुद न चुनें, कोई नाम नहीं। संस्थाओं पर सख़्त, समुदायों पर कभी नहीं।')}
      stats={[
        { value: everything.length, label: t('Threads', 'चर्चाएँ') },
        { value: everything.reduce((sum, post) => sum + post.replyCount, 0), label: t('Answers', 'जवाब') },
        { value: everything.filter((post) => post.kind === 'question' && post.replyCount === 0).length, label: t('Open questions', 'खुले सवाल') },
      ]}
      illustration="magnifier-hero"
      illustrationAlt={t('Illustration: a magnifying glass over government filings', 'चित्रण: सरकारी दस्तावेज़ों पर आवर्धक लेंस')}
      exhibits={everything.slice(0, 2).map((post) => ({ title: post.title, meta: post.authorName }))}
    />
    <section className="signal-container mt-14 sm:mt-20">
      <div className="cm-top-grid">
        <div>
          <p className="signal-kicker text-accent">{t('Ask or start a discussion', 'पूछिए या चर्चा शुरू कीजिए')}</p>
          <h2 className="mt-2 font-display text-4xl leading-tight">{t('What do you need to know?', 'आपको क्या जानना है?')}</h2>
          <div className="mt-6"><Composer handle={handle} initialTitle={prefill.title} initialState={prefill.state} initialTopic={prefill.topic} focusKey={prefill.focus} /></div>
        </div>
        <div className="grid content-start gap-6">
          <div>
            <p className="signal-kicker text-accent">{t('Prompts from the desk', 'डेस्क के सवाल')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('Starters tied to our current reporting. Pick one to fill the form; they are not posts.', 'हमारी मौजूदा रिपोर्टिंग से जुड़ी शुरुआत। फ़ॉर्म भरने के लिए कोई चुनिए; ये पोस्ट नहीं हैं।')}</p>
            <div className="mt-3 grid gap-2">{DESK_PROMPTS.map((prompt) => <button key={prompt.en} type="button" className="cm-prompt" onClick={() => applyPrompt(prompt)}><MessageCircle size={15} /> <span>{lang === 'hi' ? prompt.hi : prompt.en}</span></button>)}</div>
          </div>
          <HouseRules />
        </div>
      </div>
    </section>
    <section className="signal-container mt-16 sm:mt-24" aria-labelledby="community-feed-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <h2 id="community-feed-title" className="font-display text-4xl sm:text-5xl">{t('On the floor', 'मंच पर')}</h2>
        <div className="answers-chips" role="group" aria-label={t('Sort', 'क्रम')}>
          {([['trending', t('Trending', 'चर्चित')], ['recent', t('Newest', 'नए')], ['unanswered', t('Unanswered', 'अनुत्तरित')], ['popular', t('Most voted', 'सबसे ज़्यादा वोट')]] as const).map(([value, text]) => <button key={value} type="button" aria-pressed={sort === value} onClick={() => setSort(value)} data-testid={`button-community-sort-${value}`}>{text}</button>)}
        </div>
      </div>
      <div className="cm-filters">
        <label><span className="sr-only">{t('Type', 'प्रकार')}</span><select value={kind} onChange={(event) => setKind(event.target.value as CommunityPostKind | 'all')}><option value="all">{t('Questions and discussions', 'सवाल और चर्चाएँ')}</option><option value="question">{t('Questions only', 'केवल सवाल')}</option><option value="thought">{t('Discussions only', 'केवल चर्चाएँ')}</option></select></label>
        <label><span className="sr-only">{t('Topic', 'विषय')}</span><select value={topic} onChange={(event) => setTopic(event.target.value as CommunityTopic | 'all')}><option value="all">{t('All topics', 'सभी विषय')}</option>{TOPICS.map(([id, en, hi]) => <option key={id} value={id}>{lang === 'hi' ? hi : en}</option>)}</select></label>
        <label><span className="sr-only">{t('State', 'राज्य')}</span><select value={state} onChange={(event) => setState(event.target.value)}><option value="">{t('All of India', 'पूरा भारत')}</option>{REGIONS.map((region) => <option key={region.name} value={region.name}>{lang === 'hi' ? region.hi : region.name}</option>)}</select></label>
      </div>
      {isLoading ? <div className="cm-loading" role="status">{t('Opening the floor…', 'मंच खुल रहा है…')}</div> :
        isError ? <div className="cm-empty" role="alert"><p>{t('The community room could not be reached.', 'समुदाय कक्ष तक पहुँच नहीं हो सकी।')}</p><button type="button" className="signal-button mt-4" onClick={() => void refetch()}>{t('Try again', 'फिर कोशिश करें')}</button></div> :
          posts.length === 0 ? <div className="cm-empty"><p className="font-display text-3xl">{sort === 'unanswered' ? t('Every question has an answer. For now.', 'हर सवाल का जवाब है। फ़िलहाल।') : t('The floor is open. Be the first to ask.', 'मंच खुला है। सबसे पहले पूछिए।')}</p><a href="#ask" className="signal-button mt-5 inline-flex">{t('Ask a question', 'सवाल पूछिए')}</a></div> :
            <div className="cm-feed">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>}
    </section>
  </main>;
}

/** A question or discussion with its answers, most helpful first. */
export function CommunityDetailPage() {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const topicLabel = useTopicLabel();
  const queryClient = useQueryClient();
  const params = useParams<{ id?: string }>();
  const postId = Number(params.id);
  const { data, isLoading, isError } = useGetCommunityPost(postId, { query: { enabled: Number.isFinite(postId), queryKey: getGetCommunityPostQueryKey(postId) } });
  const like = useToggleCommunityPostLike();
  const helpful = useToggleCommunityReplyHelpful();
  const reportPost = useReportCommunityPost();
  const reportReply = useReportCommunityReply();
  const reply = useCreateCommunityReply();
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [reportedReplies, setReportedReplies] = useState<number[]>([]);
  const post = data?.post;
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: getGetCommunityPostQueryKey(postId) }); void queryClient.invalidateQueries({ queryKey: getGetCommunityPostsQueryKey() }); };
  const path = `/community/${params.id ?? ''}`;
  useSeo({
    title: post ? `${post.title} — ${t('The Signal 24 community', 'द सिग्नल 24 समुदाय')}` : t('Community — The Signal 24', 'समुदाय — द सिग्नल 24'),
    description: post?.body.slice(0, 160) ?? '',
    canonicalPath: post ? path : undefined,
    // Participant posts are visible to readers but kept out of search indexes.
    robots: 'noindex, follow',
    structuredData: post ? siteGraph(webPageNode(path, { name: post.title, publisher: organizationRef }, 'DiscussionForumPosting'), breadcrumbNode(path, [[t('Community', 'समुदाय'), '/community'], [post.title, path]])) : undefined,
  });
  const submitReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    reply.mutate({ postId, data: { body: body.trim(), authorName: name.trim() || undefined } }, { onSuccess: () => { setBody(''); refresh(); } });
  };
  if (isLoading) return <main className="signal-page"><Header /><div className="signal-container cm-loading py-24" role="status">{t('Opening the thread…', 'चर्चा खुल रही है…')}</div></main>;
  if (isError || !post) return <main className="signal-page"><Header /><div className="signal-container py-24"><div className="cm-empty"><p className="font-display text-3xl">{t('This thread is not available.', 'यह चर्चा उपलब्ध नहीं है।')}</p><p className="mt-2 text-sm text-muted-foreground">{t('It may have been removed after reports, or the address is wrong.', 'शायद रिपोर्ट के बाद हटा दी गई, या पता ग़लत है।')}</p><Link href="/community" className="signal-button mt-5 inline-flex">{t('Back to the community', 'समुदाय पर लौटें')}</Link></div></div></main>;
  const replies = data?.replies ?? [];
  const isQuestion = post.kind === 'question';
  return <main className="signal-page">
    <Header />
    <article className="signal-container cm-thread">
      <nav className="article-crumbs" aria-label={t('Breadcrumb', 'ब्रेडक्रंब')}><Link href="/community"><ArrowLeft size={12} className="mr-1 inline" />{t('Community', 'समुदाय')}</Link><span aria-hidden="true">/</span><span>{topicLabel(post.topic)}</span>{post.state && <><span aria-hidden="true">/</span><span>{label(post.state)}</span></>}</nav>
      <div className="cm-thread-grid">
        <div className="min-w-0">
          <div className="cm-card-meta mt-6"><span className={`cm-kind-badge is-${isQuestion ? 'question' : 'discussion'}`}>{isQuestion ? t('Question', 'सवाल') : t('Discussion', 'चर्चा')}</span><span>{post.authorName}{post.ownedByViewer ? ` (${t('you', 'आप')})` : ''}</span><time dateTime={post.createdAt}>{relativeTime(post.createdAt, lang)}</time></div>
          <h1 className="cm-thread-title">{post.title}</h1>
          <div className="cm-thread-body">{post.body.split(/\n{2,}/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          {post.linkUrl && <a href={post.linkUrl} target="_blank" rel="noopener noreferrer nofollow ugc" className="cm-link">{post.linkUrl} <ArrowUpRight size={13} /></a>}
          <div className="cm-actions">
            <button type="button" className={`cm-action ${post.likedByViewer ? 'is-on' : ''}`} aria-pressed={post.likedByViewer} onClick={() => like.mutate({ postId }, { onSuccess: refresh })} data-testid="button-community-like"><ThumbsUp size={15} /> {isQuestion ? t('I want to know too', 'मुझे भी जानना है') : t('Agree', 'सहमत')} · {post.likeCount}</button>
            <ReportButton pending={reportPost.isPending} done={reportPost.isSuccess} onReport={(reason) => reportPost.mutate({ postId, data: { reason } })} />
          </div>
          <section className="cm-answers" aria-labelledby="answers-title">
            <h2 id="answers-title" className="font-display text-3xl">{replies.length} {isQuestion ? t(replies.length === 1 ? 'answer' : 'answers', 'जवाब') : t(replies.length === 1 ? 'reply' : 'replies', 'जवाब')}</h2>
            {replies.length === 0 && <p className="mt-3 text-muted-foreground">{isQuestion ? t('No answers yet. If you know, say so; if you have a document, link it.', 'अभी कोई जवाब नहीं। अगर आप जानते हैं, बताइए; दस्तावेज़ है, तो लिंक दीजिए।') : t('No replies yet.', 'अभी कोई जवाब नहीं।')}</p>}
            <ol className="cm-answer-list">{replies.map((item, index) => <li key={item.id} className={`cm-answer ${index === 0 && item.helpfulCount > 0 ? 'is-top' : ''}`}>
              {index === 0 && item.helpfulCount > 0 && <p className="cm-top-label">{t('Most helpful', 'सबसे मददगार')}</p>}
              <div className="cm-answer-body">{item.body.split(/\n{2,}/).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
              <div className="cm-answer-foot">
                <span>{item.authorName}{item.ownedByViewer ? ` (${t('you', 'आप')})` : ''} · <time dateTime={item.createdAt}>{relativeTime(item.createdAt, lang)}</time></span>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className={`cm-action ${item.helpfulByViewer ? 'is-on' : ''}`} aria-pressed={item.helpfulByViewer} onClick={() => helpful.mutate({ replyId: item.id }, { onSuccess: refresh })}><ThumbsUp size={14} /> {t('Helpful', 'मददगार')} · {item.helpfulCount}</button>
                  <ReportButton pending={reportReply.isPending} done={reportedReplies.includes(item.id)} onReport={(reason) => reportReply.mutate({ replyId: item.id, data: { reason } }, { onSuccess: () => setReportedReplies((current) => [...current, item.id]) })} />
                </div>
              </div>
            </li>)}</ol>
          </section>
          <form className="cm-composer mt-8" onSubmit={submitReply} data-testid="form-community-reply">
            <label className="cm-field"><span>{isQuestion ? t('Your answer', 'आपका जवाब') : t('Your reply', 'आपका जवाब')}</span><textarea required minLength={2} maxLength={5000} rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder={t('What you know, how you know it, and the document if there is one.', 'आप क्या जानते हैं, कैसे जानते हैं, और दस्तावेज़ हो तो वह।')} data-testid="input-community-reply" /></label>
            <div className="cm-row"><label className="cm-field"><span>{t('Name (optional)', 'नाम (वैकल्पिक)')}</span><input maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder={t('Leave blank to stay anonymous', 'गुमनाम रहने के लिए ख़ाली छोड़िए')} /></label></div>
            {reply.isError && <p className="cm-error" role="alert">{errorMessage(reply.error, t('That could not be posted. Please try again.', 'यह पोस्ट नहीं हो सका। फिर कोशिश करें।'))}</p>}
            <div className="cm-submit-row"><p className="cm-anon"><ShieldCheck size={15} /> {t('Anonymous unless you add a name.', 'नाम न जोड़ें तो गुमनाम।')}</p><button type="submit" className="cm-post-button" disabled={reply.isPending} data-testid="button-community-reply">{reply.isPending ? t('Posting…', 'पोस्ट हो रहा है…') : isQuestion ? t('Post answer', 'जवाब पोस्ट करें') : t('Post reply', 'जवाब पोस्ट करें')}</button></div>
          </form>
        </div>
        <div className="grid content-start gap-6">
          <HouseRules />
          <Link href="/answers" className="article-rail-cta">{t('Check the Answers hub first', 'पहले जवाब केंद्र देखिए')} <ArrowUpRight size={14} /></Link>
        </div>
      </div>
    </article>
  </main>;
}
