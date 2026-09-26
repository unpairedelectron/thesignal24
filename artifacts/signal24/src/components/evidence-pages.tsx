import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  FileText,
  Link2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Link, useParams } from "wouter";
import {
  getGetEvidenceEventQueryKey,
  getGetEvidenceEventsQueryKey,
  getGetSourceDocumentQueryKey,
  getGetStoryEvidenceQueryKey,
  getSearchEvidenceRecordsQueryKey,
  useCreateEvidenceEvent,
  useCreateSourceDocument,
  useDeleteEvidenceEvent,
  useDeleteSourceDocument,
  useGetEditorEvidence,
  useGetEvidenceEvent,
  useGetEvidenceEvents,
  useGetSourceDocument,
  useGetStoryEvidence,
  useLinkArticleToEvent,
  useLinkSourceToEvent,
  useSearchEvidenceRecords,
  useUnlinkArticleFromEvent,
  useUnlinkSourceFromEvent,
  useUpdateEvidenceEvent,
  useUpdateSourceDocument,
} from "@workspace/api-client-react";
import type {
  EvidenceDocumentType,
  EvidenceEventWorkflowStatus,
  EvidenceSourceRole,
  EvidenceSourceStatus,
  Topic,
} from "@workspace/api-client-react";

const TOPICS: Topic[] = [
  "Latest",
  "Courts & Policy",
  "States",
  "History",
  "Ground Reports",
  "Data & Notes",
];
const EVENT_STATUSES: EvidenceEventWorkflowStatus[] = [
  "draft",
  "published",
  "archived",
];
const SOURCE_STATUSES: EvidenceSourceStatus[] = [
  "verified",
  "unverified",
  "archived",
  "unavailable",
];
const DOCUMENT_TYPES: EvidenceDocumentType[] = [
  "official-document",
  "court-record",
  "government-data",
  "report",
  "news-report",
  "other",
];
const SOURCE_ROLES: EvidenceSourceRole[] = ["primary", "secondary"];

function useEvidenceSeo(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    let meta = document.head.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }, [title, description]);
}

function displayDate(value: string | Date | null | undefined) {
  if (!value) return "Date not supplied";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not supplied";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function dateField(value: string | Date | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function dateInput(value: string) {
  return value || null;
}

