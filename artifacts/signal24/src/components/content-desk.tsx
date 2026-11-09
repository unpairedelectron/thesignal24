import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetEditorialIssueQueryKey,
  getGetEditorContentSourcesQueryKey,
  getGetEditorDiscoveryItemsQueryKey,
  useGetEditorialIssue,
  useCreateEditorContentSource,
  useCreateEditorDiscoveryItem,
  useGetEditorContentSources,
  useGetEditorDiscoveryItems,
  usePromoteEditorDiscoveryItem,
  useUpdateEditorContentSource,
  useUpdateEditorDiscoveryItem,
} from "@workspace/api-client-react";
import type {
  ContentAuthorityLevel,
  ContentSourceType,
  ContentTopic,
  DiscoveryItemStatus,
  Topic,
} from "@workspace/api-client-react";
import { ImageCandidateManager } from "./image-candidate-manager";

const SOURCE_TYPES: ContentSourceType[] = [
  "government",
  "court",
  "regulator",
  "reporting",
  "academic",
  "community",
  "image",
  "other",
];
const AUTHORITY_LEVELS: ContentAuthorityLevel[] = [
  "primary",
  "secondary",
  "academic",
  "community",
  "unconfirmed",
];
const CONTENT_TOPICS: ContentTopic[] = [
  "Reservation",
  "Higher Education",
  "Employment",
  "Government Recruitment",
  "UGC",
  "Universities",
  "Supreme Court",
  "High Courts",
  "Constitution",
  "Social Justice",
  "EWS",
  "SC",
  "ST",
  "OBC",
  "PwD",
  "Women",
  "Minorities",
  "Admissions",
  "Examinations",
  "Public Policy",
  "State Policy",
  "Court Judgments",
  "Government Orders",
  "Data",
  "Historical Records",
];
const GEOGRAPHIES = [
  "National",
  "Multi-state",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (National Capital Territory)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
const DISCOVERY_STATUSES: DiscoveryItemStatus[] = ["new", "review", "rejected"];

const ARTICLE_TOPICS: Topic[] = [
  "Latest",
  "Courts & Policy",
  "States",
  "History",
  "Ground Reports",
  "Data & Notes",
];
type SourceForm = {
  id?: number;
  sourceName: string;
  sourceType: ContentSourceType;
  authorityLevel: ContentAuthorityLevel;
  domain: string;
  rssUrl: string;
  sitemapUrl: string;
  searchUrl: string;
  language: string;
  state: string;
  enabled: boolean;
};
type LeadForm = {
  sourceId: string;
  originalUrl: string;
  title: string;
  publisher: string;
  sourcePublishedOn: string;
  author: string;
  summary: string;
  language: string;
  state: string;
  topic: string;
  candidateEventTitle: string;
  candidateSourceUrl: string;
  candidateImageUrl: string;
};
type ReviewDraft = { status: DiscoveryItemStatus; notes: string };

type PromotionDraft = { topic: Topic; title: string; dek: string; body: string };
const emptySource: SourceForm = {
  sourceName: "",
  sourceType: "government",
  authorityLevel: "primary",
  domain: "",
  rssUrl: "",
  sitemapUrl: "",
  searchUrl: "",
  language: "English",
  state: "",
  enabled: false,
};
const emptyLead: LeadForm = {
  sourceId: "",
  originalUrl: "",
  title: "",
  publisher: "",
  sourcePublishedOn: "",
  author: "",
  summary: "",
  language: "English",
  state: "",
  topic: "",
  candidateEventTitle: "",
  candidateSourceUrl: "",
  candidateImageUrl: "",
};

function humanize(value: string) {
  return value.replaceAll("-", " ");
}

function nullable(value: string) {
  return value.trim() || null;
}

function SourceSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1 signal-kicker text-muted-foreground">
      {label}
      <select
        className="signal-input min-h-10 normal-case tracking-normal text-foreground"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option ? humanize(option) : "Not specified"}
          </option>
        ))}
      </select>
    </label>
  );
}

function SourceTextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="grid gap-1 signal-kicker text-muted-foreground">
      {label}
      <input
        className="signal-input min-h-10 normal-case tracking-normal text-foreground"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </label>
  );
}

