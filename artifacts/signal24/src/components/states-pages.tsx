import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { getGetArchiveQueryKey, getGetEvidenceEventsQueryKey, getGetPoliciesQueryKey, useGetArchive, useGetEvidenceEvents, useGetPolicies, type PolicyRecord, type Story } from '@workspace/api-client-react';
import { Header } from '@/components/site-chrome';
import { TopicHero } from '@/components/topic-stage';
import NotFound from '@/pages/not-found';
import { localizePolicy, useLabel, useLang, useLocalizeStories, useT, type LocalizedStory } from '@/lib/i18n';
import { basePath, useSeo } from '@/lib/seo';
import { canonicalStateName, getMapFeatureName, mapPath, parseStateMap, stateNameKey, type MapFeature } from '@/lib/state-map';
import { REGIONS, regionBySlug, regionSlug, STATE_PROFILES, stateMeta, storyConcerns } from '@/lib/states';
import { breadcrumbNode, collectionPageNode, organizationRef, placeForState, siteGraph, webPageNode } from '@/lib/structured-data';
import { PAGE_META } from '@/lib/page-meta';

type Tier = 'profiled' | 'mentioned' | 'none';

function formatDay(value: string, lang: 'en' | 'hi') {
  const monthOnly = /^\d{4}-\d{2}$/.test(value);
  const date = new Date(`${monthOnly ? `${value}-01` : value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { ...(monthOnly ? {} : { day: 'numeric' }), month: 'short', year: 'numeric', numberingSystem: 'latn' } as Intl.DateTimeFormatOptions);
}

function usePublishedStories() {
  const params = useMemo(() => ({ limit: 100 }), []);
  const query = useGetArchive(params, { query: { queryKey: getGetArchiveQueryKey(params), staleTime: 60_000 } });
  const localize = useLocalizeStories();
  const stories = useMemo(() => localize(query.data?.stories ?? []), [query.data, localize]);
  return { ...query, stories };
}

function useCoverage(stories: Story[]) {
  return useMemo(() => {
    const tiers = new Map<string, Tier>();
    const counts = new Map<string, number>();
    for (const region of REGIONS) {
      const count = stories.filter((story) => storyConcerns(story, region)).length;
      counts.set(region.name, count);
      tiers.set(region.name, STATE_PROFILES[region.name] ? 'profiled' : count > 0 ? 'mentioned' : 'none');
    }
    return { tiers, counts };
  }, [stories]);
}

function useMapFeatures() {
  const [features, setFeatures] = useState<MapFeature[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let cancelled = false;
    fetch(`${basePath}/data/india-states-simplified.geojson`)
      .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.json(); })
      .then((value: unknown) => { if (!cancelled) { setFeatures(parseStateMap(value)); setStatus('ready'); } })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, []);
  return { features, status };
}

function pathBounds(d: string) {
  const numbers = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (let index = 0; index + 1 < numbers.length; index += 2) {
    minX = Math.min(minX, numbers[index]); maxX = Math.max(maxX, numbers[index]);
    minY = Math.min(minY, numbers[index + 1]); maxY = Math.max(maxY, numbers[index + 1]);
  }
  return { minX, minY, maxX, maxY };
}

/**
 * India with every state and UT clickable, shaded by how much of the record we hold.
 * With `focus`, the map zooms to one state and fades the rest.
 */
export function IndiaMap({ tiers, focus, compact = false }: { tiers: Map<string, Tier>; focus?: string; compact?: boolean }) {
  const t = useT();
  const label = useLabel();
  const [, setLocation] = useLocation();
  const { features, status } = useMapFeatures();
  const [hover, setHover] = useState<string | null>(null);
  const shapes = useMemo(() => features.map((feature) => {
    const raw = getMapFeatureName(feature);
    const name = raw ? canonicalStateName(raw) : '';
    return { name, d: mapPath(feature.geometry?.coordinates) };
  }), [features]);
  const viewBox = useMemo(() => {
    if (!focus) return '0 0 1000 950';
    const shape = shapes.find((item) => stateNameKey(item.name) === stateNameKey(focus));
    if (!shape) return '0 0 1000 950';
    const { minX, minY, maxX, maxY } = pathBounds(shape.d);
    const pad = Math.max(maxX - minX, maxY - minY) * 0.35 + 20;
    return `${(minX - pad).toFixed(0)} ${(minY - pad).toFixed(0)} ${(maxX - minX + pad * 2).toFixed(0)} ${(maxY - minY + pad * 2).toFixed(0)}`;
  }, [focus, shapes]);
  if (status === 'loading') return <div className="india-map-status" role="status">{t('Loading the map…', 'नक्शा लोड हो रहा है…')}</div>;
  if (status === 'error') return <div className="india-map-status" role="alert">{t('The map could not be loaded. Every state is listed below.', 'नक्शा लोड नहीं हुआ। हर राज्य नीचे सूचीबद्ध है।')}</div>;
  const go = (name: string) => setLocation(`/state/${regionSlug(name)}`);
  return <figure className={`india-map-figure ${compact ? 'is-compact' : ''}`}>
    <svg viewBox={viewBox} className="india-map-svg" role="group" aria-label={t('Map of India by state; select a state to open its profile', 'राज्यों के हिसाब से भारत का नक्शा; प्रोफ़ाइल खोलने के लिए राज्य चुनें')}>
      {shapes.map((shape, index) => {
        const tier = tiers.get(shape.name) ?? 'none';
        const isFocus = focus ? stateNameKey(shape.name) === stateNameKey(focus) : false;
        return <path
          key={`${shape.name}-${index}`}
          d={shape.d}
          className={`india-map-shape is-${tier} ${isFocus ? 'is-focus' : ''} ${focus && !isFocus ? 'is-faded' : ''}`}
          role="link"
          tabIndex={0}
          aria-label={`${label(shape.name)}: ${tier === 'profiled' ? t('profile and records', 'प्रोफ़ाइल और रिकॉर्ड') : tier === 'mentioned' ? t('mentioned in records', 'रिकॉर्ड में उल्लेख') : t('no record yet', 'अभी कोई रिकॉर्ड नहीं')}`}
          onClick={() => go(shape.name)}
          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); go(shape.name); } }}
          onPointerEnter={() => setHover(shape.name)}
          onPointerLeave={() => setHover((current) => (current === shape.name ? null : current))}
          data-testid={`map-region-${regionSlug(shape.name)}`}
        />;
      })}
    </svg>
    {!compact && <figcaption className="india-map-caption">
      <span className="india-map-hover" aria-live="polite">{hover ? label(hover) : t('Hover or tap a state', 'किसी राज्य पर जाएँ या टैप करें')}</span>
      <span className="india-map-legend"><i className="is-profiled" /> {t('Profile and records', 'प्रोफ़ाइल और रिकॉर्ड')}</span>
      <span className="india-map-legend"><i className="is-mentioned" /> {t('Mentioned in records', 'रिकॉर्ड में उल्लेख')}</span>
      <span className="india-map-legend"><i className="is-none" /> {t('No record yet', 'अभी कोई रिकॉर्ड नहीं')}</span>
    </figcaption>}
    <p className="india-map-note">{t('Map for navigation only, not a legal boundary reference.', 'नक्शा केवल नेविगेशन के लिए है, क़ानूनी सीमा का संदर्भ नहीं।')} <a href={`${basePath}/data/india-map-attribution.md`} target="_blank" rel="noopener noreferrer">{t('Attribution', 'स्रोत')}</a></p>
  </figure>;
}

function RecordRow({ story }: { story: LocalizedStory }) {
  const label = useLabel();
  return <Link href={story.canonicalPath ?? `/stories/${story.id}`} className="state-record">
    <span className="state-record-meta">{label(story.topic)} / {label(story.kind)}</span>
    <span lang={story.contentLang} className="state-record-title">{story.title}</span>
    <span lang={story.contentLang} className="state-record-dek">{story.dek}</span>
  </Link>;
}

/** The states hub: the full map, coverage at a glance, and every state and UT. */
export function StatesPage() {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const { stories } = usePublishedStories();
  const { tiers, counts } = useCoverage(stories);
  const [kind, setKind] = useState<'all' | 'state' | 'ut' | 'covered'>('all');
  const profiled = REGIONS.filter((region) => tiers.get(region.name) === 'profiled');
  const listed = REGIONS.filter((region) => kind === 'all' || (kind === 'covered' ? tiers.get(region.name) !== 'none' : region.kind === kind));
  const title = t(PAGE_META.states.title.en, PAGE_META.states.title.hi);
  const description = t(PAGE_META.states.description.en, PAGE_META.states.description.hi);
  useSeo({
    title,
    description,
    canonicalPath: '/states',
    structuredData: siteGraph(
      collectionPageNode('/states', { name: title, description, publisher: organizationRef }, REGIONS.map((region) => ({ url: `/state/${regionSlug(region.name)}`, name: lang === 'hi' ? region.hi : region.name }))),
      breadcrumbNode('/states', [[t('States', 'राज्य'), '/states']]),
    ),
  });
  return <main className="signal-page">
    <Header />
    <TopicHero
      kicker={t('The Signal 24 / state by state', 'द सिग्नल 24 / राज्य-दर-राज्य')}
      headline={t('One Constitution, 36 jurisdictions,', 'एक संविधान, 36 क्षेत्राधिकार,')}
      accent={t('and a ceiling most of them tested.', 'और एक सीमा जिसे ज़्यादातर ने परखा।')}
      standfirst={t('Reservation is decided as much in state capitals as in Delhi. Pick any state or Union Territory for its laws, court cases and records. Where the latest status could not be confirmed, the profile labels that gap and links its sources.', 'आरक्षण जितना दिल्ली में तय होता है, उतना ही राज्यों की राजधानियों में। किसी भी राज्य या केंद्रशासित प्रदेश के क़ानून, अदालती मामले और रिकॉर्ड के लिए उसे चुनिए। जहाँ नवीनतम स्थिति की पुष्टि नहीं हुई, प्रोफ़ाइल उस कमी को बताती है और स्रोतों से जोड़ती है।')}
      stats={[
        { value: REGIONS.length, label: t('States and UTs', 'राज्य और केंद्रशासित प्रदेश') },
        { value: profiled.length, label: t('Full profiles', 'पूरी प्रोफ़ाइलें') },
        { value: REGIONS.filter((region) => tiers.get(region.name) !== 'none').length, label: t('With records', 'रिकॉर्ड वाले') },
      ]}
      illustration="ceiling-gauge"
      illustrationAlt={t('Illustration: state quota bars breaking through the 50% ceiling, stamped struck down', 'चित्रण: 50% की छत तोड़ते राज्यों के आरक्षण, जिन पर “रद्द” की मुहर है')}
      exhibits={profiled.slice(0, 2).map((region) => ({ title: STATE_PROFILES[region.name].status[lang], meta: lang === 'hi' ? region.hi : region.name }))}
    />
    <section className="signal-container mt-14 sm:mt-20">
      <div className="states-hub-grid">
        <IndiaMap tiers={tiers} />
        <div>
          <p className="signal-kicker text-accent">{t('Where the fights are', 'लड़ाइयाँ कहाँ हैं')}</p>
          <div className="mt-4 grid gap-3">
            {profiled.map((region) => {
              const profile = STATE_PROFILES[region.name];
              return <Link key={region.name} href={`/state/${regionSlug(region.name)}`} className={`state-feature is-${profile.tone}`} data-testid={`link-state-feature-${regionSlug(region.name)}`}>
                <span className="state-feature-name">{lang === 'hi' ? region.hi : region.name}</span>
                <span className="state-feature-status">{profile.status[lang]}</span>
                <span className="state-feature-summary">{profile.summary[lang]}</span>
              </Link>;
            })}
          </div>
        </div>
      </div>
    </section>
    <section className="signal-container mt-16 sm:mt-24" aria-labelledby="all-regions-title">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <h2 id="all-regions-title" className="font-display text-4xl sm:text-5xl">{t('Every state and Union Territory', 'हर राज्य और केंद्रशासित प्रदेश')}</h2>
        <div className="answers-chips" role="group" aria-label={t('Filter', 'छाँटें')}>
          {([['all', t('All', 'सभी')], ['state', t('States', 'राज्य')], ['ut', t('Union Territories', 'केंद्रशासित प्रदेश')], ['covered', t('With records', 'रिकॉर्ड वाले')]] as const).map(([value, text]) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => setKind(value)}>{text}</button>)}
        </div>
      </div>
      <ul className="region-grid">
        {listed.map((region) => {
          const tier = tiers.get(region.name) ?? 'none';
          const count = counts.get(region.name) ?? 0;
          return <li key={region.name}><Link href={`/state/${regionSlug(region.name)}`} className={`region-card is-${tier}`} data-testid={`link-region-${regionSlug(region.name)}`}>
            <span className="region-card-name">{lang === 'hi' ? region.hi : region.name}</span>
            <span className="region-card-kind">{region.kind === 'ut' ? t('Union Territory', 'केंद्रशासित प्रदेश') : t('State', 'राज्य')}</span>
            <span className="region-card-status">{tier === 'profiled' ? STATE_PROFILES[region.name].status[lang] : tier === 'mentioned' ? t(`${count} ${count === 1 ? 'record mentions it' : 'records mention it'}`, `${count} रिकॉर्ड में उल्लेख`) : t('No sourced record yet', 'अभी कोई स्रोत-आधारित रिकॉर्ड नहीं')}</span>
          </Link></li>;
        })}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">{t('“Mentioned” means a published record names the state; it is not a full state profile.', '“उल्लेख” का मतलब है कि किसी प्रकाशित रिकॉर्ड में राज्य का नाम है; यह पूरी राज्य प्रोफ़ाइल नहीं है।')} {label('National')}: {t('national records stay off the map.', 'राष्ट्रीय रिकॉर्ड नक्शे पर नहीं दिखते।')}</p>
    </section>
  </main>;
}

/** One state or UT: its profile if we have one, every record that concerns it, and an honest gap if not. */
export function StateProfilePage() {
  const t = useT();
  const lang = useLang();
  const label = useLabel();
  const params = useParams<{ slug?: string }>();
  const region = regionBySlug(params.slug);
  const { stories, isLoading } = usePublishedStories();
  const { tiers } = useCoverage(stories);
  const policyParams = useMemo(() => ({ limit: 100 }), []);
  const policies = useGetPolicies(policyParams, { query: { queryKey: getGetPoliciesQueryKey(policyParams), staleTime: 60_000 } });
  const eventParams = useMemo(() => ({ limit: 100 }), []);
  const events = useGetEvidenceEvents(eventParams, { query: { queryKey: getGetEvidenceEventsQueryKey(eventParams), staleTime: 60_000 } });
  const profile = region ? STATE_PROFILES[region.name] : undefined;
  const records = region ? stories.filter((story) => storyConcerns(story, region)) : [];
  const ledger: Array<ReturnType<typeof localizePolicy>> = region ? (policies.data?.records ?? []).filter((record: PolicyRecord) => (record.state && stateNameKey(record.state) === stateNameKey(region.name)) || profile?.ledger.includes(record.slug)).map((record) => localizePolicy(record, lang)) : [];
  const relatedEvents = region ? (events.data?.events ?? []).filter((item) => new RegExp(`\\b${region.name}\\b`, 'i').test(`${item.event.title} ${item.event.summary}`)) : [];
  const name = region ? (lang === 'hi' ? region.hi : region.name) : '';
  const path = `/state/${params.slug ?? ''}`;
  const meta = region ? stateMeta(region, records.length > 0, lang) : undefined;
  // An unknown slug renders NotFound, whose effect runs first; keep its not-found tags.
  const title = meta?.title ?? t(PAGE_META.notFound.title.en, PAGE_META.notFound.title.hi);
  const description = meta?.description ?? PAGE_META.notFound.description.en;
  useSeo({
    title,
    description,
    canonicalPath: region ? path : undefined,
    robots: meta?.robots ?? 'noindex, nofollow',
    structuredData: region ? siteGraph(
      webPageNode(path, { name: title, description, about: placeForState(region.name), publisher: organizationRef }, 'CollectionPage'),
      breadcrumbNode(path, [[t('States', 'राज्य'), '/states'], [name, path]]),
    ) : undefined,
  });
  if (!region) return <NotFound />;
  return <main className="signal-page">
    <Header />
    <section className="signal-container state-head">
      <nav className="article-crumbs" aria-label={t('Breadcrumb', 'ब्रेडक्रंब')}><Link href="/states"><ArrowLeft size={12} className="mr-1 inline" />{t('All states', 'सभी राज्य')}</Link><span aria-hidden="true">/</span><span>{region.kind === 'ut' ? t('Union Territory', 'केंद्रशासित प्रदेश') : t('State', 'राज्य')}</span></nav>
      <div className="state-head-grid">
        <div>
          <h1 className="state-title">{name}</h1>
          {profile ? <>
            <p className={`state-status is-${profile.tone}`}>{profile.status[lang]}</p>
            <p className="state-summary">{profile.summary[lang]}</p>
          </> : <p className="state-summary">{records.length > 0 ? t('We have not built a full profile for this state yet. The published records that mention it are below.', 'हमने अभी इस राज्य की पूरी प्रोफ़ाइल नहीं बनाई है। इसका उल्लेख करने वाले प्रकाशित रिकॉर्ड नीचे हैं।') : t('We have not yet published a sourced record on this state. That is a gap, and we would rather show it than fill it with guesses.', 'हमने अभी इस राज्य पर कोई स्रोत-आधारित रिकॉर्ड प्रकाशित नहीं किया है। यह एक कमी है, और हम इसे अनुमानों से भरने के बजाय दिखाना बेहतर समझते हैं।')}</p>}
          <dl className="state-stats">
            <div><dt>{t('Records', 'रिकॉर्ड')}</dt><dd>{isLoading ? '…' : records.length}</dd></div>
            <div><dt>{t('Ledger entries', 'रजिस्टर प्रविष्टियाँ')}</dt><dd>{ledger.length}</dd></div>
            <div><dt>{t('Dated events', 'तारीख़वार घटनाएँ')}</dt><dd>{relatedEvents.length}</dd></div>
          </dl>
        </div>
        <IndiaMap tiers={tiers} focus={region.name} compact />
      </div>
    </section>
    {profile && <section className="signal-container mt-14">
      <div className="grid gap-10 border-y-2 border-foreground py-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-16">
        <div>
          <p className="signal-kicker text-accent">{t('Where it stands, in dates', 'मामला कहाँ है, तारीख़ों में')}</p>
          <ol className="topic-play mt-5">{profile.facts.map((fact) => <li key={fact.when + fact.text.en} className="topic-play-item is-decided"><time dateTime={fact.when} className="signal-kicker text-muted-foreground">{formatDay(fact.when, lang)}</time><p className="mt-1 text-[.95rem] leading-relaxed">{fact.text[lang]}</p>{fact.source && <a className="mt-2 inline-flex text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground" href={fact.source.url} target="_blank" rel="noopener noreferrer">{t(`Source: ${fact.source.label}`, `स्रोत: ${fact.source.label}`)} <ArrowUpRight size={12} className="ml-1" aria-hidden="true" /></a>}{fact.review && <p className="mt-1 text-xs text-muted-foreground" data-testid={`state-review-${regionSlug(region.name)}-${fact.when}`}>{t(`Status checked ${formatDay(fact.review.checkedOn, lang)} · Next check: ${fact.review.nextCheck.en}`, `${formatDay(fact.review.checkedOn, lang)} को स्थिति जाँची · अगली जाँच: ${fact.review.nextCheck.hi}`)}</p>}</li>)}</ol>
        </div>
        <div>
          <p className="signal-kicker text-accent">{t('The questions they won’t answer', 'वे सवाल, जिनका जवाब वे नहीं देंगे')}</p>
          <ol className="mt-5 divide-y divide-foreground/15 border-y border-foreground/15">{profile.questions.map((question, index) => <li key={question.en} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4"><span className="font-display text-2xl text-accent">{String(index + 1).padStart(2, '0')}</span><p className="font-display text-xl leading-snug">{question[lang]}</p></li>)}</ol>
        </div>
      </div>
    </section>}
    {records.length > 0 && <section className="signal-container mt-14">
      <div className="border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('The reporting', 'रिपोर्टिंग')}</p><h2 className="mt-2 font-display text-4xl">{t(`Records on ${name}`, `${name} पर रिकॉर्ड`)}</h2></div>
      <div className="state-records">{records.map((story) => <RecordRow key={story.id} story={story} />)}</div>
    </section>}
    {ledger.length > 0 && <section className="signal-container mt-14">
      <div className="border-b-2 border-foreground pb-4"><p className="signal-kicker text-accent">{t('From the policy ledger', 'नीति रजिस्टर से')}</p></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{ledger.map((record) => <Link key={record.slug} href={record.canonicalPath} className="topic-policy-card group" lang={record.contentLang}><span className={`topic-policy-status is-${record.status.replace(/\s+/g, '-')}`}>{label(record.status)}</span><h3 className="mt-3 font-display text-2xl leading-tight group-hover:text-accent">{record.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{record.courtStatus}</p></Link>)}</div>
    </section>}
    <section className="signal-container mt-14">
      <div className="state-gap">
        <div>
          <p className="signal-kicker text-accent">{t('Find out yourself', 'ख़ुद पता कीजिए')}</p>
          <h2 className="mt-2 font-display text-3xl leading-tight">{t(`What ${name} should publish, and how to ask for it`, `${name} को क्या प्रकाशित करना चाहिए, और उसे कैसे माँगें`)}</h2>
          <ol className="mt-5 grid gap-3 text-[.95rem] leading-relaxed">
            <li><b>{t('The reservation Act and rules', 'आरक्षण अधिनियम और नियम')}</b> — {t('in the state gazette, with every amendment.', 'राज्य के राजपत्र में, हर संशोधन के साथ।')}</li>
            <li><b>{t('The backward classes commission’s latest report', 'पिछड़ा वर्ग आयोग की ताज़ा रिपोर्ट')}</b> — {t('and the survey data behind it.', 'और उसके पीछे का सर्वेक्षण डेटा।')}</li>
            <li><b>{t('Caste-wise representation in state services, cadre by cadre', 'राज्य सेवाओं में कैडर-दर-कैडर जाति-वार प्रतिनिधित्व')}</b> — {t('the evidence every court asks for first. Ask the General Administration Department by RTI.', 'वह सबूत जो हर अदालत सबसे पहले माँगती है। सामान्य प्रशासन विभाग से आरटीआई के ज़रिए माँगिए।')}</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/answers/how-to-file-an-rti" className="signal-button">{t('How to file the RTI', 'आरटीआई कैसे दाख़िल करें')}</Link><Link href={`/community?state=${encodeURIComponent(region.name)}&ask=`} className="signal-button is-ghost"><MessageCircle size={14} className="mr-1 inline" />{t(`Ask about ${name}`, `${name} के बारे में पूछिए`)}</Link></div>
        </div>
        {relatedEvents.length > 0 && <div>
          <p className="signal-kicker text-accent">{t('Dated events', 'तारीख़वार घटनाएँ')}</p>
          <ul className="mt-4 grid gap-3">{relatedEvents.map((item) => <li key={item.event.id}><Link href={`/events/${item.event.id}`} className="state-event"><span className="signal-kicker text-muted-foreground">{item.event.recordDate ? formatDay(item.event.recordDate, lang) : ''}</span><span lang="en" className="state-event-title">{item.event.title}</span><ArrowUpRight size={14} /></Link></li>)}</ul>
        </div>}
      </div>
    </section>
  </main>;
}

/** The front-page states section: the full map and the live fights, linking into the hub. */
export function HomeStatesSection() {
  const t = useT();
  const lang = useLang();
  const { stories } = usePublishedStories();
  const { tiers } = useCoverage(stories);
  const profiled = REGIONS.filter((region) => STATE_PROFILES[region.name]);
  return <section className="signal-container mt-20 sm:mt-28" id="india-in-focus" aria-labelledby="india-focus-title">
    <div className="flex flex-col justify-between gap-5 border-b-2 border-foreground pb-5 sm:flex-row sm:items-end">
      <div><p className="signal-kicker text-accent">{t('States', 'राज्य')}</p><h2 id="india-focus-title" className="mt-3 font-display text-5xl leading-[.9] tracking-[-.05em] sm:text-6xl">{t(<>One country, many quota laws,<br /><em className="font-normal text-accent">many ways to test a court’s patience.</em></>, <>एक देश, आरक्षण के कई क़ानून,<br /><em className="font-normal text-accent">अदालत के सब्र को परखने के कई तरीक़े।</em></>)}</h2></div>
      <Link href="/states" className="signal-button shrink-0" data-testid="link-home-states-hub">{t('Open all 36 states and UTs', 'सभी 36 राज्य और केंद्रशासित प्रदेश खोलें')} <ArrowUpRight size={14} className="ml-1 inline" /></Link>
    </div>
    <div className="states-hub-grid mt-8">
      <IndiaMap tiers={tiers} />
      <div className="grid content-start gap-3">
        {profiled.map((region) => {
          const profile = STATE_PROFILES[region.name];
          return <Link key={region.name} href={`/state/${regionSlug(region.name)}`} className={`state-feature is-${profile.tone}`}><span className="state-feature-name">{lang === 'hi' ? region.hi : region.name}</span><span className="state-feature-status">{profile.status[lang]}</span></Link>;
        })}
      </div>
    </div>
  </section>;
}