function humanize(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ErrorNote({ text }: { text: string }) {
  return <p className="text-sm text-destructive" role="alert">{text}</p>;
}

function SourceLinkCard({
  source,
  role,
}: {
  source: {
    id: number;
    title: string;
    publisher: string;
    publicationDate: string | Date | null;
    documentType: string;
    status: string;
    sourceUrl: string | null;
  };
  role?: string;
}) {
  return (
    <article className="border border-foreground/15 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <FileText size={17} className="mt-1 shrink-0 text-accent" />
          <div>
            <h3 className="font-display text-xl leading-tight">{source.title}</h3>
            <p className="mt-2 signal-kicker text-muted-foreground">
              {source.publisher} · {humanize(source.documentType)}
            </p>
          </div>
        </div>
        {role && (
          <span className="signal-kicker text-accent">
            {role} source
          </span>
        )}
      </div>
      <p className="mt-4 signal-kicker text-muted-foreground">
        Published {displayDate(source.publicationDate)} · {humanize(source.status)}
      </p>
      {source.sourceUrl ? (
        <a
          href={source.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 signal-kicker text-accent hover:underline"
        >
          Open source document <ExternalLink size={12} />
        </a>
      ) : (
        <p className="mt-4 signal-kicker text-muted-foreground">
          SOURCE LINK UNAVAILABLE
        </p>
      )}
      <Link
        href={`/sources/${source.id}`}
        className="mt-3 inline-flex items-center gap-1 signal-kicker text-muted-foreground hover:text-accent"
      >
        View source record <ArrowUpRight size={12} />
      </Link>
    </article>
  );
}

function EventCard({
  event,
  compact = false,
}: {
  event: {
    event: {
      id: number;
      title: string;
      topic: string;
      recordDate: string | Date | null;
      summary: string;
    };
    articleCount: number;
    sourceCount: number;
  };
  compact?: boolean;
}) {
  return (
    <article className="border-b border-foreground/15 py-5 last:border-0">
      <p className="signal-kicker text-accent">
        {event.event.topic} · Event date {displayDate(event.event.recordDate)}
      </p>
      <Link
        href={`/events/${event.event.id}`}
        className="mt-2 block font-display text-2xl leading-tight hover:text-accent"
      >
        {event.event.title}
      </Link>
      <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${compact ? "line-clamp-2" : ""}`}>
        {event.event.summary}
      </p>
      <p className="mt-3 signal-kicker text-muted-foreground">
        {event.articleCount} linked {event.articleCount === 1 ? "article" : "articles"} ·{" "}
        {event.sourceCount} linked {event.sourceCount === 1 ? "source" : "sources"}
      </p>
    </article>
  );
}

export function EvidenceEventsPage() {
  useEvidenceSeo(
    "Events and evidence — Signal Hub",
    "Published events connected to Signal Hub articles and source documents.",
  );
  const query = useGetEvidenceEvents(undefined, {
    query: {
      queryKey: getGetEvidenceEventsQueryKey(),
      staleTime: 60_000,
      refetchOnWindowFocus: true,
    },
  });

  return (
    <section className="signal-container py-12 sm:py-20">
      <Link href="/" className="signal-kicker text-muted-foreground hover:text-accent">
        <ArrowLeft size={13} className="mr-2 inline" /> Signal Hub
      </Link>
      <div className="mt-10 grid gap-8 border-b border-foreground/20 pb-8 lg:grid-cols-[1fr_.48fr] lg:items-end">
        <div>
          <p className="signal-kicker text-accent">Evidence / Events</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[.94] tracking-[-.05em] sm:text-7xl">
            Follow the record through an event.
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          Each event below is an editorial record with explicitly linked articles
          and source documents. No relationship is inferred from article text.
        </p>
      </div>
      {query.isLoading ? (
        <p className="py-10 text-sm text-muted-foreground">Loading published events…</p>
      ) : query.isError ? (
        <p className="py-10 text-sm text-destructive" role="alert">
          Published events could not be loaded. Refresh to try again.
        </p>
      ) : query.data?.events.length ? (
        <div className="mt-4 divide-y divide-foreground/15">
          {query.data.events.map((event) => (
            <EventCard key={event.event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-dashed border-foreground/25 p-6">
          <p className="font-display text-2xl">No published event records yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This page will show only events created and published by the editorial desk.
          </p>
        </div>
      )}
    </section>
  );
}

export function EvidenceSearchPage() {
  useEvidenceSeo(
    "Search the evidence — Signal Hub",
    "Search published articles, events, and source documents as separate record types.",
  );
  const [term, setTerm] = useState(
    () => new URLSearchParams(window.location.search).get("q") ?? "",
  );
  const [filter, setFilter] = useState("all");
  const normalized = term.trim();
  const query = useSearchEvidenceRecords(
    { q: normalized },
    {
      query: {
        queryKey: getSearchEvidenceRecordsQueryKey({ q: normalized }),
        enabled: normalized.length > 0,
        staleTime: 30_000,
      },
    },
  );
  const results = useMemo(
    () => (query.data?.results ?? []).filter(
      (result) => filter === "all" || result.resultType === filter,
    ),
    [filter, query.data?.results],
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = new URL(window.location.href);
    if (normalized) url.searchParams.set("q", normalized);
    else url.searchParams.delete("q");
    window.history.replaceState({}, "", url);
  }

  return (
    <section className="signal-container py-12 sm:py-20">
      <Link href="/" className="signal-kicker text-muted-foreground hover:text-accent">
        <ArrowLeft size={13} className="mr-2 inline" /> Signal Hub
      </Link>
      <div className="mt-10 max-w-4xl">
        <p className="signal-kicker text-accent">Search / Published evidence</p>
        <h1 className="mt-3 font-display text-5xl leading-[.94] tracking-[-.05em] sm:text-7xl">
          Search the record.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Articles, events, and source documents remain clearly identified as
          different kinds of records.
        </p>
      </div>
      <form onSubmit={submit} className="mt-8 flex max-w-3xl gap-3 border-b border-foreground/30 pb-3">
        <Search size={18} className="mt-2 text-accent" />
        <input
          aria-label="Search articles, events, and source documents"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search by title, topic, publisher or text"
          className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-2 signal-kicker text-primary-foreground"
        >
          Search
        </button>
      </form>
      {normalized && (
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Filter result type">
          {["all", "article", "event", "source"].map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={filter === kind}
              onClick={() => setFilter(kind)}
              className={`rounded-full border px-3 py-2 signal-kicker transition-colors ${
                filter === kind
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-foreground/20 hover:border-accent"
              }`}
            >
              {kind === "all" ? "All records" : `${humanize(kind)}s`}
            </button>
          ))}
        </div>
      )}
      {!normalized ? (
        <p className="mt-10 border border-dashed border-foreground/25 p-6 text-sm text-muted-foreground">
          Enter a search term to find published articles, events, and source documents.
        </p>
      ) : query.isLoading ? (
        <p className="mt-10 text-sm text-muted-foreground">Searching published records…</p>
      ) : query.isError ? (
        <p className="mt-10 text-sm text-destructive" role="alert">
          Search is unavailable. Please try again.
        </p>
      ) : results.length ? (
        <div className="mt-8 grid gap-3">
          {results.map((result) => (
            <article key={`${result.resultType}-${result.id}`} className="border border-foreground/15 bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="signal-kicker text-accent">{humanize(result.resultType)}</span>
                {result.topic && <span className="signal-kicker text-muted-foreground">{result.topic}</span>}
              </div>
              <Link href={result.path} className="mt-2 block font-display text-2xl leading-tight hover:text-accent">
                {result.title}
              </Link>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {result.summary}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 signal-kicker text-muted-foreground">
                {result.recordDate && <span>{result.resultType === "event" ? "Event date" : "Record date"} {displayDate(result.recordDate)}</span>}
                {result.articlePublishedAt && <span>Article published {displayDate(result.articlePublishedAt)}</span>}
                {result.sourcePublicationDate && <span>Source published {displayDate(result.sourcePublicationDate)}</span>}
                {result.resultType !== "source" && <span>{result.eventCount} linked {result.eventCount === 1 ? "event" : "events"} · {result.sourceCount} linked {result.sourceCount === 1 ? "source" : "sources"}</span>}
                {result.resultType === "source" && result.sourceStatus && <span>{humanize(result.sourceStatus)}</span>}
                {result.resultType === "source" && result.documentType && <span>{humanize(result.documentType)}</span>}
              </div>
              {result.resultType === "source" && (
                result.sourceUrl ? (
                  <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 signal-kicker text-accent hover:underline">
                    Open source <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="mt-4 signal-kicker text-muted-foreground">SOURCE LINK UNAVAILABLE</p>
                )
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-10 border border-dashed border-foreground/25 p-6 text-sm text-muted-foreground">
          No published {filter === "all" ? "records" : `${humanize(filter)} records`} match “{normalized}”.
        </p>
      )}
    </section>
  );
}

export function EvidenceEventDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const eventId = Number(id);
  const query = useGetEvidenceEvent(eventId, {
    query: {
      queryKey: getGetEvidenceEventQueryKey(eventId),
      enabled: Number.isInteger(eventId) && eventId > 0,
    },
  });
  const event = query.data?.event;
  useEvidenceSeo(
    event ? `${event.event.title} — Signal Hub` : "Event — Signal Hub",
    event?.event.summary ?? "A published event record with explicitly linked articles and source documents.",
  );

  if (!Number.isInteger(eventId) || eventId <= 0) {
    return <EvidencePageMessage title="Invalid event address" text="This event record address is not valid." />;
  }
  if (query.isLoading) return <EvidencePageMessage title="Opening event record" text="Loading published evidence…" />;
  if (query.isError || !event) {
    return <EvidencePageMessage title="Event not found" text="This event may not be published or may have moved." />;
  }

  return (
    <section className="signal-container py-12 sm:py-20">
      <Link href="/events" className="signal-kicker text-muted-foreground hover:text-accent">
        <ArrowLeft size={13} className="mr-2 inline" /> All events
      </Link>
      <div className="mt-10 grid gap-8 border-b border-foreground/20 pb-8 lg:grid-cols-[1fr_.48fr] lg:items-end">
        <div>
          <p className="signal-kicker text-accent">{event.event.topic} / Published event</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[.94] tracking-[-.05em] sm:text-7xl">
            {event.event.title}
          </h1>
        </div>
        <div className="border-l-2 border-accent pl-5">
          <p className="signal-kicker text-muted-foreground">Event date</p>
          <p className="mt-2 font-display text-2xl">{displayDate(event.event.recordDate)}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{event.event.summary}</p>
        </div>
      </div>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <section>
          <p className="signal-kicker text-accent">Linked articles · {event.articles.length}</p>
          {event.articles.length ? (
            <div className="mt-3 divide-y divide-foreground/15">
              {event.articles.map((article) => (
                <article key={article.id} className="py-5">
                  <p className="signal-kicker text-muted-foreground">{article.topic} · {article.kind}</p>
                  <Link href={article.canonicalPath} className="mt-2 block font-display text-2xl hover:text-accent">
                    {article.title}
                  </Link>
                  <p className="mt-2 signal-kicker text-muted-foreground">
                    Record date {displayDate(article.recordDate)} · Article published {displayDate(article.articlePublishedAt)}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 border border-dashed border-foreground/25 p-5 text-sm text-muted-foreground">
              No published articles are explicitly linked to this event.
            </p>
          )}
        </section>
        <section>
          <p className="signal-kicker text-accent">
            Linked source documents · {event.sourceCount}
          </p>
          <div className="mt-4 grid gap-3">
            {[
              ...event.primarySources.map((source) => ({ source, role: "primary" })),
              ...event.secondarySources.map((source) => ({ source, role: "secondary" })),
            ].length ? (
              [
                ...event.primarySources.map((source) => ({ source, role: "primary" })),
                ...event.secondarySources.map((source) => ({ source, role: "secondary" })),
              ].map(({ source, role }) => (
                <SourceLinkCard key={`${role}-${source.id}`} source={source} role={role} />
              ))
            ) : (
              <p className="border border-dashed border-foreground/25 p-5 text-sm text-muted-foreground">
                No source documents are explicitly linked to this event.
              </p>
            )}
          </div>
        </section>
      </div>
      <p className="mt-12 border-t border-foreground/15 pt-5 signal-kicker text-muted-foreground">
        Article and source relationships are editorially maintained. Unlinked records are not implied.
      </p>
    </section>
  );
}

export function EvidenceSourceDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const sourceId = Number(id);
  const query = useGetSourceDocument(sourceId, {
    query: {
      queryKey: getGetSourceDocumentQueryKey(sourceId),
      enabled: Number.isInteger(sourceId) && sourceId > 0,
    },
  });
  const data = query.data;
  const source = data?.sourceDocument;
  useEvidenceSeo(
    source ? `${source.title} — Signal Hub` : "Source document — Signal Hub",
    source
      ? `${source.publisher} source document record with publication metadata and explicit event/article links.`
      : "A source document record and its explicitly linked events and articles.",
  );

  if (!Number.isInteger(sourceId) || sourceId <= 0) {
    return <EvidencePageMessage title="Invalid source address" text="This source record address is not valid." />;
  }
  if (query.isLoading) return <EvidencePageMessage title="Opening source record" text="Loading published evidence…" />;
  if (query.isError || !data || !source) {
    return <EvidencePageMessage title="Source document not found" text="This source may not have a published event relationship or may have moved." />;
  }

  return (
    <section className="signal-container py-12 sm:py-20">
      <Link href="/events" className="signal-kicker text-muted-foreground hover:text-accent">
        <ArrowLeft size={13} className="mr-2 inline" /> Published events
      </Link>
      <div className="mt-10 grid gap-8 border-b border-foreground/20 pb-8 lg:grid-cols-[1fr_.48fr] lg:items-end">
        <div>
          <p className="signal-kicker text-accent">Source document / {humanize(source.documentType)}</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl leading-[.94] tracking-[-.05em] sm:text-7xl">
            {source.title}
          </h1>
          <p className="mt-5 signal-kicker text-muted-foreground">
            {source.publisher} · {humanize(source.status)}
          </p>
        </div>
        <div className="border-l-2 border-accent pl-5">
          <p className="signal-kicker text-muted-foreground">Publication date</p>
          <p className="mt-2 font-display text-2xl">{displayDate(source.publicationDate)}</p>
          {source.sourceUrl ? (
            <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 signal-kicker text-accent hover:underline">
              Open original document <ExternalLink size={12} />
            </a>
          ) : (
            <p className="mt-5 signal-kicker text-muted-foreground">SOURCE LINK UNAVAILABLE</p>
          )}
        </div>
      </div>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_1fr]">
        <section>
          <p className="signal-kicker text-accent">Explicitly supporting events · {data.supportingEvents.length}</p>
          <div className="mt-3 divide-y divide-foreground/15">
            {data.supportingEvents.length ? data.supportingEvents.map(({ event, sourceRole }) => (
              <article key={event.id} className="py-5">
                <p className="signal-kicker text-muted-foreground">
                  {sourceRole} source · Event date {displayDate(event.recordDate)}
                </p>
                <Link href={`/events/${event.id}`} className="mt-2 block font-display text-2xl hover:text-accent">
                  {event.title}
                </Link>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{event.summary}</p>
              </article>
            )) : (
              <p className="py-5 text-sm text-muted-foreground">No published events are explicitly linked to this source.</p>
            )}
          </div>
        </section>
        <section>
          <p className="signal-kicker text-accent">Cited by published articles · {data.citedByArticles.length}</p>
          <div className="mt-3 divide-y divide-foreground/15">
            {data.citedByArticles.length ? data.citedByArticles.map((article) => (
              <article key={article.id} className="py-5">
                <p className="signal-kicker text-muted-foreground">{article.topic} · {article.kind}</p>
                <Link href={article.canonicalPath} className="mt-2 block font-display text-2xl hover:text-accent">
                  {article.title}
                </Link>
                <p className="mt-2 signal-kicker text-muted-foreground">
                  Record date {displayDate(article.recordDate)} · Article published {displayDate(article.articlePublishedAt)}
                </p>
              </article>
            )) : (
              <p className="py-5 text-sm text-muted-foreground">No published articles are linked through this event.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export function ArticleEvidenceSection({ storyId }: { storyId: number }) {
  const query = useGetStoryEvidence(storyId, {
    query: {
      queryKey: getGetStoryEvidenceQueryKey(storyId),
      enabled: Number.isInteger(storyId) && storyId > 0,
      staleTime: 60_000,
    },
  });
  if (query.isError) {
    return (
      <section className="mt-12 border-t border-foreground/20 pt-8" aria-labelledby="article-evidence-title">
        <p id="article-evidence-title" className="signal-kicker text-accent">Article / Evidence links</p>
        <p className="mt-3 text-sm text-muted-foreground">Evidence links are temporarily unavailable.</p>
      </section>
    );
  }
  if (query.isLoading) return null;
  const events = query.data?.events ?? [];
  return (
    <section className="mt-12 border-t border-foreground/20 pt-8" aria-labelledby="article-evidence-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="signal-kicker text-accent">Evidence / Explicit relationships</p>
          <h2 id="article-evidence-title" className="mt-2 font-display text-3xl">Events and source documents</h2>
        </div>
        <Link href="/events" className="signal-kicker text-muted-foreground hover:text-accent">
          Browse events <ArrowUpRight size={12} className="ml-1 inline" />
        </Link>
      </div>
      {events.length ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {events.map((event) => (
            <div key={event.event.id} className="border border-foreground/15 p-5">
              <EventCard event={event} compact />
              <div className="mt-4 grid gap-2">
                {[
                  ...event.primarySources.map((source) => ({ source, role: "primary" })),
                  ...event.secondarySources.map((source) => ({ source, role: "secondary" })),
                ].map(({ source, role }) => (
                  <SourceLinkCard key={`${role}-${source.id}`} source={source} role={role} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 border border-dashed border-foreground/25 p-5 text-sm leading-relaxed text-muted-foreground">
          No event or source documents are explicitly linked to this article yet.
        </p>
      )}
      <p className="mt-5 signal-kicker text-muted-foreground">
        These links are editorially maintained; they are not inferred from article text.
      </p>
    </section>
  );
}

function EvidencePageMessage({ title, text }: { title: string; text: string }) {
  return (
    <section className="signal-container py-20">
      <Link href="/events" className="signal-kicker text-muted-foreground hover:text-accent">
        <ArrowLeft size={13} className="mr-2 inline" /> Evidence records
      </Link>
      <h1 className="mt-8 font-display text-4xl">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{text}</p>
    </section>
  );
}

type EventForm = {
  id?: number;
  title: string;
  topic: Topic;
  recordDate: string;
  summary: string;
  workflowStatus: EvidenceEventWorkflowStatus;
};

type SourceForm = {
  id?: number;
  title: string;
  publisher: string;
  publicationDate: string;
  documentType: EvidenceDocumentType;
  sourceUrl: string;
  status: EvidenceSourceStatus;
};

const emptyEvent: EventForm = {
  title: "",
  topic: "Latest",
  recordDate: "",
  summary: "",
  workflowStatus: "draft",
};

const emptySource: SourceForm = {
  title: "",
  publisher: "",
  publicationDate: "",
  documentType: "other",
  sourceUrl: "",
  status: "unverified",
};

export function EditorEvidenceDesk() {
  const queryClient = useQueryClient();
  const query = useGetEditorEvidence();
  const [eventForm, setEventForm] = useState<EventForm>(emptyEvent);
  const [sourceForm, setSourceForm] = useState<SourceForm>(emptySource);
  const [articleId, setArticleId] = useState("");
  const [eventId, setEventId] = useState("");
  const [sourceDocumentId, setSourceDocumentId] = useState("");
  const [sourceRole, setSourceRole] = useState<EvidenceSourceRole>("primary");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const createEvent = useCreateEvidenceEvent();
  const updateEvent = useUpdateEvidenceEvent();
  const deleteEvent = useDeleteEvidenceEvent();
  const createSource = useCreateSourceDocument();
  const updateSource = useUpdateSourceDocument();
  const deleteSource = useDeleteSourceDocument();
  const linkArticle = useLinkArticleToEvent();
  const unlinkArticle = useUnlinkArticleFromEvent();
  const linkSource = useLinkSourceToEvent();
  const unlinkSource = useUnlinkSourceFromEvent();

  const events = query.data?.events ?? [];
  const sources = query.data?.sourceDocuments ?? [];
  const articles = query.data?.articles ?? [];
  const selectedEvent = events.find((item) => String(item.event.id) === eventId);

  async function refresh(message: string) {
    await queryClient.invalidateQueries();
    setNotice(message);
    setError("");
  }

  function failure(message: string, reason?: unknown) {
    setError(reason instanceof Error ? reason.message : message);
    setNotice("");
  }

  function submitEvent(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError("");
    const data = {
      title: eventForm.title.trim(),
      topic: eventForm.topic,
      recordDate: dateInput(eventForm.recordDate),
      summary: eventForm.summary.trim(),
      workflowStatus: eventForm.workflowStatus,
    };
    const callbacks = {
      onSuccess: () => {
        void refresh(eventForm.id ? "Event updated." : "Event created.");
        setEventForm(emptyEvent);
      },
      onError: (reason: unknown) => failure("Event could not be saved.", reason),
    };
    if (eventForm.id) updateEvent.mutate({ eventId: eventForm.id, data }, callbacks);
    else createEvent.mutate({ data }, callbacks);
  }

  function submitSource(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    setError("");
    const data = {
      title: sourceForm.title.trim(),
      publisher: sourceForm.publisher.trim(),
      publicationDate: dateInput(sourceForm.publicationDate),
      documentType: sourceForm.documentType,
      sourceUrl: sourceForm.sourceUrl.trim() || null,
      status: sourceForm.status,
    };
    const callbacks = {
      onSuccess: () => {
        void refresh(sourceForm.id ? "Source document updated." : "Source document created.");
        setSourceForm(emptySource);
      },
      onError: (reason: unknown) => failure("Source document could not be saved.", reason),
    };
    if (sourceForm.id) updateSource.mutate({ sourceId: sourceForm.id, data }, callbacks);
    else createSource.mutate({ data }, callbacks);
  }

  function submitArticleLink(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const selectedArticle = Number(articleId);
    const selectedEventId = Number(eventId);
    if (!selectedArticle || !selectedEventId) return;
    linkArticle.mutate(
      { data: { articleId: selectedArticle, eventId: selectedEventId } },
      {
        onSuccess: () => {
          void refresh("Article linked to event.");
          setArticleId("");
        },
        onError: (reason) => failure("Article could not be linked.", reason),
      },
    );
  }

  function submitSourceLink(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const selectedSourceId = Number(sourceDocumentId);
    const selectedEventId = Number(eventId);
    if (!selectedSourceId || !selectedEventId) return;
    linkSource.mutate(
      {
        data: {
          eventId: selectedEventId,
          sourceDocumentId: selectedSourceId,
          sourceRole,
        },
      },
      {
        onSuccess: () => {
          void refresh("Source document linked to event.");
          setSourceDocumentId("");
        },
        onError: (reason) => failure("Source document could not be linked.", reason),
      },
    );
  }

  function removeEvent(id: number) {
    if (!window.confirm("Delete this event and all article/source relationships attached to it? This cannot be undone.")) return;
    deleteEvent.mutate(
      { eventId: id },
      {
        onSuccess: () => {
          void refresh("Event and its relationships deleted.");
          if (eventForm.id === id) setEventForm(emptyEvent);
          if (eventId === String(id)) setEventId("");
        },
        onError: (reason) => failure("Event could not be deleted.", reason),
      },
    );
  }

  function removeSource(id: number) {
    if (!window.confirm("Delete this source document and all event relationships attached to it? This cannot be undone.")) return;
    deleteSource.mutate(
      { sourceId: id },
      {
        onSuccess: () => {
          void refresh("Source document and its relationships deleted.");
          if (sourceForm.id === id) setSourceForm(emptySource);
          if (sourceDocumentId === String(id)) setSourceDocumentId("");
        },
        onError: (reason) => failure("Source document could not be deleted.", reason),
      },
    );
  }

  const alreadyLinkedArticles = new Set(
    selectedEvent?.articleLinks.map((link) => link.article.id) ?? [],
  );
  const alreadyLinkedSources = new Set(
    selectedEvent?.sourceLinks.map((link) => link.sourceDocument.id) ?? [],
  );

  if (query.isLoading) {
    return <section className="signal-container py-16 text-sm text-muted-foreground">Loading evidence records…</section>;
  }
  if (query.isError || !query.data) {
    return (
      <section className="signal-container py-16">
        <p className="signal-kicker text-accent">Evidence desk unavailable</p>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">The editorial evidence graph could not be loaded.</p>
        <button type="button" onClick={() => void query.refetch()} className="mt-5 rounded-full border border-foreground/25 px-4 py-2 signal-kicker">Try again</button>
      </section>
    );
  }

  return (
    <section className="signal-container py-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/20 pb-6">
        <div>
          <p className="signal-kicker text-accent">Editorial desk / Evidence graph</p>
          <h1 className="mt-2 font-display text-4xl tracking-[-.04em] sm:text-6xl">Events, articles, sources.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Create records and maintain explicit links. Public readers see only published events and articles.
          </p>
        </div>
        <p className="signal-kicker text-muted-foreground">{events.length} events · {sources.length} sources · {articles.length} articles</p>
      </div>
      {error && <div className="mt-5"><ErrorNote text={error} /></div>}
      {notice && <p className="mt-5 text-sm text-accent" role="status">{notice}</p>}

      <div className="mt-8 grid gap-8 xl:grid-cols-[.9fr_1.1fr]">
        <div className="grid content-start gap-8">
          <form onSubmit={submitEvent} className="grid gap-4 border border-foreground/15 bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="signal-kicker text-accent">{eventForm.id ? "Edit event" : "New event"}</p>
                <h2 className="mt-1 font-display text-2xl">Event record</h2>
              </div>
              {eventForm.id && <button type="button" onClick={() => setEventForm(emptyEvent)} className="signal-kicker text-muted-foreground hover:text-accent">Cancel edit</button>}
            </div>
            <label className="grid gap-2 text-sm">Title
              <input required minLength={1} value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} className="editor-input" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">Topic
                <select value={eventForm.topic} onChange={(e) => setEventForm({ ...eventForm, topic: e.target.value as Topic })} className="editor-input">
                  {TOPICS.map((topic) => <option key={topic}>{topic}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm">Event date <span className="text-xs text-muted-foreground">Leave blank when the source does not supply one.</span>
                <input type="date" value={eventForm.recordDate} onChange={(e) => setEventForm({ ...eventForm, recordDate: e.target.value })} className="editor-input" />
              </label>
            </div>
            <label className="grid gap-2 text-sm">Summary
              <textarea required rows={3} value={eventForm.summary} onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })} className="editor-input resize-y" />
            </label>
            <label className="grid gap-2 text-sm">Publication status
              <select value={eventForm.workflowStatus} onChange={(e) => setEventForm({ ...eventForm, workflowStatus: e.target.value as EvidenceEventWorkflowStatus })} className="editor-input">
                {EVENT_STATUSES.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
              </select>
            </label>
            <button type="submit" disabled={createEvent.isPending || updateEvent.isPending} className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-50">
              <Plus size={13} /> {createEvent.isPending || updateEvent.isPending ? "Saving…" : eventForm.id ? "Save event" : "Create event"}
            </button>
          </form>

          <form onSubmit={submitSource} className="grid gap-4 border border-foreground/15 bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="signal-kicker text-accent">{sourceForm.id ? "Edit source" : "New source"}</p>
                <h2 className="mt-1 font-display text-2xl">Source document</h2>
              </div>
              {sourceForm.id && <button type="button" onClick={() => setSourceForm(emptySource)} className="signal-kicker text-muted-foreground hover:text-accent">Cancel edit</button>}
            </div>
            <label className="grid gap-2 text-sm">Document title
              <input required minLength={1} value={sourceForm.title} onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })} className="editor-input" />
            </label>
            <label className="grid gap-2 text-sm">Publisher
              <input required minLength={1} value={sourceForm.publisher} onChange={(e) => setSourceForm({ ...sourceForm, publisher: e.target.value })} className="editor-input" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm">Publication date
                <input type="date" value={sourceForm.publicationDate} onChange={(e) => setSourceForm({ ...sourceForm, publicationDate: e.target.value })} className="editor-input" />
              </label>
              <label className="grid gap-2 text-sm">Document type
                <select value={sourceForm.documentType} onChange={(e) => setSourceForm({ ...sourceForm, documentType: e.target.value as EvidenceDocumentType })} className="editor-input">
                  {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{humanize(type)}</option>)}
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm">Source URL <span className="text-xs text-muted-foreground">Leave blank if the original document link is unavailable.</span>
              <input type="url" value={sourceForm.sourceUrl} onChange={(e) => setSourceForm({ ...sourceForm, sourceUrl: e.target.value })} className="editor-input" placeholder="https://" />
            </label>
            <label className="grid gap-2 text-sm">Verification status
              <select value={sourceForm.status} onChange={(e) => setSourceForm({ ...sourceForm, status: e.target.value as EvidenceSourceStatus })} className="editor-input">
                {SOURCE_STATUSES.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
              </select>
            </label>
            <button type="submit" disabled={createSource.isPending || updateSource.isPending} className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-5 py-3 signal-kicker text-primary-foreground disabled:opacity-50">
              <Plus size={13} /> {createSource.isPending || updateSource.isPending ? "Saving…" : sourceForm.id ? "Save source" : "Create source"}
            </button>
          </form>
        </div>

        <div className="grid content-start gap-8">
          <section className="border border-foreground/15 bg-card p-5 sm:p-6">
            <div>
              <p className="signal-kicker text-accent">Explicit relationships</p>
              <h2 className="mt-1 font-display text-2xl">Link article or source to event</h2>
            </div>
            <label className="mt-5 grid gap-2 text-sm">Event
              <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="editor-input">
                <option value="">Choose an event</option>
                {events.map(({ event }) => <option key={event.id} value={event.id}>{event.title} · {humanize(event.workflowStatus)}</option>)}
              </select>
            </label>
            <form onSubmit={submitArticleLink} className="mt-4 grid gap-3 border-t border-foreground/15 pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="grid gap-2 text-sm">Article
                <select value={articleId} onChange={(e) => setArticleId(e.target.value)} className="editor-input" disabled={!eventId}>
                  <option value="">Choose an article</option>
                  {articles.filter((article) => !alreadyLinkedArticles.has(article.id)).map((article) => <option key={article.id} value={article.id}>{article.title} · {humanize(article.workflowStatus ?? "draft")}</option>)}
                </select>
              </label>
              <button type="submit" disabled={!eventId || !articleId || linkArticle.isPending} className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/25 px-4 py-3 signal-kicker disabled:opacity-40"><Link2 size={13} /> Link article</button>
            </form>
            <form onSubmit={submitSourceLink} className="mt-4 grid gap-3 border-t border-foreground/15 pt-4">
              <label className="grid gap-2 text-sm">Source document
                <select value={sourceDocumentId} onChange={(e) => setSourceDocumentId(e.target.value)} className="editor-input" disabled={!eventId}>
                  <option value="">Choose a source document</option>
                  {sources.filter((item) => !alreadyLinkedSources.has(item.sourceDocument.id)).map((item) => <option key={item.sourceDocument.id} value={item.sourceDocument.id}>{item.sourceDocument.title}</option>)}
                </select>
              </label>
              <div className="flex flex-wrap items-end gap-3">
                <label className="grid gap-2 text-sm">Relationship role
                  <select value={sourceRole} onChange={(e) => setSourceRole(e.target.value as EvidenceSourceRole)} className="editor-input min-w-40">
                    {SOURCE_ROLES.map((role) => <option key={role} value={role}>{humanize(role)}</option>)}
                  </select>
                </label>
                <button type="submit" disabled={!eventId || !sourceDocumentId || linkSource.isPending} className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/25 px-4 py-3 signal-kicker disabled:opacity-40"><Link2 size={13} /> Link source</button>
              </div>
            </form>
          </section>

          <section>
            <div className="flex items-end justify-between border-b border-foreground/20 pb-3">
              <div><p className="signal-kicker text-accent">Stored events</p><h2 className="mt-1 font-display text-2xl">Relationship ledger</h2></div>
            </div>
            {events.length ? <div className="mt-3 divide-y divide-foreground/15">
              {events.map(({ event, audit, articleLinks: linkedArticles, sourceLinks: linkedSources }) => (
                <article key={event.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="signal-kicker text-accent">{event.topic} · {humanize(event.workflowStatus)}</p>
                      <h3 className="mt-1 font-display text-2xl">{event.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{event.summary}</p>
                      <p className="mt-2 signal-kicker text-muted-foreground">Event date {displayDate(event.recordDate)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => {
                        setEventId(String(event.id));
                        setEventForm({ id: event.id, title: event.title, topic: event.topic, recordDate: dateField(event.recordDate), summary: event.summary, workflowStatus: event.workflowStatus });
                      }} className="signal-kicker text-accent hover:underline">Edit</button>
                      <button type="button" onClick={() => removeEvent(event.id)} className="signal-kicker text-destructive hover:underline" aria-label={`Delete ${event.title}`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Created by <code title={audit.createdBy}>{audit.createdBy}</code> · {displayDate(audit.createdAt)} · Updated by <code title={audit.updatedBy}>{audit.updatedBy}</code>
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {linkedArticles.map((link) => (
                      <div key={link.article.id} className="border border-foreground/10 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={link.article.canonicalPath} className="text-sm hover:text-accent">{link.article.title}</Link>
                          <button type="button" onClick={() => unlinkArticle.mutate({ eventId: event.id, storyId: link.article.id }, { onSuccess: () => void refresh("Article link removed."), onError: (reason) => failure("Article link could not be removed.", reason) })} className="text-destructive" aria-label={`Unlink ${link.article.title}`}><Trash2 size={13} /></button>
                        </div>
                        <p className="mt-2 signal-kicker text-muted-foreground">Linked by {link.linkedBy} · {displayDate(link.linkedAt)}</p>
                      </div>
                    ))}
                    {linkedSources.map((link) => (
                      <div key={link.sourceDocument.id} className="border border-foreground/10 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/sources/${link.sourceDocument.id}`} className="text-sm hover:text-accent">{link.sourceDocument.title}</Link>
                          <button type="button" onClick={() => unlinkSource.mutate({ eventId: event.id, sourceId: link.sourceDocument.id }, { onSuccess: () => void refresh("Source link removed."), onError: (reason) => failure("Source link could not be removed.", reason) })} className="text-destructive" aria-label={`Unlink ${link.sourceDocument.title}`}><Trash2 size={13} /></button>
                        </div>
                        <p className="mt-2 signal-kicker text-muted-foreground">{humanize(link.sourceRole)} · Linked by {link.linkedBy} · {displayDate(link.linkedAt)}</p>
                      </div>
                    ))}
                    {!linkedArticles.length && !linkedSources.length && (
                      <p className="border border-dashed border-foreground/15 p-3 text-sm text-muted-foreground">No stored relationships.</p>
                    )}
                  </div>
                </article>
              ))}
            </div> : <p className="py-6 text-sm text-muted-foreground">No event records have been created.</p>}
          </section>

          <section>
            <div className="border-b border-foreground/20 pb-3">
              <p className="signal-kicker text-accent">Stored source documents</p>
              <h2 className="mt-1 font-display text-2xl">Source register</h2>
            </div>
            {sources.length ? <div className="mt-3 divide-y divide-foreground/15">
              {sources.map(({ sourceDocument: source, audit }) => (
                <article key={source.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="signal-kicker text-accent">{humanize(source.documentType)} · {humanize(source.status)}</p>
                      <h3 className="mt-1 font-display text-xl">{source.title}</h3>
                      <p className="mt-1 signal-kicker text-muted-foreground">{source.publisher} · {displayDate(source.publicationDate)}</p>
                      {!source.sourceUrl && <p className="mt-2 signal-kicker text-muted-foreground">SOURCE LINK UNAVAILABLE</p>}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSourceForm({ id: source.id, title: source.title, publisher: source.publisher, publicationDate: dateField(source.publicationDate), documentType: source.documentType, sourceUrl: source.sourceUrl ?? "", status: source.status })} className="signal-kicker text-accent hover:underline">Edit</button>
                      <button type="button" onClick={() => removeSource(source.id)} className="signal-kicker text-destructive hover:underline" aria-label={`Delete ${source.title}`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Created by <code title={audit.createdBy}>{audit.createdBy}</code> · {displayDate(audit.createdAt)} · Updated by <code title={audit.updatedBy}>{audit.updatedBy}</code>
                  </p>
                </article>
              ))}
            </div> : <p className="py-6 text-sm text-muted-foreground">No source documents have been created.</p>}
          </section>
        </div>
      </div>
      <p className="mt-10 border-t border-foreground/15 pt-5 signal-kicker text-muted-foreground">
        Removing a record cascades its active relationships. Relationship rows retain the editor identity and time at which they were created while they exist.
      </p>
    </section>
  );
}