export function SourceDiscoveryDesk() {
  const queryClient = useQueryClient();
  const sourceQuery = useGetEditorContentSources();
  const discoveryQuery = useGetEditorDiscoveryItems();
  const editorialIssueQuery = useGetEditorialIssue();
  const createSource = useCreateEditorContentSource();
  const updateSource = useUpdateEditorContentSource();
  const createLead = useCreateEditorDiscoveryItem();
  const updateLead = useUpdateEditorDiscoveryItem();
  const promoteLead = usePromoteEditorDiscoveryItem();
  const [sourceForm, setSourceForm] = useState<SourceForm>(emptySource);
  const [leadForm, setLeadForm] = useState<LeadForm>(emptyLead);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, ReviewDraft>>(
    {},
  );
  const [promotionDrafts, setPromotionDrafts] = useState<
    Record<number, PromotionDraft | undefined>
  >({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const sources = sourceQuery.data?.sources ?? [];
  const items = discoveryQuery.data?.items ?? [];
  const activeSources = sources.filter((source) => source.enabled);

  async function refresh(message: string) {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetEditorContentSourcesQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetEditorDiscoveryItemsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetEditorialIssueQueryKey(),
      }),
    ]);
    setNotice(message);
    setError("");
  }

  function fail(message: string, reason?: unknown) {
    setError(reason instanceof Error ? reason.message : message);
    setNotice("");
  }

  function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = {
      sourceName: sourceForm.sourceName.trim(),
      sourceType: sourceForm.sourceType,
      authorityLevel: sourceForm.authorityLevel,
      domain: sourceForm.domain.trim(),
      rssUrl: nullable(sourceForm.rssUrl),
      sitemapUrl: nullable(sourceForm.sitemapUrl),
      searchUrl: nullable(sourceForm.searchUrl),
      language: sourceForm.language.trim(),
      state: sourceForm.state || null,
      enabled: sourceForm.enabled,
    };
    const callbacks = {
      onSuccess: () => {
        void refresh(sourceForm.id ? "Source entry updated." : "Source entry added.");
        setSourceForm(emptySource);
      },
      onError: (reason: unknown) => fail("Source entry could not be saved.", reason),
    };
    if (sourceForm.id) {
      updateSource.mutate({ sourceId: sourceForm.id, data }, callbacks);
    } else {
      createSource.mutate({ data }, callbacks);
    }
  }

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = {
      sourceId: Number(leadForm.sourceId || activeSources[0]?.id),
      originalUrl: leadForm.originalUrl.trim(),
      title: leadForm.title.trim(),
      publisher: nullable(leadForm.publisher),
      sourcePublishedOn: leadForm.sourcePublishedOn || null,
      author: nullable(leadForm.author),
      summary: leadForm.summary.trim(),
      language: leadForm.language.trim(),
      state: leadForm.state || null,
      topic: leadForm.topic ? (leadForm.topic as ContentTopic) : null,
      candidateEventTitle: nullable(leadForm.candidateEventTitle),
      candidateSourceUrl: nullable(leadForm.candidateSourceUrl),
      candidateImageUrl: nullable(leadForm.candidateImageUrl),
    };
    createLead.mutate(
      { data },
      {
        onSuccess: () => {
          void refresh("External lead added for editorial review.");
          setLeadForm({ ...emptyLead, sourceId: leadForm.sourceId });
        },
        onError: (reason: unknown) =>
          fail("External lead could not be added.", reason),
      },
    );
  }

  function saveReview(
    itemId: number,
    currentStatus: DiscoveryItemStatus,
    currentNotes: string,
  ) {
    const draft = reviewDrafts[itemId] ?? {
      status: currentStatus,
      notes: currentNotes,
    };
    updateLead.mutate(
      {
        itemId,
        data: { status: draft.status, reviewNotes: draft.notes },
      },
      {
        onSuccess: () => void refresh("Lead review saved."),
        onError: (reason: unknown) =>
          fail("Lead review could not be saved.", reason),
      },
    );
  }

  function submitPromotion(
    event: FormEvent<HTMLFormElement>,
    itemId: number,
  ) {
    event.preventDefault();
    const draft = promotionDrafts[itemId];
    const issueId = editorialIssueQuery.data?.issue.id;
    if (!draft || !issueId) {
      fail("Open an editorial issue before promoting a lead.");
      return;
    }
    promoteLead.mutate(
      {
        itemId,
        data: {
          issueId,
          topic: draft.topic,
          title: draft.title.trim(),
          dek: draft.dek.trim(),
          body: draft.body.trim(),
        },
      },
      {
        onSuccess: (item) => {
          setPromotionDrafts((current) => {
            const next = { ...current };
            delete next[itemId];
            return next;
          });
          void refresh(
            `Lead promoted to unpublished draft article #${item.promotedStoryId}.`,
          );
        },
        onError: (reason: unknown) =>
          fail("The lead could not be promoted.", reason),
      },
    );
  }

  if (sourceQuery.isLoading || discoveryQuery.isLoading) {
    return (
      <section className="mt-12 border-t border-foreground/20 pt-8">
        <p className="signal-kicker text-muted-foreground" role="status">
          Loading the content source desk…
        </p>
      </section>
    );
  }

  if (sourceQuery.isError || discoveryQuery.isError) {
    return (
      <section className="mt-12 border-t border-foreground/20 pt-8">
        <p className="signal-kicker text-accent">CONTENT SOURCE DESK UNAVAILABLE</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The editor-only source registry and discovery queue could not be loaded.
          No public records were changed.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-14 border-t-2 border-foreground pt-8" aria-labelledby="content-desk-title">
      <div className="flex flex-col justify-between gap-4 border-b border-foreground/20 pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="signal-kicker text-accent">CONTENT DESK / MANUAL INTAKE</p>
          <h2 id="content-desk-title" className="mt-2 font-display text-4xl tracking-[-.04em]">
            Sources &amp; leads
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          External leads are not The Signal 24 reporting or evidence. This desk does
          not fetch full articles, create evidence links, or publish automatically.
        </p>
      </div>

      {(error || notice) && (
        <p
          role={error ? "alert" : "status"}
          className={`mt-4 text-sm ${error ? "text-destructive" : "text-accent"}`}
        >
          {error || notice}
        </p>
      )}

      <div className="mt-8 grid gap-10 xl:grid-cols-2">
        <div>
          <div className="border-b border-foreground/20 pb-3">
            <p className="signal-kicker text-accent">01 / Configurable sources</p>
            <h3 className="mt-1 font-display text-2xl">Source registry</h3>
          </div>
          <form className="mt-5 grid gap-4" onSubmit={submitSource}>
            <div className="grid gap-4 sm:grid-cols-2">
              <SourceTextField
                label="Source name"
                value={sourceForm.sourceName}
                onChange={(sourceName) => setSourceForm({ ...sourceForm, sourceName })}
                required
                maxLength={160}
              />
              <SourceTextField
                label="Approved domain"
                value={sourceForm.domain}
                onChange={(domain) => setSourceForm({ ...sourceForm, domain })}
                required
                placeholder="example.gov.in"
                maxLength={253}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SourceSelect
                label="Source type"
                value={sourceForm.sourceType}
                onChange={(value) =>
                  setSourceForm({ ...sourceForm, sourceType: value as ContentSourceType })
                }
                options={SOURCE_TYPES}
              />
              <SourceSelect
                label="Authority classification"
                value={sourceForm.authorityLevel}
                onChange={(value) =>
                  setSourceForm({
                    ...sourceForm,
                    authorityLevel: value as ContentAuthorityLevel,
                  })
                }
                options={AUTHORITY_LEVELS}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SourceTextField
                label="Language"
                value={sourceForm.language}
                onChange={(language) => setSourceForm({ ...sourceForm, language })}
                required
                maxLength={80}
              />
              <SourceSelect
                label="State / territory"
                value={sourceForm.state}
                onChange={(state) => setSourceForm({ ...sourceForm, state })}
                options={["", ...GEOGRAPHIES]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SourceTextField
                label="RSS URL (optional)"
                value={sourceForm.rssUrl}
                onChange={(rssUrl) => setSourceForm({ ...sourceForm, rssUrl })}
                type="url"
                placeholder="https://"
              />
              <SourceTextField
                label="Sitemap URL (optional)"
                value={sourceForm.sitemapUrl}
                onChange={(sitemapUrl) => setSourceForm({ ...sourceForm, sitemapUrl })}
                type="url"
                placeholder="https://"
              />
              <SourceTextField
                label="Official search page"
                value={sourceForm.searchUrl}
                onChange={(searchUrl) => setSourceForm({ ...sourceForm, searchUrl })}
                type="url"
                placeholder="https://"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={sourceForm.enabled}
                onChange={(event) =>
                  setSourceForm({ ...sourceForm, enabled: event.target.checked })
                }
              />
              Allow this source to be selected for manual lead intake
            </label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Automated polling is not active. RSS, sitemap and search URLs must
              be HTTPS and stay on this approved domain.
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="signal-button" disabled={createSource.isPending || updateSource.isPending}>
                {sourceForm.id ? "Save source" : "Add source"}
              </button>
              {sourceForm.id && (
                <button type="button" className="signal-rule-link" onClick={() => setSourceForm(emptySource)}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 divide-y divide-foreground/15 border-t border-foreground/15">
            {sources.length ? sources.map((source) => (
              <article key={source.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="signal-kicker text-accent">
                      {humanize(source.authorityLevel)} / {source.enabled ? "intake enabled" : "disabled"}
                    </p>
                    <h4 className="mt-1 font-display text-xl">{source.sourceName}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {source.domain} · {source.language} · Manual only
                      {source.state ? ` · ${source.state}` : ""}
                    </p>
                    {source.searchUrl && (
                      <a href={source.searchUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center text-xs text-accent hover:underline">
                        Open official search page
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    className="signal-kicker text-accent hover:underline"
                    onClick={() => setSourceForm({
                      id: source.id,
                      sourceName: source.sourceName,
                      sourceType: source.sourceType,
                      authorityLevel: source.authorityLevel,
                      domain: source.domain,
                      rssUrl: source.rssUrl ?? "",
                      sitemapUrl: source.sitemapUrl ?? "",
                      searchUrl: source.searchUrl ?? "",
                      language: source.language,
                      state: source.state ?? "",
                      enabled: source.enabled,
                    })}
                  >
                    Edit
                  </button>
                </div>
              </article>
            )) : (
              <p className="py-5 text-sm text-muted-foreground">
                No sources are configured yet. Add and verify an official source before enabling it.
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="border-b border-foreground/20 pb-3">
            <p className="signal-kicker text-accent">02 / External leads</p>
            <h3 className="mt-1 font-display text-2xl">Discovery queue</h3>
          </div>
          {activeSources.length === 0 ? (
            <p className="mt-5 border border-dashed border-foreground/20 p-4 text-sm leading-relaxed text-muted-foreground">
              Enable a verified registry entry before adding a lead. This avoids
              accepting arbitrary external URLs into the editorial queue.
            </p>
          ) : (
            <form className="mt-5 grid gap-4" onSubmit={submitLead}>
              <div className="grid gap-4 sm:grid-cols-2">
                <SourceSelect
                  label="Registered source"
                  value={leadForm.sourceId || String(activeSources[0].id)}
                  onChange={(sourceId) => setLeadForm({ ...leadForm, sourceId })}
                  options={activeSources.map((source) => String(source.id))}
                />
                <SourceTextField
                  label="Original source URL"
                  value={leadForm.originalUrl}
                  onChange={(originalUrl) => setLeadForm({ ...leadForm, originalUrl })}
                  type="url"
                  required
                  placeholder="https://"
                />
              </div>
              <SourceTextField
                label="Lead headline"
                value={leadForm.title}
                onChange={(title) => setLeadForm({ ...leadForm, title })}
                required
                maxLength={300}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <SourceTextField
                  label="Source publication date"
                  value={leadForm.sourcePublishedOn}
                  onChange={(sourcePublishedOn) => setLeadForm({ ...leadForm, sourcePublishedOn })}
                  type="date"
                />
                <SourceTextField
                  label="Publisher (optional)"
                  value={leadForm.publisher}
                  onChange={(publisher) => setLeadForm({ ...leadForm, publisher })}
                  maxLength={160}
                />
                <SourceTextField
                  label="Author (optional)"
                  value={leadForm.author}
                  onChange={(author) => setLeadForm({ ...leadForm, author })}
                  maxLength={160}
                />
              </div>
              <label className="grid gap-1 signal-kicker text-muted-foreground">
                Short neutral research note (not copied article text)
                <textarea
                  className="signal-input min-h-24 resize-y normal-case tracking-normal text-foreground"
                  value={leadForm.summary}
                  onChange={(event) => setLeadForm({ ...leadForm, summary: event.target.value })}
                  required
                  maxLength={500}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <SourceSelect
                  label="Candidate topic"
                  value={leadForm.topic}
                  onChange={(topic) => setLeadForm({ ...leadForm, topic })}
                  options={["", ...CONTENT_TOPICS]}
                />
                <SourceSelect
                  label="Candidate geography"
                  value={leadForm.state}
                  onChange={(state) => setLeadForm({ ...leadForm, state })}
                  options={["", ...GEOGRAPHIES]}
                />
                <SourceTextField
                  label="Language"
                  value={leadForm.language}
                  onChange={(language) => setLeadForm({ ...leadForm, language })}
                  required
                  maxLength={80}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <SourceTextField
                  label="Possible event title"
                  value={leadForm.candidateEventTitle}
                  onChange={(candidateEventTitle) => setLeadForm({ ...leadForm, candidateEventTitle })}
                  maxLength={300}
                />
                <SourceTextField
                  label="Possible primary source URL"
                  value={leadForm.candidateSourceUrl}
                  onChange={(candidateSourceUrl) => setLeadForm({ ...leadForm, candidateSourceUrl })}
                  type="url"
                  placeholder="https://"
                />
                <SourceTextField
                  label="Possible image URL"
                  value={leadForm.candidateImageUrl}
                  onChange={(candidateImageUrl) => setLeadForm({ ...leadForm, candidateImageUrl })}
                  type="url"
                  placeholder="https://"
                />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Candidate events, documents and images are suggestions only.
                Adding a lead does not create an article or evidence relationship.
              </p>
              <button type="submit" className="signal-button justify-self-start" disabled={createLead.isPending}>
                Add to review queue
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-foreground/15">
            {items.length ? items.map((item) => {
              const draft = reviewDrafts[item.id] ?? {
                status: item.status,
                notes: item.reviewNotes,
              };
              const promotionDraft = promotionDrafts[item.id];
              const editorialIssue = editorialIssueQuery.data?.issue;
              return (
                <article key={item.id} className="border-b border-foreground/15 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="signal-kicker text-accent">
                        External lead / {item.sourceName} / {humanize(item.status)}
                      </p>
                      <h4 className="mt-1 font-display text-xl">{item.title}</h4>
                      <p className="mt-1 signal-kicker text-muted-foreground">
                        Source date {item.sourcePublishedOn ?? "not supplied"}
                        {item.state ? ` · ${item.state}` : ""}
                        {item.topic ? ` · ${item.topic}` : ""}
                      </p>
                    </div>
                    <a href={item.originalUrl} target="_blank" rel="noopener noreferrer" className="signal-kicker text-accent hover:underline">
                      Open original source
                    </a>
                  </div>
                  {item.summary && (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {item.summary}
                    </p>
                  )}
                  {(item.candidateEventTitle || item.candidateSourceUrl || item.candidateImageUrl) && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 signal-kicker text-muted-foreground">
                      {item.candidateEventTitle && <span>Possible event: {item.candidateEventTitle}</span>}
                      {item.candidateSourceUrl && <a href={item.candidateSourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">Candidate document</a>}
                      {item.candidateImageUrl && <a href={item.candidateImageUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">Existing image link · not rights reviewed</a>}
                    </div>
                  )}
                  <ImageCandidateManager itemId={item.id} />
                  <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
                    <SourceSelect
                      label="Review status"
                      value={draft.status}
                      onChange={(status) =>
                        setReviewDrafts({
                          ...reviewDrafts,
                          [item.id]: { ...draft, status: status as DiscoveryItemStatus },
                        })
                      }
                      options={DISCOVERY_STATUSES}
                    />
                    <label className="grid gap-1 signal-kicker text-muted-foreground">
                      Editor note
                      <input
                        className="signal-input min-h-10 normal-case tracking-normal text-foreground"
                        value={draft.notes}
                        onChange={(event) =>
                          setReviewDrafts({
                            ...reviewDrafts,
                            [item.id]: { ...draft, notes: event.target.value },
                          })
                        }
                        maxLength={2000}
                      />
                    </label>
                    <button
                      type="button"
                      className="signal-button"
                      disabled={updateLead.isPending}
                      onClick={() => saveReview(item.id, item.status, item.reviewNotes)}
                    >
                      Save review
                    </button>
                  </div>
                  {item.promotedStoryId ? (
                    <div className="mt-4 border-l-2 border-accent pl-3">
                      <p className="signal-kicker text-accent">
                        Draft article #{item.promotedStoryId} · unpublished
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Promoted by {item.promotedBy ?? "editor"}
                        {item.promotedAt
                          ? ` · ${new Date(item.promotedAt).toLocaleString()}`
                          : ""}
                      </p>
                    </div>
                  ) : item.status === "review" ? (
                    <div className="mt-4 border-t border-foreground/10 pt-4">
                      {promotionDraft ? (
                        <form
                          className="grid gap-3"
                          onSubmit={(event) => submitPromotion(event, item.id)}
                        >
                          <p className="signal-kicker text-accent">
                            Create an original article draft
                          </p>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            Source, publisher, and source date will be carried over.
                            Write new editorial copy below; this will not publish the
                            article or link it to an event or evidence source.
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <SourceSelect
                              label="Editorial topic"
                              value={promotionDraft.topic}
                              onChange={(topic) =>
                                setPromotionDrafts({
                                  ...promotionDrafts,
                                  [item.id]: {
                                    ...promotionDraft,
                                    topic: topic as Topic,
                                  },
                                })
                              }
                              options={ARTICLE_TOPICS}
                            />
                            <SourceTextField
                              label="Original article title"
                              value={promotionDraft.title}
                              onChange={(title) =>
                                setPromotionDrafts({
                                  ...promotionDrafts,
                                  [item.id]: { ...promotionDraft, title },
                                })
                              }
                              required
                              maxLength={300}
                            />
                          </div>
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            Original standfirst / dek
                            <textarea
                              className="signal-input min-h-20 normal-case tracking-normal text-foreground"
                              value={promotionDraft.dek}
                              onChange={(event) =>
                                setPromotionDrafts({
                                  ...promotionDrafts,
                                  [item.id]: {
                                    ...promotionDraft,
                                    dek: event.target.value,
                                  },
                                })
                              }
                              required
                              maxLength={500}
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            Original article body
                            <textarea
                              className="signal-input min-h-48 normal-case tracking-normal text-foreground"
                              value={promotionDraft.body}
                              onChange={(event) =>
                                setPromotionDrafts({
                                  ...promotionDrafts,
                                  [item.id]: {
                                    ...promotionDraft,
                                    body: event.target.value,
                                  },
                                })
                              }
                              required
                              maxLength={50000}
                              placeholder="Write original reporting or analysis. Separate paragraphs with a blank line."
                            />
                          </label>
                          {!editorialIssueQuery.isLoading && !editorialIssue && (
                            <p className="text-xs text-accent" role="status">
                              No current issue is available. Create or open an issue
                              in the <a className="underline" href="/editor">editorial desk</a>{" "}
                              before promoting a lead.
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              className="signal-button"
                              disabled={
                                promoteLead.isPending ||
                                editorialIssueQuery.isLoading ||
                                !editorialIssue
                              }
                            >
                              {promoteLead.isPending
                                ? "Creating draft…"
                                : "Create unpublished draft"}
                            </button>
                            <button
                              type="button"
                              className="signal-button border border-foreground/20 bg-transparent text-foreground"
                              onClick={() =>
                                setPromotionDrafts({
                                  ...promotionDrafts,
                                  [item.id]: undefined,
                                })
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className="signal-button"
                          onClick={() =>
                            setPromotionDrafts({
                              ...promotionDrafts,
                              [item.id]: {
                                topic: "Latest",
                                title: "",
                                dek: "",
                                body: "",
                              },
                            })
                          }
                        >
                          Write article draft
                        </button>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            }) : (
              <p className="py-5 text-sm text-muted-foreground">
                No external leads have been added. The queue does not invent or auto-import stories.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
