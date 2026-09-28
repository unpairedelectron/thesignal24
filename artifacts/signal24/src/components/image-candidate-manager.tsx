import { useState, type FormEvent, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getGetEditorDiscoveryItemImageCandidatesQueryKey,
  useApplyEditorImageCandidateSourceRecheck,
  useCreateEditorDiscoveryItemImageCandidate,
  useGetEditorDiscoveryItemImageCandidates,
  useRecheckEditorImageCandidateSource,
  useReviewEditorImageCandidateRights,
  useSearchEditorImageCandidates,
  useUpdateEditorImageCandidate,
} from "@workspace/api-client-react";
import type {
  EditorImageCandidate,
  EditorImageCandidateRightsMetadata,
  EditorImageCandidateSearchResult,
  EditorImageCandidateSourceRecheckPreview,
  EditorImageCandidateSourceRecheckPreviewChangedFieldsItem,
  ImageCandidateRightsDecision,
} from "@workspace/api-client-react";

type CandidateDraft = {
  license: string;
  licenseUrl: string;
  creator: string;
  credit: string;
  copyright: string;
  usageRights: string;
  altText: string;
  caption: string;
  reviewNotes: string;
};

const rightsFieldLabels: Record<
  EditorImageCandidateSourceRecheckPreviewChangedFieldsItem,
  string
> = {
  license: "License",
  licenseUrl: "License terms URL",
  creator: "Creator / artist",
  credit: "Required credit",
  copyright: "Copyright statement",
  usageRights: "Usage rights and restrictions",
};

function rightsMetadataValue(
  field: keyof EditorImageCandidateRightsMetadata,
  value: string | null,
): ReactNode {
  if (!value?.trim()) return <span className="italic">Not supplied</span>;
  if (field === "licenseUrl") {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-accent hover:underline"
      >
        {value}
      </a>
    );
  }
  return value;
}

