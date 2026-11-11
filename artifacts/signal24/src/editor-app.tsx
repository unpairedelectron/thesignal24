// The editorial desk and its sign-in pages. Loaded only when someone opens /editor,
// /sign-in or /sign-up, so readers never download the auth SDK (about 1 MB) or the desk.
import { lazy, Suspense, type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import {
  Archive,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Heart,
  Link2,
  Menu,
  MessageCircle,
  MapPin,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Link, Route, Router as WouterRouter, Switch, useLocation, useParams, useSearch } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { FOCUS_SOURCES } from '@/components/focus-source-desk';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  canonicalStateName,
  getRequestedStateFromSearch,
  getSelectedStateFromSearch,
  getMapFeatureName,
  getStateLinkedStories,
  getStateNames,
  getStoriesForState,
  getUnmappedStateNames,
  isMapSelectionKey,
  mapPath,
  parseStateMap,
  searchWithSelectedState,
  stateNameKey,
  toggleStateSelection,
  urlWithSelectedState,
  type MapFeature,
} from '@/lib/state-map';
import {
  getGetArchiveQueryKey,
  getGetDecisionImpactRevisionsQueryKey,
  getGetDecisionImpactRevisionsQueryOptions,
  getGetEditorialIssueQueryKey,
  getGetEditorSessionQueryKey,
  getGetCurrentIssueQueryKey,
  getGetEvidenceEventsQueryKey,
  getGetDecisionImpactsQueryKey,
  getGetLiveUpdatesQueryKey,
  getGetPoliciesQueryKey,
  getGetPolicyQueryKey,
  getGetStoryRevisionsQueryOptions,
  getGetStoryQueryKey,
  useCreateIssue,
  useCreateStory,
  useGetArchive,
  useGetCurrentIssue,
  useGetEvidenceEvents,
  useGetDecisionImpacts,
  useGetDecisionImpactRevisions,
  useGetEditorialIssue,
  useGetLiveUpdates,
  useGetPolicies,
  useGetPolicy,
  useGetStoryRevisions,
  useGetStory,
  getGetCommunityPostsQueryKey,
  getGetCommunityPostQueryKey,
  useGetCommunityPosts,
  useGetCommunityPost,
  useCreateCommunityPost,
  useCreateCommunityReply,
  useToggleCommunityPostLike,
  usePublishIssue,
  useSubscribeToNewsletter,
  useUpdateStory,
  useCreateDecisionImpact,
  useUpdateDecisionImpact,
  useGetEditorSession,
} from '@workspace/api-client-react';
import type { ArchiveResult, CommunityPost, CommunityReply, CommunityPostInput, CommunityPostKind, CommunityTopic, DecisionImpactArea, DecisionImpactEvidenceType, DecisionImpactInput, DecisionImpactRecord, DecisionImpactRevision, DecisionImpactWorkflowStatus, GetCommunityPostsParams, GetCommunityPostsSort, GetPoliciesParams, Issue, IssueInput, LiveUpdate, PolicyRecord, PolicySource, Story, StoryInput, StoryKind, StoryWorkflowStatus, Topic, VerificationStatus } from '@workspace/api-client-react';
import NotFound from '@/pages/not-found';
import { absoluteSiteUrl, basePath, getActiveLang, SITE_LANGUAGE, useSeo } from '@/lib/seo';
import { LangProvider, LanguageSwitch, localizePolicy, localizeStory, useLabel, useLang, useLocalHref, useLocalizeStories, useT, type LocalizedStory } from '@/lib/i18n';
import { ACCOUNTABILITY_CHECKED_ON, ACCOUNTABILITY_ITEMS } from '@/lib/accountability';
import { RichBody, outlineOf } from '@/components/rich-body';
import { GlobalFooter, Header } from '@/components/site-chrome';
import { HomeStage } from '@/components/home-stage';
import { CommunityTeaser, DeskStrip, LedgerTrio, SectionHead, TimelineStrip } from '@/components/home-sections';
import { KeyFigures } from '@/components/key-figures';
import { CountUp } from '@/components/home-stage';
import { KEY_FIGURES, daysSince, type Bilingual } from '@/lib/key-figures';
import { m, useReducedMotion } from 'framer-motion';
import type { CabinetDrawer } from '@/components/topic-stage';
import { TOPIC_BRIEFS, TOPIC_BRIEFS_CHECKED_ON, topicBrief, type TopicBrief, type TopicKey } from '@/lib/topic-briefs';
import { authorPageStructuredData, breadcrumbNode, collectionPageNode, EDITORIAL_DESK_PATH, editorialDeskNode, editorialDeskRef, externalDocument, imageObject, organizationRef, placeForState, siteGraph, webPageNode, websiteRef } from '@/lib/structured-data';
import { AUTHORS, authorByName, authorBySlug, authorMeta, authorPath, PEN_NAME_NOTE, type Author } from '@/lib/authors';
import { PAGE_META } from '@/lib/page-meta';
import { INFO_PAGES } from '@/lib/info-pages';
import { POLICY_NOTES } from '@/lib/policy-notes';
import { illustration, imageCaptionForStory, imageForStory, imageForText, slugify, storyPath, storySeo, TOPIC_ILLUSTRATION, type IllustrationName } from '@/lib/stories';
import { DECISION_IMPACT_AREAS, DECISION_IMPACT_EVIDENCE_TYPES, DECISION_IMPACT_WORKFLOW_STATUSES, EditorEvidenceDesk, EmptyState, ErrorState, KINDS, LoadingBlock, TOPICS, VERIFICATION_STATUSES, WORKFLOW_STATUSES, evidenceTypeLabel, formatDate, queryClient, verificationLabel } from './App';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="signal-kicker text-muted-foreground">{label}</span>{children}</label>;
}