function candidateDraft(candidate: EditorImageCandidate): CandidateDraft {
  return {
    license: candidate.license,
    licenseUrl: candidate.licenseUrl ?? "",
    creator: candidate.creator,
    credit: candidate.credit,
    copyright: candidate.copyright,
    usageRights: candidate.usageRights,
    altText: candidate.altText,
    caption: candidate.caption,
    reviewNotes: candidate.reviewNotes,
  };
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function rightsStatusLabel(status: EditorImageCandidate["rightsStatus"]) {
  if (status === "approved") return "Rights checked";
  if (status === "rejected") return "Rights rejected";
  return "Rights review pending";
}

function SearchResult({
  itemId,
  result,
  alreadySaved,
  onSaved,
  onError,
}: {
  itemId: number;
  result: EditorImageCandidateSearchResult;
  alreadySaved: boolean;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const createCandidate = useCreateEditorDiscoveryItemImageCandidate();

  return (
    <article className="grid gap-4 border-b border-foreground/15 py-4 sm:grid-cols-[140px_1fr]">
      <a
        href={result.filePageUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${result.source} item page for ${result.fileTitle}`}
      >
        <img
          src={result.thumbnailUrl}
          alt=""
          loading="lazy"
          className="aspect-video w-full border border-foreground/15 object-cover"
        />
      </a>
      <div className="min-w-0">
        <a
          href={result.filePageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          {result.fileTitle}
        </a>
        <p className="mt-1 signal-kicker text-muted-foreground">
          {result.source} search result · not rights-cleared
        </p>
        <dl className="mt-3 grid gap-2 text-xs leading-relaxed text-muted-foreground">
          <div>
            <dt className="inline font-semibold text-foreground">License: </dt>
            <dd className="inline">
              {result.license || `Not supplied by ${result.source}`}
            </dd>
            {result.licenseUrl && (
              <>
                {" · "}
                <a
                  href={result.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  License terms
                </a>
              </>
            )}
          </div>
          <div>
            <dt className="inline font-semibold text-foreground">Creator: </dt>
            <dd className="inline">
              {result.creator || `Not supplied by ${result.source}`}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-foreground">Credit: </dt>
            <dd className="inline">
              {result.credit || `Not supplied by ${result.source}`}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-foreground">Copyright: </dt>
            <dd className="inline">
              {result.copyright || `Not supplied by ${result.source}`}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-foreground">Usage terms: </dt>
            <dd className="inline">
              {result.usageRights || `Not supplied by ${result.source}`}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          className="signal-rule-link mt-3"
          disabled={alreadySaved || createCandidate.isPending}
          onClick={() =>
            createCandidate.mutate(
              {
                itemId,
                data: {
                  source: result.source,
                  fileTitle: result.fileTitle,
                  filePageUrl: result.filePageUrl,
                  imageUrl: result.imageUrl,
                  altText: "",
                  caption: "",
                },
              },
              {
                onSuccess: onSaved,
                onError: (error) =>
                  onError(
                    errorMessage(error, "The image candidate could not be saved."),
                  ),
              },
            )
          }
        >
          {alreadySaved ? "Already saved for this lead" : "Save candidate for review"}
        </button>
      </div>
    </article>
  );
}

export function ImageCandidateManager({ itemId }: { itemId: number }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [archiveSource, setArchiveSource] =
    useState<EditorImageCandidateSearchResult["source"]>("Wikimedia Commons");
  const [drafts, setDrafts] = useState<Record<number, CandidateDraft>>({});
  const [sourcePreviews, setSourcePreviews] = useState<
    Record<number, EditorImageCandidateSourceRecheckPreview>
  >({});
  const [sourcePreviewsNeedRefresh, setSourcePreviewsNeedRefresh] = useState<
    Record<number, boolean>
  >({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const candidatesQuery = useGetEditorDiscoveryItemImageCandidates(itemId, {
    query: {
      queryKey: getGetEditorDiscoveryItemImageCandidatesQueryKey(itemId),
      enabled: isOpen,
    },
  });
  const search = useSearchEditorImageCandidates();
  const updateCandidate = useUpdateEditorImageCandidate();
  const recheckSource = useRecheckEditorImageCandidateSource();
  const applySourceRecheck = useApplyEditorImageCandidateSourceRecheck();
  const reviewRights = useReviewEditorImageCandidateRights();
  const candidates = candidatesQuery.data?.candidates ?? [];
  const searchResults = search.data?.results ?? [];

  function clearDraft(candidateId: number) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[candidateId];
      return next;
    });
  }

  function updateDraft(
    candidate: EditorImageCandidate,
    field: keyof CandidateDraft,
    value: string,
  ) {
    setDrafts((current) => ({
      ...current,
      [candidate.id]: {
        ...(current[candidate.id] ?? candidateDraft(candidate)),
        [field]: value,
      },
    }));
  }

  function invalidateCandidates() {
    return queryClient.invalidateQueries({
      queryKey: getGetEditorDiscoveryItemImageCandidatesQueryKey(itemId),
    });
  }

  function clearSourcePreview(candidateId: number) {
    setSourcePreviews((current) => {
      const next = { ...current };
      delete next[candidateId];
      return next;
    });
    setSourcePreviewsNeedRefresh((current) => {
      const next = { ...current };
      delete next[candidateId];
      return next;
    });
  }

  function recheckSourceTerms(candidate: EditorImageCandidate) {
    setError("");
    setNotice("");
    setSourcePreviewsNeedRefresh((current) =>
      current[candidate.id]
        ? { ...current, [candidate.id]: true }
        : current,
    );
    recheckSource.mutate(
      { candidateId: candidate.id },
      {
        onSuccess: (preview) => {
          void invalidateCandidates();
          setSourcePreviews((current) => ({
            ...current,
            [candidate.id]: preview,
          }));
          setSourcePreviewsNeedRefresh((current) => ({
            ...current,
            [candidate.id]: false,
          }));
          setNotice(
            preview.changedFields.length === 0
              ? `${candidate.source} rights terms match the saved snapshot. No metadata was changed.`
              : `${candidate.source} terms differ from the saved snapshot. Compare them below before applying.`,
          );
        },
        onError: (reason) =>
          {
            void invalidateCandidates();
            setSourcePreviewsNeedRefresh((current) => ({
              ...current,
              [candidate.id]: true,
            }));
            setError(
              errorMessage(
                reason,
                `${candidate.source} could not be checked. Saved image terms were not changed.`,
              ),
            );
          },
      },
    );
  }

  function applySourceTerms(
    candidate: EditorImageCandidate,
    preview: EditorImageCandidateSourceRecheckPreview,
    hasUnsavedMetadata: boolean,
  ) {
    if (hasUnsavedMetadata) {
      setError(`Save the image metadata before applying ${candidate.source} terms.`);
      return;
    }
    setError("");
    applySourceRecheck.mutate(
      {
        candidateId: candidate.id,
        data: { expectedMetadata: preview.currentMetadata },
      },
      {
        onSuccess: (result) => {
          clearDraft(candidate.id);
          clearSourcePreview(candidate.id);
          void invalidateCandidates();
          setNotice(
            result.rightsTermsChanged
              ? `Current ${candidate.source} terms saved. The previous rights decision was cleared and review is pending.`
              : "No rights terms changed. The saved snapshot and review decision remain unchanged.",
          );
        },
        onError: (reason) => {
          void invalidateCandidates();
          setSourcePreviewsNeedRefresh((current) => ({
            ...current,
            [candidate.id]: true,
          }));
          setError(
            errorMessage(
              reason,
              `${candidate.source} terms could not be applied. Saved image terms were not changed; recheck before trying again.`,
            ),
          );
        },
      },
    );
  }

  function saveMetadata(candidate: EditorImageCandidate, draft: CandidateDraft) {
    setError("");
    updateCandidate.mutate(
      {
        candidateId: candidate.id,
        data: {
          license: draft.license,
          licenseUrl: draft.licenseUrl.trim() || null,
          creator: draft.creator,
          credit: draft.credit,
          copyright: draft.copyright,
          usageRights: draft.usageRights,
          altText: draft.altText,
          caption: draft.caption,
        },
      },
      {
        onSuccess: () => {
          clearDraft(candidate.id);
          if (sourcePreviews[candidate.id]) {
            setSourcePreviewsNeedRefresh((current) => ({
              ...current,
              [candidate.id]: true,
            }));
          }
          void invalidateCandidates();
          setNotice(
            sourcePreviews[candidate.id]
              ? "Image metadata saved. Recheck the source comparison before recording a rights decision."
              : "Image metadata saved. Rights remain pending if rights terms changed.",
          );
        },
        onError: (reason) =>
          setError(errorMessage(reason, "Image metadata could not be saved.")),
      },
    );
  }

  function reviewCandidate(
    candidate: EditorImageCandidate,
    decision: ImageCandidateRightsDecision,
    draft: CandidateDraft,
    hasUnsavedMetadata: boolean,
  ) {
    if (hasUnsavedMetadata) {
      setError("Save the image metadata before recording a rights decision.");
      return;
    }
    if (
      decision === "approved" &&
      ((recheckSource.isPending &&
        recheckSource.variables?.candidateId === candidate.id) ||
        sourcePreviewsNeedRefresh[candidate.id] ||
        (sourcePreviews[candidate.id]?.changedFields.length ?? 0) > 0)
    ) {
      setError(
        `Recheck ${candidate.source} and resolve or refresh the comparison before approving rights.`,
      );
      return;
    }
    setError("");
    reviewRights.mutate(
      {
        candidateId: candidate.id,
        data: {
          rightsStatus: decision,
          reviewNotes: draft.reviewNotes.trim(),
        },
      },
      {
        onSuccess: () => {
          clearDraft(candidate.id);
          void invalidateCandidates();
          setNotice(
            decision === "approved"
              ? "Rights review recorded. This does not publish or attach the image."
              : "Image candidate rejected for rights use.",
          );
        },
        onError: (reason) =>
          setError(errorMessage(reason, "The rights decision could not be saved.")),
      },
    );
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    search.mutate(
      { data: { query: searchText.trim(), source: archiveSource } },
      {
        onError: (reason) =>
          setError(errorMessage(reason, `${archiveSource} search failed.`)),
      },
    );
  }

  return (
    <div className="mt-4 border-t border-foreground/15 pt-3">
      <button
        type="button"
        className="signal-kicker text-accent hover:underline"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "Hide image candidates" : "Search and review image candidates"}
      </button>

      {isOpen && (
        <div className="mt-4">
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
            {archiveSource === "Internet Archive"
              ? "Internet Archive item metadata may be incomplete or supplied by uploaders, and the archive does not guarantee an item’s copyright status. Inspect the original record and rights terms. Every saved candidate stays pending until an editor records a rights decision; candidates are not attached to stories or published automatically."
              : "Search Wikimedia Commons and inspect each original file page. Commons availability is not reuse clearance. Every saved candidate stays pending until an editor records a rights decision; candidates are not attached to stories or published automatically."}
          </p>

          {(error || notice) && (
            <p
              className={`mt-3 text-sm ${error ? "text-destructive" : "text-accent"}`}
              role={error ? "alert" : "status"}
            >
              {error || notice}
            </p>
          )}

          <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={submitSearch}>
            <label className="grid gap-1 signal-kicker text-muted-foreground">
              Image archive
              <select
                className="signal-input min-h-10 normal-case tracking-normal text-foreground"
                value={archiveSource}
                onChange={(event) => {
                  setArchiveSource(
                    event.target.value as EditorImageCandidateSearchResult["source"],
                  );
                  search.reset();
                  setError("");
                  setNotice("");
                }}
              >
                <option value="Wikimedia Commons">Wikimedia Commons</option>
                <option value="Internet Archive">Internet Archive</option>
              </select>
            </label>
            <label className="grid flex-1 gap-1 signal-kicker text-muted-foreground">
              Search terms
              <input
                className="signal-input min-h-10 normal-case tracking-normal text-foreground"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                minLength={2}
                maxLength={160}
                placeholder="Topic, event, place or institution"
              />
            </label>
            <button
              type="submit"
              className="signal-button self-end"
              disabled={search.isPending || searchText.trim().length < 2}
            >
              {search.isPending ? "Searching…" : `Search ${archiveSource}`}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-3 border-t border-foreground/15">
              {searchResults.map((result) => (
                <SearchResult
                  key={result.fileTitle}
                  itemId={itemId}
                  result={result}
                  alreadySaved={candidates.some(
                    (candidate) => candidate.fileTitle === result.fileTitle,
                  )}
                  onSaved={() => {
                    setError("");
                    setNotice("Candidate saved with rights review pending.");
                    void invalidateCandidates();
                  }}
                  onError={setError}
                />
              ))}
            </div>
          )}

          <div className="mt-6 border-t-2 border-foreground/20 pt-4">
            <h5 className="font-display text-xl">Saved image candidates</h5>
            {candidatesQuery.isLoading ? (
              <p className="mt-3 signal-kicker text-muted-foreground" role="status">
                Loading saved candidates…
              </p>
            ) : candidatesQuery.isError ? (
              <p className="mt-3 text-sm text-destructive" role="alert">
                Saved candidates could not be loaded. Close and reopen this panel to retry.
              </p>
            ) : candidates.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No image candidates have been saved for this lead.
              </p>
            ) : (
              <div className="mt-3 divide-y divide-foreground/15 border-t border-foreground/15">
                {candidates.map((candidate) => {
                  const draft = drafts[candidate.id] ?? candidateDraft(candidate);
                  const metadataChanged =
                    draft.license !== candidate.license ||
                    draft.licenseUrl !== (candidate.licenseUrl ?? "") ||
                    draft.creator !== candidate.creator ||
                    draft.credit !== candidate.credit ||
                    draft.copyright !== candidate.copyright ||
                    draft.usageRights !== candidate.usageRights;
                  const metadataDirty =
                    metadataChanged ||
                    draft.altText !== candidate.altText ||
                    draft.caption !== candidate.caption;
                  const rightsFieldsReady = [
                    draft.license,
                    draft.creator,
                    draft.credit,
                    draft.copyright,
                    draft.usageRights,
                    draft.altText,
                    draft.caption,
                  ].every((value) => value.trim().length > 0);
                  const savingThisCandidate =
                    updateCandidate.isPending &&
                    updateCandidate.variables?.candidateId === candidate.id;
                  const recheckingThisCandidate =
                    recheckSource.isPending &&
                    recheckSource.variables?.candidateId === candidate.id;
                  const applyingThisCandidate =
                    applySourceRecheck.isPending &&
                    applySourceRecheck.variables?.candidateId === candidate.id;
                  const reviewingThisCandidate =
                    reviewRights.isPending &&
                    reviewRights.variables?.candidateId === candidate.id;
                  const sourcePreview = sourcePreviews[candidate.id];
                  const sourcePreviewNeedsRefresh =
                    sourcePreviewsNeedRefresh[candidate.id] === true;
                  const sourceTermsChanged =
                    (sourcePreview?.changedFields.length ?? 0) > 0;
                  const rightsApprovalBlocked =
                    sourceTermsChanged ||
                    sourcePreviewNeedsRefresh ||
                    recheckingThisCandidate;

                  return (
                    <article key={candidate.id} className="grid gap-4 py-5 sm:grid-cols-[180px_1fr]">
                      <div>
                        <a
                          href={candidate.filePageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="signal-kicker text-accent hover:underline"
                        >
                          <img
                            src={candidate.thumbnailUrl}
                            alt=""
                            loading="lazy"
                            className="mb-2 aspect-video w-full border border-foreground/15 object-cover"
                          />
                          Open original file page
                        </a>
                        <p className="mt-2 signal-kicker text-muted-foreground">
                          Discovered {new Date(candidate.discoveredAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="signal-kicker text-accent">
                              {candidate.source} / {rightsStatusLabel(candidate.rightsStatus)}
                            </p>
                            <h6 className="mt-1 font-display text-lg">{candidate.fileTitle}</h6>
                          </div>
                          {candidate.reviewedAt && (
                            <p className="signal-kicker text-muted-foreground">
                              Reviewed by {candidate.reviewedBy} ·{" "}
                              {new Date(candidate.reviewedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {candidate.sourceAvailabilityStatus === "missing" && (
                          <p
                            className="mt-3 border-l-2 border-destructive px-3 py-2 text-sm text-destructive"
                            role="status"
                          >
                            Source file confirmed missing from {candidate.source}.
                            The saved attribution and rights snapshot are still
                            available below.
                          </p>
                        )}

                        <dl className="mt-3 grid gap-2 text-xs leading-relaxed text-muted-foreground">
                          <div>
                            <dt className="inline font-semibold text-foreground">License: </dt>
                            <dd className="inline">
                              {candidate.license ||
                                `Not supplied by ${candidate.source}`}
                            </dd>
                            {candidate.licenseUrl && (
                              <>
                                {" · "}
                                <a
                                  href={candidate.licenseUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent hover:underline"
                                >
                                  License terms
                                </a>
                              </>
                            )}
                          </div>
                          <div>
                            <dt className="inline font-semibold text-foreground">Copyright: </dt>
                            <dd className="inline">
                              {candidate.copyright ||
                                `Not supplied by ${candidate.source}`}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-4 border border-foreground/15 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              className="signal-rule-link"
                              disabled={
                                metadataDirty ||
                                savingThisCandidate ||
                                recheckingThisCandidate ||
                                applyingThisCandidate
                              }
                              onClick={() => recheckSourceTerms(candidate)}
                            >
                              {recheckingThisCandidate
                                ? `Checking ${candidate.source}…`
                                : `Recheck current ${candidate.source} terms`}
                            </button>
                            <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
                              This read-only check compares the original file page
                              with the saved rights snapshot. It does not change
                              saved metadata.
                            </p>
                          </div>
                          {metadataDirty && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Save or discard image metadata changes before rechecking.
                            </p>
                          )}
                          {sourcePreviewNeedsRefresh && !sourcePreview && (
                            <p className="mt-2 text-xs text-destructive" role="status">
                               Current {candidate.source} terms could not be confirmed. Retry the
                              recheck before approving rights.
                            </p>
                          )}

                          {sourcePreview && (
                            <section
                              className="mt-3 border-t border-foreground/15 pt-3"
                              aria-label={`${candidate.source} rights comparison for ${candidate.fileTitle}`}
                            >
                              <p className="signal-kicker text-muted-foreground">
                                {candidate.source} checked{" "}
                                {new Date(sourcePreview.checkedAt).toLocaleString()}
                              </p>
                              {sourcePreviewNeedsRefresh && (
                                <p className="mt-2 text-sm text-destructive" role="status">
                                  The saved candidate changed after this comparison.
                                  Recheck before applying terms or approving rights.
                                </p>
                              )}
                              {sourcePreview.changedFields.length === 0 ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  No rights-term changes found. The saved snapshot and
                                  any existing review decision remain unchanged.
                                </p>
                              ) : (
                                <>
                                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    Review each difference below. Applying the current
                                    terms will clear the previous rights decision and
                                    return this candidate to pending review.
                                  </p>
                                  <ul className="mt-3 divide-y divide-foreground/15 border-y border-foreground/15">
                                    {sourcePreview.changedFields.map((field) => (
                                      <li key={field} className="py-3">
                                        <p className="signal-kicker text-foreground">
                                          {rightsFieldLabels[field]}
                                        </p>
                                        <div className="mt-2 grid gap-3 text-xs leading-relaxed sm:grid-cols-2">
                                          <div className="min-w-0">
                                            <p className="font-semibold text-muted-foreground">
                                              Saved
                                            </p>
                                            <p className="mt-1 break-words text-foreground">
                                              {rightsMetadataValue(
                                                field,
                                                candidate[field],
                                              )}
                                            </p>
                                          </div>
                                          <div className="min-w-0">
                                            <p className="font-semibold text-muted-foreground">
                                              Current {candidate.source}
                                            </p>
                                            <p className="mt-1 break-words text-foreground">
                                              {rightsMetadataValue(
                                                field,
                                                sourcePreview.currentMetadata[field],
                                              )}
                                            </p>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                  <button
                                    type="button"
                                    className="signal-button mt-3"
                                    disabled={
                                      metadataDirty ||
                                      sourcePreviewNeedsRefresh ||
                                      savingThisCandidate ||
                                      recheckingThisCandidate ||
                                      applyingThisCandidate
                                    }
                                    onClick={() =>
                                      applySourceTerms(
                                        candidate,
                                        sourcePreview,
                                        metadataDirty,
                                      )
                                    }
                                  >
                                    {applyingThisCandidate
                                      ? "Applying terms…"
                                      : "Apply current terms and reset rights review"}
                                  </button>
                                </>
                              )}
                              {sourcePreview.changedFields.length === 0 &&
                                !sourcePreviewNeedsRefresh && (
                                  <button
                                    type="button"
                                    className="signal-rule-link mt-3"
                                    onClick={() =>
                                      clearSourcePreview(candidate.id)
                                    }
                                  >
                                    Close comparison
                                  </button>
                                )}
                            </section>
                          )}
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            License
                            <input
                              className="signal-input min-h-10 normal-case tracking-normal text-foreground"
                              value={draft.license}
                              onChange={(event) =>
                                updateDraft(candidate, "license", event.target.value)
                              }
                              maxLength={500}
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            License terms URL (optional)
                            <input
                              className="signal-input min-h-10 normal-case tracking-normal text-foreground"
                              type="url"
                              value={draft.licenseUrl}
                              onChange={(event) =>
                                updateDraft(candidate, "licenseUrl", event.target.value)
                              }
                              placeholder="https://"
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            Creator / artist
                            <input
                              className="signal-input min-h-10 normal-case tracking-normal text-foreground"
                              value={draft.creator}
                              onChange={(event) =>
                                updateDraft(candidate, "creator", event.target.value)
                              }
                              maxLength={1000}
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            Required credit
                            <input
                              className="signal-input min-h-10 normal-case tracking-normal text-foreground"
                              value={draft.credit}
                              onChange={(event) =>
                                updateDraft(candidate, "credit", event.target.value)
                              }
                              maxLength={2000}
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground md:col-span-2">
                            Copyright statement
                            <textarea
                              className="signal-input min-h-16 resize-y normal-case tracking-normal text-foreground"
                              value={draft.copyright}
                              onChange={(event) =>
                                updateDraft(candidate, "copyright", event.target.value)
                              }
                              maxLength={2000}
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground md:col-span-2">
                            Usage rights and restrictions
                            <textarea
                              className="signal-input min-h-20 resize-y normal-case tracking-normal text-foreground"
                              value={draft.usageRights}
                              onChange={(event) =>
                                updateDraft(candidate, "usageRights", event.target.value)
                              }
                              maxLength={3000}
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            Alt text
                            <textarea
                              className="signal-input min-h-16 resize-y normal-case tracking-normal text-foreground"
                              value={draft.altText}
                              onChange={(event) =>
                                updateDraft(candidate, "altText", event.target.value)
                              }
                              maxLength={500}
                            />
                          </label>
                          <label className="grid gap-1 signal-kicker text-muted-foreground">
                            Caption
                            <textarea
                              className="signal-input min-h-16 resize-y normal-case tracking-normal text-foreground"
                              value={draft.caption}
                              onChange={(event) =>
                                updateDraft(candidate, "caption", event.target.value)
                              }
                              maxLength={1000}
                            />
                          </label>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            className="signal-rule-link"
                            disabled={!metadataDirty || savingThisCandidate}
                            onClick={() => saveMetadata(candidate, draft)}
                          >
                            {savingThisCandidate ? "Saving…" : "Save image metadata"}
                          </button>
                          {metadataChanged && (
                            <span className="signal-kicker text-muted-foreground">
                              Saving changed rights terms returns the review to pending.
                            </span>
                          )}
                        </div>

                        {candidate.reviewNotes && (
                          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                            Previous rights-review note: {candidate.reviewNotes}
                          </p>
                        )}
                        {candidate.rightsHistory.length > 0 && (
                          <details className="mt-4 border border-foreground/15 p-3">
                            <summary className="cursor-pointer signal-kicker text-accent">
                              Rights history ({candidate.rightsHistory.length})
                            </summary>
                            <ol className="mt-3 divide-y divide-foreground/15 border-t border-foreground/15">
                              {candidate.rightsHistory.map((entry) => (
                                <li key={entry.id} className="py-4">
                                  <p className="signal-kicker text-foreground">
                                    Terms changed by {entry.changedBy} ·{" "}
                                    {new Date(entry.changedAt).toLocaleString()} ·{" "}
                                    {entry.changeSource === "source_recheck"
                                      ? "source recheck"
                                      : "editor edit"}
                                  </p>
                                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    Previous decision:{" "}
                                    {rightsStatusLabel(entry.previousRightsStatus)}
                                    {entry.previousReviewedBy
                                      ? ` · reviewed by ${entry.previousReviewedBy}`
                                      : ""}
                                    {entry.previousReviewedAt
                                      ? ` · ${new Date(
                                          entry.previousReviewedAt,
                                        ).toLocaleString()}`
                                      : ""}
                                  </p>
                                  {entry.previousReviewNotes && (
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                      Previous review note: {entry.previousReviewNotes}
                                    </p>
                                  )}
                                  <dl className="mt-3 grid gap-3 text-xs leading-relaxed sm:grid-cols-2">
                                    {(Object.keys(rightsFieldLabels) as Array<
                                      keyof EditorImageCandidateRightsMetadata
                                    >).map((field) => (
                                      <div
                                        key={field}
                                        className="border-t border-foreground/10 pt-2"
                                      >
                                        <dt className="signal-kicker text-foreground">
                                          {rightsFieldLabels[field]}
                                        </dt>
                                        <dd className="mt-1 break-words text-muted-foreground">
                                          Previous:{" "}
                                          {rightsMetadataValue(
                                            field,
                                            entry.previousMetadata[field],
                                          )}
                                        </dd>
                                        <dd className="mt-1 break-words text-muted-foreground">
                                          New:{" "}
                                          {rightsMetadataValue(
                                            field,
                                            entry.newMetadata[field],
                                          )}
                                        </dd>
                                      </div>
                                    ))}
                                  </dl>
                                </li>
                              ))}
                            </ol>
                          </details>
                        )}
                        <label className="mt-4 grid gap-1 signal-kicker text-muted-foreground">
                          Rights-review note
                          <textarea
                            className="signal-input min-h-16 resize-y normal-case tracking-normal text-foreground"
                            value={draft.reviewNotes}
                            onChange={(event) =>
                              updateDraft(candidate, "reviewNotes", event.target.value)
                            }
                            maxLength={2000}
                            placeholder="Record what you checked on the original file page."
                          />
                        </label>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="signal-button"
                            disabled={
                              !rightsFieldsReady ||
                              !draft.reviewNotes.trim() ||
                              metadataDirty ||
                              rightsApprovalBlocked ||
                              reviewingThisCandidate
                            }
                            onClick={() =>
                              reviewCandidate(
                                candidate,
                                "approved",
                                draft,
                                metadataDirty,
                              )
                            }
                          >
                            {reviewingThisCandidate ? "Saving…" : "Confirm rights checked"}
                          </button>
                          <button
                            type="button"
                            className="signal-rule-link text-destructive"
                            disabled={
                              !draft.reviewNotes.trim() ||
                              metadataDirty ||
                              reviewingThisCandidate
                            }
                            onClick={() =>
                              reviewCandidate(
                                candidate,
                                "rejected",
                                draft,
                                metadataDirty,
                              )
                            }
                          >
                            Reject for rights use
                          </button>
                        </div>
                        {rightsApprovalBlocked && (
                          <p className="mt-3 text-xs leading-relaxed text-muted-foreground" role="status">
                            Rights approval is paused until the {candidate.source} comparison
                            is rechecked and any changed terms are resolved.
                          </p>
                        )}
                        {candidate.rightsStatus === "approved" && (
                          <p className="mt-3 signal-kicker text-muted-foreground">
                            Rights were reviewed by an editor. This candidate remains
                            unpublished and is not attached to a story.
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}