type StoryDraft = StoryInput & { id?: number };
const emptyStory = (issueId: number): StoryDraft => ({ issueId, topic: 'Latest', kind: 'Article', state: '', source: '', sourceUrl: '', publishedOn: new Date().toISOString().slice(0, 10), eyebrow: '', title: '', dek: '', body: '', time: '6 min', read: 6, tone: 'Latest', number: null, sortOrder: 1 });

function localDateTimeValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function RevisionHistory({ storyId }: { storyId?: number }) {
  const { data, isLoading } = useGetStoryRevisions(storyId ?? 0, {
    query: { ...getGetStoryRevisionsQueryOptions(storyId ?? 0), enabled: Boolean(storyId) },
  });
  if (!storyId) return null;
  return <div className="mt-6 border-t border-foreground/15 pt-5">
    <div className="flex items-center justify-between gap-4">
      <p className="signal-kicker text-accent">Revision history</p>
      <span className="signal-kicker text-muted-foreground">{data?.length ?? 0} saved</span>
    </div>
    {isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading saved revisions…</p> : data?.length ? <div className="mt-3 space-y-2">{data.map((revision) => {
      const title = typeof revision.snapshot.title === 'string' ? revision.snapshot.title : 'Untitled revision';
      return <div key={revision.id} className="flex items-start justify-between gap-4 border-l border-foreground/20 pl-3 text-sm">
        <div><p className="font-medium">Revision {revision.revisionNumber}</p><p className="text-muted-foreground">{revision.changeNote || 'No change note'}</p><p className="text-xs text-muted-foreground">{title}</p></div>
        <time className="shrink-0 text-xs text-muted-foreground">{formatDate(revision.createdAt)}</time>
      </div>;
    })}</div> : <p className="mt-3 text-sm text-muted-foreground">No revisions recorded yet.</p>}
  </div>;
}

type DecisionImpactDraft = DecisionImpactInput & { id?: number };

function DecisionImpactRevisionHistory({ recordId }: { recordId: number }) {
  const { data, isLoading, isError } = useGetDecisionImpactRevisions(recordId, {
    query: {
      ...getGetDecisionImpactRevisionsQueryOptions(recordId),
      enabled: Boolean(recordId),
    },
  });

  if (isLoading) {
    return <p className="mt-3 text-sm text-muted-foreground">Loading saved revisions…</p>;
  }
  if (isError) {
    return <p className="mt-3 text-sm text-accent" role="alert">The revision history could not be loaded.</p>;
  }
  if (!data?.length) {
    return <p className="mt-3 text-sm text-muted-foreground">No revisions recorded yet.</p>;
  }

  return <div className="mt-3 space-y-3">
    {data.map((revision: DecisionImpactRevision) => {
      const snapshot = revision.snapshot;
      const snapshotTitle = typeof snapshot.title === 'string' ? snapshot.title : 'Untitled revision';
      return <details key={revision.id} className="border-l border-foreground/20 pl-3" data-testid={`decision-impact-revision-${revision.revisionNumber}`}>
        <summary className="cursor-pointer text-sm">
          <span className="font-medium">Revision {revision.revisionNumber} / {snapshotTitle}</span>
          <span className="ml-2 text-xs text-muted-foreground">{formatDate(revision.createdAt)}</span>
        </summary>
        <p className="mt-2 text-sm text-muted-foreground">{revision.changeNote}</p>
        <p className="mt-1 signal-kicker text-muted-foreground">Recorded by {revision.changedBy}</p>
        <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words border border-foreground/10 bg-background p-3 text-xs leading-relaxed text-muted-foreground">{JSON.stringify(snapshot, null, 2)}</pre>
      </details>;
    })}
  </div>;
}

function DecisionImpactDeskRecordRow({
  record,
  historyOpen,
  onToggleHistory,
  onEdit,
}: {
  record: DecisionImpactRecord;
  historyOpen: boolean;
  onToggleHistory: () => void;
  onEdit: () => void;
}) {
  return <div className="py-4" data-testid={`row-editor-decision-impact-${record.id}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="signal-kicker text-accent">{evidenceTypeLabel(record.evidenceType)} / {record.decisionArea}</p>
          <span className="rounded-full border border-foreground/20 px-2 py-1 signal-kicker text-[9px]">{record.workflowStatus}</span>
          <span className="signal-kicker text-muted-foreground">{verificationLabel(record.verificationStatus)}</span>
        </div>
        <h3 className="mt-1 truncate font-display text-2xl">{record.title}</h3>
        <p className="mt-1 truncate text-sm text-muted-foreground">{record.geography} · {formatDate(record.observedOn)} · {record.source}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-4">
        <button type="button" onClick={onToggleHistory} aria-expanded={historyOpen} className="inline-flex items-center gap-1 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-history-decision-impact-${record.id}`}>
          <ChevronDown size={13} className={historyOpen ? 'rotate-180' : ''} /> History
        </button>
        <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-edit-decision-impact-${record.id}`}>
          <Pencil size={13} /> Edit
        </button>
      </div>
    </div>
    {historyOpen && <DecisionImpactRevisionHistory recordId={record.id} />}
  </div>;
}

function emptyDecisionImpact(): DecisionImpactDraft {
  const today = new Date().toISOString().slice(0, 10);
  return {
    evidenceType: 'lived-account',
    decisionArea: 'migration',
    title: '',
    summary: '',
    geography: 'India',
    observedOn: today,
    definition: '',
    findingValue: null,
    findingUnit: null,
    denominator: null,
    source: '',
    sourceUrl: '',
    sourcePublishedOn: null,
    sourceRetrievedOn: today,
    verificationStatus: 'unverified',
    verificationNotes: '',
    workflowStatus: 'draft',
    revisionNote: '',
  };
}

function DecisionImpactDeskPanel() {
  const queryClient = useQueryClient();
  const listParams = useMemo(() => ({ includeUnpublished: true, limit: 100 }), []);
  const { data, isLoading, isError, refetch } = useGetDecisionImpacts(listParams, { query: { queryKey: getGetDecisionImpactsQueryKey(listParams) } });
  const createMutation = useCreateDecisionImpact();
  const updateMutation = useUpdateDecisionImpact();
  const [form, setForm] = useState<DecisionImpactDraft | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [historyRecordId, setHistoryRecordId] = useState<number | null>(null);
  const records = data?.records ?? [];
  const setField = (field: keyof DecisionImpactDraft, value: string | number | null) => setForm((current) => current ? { ...current, [field]: value } : current);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setNotice(null);
    const onSuccess = () => {
      setForm(null);
      setNotice(form.id ? 'Decision-impact evidence updated.' : 'Decision-impact evidence saved as a draft.');
      void queryClient.invalidateQueries({ queryKey: getGetDecisionImpactsQueryKey(listParams) });
      void queryClient.invalidateQueries({ queryKey: getGetDecisionImpactsQueryKey({ limit: 100 }) });
      if (form.id) {
        void queryClient.invalidateQueries({ queryKey: getGetDecisionImpactRevisionsQueryKey(form.id) });
      }
    };
    const onError = () => setNotice('The evidence record could not be saved. Check the source, dates and required definition.');
    if (form.id) updateMutation.mutate({ recordId: form.id, data: form }, { onSuccess, onError });
    else createMutation.mutate({ data: form }, { onSuccess, onError });
  }
  return <section className="signal-container border-t-2 border-primary py-10 sm:py-14" data-testid="section-decision-impact-editor">
    <div className="flex flex-col justify-between gap-5 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">03 / Decision evidence</p><h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">Publish what the evidence can carry.</h2><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Keep lived accounts, monitored leads and quantified findings separate. A quantified finding needs a definition, geography, date, source and verification context before it can appear as a measured signal.</p></div><button type="button" onClick={() => setForm(emptyDecisionImpact())} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 signal-kicker text-accent-foreground" data-testid="button-add-decision-impact"><Plus size={14} /> Add evidence</button></div>
    {notice && <p className="mt-5 border border-secondary bg-secondary/15 px-4 py-3 text-sm" role="status" data-testid="status-decision-impact-editor">{notice}</p>}
    {form ? <form onSubmit={save} className="mt-6 grid gap-4 border border-foreground/20 bg-card p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4"><p className="font-display text-2xl">{form.id ? 'Edit evidence record' : 'New evidence record'}</p><button type="button" onClick={() => setForm(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close evidence form" data-testid="button-close-decision-impact-form"><X size={18} /></button></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Evidence class"><select required value={form.evidenceType} onChange={(event) => setField('evidenceType', event.target.value)} className="editor-input" data-testid="select-decision-impact-evidence-type">{DECISION_IMPACT_EVIDENCE_TYPES.map((type) => <option key={type} value={type}>{evidenceTypeLabel(type)}</option>)}</select></Field>
        <Field label="Decision area"><select required value={form.decisionArea} onChange={(event) => setField('decisionArea', event.target.value)} className="editor-input" data-testid="select-decision-impact-area">{DECISION_IMPACT_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}</select></Field>
        <Field label="Workflow state"><select value={form.workflowStatus ?? 'draft'} onChange={(event) => setField('workflowStatus', event.target.value)} className="editor-input" data-testid="select-decision-impact-workflow">{DECISION_IMPACT_WORKFLOW_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
        <Field label="Verification state"><select value={form.verificationStatus ?? 'unverified'} onChange={(event) => setField('verificationStatus', event.target.value)} className="editor-input" data-testid="select-decision-impact-verification">{VERIFICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
        <Field label="Geography"><input required minLength={2} value={form.geography} onChange={(event) => setField('geography', event.target.value)} className="editor-input" placeholder="India, Maharashtra, or a defined population" data-testid="input-decision-impact-geography" /></Field>
        <Field label="Observed on"><input required type="date" value={form.observedOn} onChange={(event) => setField('observedOn', event.target.value)} className="editor-input" data-testid="input-decision-impact-observed-on" /></Field>
        <Field label="Source"><input required value={form.source} onChange={(event) => setField('source', event.target.value)} className="editor-input" placeholder="Institution, publication, participant or dataset" data-testid="input-decision-impact-source" /></Field>
        <Field label="Source URL"><input required type="url" value={form.sourceUrl} onChange={(event) => setField('sourceUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-decision-impact-source-url" /></Field>
        <Field label="Source published on"><input type="date" value={form.sourcePublishedOn ?? ''} onChange={(event) => setField('sourcePublishedOn', event.target.value || null)} className="editor-input" data-testid="input-decision-impact-source-published-on" /></Field>
        <Field label="Source retrieved on"><input required type="date" value={form.sourceRetrievedOn} onChange={(event) => setField('sourceRetrievedOn', event.target.value)} className="editor-input" data-testid="input-decision-impact-source-retrieved-on" /></Field>
      </div>
      <Field label="Title"><input required minLength={12} value={form.title} onChange={(event) => setField('title', event.target.value)} className="editor-input text-lg" data-testid="input-decision-impact-title" /></Field>
      <Field label="Summary"><textarea required minLength={20} value={form.summary} onChange={(event) => setField('summary', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="textarea-decision-impact-summary" /></Field>
      <Field label="Definition / what was measured or observed"><textarea required minLength={20} value={form.definition} onChange={(event) => setField('definition', event.target.value)} className="editor-input min-h-24 resize-y" placeholder="Name the population, measure, period and comparison this record can support." data-testid="textarea-decision-impact-definition" /></Field>
      <div className="grid gap-4 sm:grid-cols-3"><Field label="Finding value (quantified only)"><input type="number" step="any" value={form.findingValue ?? ''} onChange={(event) => setField('findingValue', event.target.value === '' ? null : Number(event.target.value))} className="editor-input" placeholder="Leave blank for accounts or leads" data-testid="input-decision-impact-value" /></Field><Field label="Unit"><input value={form.findingUnit ?? ''} onChange={(event) => setField('findingUnit', event.target.value || null)} className="editor-input" placeholder="%, people, applications" data-testid="input-decision-impact-unit" /></Field><Field label="Denominator / comparison"><input value={form.denominator ?? ''} onChange={(event) => setField('denominator', event.target.value || null)} className="editor-input" placeholder="Who or what the value covers" data-testid="input-decision-impact-denominator" /></Field></div>
      <Field label="Verification context"><textarea value={form.verificationNotes ?? ''} onChange={(event) => setField('verificationNotes', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="What was checked, against which source, and what remains uncertain?" data-testid="textarea-decision-impact-verification-notes" /></Field>
      <Field label="Revision note"><input value={form.revisionNote ?? ''} onChange={(event) => setField('revisionNote', event.target.value)} className="editor-input" placeholder="What changed?" data-testid="input-decision-impact-revision-note" /></Field>
      <div className="flex flex-wrap gap-2"><button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-save-decision-impact">{createMutation.isPending || updateMutation.isPending ? 'Saving…' : form.id ? 'Save changes' : 'Save draft'}</button><button type="button" onClick={() => setForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 signal-kicker" data-testid="button-cancel-decision-impact">Cancel</button></div>
    </form> : <div className="mt-6">
      {isLoading ? <p className="text-sm text-muted-foreground">Loading evidence records…</p> : isError ? <div className="flex flex-wrap items-center justify-between gap-4 border border-accent/50 p-5"><p className="text-sm text-muted-foreground">The evidence records could not be loaded.</p><button type="button" onClick={() => void refetch()} className="signal-kicker text-accent">Try again</button></div> : records.length === 0 ? <div className="border border-dashed border-foreground/25 p-6"><p className="signal-kicker text-accent">No decision evidence yet</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Add a lived account, monitored lead or quantified finding with its source and verification frame.</p></div> : <div className="divide-y divide-foreground/15">
        {records.map((record) => <DecisionImpactDeskRecordRow
          key={record.id}
          record={record}
          historyOpen={historyRecordId === record.id}
          onToggleHistory={() => setHistoryRecordId((current) => current === record.id ? null : record.id)}
          onEdit={() => setForm({
            ...record,
            revisionNote: '',
            observedOn: record.observedOn,
            sourcePublishedOn: record.sourcePublishedOn,
            sourceRetrievedOn: record.sourceRetrievedOn,
            workflowStatus: record.workflowStatus === 'published' ? 'draft' : record.workflowStatus,
          })}
        />)}
      </div>}
    </div>}
  </section>;
}

function EditorialDesk() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useGetEditorialIssue();
  const createIssueMutation = useCreateIssue();
  const publishMutation = usePublishIssue();
  const createStoryMutation = useCreateStory();
  const updateStoryMutation = useUpdateStory();
  const [workingIssue, setWorkingIssue] = useState<Issue | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [issueForm, setIssueForm] = useState<IssueInput>({ issueDate: new Date().toISOString().slice(0, 10), issueNumber: 1, title: '', intro: '' });
  const [storyForm, setStoryForm] = useState<StoryDraft | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (data && !hydrated.current) {
      hydrated.current = true;
      setWorkingIssue(data.issue);
      setStories(data.stories);
      setIssueForm({ issueDate: data.issue.issueDate, issueNumber: data.issue.issueNumber, title: data.issue.title, intro: data.issue.intro });
    }
  }, [data]);
  useEffect(() => { document.title = 'Editorial desk — The Signal 24'; }, []);

  if (isLoading) return <div className="signal-page"><Header editor /><LoadingBlock label="Loading the editorial desk…" /></div>;
  if (isError) return <div className="signal-page"><Header editor /><div className="py-20"><ErrorState message="The editorial workspace could not be loaded." onRetry={() => void refetch()} /></div></div>;

  const updateIssue = (field: keyof IssueInput, value: string) => setIssueForm((current) => ({ ...current, [field]: field === 'issueNumber' ? Number(value) : value }));
  const setStory = (field: keyof StoryInput, value: string) => setStoryForm((current) => current ? { ...current, [field]: ['read', 'sortOrder', 'number'].includes(field) ? (value === '' ? null : Number(value)) : value } : current);
  const setHi = (field: 'title' | 'dek' | 'body', value: string) => setStoryForm((current) => {
    if (!current) return current;
    const next = { title: current.hi?.title ?? '', dek: current.hi?.dek ?? '', body: current.hi?.body ?? '', [field]: value };
    return { ...current, hi: next.title || next.dek || next.body ? next : null };
  });

  function createIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    createIssueMutation.mutate({ data: issueForm }, {
      onSuccess: (issue) => { setWorkingIssue(issue); setStories([]); setStoryForm(null); setNotice({ type: 'success', text: `Issue ${issue.issueNumber} created as a draft.` }); },
      onError: () => setNotice({ type: 'error', text: 'The issue could not be created. Check the fields and try again.' }),
    });
  }

  function saveStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!storyForm) return;
    setNotice(null);
    const onSuccess = (saved: Story) => {
      setStories((current) => storyForm.id ? current.map((item) => item.id === saved.id ? saved : item) : [...current, saved]);
      setStoryForm(null);
      setNotice({ type: 'success', text: storyForm.id ? 'Record updated and revision saved.' : 'Record added as a draft.' });
      void queryClient.invalidateQueries({ queryKey: getGetEditorialIssueQueryKey() });
    };
    if (storyForm.id) {
      updateStoryMutation.mutate({ storyId: storyForm.id, data: storyForm }, { onSuccess, onError: () => setNotice({ type: 'error', text: 'The record could not be updated. Published records must be moved back to draft before editing.' }) });
    } else {
      createStoryMutation.mutate({ data: storyForm }, { onSuccess, onError: () => setNotice({ type: 'error', text: 'The record could not be added.' }) });
    }
  }

  function publish() {
    if (!workingIssue) return;
    publishMutation.mutate({ issueId: workingIssue.id }, {
      onSuccess: (issue) => { setWorkingIssue(issue); setNotice({ type: 'success', text: `Issue ${issue.issueNumber} is now published.` }); void queryClient.invalidateQueries({ queryKey: getGetEditorialIssueQueryKey() }); },
      onError: () => setNotice({ type: 'error', text: 'Publishing is blocked until every record is in review or already published with a review timestamp.' }),
    });
  }

  return <main className="signal-page"><Header editor /><section className="signal-container pt-12 sm:pt-20"><div className="flex flex-col justify-between gap-7 border-b border-foreground/20 pb-8 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">Private workspace / editorial desk</p><h1 className="mt-3 font-display text-6xl leading-[.9] tracking-[-.06em] sm:text-8xl">Make the<br /><em className="font-normal text-accent">record.</em></h1><p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">Create an issue, add source-aware records, and move each record through draft, review, scheduled, published or archived states. Publication is blocked until review is recorded.</p></div><div className="flex items-center gap-2 signal-kicker text-muted-foreground"><Pencil size={14} className="text-accent" /> {workingIssue?.status ?? 'draft'} / {workingIssue ? `Issue ${workingIssue.issueNumber}` : 'No issue'}</div></div>{notice && <div className={`mt-6 flex items-center gap-3 border px-4 py-3 text-sm ${notice.type === 'success' ? 'border-secondary bg-secondary/15' : 'border-destructive bg-destructive/10 text-destructive'}`} role="status" data-testid="status-editor-notice"><Check size={16} /> {notice.text}</div>}</section>
    <section className="signal-container grid gap-8 py-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-12"><div className="space-y-7"><div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="signal-kicker text-accent">01 / Issue</p><h2 className="mt-2 font-display text-3xl">Edition details</h2></div>{workingIssue && <span className="signal-kicker text-muted-foreground">{workingIssue.status}</span>}</div><form onSubmit={createIssue} className="mt-6 grid gap-4"><Field label="Issue date"><input required type="date" value={issueForm.issueDate} onChange={(event) => updateIssue('issueDate', event.target.value)} className="editor-input" data-testid="input-issue-date" /></Field><Field label="Issue number"><input required type="number" min="1" value={issueForm.issueNumber} onChange={(event) => updateIssue('issueNumber', event.target.value)} className="editor-input" data-testid="input-issue-number" /></Field><Field label="Edition title"><input required value={issueForm.title} onChange={(event) => updateIssue('title', event.target.value)} className="editor-input" placeholder="A clear title for this edition" data-testid="input-issue-title" /></Field><Field label="Introduction"><textarea required value={issueForm.intro} onChange={(event) => updateIssue('intro', event.target.value)} className="editor-input min-h-28 resize-y" placeholder="What should a reader understand before they begin?" data-testid="input-issue-intro" /></Field><div className="flex flex-wrap gap-2"><button type="submit" disabled={createIssueMutation.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-create-issue">{createIssueMutation.isPending ? 'Creating…' : 'Create new issue'} <Plus size={14} /></button>{workingIssue && <button type="button" onClick={publish} disabled={publishMutation.isPending || workingIssue.status === 'published'} className="inline-flex items-center gap-2 rounded-full border border-accent px-4 py-3 signal-kicker text-accent disabled:opacity-40" data-testid="button-publish-issue">{publishMutation.isPending ? 'Publishing…' : workingIssue.status === 'published' ? 'Published' : 'Publish issue'} <Send size={14} /></button>}</div></form></div><div className="border-l-2 border-accent px-5 py-2"><p className="signal-kicker text-accent">Desk note</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A source label is not decoration. It tells readers what kind of record they are reading, and what claims it can responsibly carry.</p></div></div>
      <div className="editor-panel border border-foreground/20 bg-card p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 border-b border-foreground/15 pb-5 sm:flex-row sm:items-end"><div><p className="signal-kicker text-accent">02 / Records</p><h2 className="mt-2 font-display text-3xl">Build the issue</h2></div><button type="button" disabled={!workingIssue} onClick={() => workingIssue && setStoryForm(emptyStory(workingIssue.id))} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 signal-kicker text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid="button-add-record"><Plus size={14} /> Add record</button></div>{!workingIssue ? <div className="py-16"><EmptyState title="Create an issue first." text="The record form will appear here once an issue exists." /></div> : storyForm ? <form onSubmit={saveStory} className="mt-6 grid gap-4"><div className="flex items-center justify-between"><p className="font-display text-2xl">{storyForm.id ? 'Edit record' : 'New record'}</p><button type="button" onClick={() => setStoryForm(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close record form" data-testid="button-close-record-form"><X size={18} /></button></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Workflow state"><select value={storyForm.workflowStatus ?? 'draft'} onChange={(event) => setStory('workflowStatus', event.target.value)} className="editor-input" data-testid="select-story-workflow">{WORKFLOW_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Verification state"><select value={storyForm.verificationStatus ?? 'unverified'} onChange={(event) => setStory('verificationStatus', event.target.value)} className="editor-input" data-testid="select-story-verification">{VERIFICATION_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Topic"><select value={storyForm.topic} onChange={(event) => setStory('topic', event.target.value)} className="editor-input" data-testid="select-story-topic">{TOPICS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Record type"><select value={storyForm.kind} onChange={(event) => setStory('kind', event.target.value)} className="editor-input" data-testid="select-story-kind">{KINDS.map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="State / territory"><input value={storyForm.state ?? ''} onChange={(event) => setStory('state', event.target.value)} className="editor-input" placeholder="Leave blank if national" data-testid="input-story-state" /></Field><Field label="Published on"><input type="date" value={storyForm.publishedOn ?? ''} onChange={(event) => setStory('publishedOn', event.target.value)} className="editor-input" data-testid="input-story-date" /></Field><Field label="Source"><input required value={storyForm.source} onChange={(event) => setStory('source', event.target.value)} className="editor-input" placeholder="Court, publication, institution or archive" data-testid="input-story-source" /></Field><Field label="Source URL"><input type="url" value={storyForm.sourceUrl ?? ''} onChange={(event) => setStory('sourceUrl', event.target.value)} className="editor-input" placeholder="https://" data-testid="input-story-source-url" /></Field><Field label="Source published on"><input type="date" value={storyForm.sourcePublishedOn ?? ''} onChange={(event) => setStory('sourcePublishedOn', event.target.value)} className="editor-input" data-testid="input-source-published-on" /></Field><Field label="Source retrieved on"><input type="date" value={storyForm.sourceRetrievedOn ?? ''} onChange={(event) => setStory('sourceRetrievedOn', event.target.value)} className="editor-input" data-testid="input-source-retrieved-on" /></Field><Field label="Scheduled for"><input type="datetime-local" value={localDateTimeValue(storyForm.scheduledFor)} onChange={(event) => setStory('scheduledFor', event.target.value ? new Date(event.target.value).toISOString() : '')} className="editor-input" data-testid="input-story-scheduled-for" /></Field><Field label="Eyebrow"><input value={storyForm.eyebrow} onChange={(event) => setStory('eyebrow', event.target.value)} className="editor-input" placeholder="What kind of moment is this?" data-testid="input-story-eyebrow" /></Field><Field label="Visual tone"><input value={storyForm.tone} onChange={(event) => setStory('tone', event.target.value)} className="editor-input" placeholder="Latest, history, data…" data-testid="input-story-tone" /></Field><Field label="Reading time"><input value={storyForm.time} onChange={(event) => setStory('time', event.target.value)} className="editor-input" placeholder="8 min" data-testid="input-story-time" /></Field><Field label="Minutes"><input type="number" min="1" value={storyForm.read} onChange={(event) => setStory('read', event.target.value)} className="editor-input" data-testid="input-story-read" /></Field><Field label="Story number"><input type="number" value={storyForm.number ?? ''} onChange={(event) => setStory('number', event.target.value)} className="editor-input" data-testid="input-story-number" /></Field><Field label="Sort order"><input type="number" min="1" value={storyForm.sortOrder} onChange={(event) => setStory('sortOrder', event.target.value)} className="editor-input" data-testid="input-story-sort-order" /></Field></div><Field label="Verification notes"><textarea value={storyForm.verificationNotes ?? ''} onChange={(event) => setStory('verificationNotes', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="What was checked, against which source, and when?" data-testid="input-verification-notes" /></Field><Field label="AI-assisted drafting disclosure"><textarea value={storyForm.aiDisclosure ?? ''} onChange={(event) => setStory('aiDisclosure', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="Leave blank when no AI assistance was used." data-testid="input-ai-disclosure" /></Field><Field label="Correction note"><textarea value={storyForm.correctionNote ?? ''} onChange={(event) => setStory('correctionNote', event.target.value)} className="editor-input min-h-20 resize-y" placeholder="Visible note for a correction or clarification." data-testid="input-correction-note" /></Field><Field label="Revision note"><input value={storyForm.revisionNote ?? ''} onChange={(event) => setStory('revisionNote', event.target.value)} className="editor-input" placeholder="What changed in this revision?" data-testid="input-revision-note" /></Field><Field label="Title"><input required value={storyForm.title} onChange={(event) => setStory('title', event.target.value)} className="editor-input text-lg" data-testid="input-story-title" /></Field><Field label="Dek"><textarea required value={storyForm.dek} onChange={(event) => setStory('dek', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="input-story-dek" /></Field><Field label="Body"><textarea required value={storyForm.body} onChange={(event) => setStory('body', event.target.value)} className="editor-input min-h-64 resize-y leading-relaxed" placeholder="Separate paragraphs with a blank line." data-testid="input-story-body" /></Field><Field label="Byline (required for Opinion)"><input value={storyForm.byline ?? ''} onChange={(event) => setStory('byline', event.target.value)} className="editor-input" placeholder="Named author, or The Signal 24 editorial board" data-testid="input-story-byline" /></Field><fieldset className="grid gap-4 border border-foreground/15 p-4" lang="hi"><legend className="signal-kicker px-1 text-accent">हिंदी संस्करण / Hindi edition</legend><p className="text-xs leading-relaxed text-muted-foreground" lang="en">Leave blank until a reviewed Hindi translation exists. Hindi pages show the English text, marked as untranslated, when these are empty.</p><Field label="शीर्षक / Hindi title"><input value={storyForm.hi?.title ?? ''} onChange={(event) => setHi('title', event.target.value)} className="editor-input text-lg" data-testid="input-story-hi-title" /></Field><Field label="सारांश / Hindi dek"><textarea value={storyForm.hi?.dek ?? ''} onChange={(event) => setHi('dek', event.target.value)} className="editor-input min-h-24 resize-y" data-testid="input-story-hi-dek" /></Field><Field label="मुख्य पाठ / Hindi body"><textarea value={storyForm.hi?.body ?? ''} onChange={(event) => setHi('body', event.target.value)} className="editor-input min-h-64 resize-y leading-relaxed" placeholder="अनुच्छेदों के बीच एक खाली पंक्ति छोड़ें।" data-testid="input-story-hi-body" /></Field></fieldset><div className="flex flex-wrap gap-2"><button type="submit" disabled={createStoryMutation.isPending || updateStoryMutation.isPending} className="rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-60" data-testid="button-save-record">{createStoryMutation.isPending || updateStoryMutation.isPending ? 'Saving…' : storyForm.id ? 'Save changes' : 'Add to issue'}</button><button type="button" onClick={() => setStoryForm(null)} className="rounded-full border border-foreground/20 px-5 py-3 signal-kicker" data-testid="button-cancel-record">Cancel</button></div><RevisionHistory storyId={storyForm.id} /></form> : <div className="mt-6">{stories.length === 0 ? <EmptyState title="No records in this issue." text="Add the first source-aware record to begin shaping the edition." /> : <div className="divide-y divide-foreground/15">{stories.map((story) => <div key={story.id} className="flex items-start justify-between gap-4 py-4" data-testid={`row-editor-story-${story.id}`}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="signal-kicker text-accent">{story.topic} / {story.kind}</p><span className="rounded-full border border-foreground/20 px-2 py-1 signal-kicker text-[9px]">{story.workflowStatus}</span><span className="signal-kicker text-muted-foreground">{story.verificationStatus}</span></div><h3 className="mt-1 truncate font-display text-2xl">{story.title}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{story.source} · {formatDate(story.publishedOn)}{story.reviewedAt ? ` · reviewed ${formatDate(story.reviewedAt)}` : ' · review pending'}</p></div><button type="button" onClick={() => setStoryForm({ ...story, workflowStatus: story.workflowStatus === 'published' ? 'draft' : story.workflowStatus, revisionNote: '' })} className="inline-flex shrink-0 items-center gap-2 signal-kicker text-muted-foreground hover:text-accent" data-testid={`button-edit-story-${story.id}`}><Pencil size={13} /> Edit</button></div>)}</div>}</div>}</div></section><footer className="signal-container flex justify-between border-t border-foreground/20 py-8"><Link href="/" className="signal-kicker signal-link inline-flex items-center gap-2"><ArrowLeft size={13} /> Leave the desk</Link><span className="signal-kicker text-muted-foreground">Source first / always</span></footer></main>;
}


function SignInPage() {
  useSeo({ title: 'Editor sign in — The Signal 24', description: 'Sign in to access the private editorial desk of The Signal 24.', robots: 'noindex, nofollow' });
  return <main className="signal-page"><section className="signal-container flex min-h-[100dvh] flex-col items-center justify-center gap-8 py-12">
    <Link href="/" className="signal-link font-display text-2xl">THE SIGNAL <span className="text-accent">24</span></Link>
    <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={`${basePath}/editor`} />
  </section></main>;
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => addListener(({ user }) => {
    const userId = user?.id ?? null;
    if (previousUserId.current !== undefined && previousUserId.current !== userId) {
      client.clear();
    }
    previousUserId.current = userId;
  }), [addListener, client]);

  return null;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#d73524',
    colorForeground: '#19243a',
    colorMutedForeground: '#626773',
    colorDanger: '#c92f22',
    colorBackground: '#f8f5ed',
    colorInput: '#ffffff',
    colorInputForeground: '#19243a',
    colorNeutral: '#aeb2bd',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#f8f5ed] rounded-xl w-[440px] max-w-full overflow-hidden border border-[#aeb2bd]',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#19243a]',
    headerSubtitle: 'text-[#626773]',
    socialButtonsBlockButtonText: 'text-[#19243a]',
    formFieldLabel: 'text-[#19243a]',
    footerActionLink: 'text-[#c92f22]',
    footerActionText: 'text-[#626773]',
    dividerText: 'text-[#626773]',
    identityPreviewEditButton: 'text-[#c92f22]',
    formFieldSuccessText: 'text-[#245e4d]',
    alertText: 'text-[#19243a]',
    logoBox: 'h-12',
    logoImage: 'h-10 w-auto',
    socialButtonsBlockButton: 'border border-[#aeb2bd] bg-white',
    formButtonPrimary: 'bg-[#19243a] text-[#f1eee4] hover:bg-[#303c54]',
    formFieldInput: 'border border-[#aeb2bd] bg-white text-[#19243a]',
    footerAction: 'text-[#626773]',
    dividerLine: 'bg-[#aeb2bd]',
    alert: 'border border-[#aeb2bd]',
    otpCodeFieldInput: 'border border-[#aeb2bd] bg-white text-[#19243a]',
    formFieldRow: 'text-[#19243a]',
    main: 'text-[#19243a]',
  },
};

function SignUpPage() {
  useSeo({ title: 'Editor account — The Signal 24', description: 'Create an account to request access to the private editorial desk of The Signal 24.', robots: 'noindex, nofollow' });
  return <main className="signal-page"><section className="signal-container flex min-h-[100dvh] flex-col items-center justify-center gap-8 py-12">
    <Link href="/" className="signal-link font-display text-2xl">THE SIGNAL <span className="text-accent">24</span></Link>
    <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={`${basePath}/editor`} />
  </section></main>;
}

function EditorAccessRoute() {
  const [location] = useLocation();
  const evidence = location === "/editor/evidence";
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const session = useGetEditorSession({
    query: {
      queryKey: getGetEditorSessionQueryKey(),
      enabled: isLoaded && isSignedIn === true,
      retry: false,
      staleTime: 30_000,
    },
  });
  useSeo({
    title: evidence ? 'Evidence graph — The Signal 24' : 'Editorial desk — The Signal 24',
    description: evidence
      ? 'Private editorial workspace for maintaining explicit article, event, and source relationships.'
      : 'Private editorial workspace for preparing source-aware records for The Signal 24.',
    robots: 'noindex, nofollow',
  });

  if (!isLoaded || (isSignedIn && session.isLoading)) {
    return <main className="signal-page"><Header editor /><section className="signal-container py-16 text-sm text-muted-foreground">Checking editor access…</section></main>;
  }

  if (!isSignedIn) {
    return <main className="signal-page"><Header editor /><section className="signal-container py-16">
      <p className="signal-kicker text-accent">Private workspace</p>
      <h1 className="mt-3 font-display text-5xl">Sign in to the editorial desk.</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Use the verified editor account to manage publication records and review revision history.</p>
      <Link href="/sign-in" className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground">Sign in</Link>
    </section></main>;
  }

  if (session.isError || !session.data) {
    return <main className="signal-page"><Header editor /><section className="signal-container py-16">
      <p className="signal-kicker text-accent">Editor access denied</p>
      <h1 className="mt-3 font-display text-5xl">This account is not on the editor list.</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">Sign out and use an authorized account with a verified email address.</p>
      <button type="button" onClick={() => void signOut({ redirectUrl: basePath || '/' })} className="mt-7 rounded-full border border-foreground/25 px-5 py-3 signal-kicker">Sign out</button>
    </section></main>;
  }

  return evidence
    ? <main className="signal-page"><Header editor /><EditorEvidenceDesk /></main>
    : <EditorialDesk />;
}

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}


export default function EditorRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    signInFallbackRedirectUrl={`${basePath}/editor`}
    signUpFallbackRedirectUrl={`${basePath}/editor`}
    localization={{
      signIn: { start: { title: 'Editor sign in', subtitle: 'Sign in to access the private editorial desk.' } },
      signUp: { start: { title: 'Editor account', subtitle: 'Create an account, then use an authorized verified email.' } },
    }}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <ClerkQueryClientCacheInvalidator />
    <Switch>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/editor/evidence" component={EditorAccessRoute} />
      <Route path="/editor" component={EditorAccessRoute} />
    </Switch>
  </ClerkProvider>;
}
