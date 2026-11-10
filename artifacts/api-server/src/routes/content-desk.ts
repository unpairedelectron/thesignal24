import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  or,
} from "drizzle-orm";
import { Router, type IRouter, type RequestHandler } from "express";
import {
  CreateEditorDiscoveryItemImageCandidateBody,
  CreateEditorDiscoveryItemImageCandidateParams,
  CreateEditorDiscoveryItemImageCandidateResponse,
  CreateEditorContentSourceBody,
  CreateEditorContentSourceResponse,
  CreateEditorDiscoveryItemBody,
  CreateEditorDiscoveryItemResponse,
  GetEditorDiscoveryItemImageCandidatesParams,
  GetEditorDiscoveryItemImageCandidatesResponse,
  GetEditorImageCandidateArchiveResponse,
  GetEditorContentSourcesResponse,
  GetEditorDiscoveryItemsResponse,
  PromoteEditorDiscoveryItemBody,
  PromoteEditorDiscoveryItemParams,
  PromoteEditorDiscoveryItemResponse,
  ReviewEditorImageCandidateRightsBody,
  ReviewEditorImageCandidateRightsParams,
  ReviewEditorImageCandidateRightsResponse,
  RemoveEditorImageCandidateParams,
  RemoveEditorImageCandidateResponse,
  SearchEditorImageCandidatesBody,
  SearchEditorImageCandidatesResponse,
  UpdateEditorImageCandidateBody,
  UpdateEditorImageCandidateParams,
  UpdateEditorImageCandidateResponse,
  ApplyEditorImageCandidateSourceRecheckBody,
  ApplyEditorImageCandidateSourceRecheckParams,
  ApplyEditorImageCandidateSourceRecheckResponse,
  RecheckEditorImageCandidateSourceParams,
  RecheckEditorImageCandidateSourceResponse,
  UpdateEditorContentSourceBody,
  UpdateEditorContentSourceParams,
  UpdateEditorContentSourceResponse,
  UpdateEditorDiscoveryItemBody,
  UpdateEditorDiscoveryItemParams,
  UpdateEditorDiscoveryItemResponse,
} from "@workspace/api-zod";
import type {
  ContentSourceInput,
  EditorImageCandidateRightsMetadata,
  EditorImageCandidateSearchResult,
} from "@workspace/api-zod";
import {
  contentImageCandidateRightsHistoryTable,
  contentImageCandidatesTable,
  db,
  discoveryItemsTable,
  issuesTable,
  sourceRegistryTable,
  storiesTable,
  storyRevisionsTable,
} from "@workspace/db";
import type {
  ContentImageCandidate,
  ContentImageCandidateRightsHistory,
} from "@workspace/db";
import { requireEditor } from "../middlewares/editorAuth";
import {
  type WikimediaCommonsClient,
  wikimediaCommonsClient,
} from "../lib/wikimedia-commons";
import {
  internetArchiveClient,
  isInternetArchiveImageUrlForItem,
  type InternetArchiveClient,
} from "../lib/internet-archive";
import {
  artInstituteClient,
  isArtInstituteImageUrl,
  parseArtInstituteArtworkPageUrl,
  type ArtInstituteClient,
} from "../lib/art-institute";

const sourceTypes = new Set([
  "government",
  "court",
  "regulator",
  "reporting",
  "academic",
  "community",
  "image",
  "other",
]);
const authorityLevels = new Set([
  "primary",
  "secondary",
  "academic",
  "community",
  "unconfirmed",
]);
const discoveryStatuses = new Set(["new", "review", "rejected"]);
const contentTopics = new Set([
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
]);
const geographies = new Set([
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
]);

function parseId(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function asIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  if ("code" in error && error.code === "23505") return true;
  return "cause" in error && isUniqueViolation(error.cause);
}

function normalizeDomain(value: string): string | null {
  const domain = value.trim().toLowerCase().replace(/^www\./, "");
  if (
    domain.length > 253 ||
    !/^(?=.{3,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(
      domain,
    )
  ) {
    return null;
  }
  return domain;
}

function parseHttpsUrl(value: string, allowedDomain?: string): URL | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.hostname.length > 253
    ) {
      return null;
    }
    if (
      allowedDomain &&
      url.hostname.toLowerCase() !== allowedDomain &&
      !url.hostname.toLowerCase().endsWith(`.${allowedDomain}`)
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function normalizeCandidateUrl(value: string, allowedDomain: string): string | null {
  const url = parseHttpsUrl(value, allowedDomain);
  if (!url) return null;
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_.+|fbclid|gclid|mc_cid|mc_eid)$/i.test(key)) {
      url.searchParams.delete(key);
    }
  }
  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }
  return url.toString();
}

function serializeSource(source: typeof sourceRegistryTable.$inferSelect) {
  return {
    ...source,
    lastCheckedAt: asIso(source.lastCheckedAt),
    createdAt: source.createdAt.toISOString(),
    updatedAt: source.updatedAt.toISOString(),
  };
}

function serializeDiscoveryItem(
  item: typeof discoveryItemsTable.$inferSelect,
  source: typeof sourceRegistryTable.$inferSelect,
) {
  return {
    id: item.id,
    sourceId: item.sourceId,
    sourceName: source.sourceName,
    sourceDomain: source.domain,
    originalUrl: item.originalUrl,
    canonicalUrl: item.canonicalUrl,
    title: item.title,
    publisher: item.publisher,
    sourcePublishedOn: item.sourcePublishedOn,
    author: item.author,
    summary: item.summary,
    language: item.language,
    state: item.state,
    topic: item.topic,
    candidateEventTitle: item.candidateEventTitle,
    candidateSourceUrl: item.candidateSourceUrl,
    candidateImageUrl: item.candidateImageUrl,
    status: item.status,
    reviewNotes: item.reviewNotes,
    reviewedBy: item.reviewedBy,
    reviewedAt: asIso(item.reviewedAt),
    promotedStoryId: item.promotedStoryId,
    promotedBy: item.promotedBy,
    promotedAt: asIso(item.promotedAt),
    createdBy: item.createdBy,
    createdAt: item.createdAt.toISOString(),
    updatedBy: item.updatedBy,
    updatedAt: item.updatedAt.toISOString(),
  };
}

function serializeImageCandidateRightsHistory(
  entry: ContentImageCandidateRightsHistory,
) {
  return {
    ...entry,
    previousReviewedAt: asIso(entry.previousReviewedAt),
    newReviewedAt: asIso(entry.newReviewedAt),
    changedAt: entry.changedAt.toISOString(),
  };
}

function serializeImageCandidate(
  candidate: ContentImageCandidate,
  rightsHistory: ContentImageCandidateRightsHistory[] = [],
) {
  return {
    ...candidate,
    reviewedAt: asIso(candidate.reviewedAt),
    removedAt: asIso(candidate.removedAt),
    discoveredAt: candidate.discoveredAt.toISOString(),
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
    rightsHistory: rightsHistory.map(serializeImageCandidateRightsHistory),
  };
}

async function getImageCandidateRightsHistory(
  database: typeof db,
  candidateId: number,
) {
  return database
    .select()
    .from(contentImageCandidateRightsHistoryTable)
    .where(eq(contentImageCandidateRightsHistoryTable.candidateId, candidateId))
    .orderBy(
      desc(contentImageCandidateRightsHistoryTable.changedAt),
      desc(contentImageCandidateRightsHistoryTable.id),
    );
}

const imageRightsMetadataFields = [
  "license",
  "licenseUrl",
  "creator",
  "credit",
  "copyright",
  "usageRights",
] as const satisfies readonly (keyof EditorImageCandidateRightsMetadata)[];

function candidateRightsMetadata(
  candidate: ContentImageCandidate,
): EditorImageCandidateRightsMetadata {
  return {
    license: candidate.license,
    licenseUrl: candidate.licenseUrl,
    creator: candidate.creator,
    credit: candidate.credit,
    copyright: candidate.copyright,
    usageRights: candidate.usageRights,
  };
}

function sourceRightsMetadata(
  source: EditorImageCandidateSearchResult,
): EditorImageCandidateRightsMetadata {
  return {
    license: source.license,
    licenseUrl: source.licenseUrl,
    creator: source.creator,
    credit: source.credit,
    copyright: source.copyright,
    usageRights: source.usageRights,
  };
}

function changedImageRightsMetadataFields(
  saved: EditorImageCandidateRightsMetadata,
  current: EditorImageCandidateRightsMetadata,
) {
  return imageRightsMetadataFields.filter(
    (field) => saved[field] !== current[field],
  );
}

function validateSourceInput(
  input: ContentSourceInput,
): { domain: string; urls: Record<string, string | null> } | null {
  const domain = normalizeDomain(input.domain);
  if (
    !domain ||
    !sourceTypes.has(input.sourceType) ||
    !authorityLevels.has(input.authorityLevel) ||
    (input.state != null && !geographies.has(input.state))
  ) {
    return null;
  }
  const urls: Record<string, string | null> = {};
  for (const key of ["rssUrl", "sitemapUrl", "searchUrl"] as const) {
    const value = input[key];
    if (value == null || value.trim() === "") {
      urls[key] = null;
      continue;
    }
    const parsed = parseHttpsUrl(value, domain);
    if (!parsed) return null;
    urls[key] = parsed.toString();
  }
  return { domain, urls };
}

export function createContentDeskRouter(
  database: typeof db = db,
  editorGuard: RequestHandler = requireEditor,
  commonsClient: WikimediaCommonsClient = wikimediaCommonsClient,
  archiveClient: InternetArchiveClient = internetArchiveClient,
  museumClient: ArtInstituteClient = artInstituteClient,
): IRouter {
  const router: IRouter = Router();
  // Every route here lives under /editor. Scope the guard to that prefix: this router
  // is mounted before the community and newsletter routers, and an unscoped guard
  // blocked those public endpoints for every visitor.
  router.use("/editor", editorGuard);

  async function currentSourceImage(
    candidate: ContentImageCandidate,
  ): Promise<EditorImageCandidateSearchResult | null> {
    if (candidate.source === "Wikimedia Commons") {
      return commonsClient.getFileByTitle(candidate.fileTitle);
    }
    if (candidate.source === "Internet Archive") {
      return archiveClient.getImageByItemUrl(
        candidate.filePageUrl,
        candidate.imageUrl,
      );
    }
    if (candidate.source === "Art Institute of Chicago") {
      return museumClient.getImageByArtworkPageUrl(
        candidate.filePageUrl,
        candidate.imageUrl,
      );
    }
    throw new Error("Unsupported image archive provider.");
  }

  async function updateSourceAvailability(
    candidate: ContentImageCandidate,
    status: "available" | "missing",
    editorId: string | undefined,
  ): Promise<ContentImageCandidate | null> {
    if (candidate.sourceAvailabilityStatus === status) {
      const [activeCandidate] = await database
        .select({ id: contentImageCandidatesTable.id })
        .from(contentImageCandidatesTable)
        .where(
          and(
            eq(contentImageCandidatesTable.id, candidate.id),
            isNull(contentImageCandidatesTable.removedAt),
            isNotNull(contentImageCandidatesTable.discoveryItemId),
          ),
        )
        .limit(1);
      return activeCandidate ? candidate : null;
    }
    const [updatedCandidate] = await database
      .update(contentImageCandidatesTable)
      .set({
        sourceAvailabilityStatus: status,
        updatedBy: editorId ?? candidate.updatedBy,
      })
      .where(
        and(
          eq(contentImageCandidatesTable.id, candidate.id),
          isNull(contentImageCandidatesTable.removedAt),
          isNotNull(contentImageCandidatesTable.discoveryItemId),
        ),
      )
      .returning();
    return updatedCandidate ?? null;
  }

  router.post("/editor/image-search", async (req, res): Promise<void> => {
    const parsed = SearchEditorImageCandidatesBody.safeParse(req.body);
    if (!parsed.success || parsed.data.query.trim().length < 2) {
      res.status(400).json({
        message: parsed.success
          ? "Enter at least two non-space characters to search."
          : parsed.error.message,
      });
      return;
    }
    const source = parsed.data.source ?? "Wikimedia Commons";
    try {
      const page = parsed.data.page ?? 1;
      const searchResult =
        source === "Internet Archive"
          ? await archiveClient.searchImages(parsed.data.query.trim(), page)
          : source === "Art Institute of Chicago"
            ? await museumClient.searchImages(parsed.data.query.trim(), page)
            : {
              results: await commonsClient.searchImages(
                parsed.data.query.trim(),
              ),
              nextPage: null,
            };
      res.json(SearchEditorImageCandidatesResponse.parse(searchResult));
    } catch {
      req.log?.warn({ source }, "Image archive search failed");
      res.status(502).json({
        message: `${source} could not be reached. Try again later.`,
      });
    }
  });

  router.get("/editor/content-sources", async (_req, res): Promise<void> => {
    const rows = await database
      .select()
      .from(sourceRegistryTable)
      .orderBy(asc(sourceRegistryTable.sourceName));
    res.json(
      GetEditorContentSourcesResponse.parse({
        sources: rows.map(serializeSource),
      }),
    );
  });

  router.post("/editor/content-sources", async (req, res): Promise<void> => {
    const parsed = CreateEditorContentSourceBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    const validated = validateSourceInput(parsed.data);
    if (!validated) {
      res.status(400).json({
        message:
          "Use a valid public domain, supported source classifications, canonical geography, and HTTPS URLs on that domain.",
      });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is required." });
      return;
    }
    const [source] = await database
      .insert(sourceRegistryTable)
      .values({
        sourceName: parsed.data.sourceName.trim(),
        sourceType: parsed.data.sourceType,
        authorityLevel: parsed.data.authorityLevel,
        domain: validated.domain,
        rssUrl: validated.urls.rssUrl,
        sitemapUrl: validated.urls.sitemapUrl,
        searchUrl: validated.urls.searchUrl,
        language: parsed.data.language.trim(),
        state: parsed.data.state?.trim() || null,
        enabled: parsed.data.enabled,
        crawlFrequency: "manual",
        createdBy: editorId,
        updatedBy: editorId,
      })
      .onConflictDoNothing({ target: sourceRegistryTable.domain })
      .returning();
    if (!source) {
      res.status(409).json({ message: "That domain is already registered." });
      return;
    }
    res.status(201).json(
      CreateEditorContentSourceResponse.parse(serializeSource(source)),
    );
  });

  router.put(
    "/editor/content-sources/:sourceId",
    async (req, res): Promise<void> => {
      const params = UpdateEditorContentSourceParams.safeParse(req.params);
      const parsed = UpdateEditorContentSourceBody.safeParse(req.body);
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
      }
      const validated = validateSourceInput(parsed.data);
      if (!validated) {
        res.status(400).json({
          message:
            "Use a valid public domain, supported source classifications, canonical geography, and HTTPS URLs on that domain.",
        });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }
      try {
        const [source] = await database
          .update(sourceRegistryTable)
          .set({
            sourceName: parsed.data.sourceName.trim(),
            sourceType: parsed.data.sourceType,
            authorityLevel: parsed.data.authorityLevel,
            domain: validated.domain,
            rssUrl: validated.urls.rssUrl,
            sitemapUrl: validated.urls.sitemapUrl,
            searchUrl: validated.urls.searchUrl,
            language: parsed.data.language.trim(),
            state: parsed.data.state?.trim() || null,
            enabled: parsed.data.enabled,
            updatedBy: editorId,
          })
          .where(eq(sourceRegistryTable.id, params.data.sourceId))
          .returning();
        if (!source) {
          res.status(404).json({ message: "Source registry entry not found." });
          return;
        }
        res.json(
          UpdateEditorContentSourceResponse.parse(serializeSource(source)),
        );
      } catch (error) {
        if (isUniqueViolation(error)) {
          res.status(409).json({ message: "That domain is already registered." });
          return;
        }
        throw error;
      }
    },
  );

  router.get("/editor/discovery-items", async (_req, res): Promise<void> => {
    const rows = await database
      .select({ item: discoveryItemsTable, source: sourceRegistryTable })
      .from(discoveryItemsTable)
      .innerJoin(
        sourceRegistryTable,
        eq(discoveryItemsTable.sourceId, sourceRegistryTable.id),
      )
      .orderBy(desc(discoveryItemsTable.createdAt));
    res.json(
      GetEditorDiscoveryItemsResponse.parse({
        items: rows.map(({ item, source }) =>
          serializeDiscoveryItem(item, source),
        ),
      }),
    );
  });

  router.post("/editor/discovery-items", async (req, res): Promise<void> => {
    const parsed = CreateEditorDiscoveryItemBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.message });
      return;
    }
    const [source] = await database
      .select()
      .from(sourceRegistryTable)
      .where(eq(sourceRegistryTable.id, parsed.data.sourceId))
      .limit(1);
    if (!source || !source.enabled) {
      res.status(404).json({ message: "Enabled source entry not found." });
      return;
    }
    const canonicalUrl = normalizeCandidateUrl(
      parsed.data.originalUrl,
      source.domain,
    );
    if (!canonicalUrl) {
      res.status(400).json({
        message: "Lead URL must use HTTPS and belong to the configured source domain.",
      });
      return;
    }
    if (
      (parsed.data.topic != null && !contentTopics.has(parsed.data.topic)) ||
      (parsed.data.state != null && !geographies.has(parsed.data.state))
    ) {
      res.status(400).json({
        message: "Choose a controlled topic and canonical geography.",
      });
      return;
    }
    for (const candidateUrl of [
      parsed.data.candidateSourceUrl,
      parsed.data.candidateImageUrl,
    ]) {
      if (candidateUrl != null && !parseHttpsUrl(candidateUrl)) {
        res.status(400).json({
          message: "Candidate document and image links must use HTTPS.",
        });
        return;
      }
    }
    const [duplicate] = await database
      .select({ id: discoveryItemsTable.id })
      .from(discoveryItemsTable)
      .where(eq(discoveryItemsTable.canonicalUrl, canonicalUrl))
      .limit(1);
    if (duplicate) {
      res.status(409).json({
        message: "This canonical URL is already in the discovery queue.",
        duplicateItemId: duplicate.id,
      });
      return;
    }
    const editorId = req.editorIdentity?.id;
    if (!editorId) {
      res.status(403).json({ message: "Verified editor identity is required." });
      return;
    }
    const [item] = await database
      .insert(discoveryItemsTable)
      .values({
        sourceId: source.id,
        originalUrl: parsed.data.originalUrl,
        canonicalUrl,
        title: parsed.data.title.trim(),
        publisher: parsed.data.publisher?.trim() || source.sourceName,
        sourcePublishedOn: parsed.data.sourcePublishedOn ?? null,
        author: parsed.data.author?.trim() || null,
        summary: parsed.data.summary.trim(),
        language: parsed.data.language.trim(),
        state: parsed.data.state ?? null,
        topic: parsed.data.topic ?? null,
        candidateEventTitle: parsed.data.candidateEventTitle?.trim() || null,
        candidateSourceUrl: parsed.data.candidateSourceUrl ?? null,
        candidateImageUrl: parsed.data.candidateImageUrl ?? null,
        status: "new",
        reviewNotes: "",
        createdBy: editorId,
        updatedBy: editorId,
      })
      .onConflictDoNothing({ target: discoveryItemsTable.canonicalUrl })
      .returning();
    if (!item) {
      res.status(409).json({
        message: "This canonical URL is already in the discovery queue.",
      });
      return;
    }
    res.status(201).json(
      CreateEditorDiscoveryItemResponse.parse(
        serializeDiscoveryItem(item, source),
      ),
    );
  });

  router.get(
    "/editor/discovery-items/:itemId/image-candidates",
    async (req, res): Promise<void> => {
      const params = GetEditorDiscoveryItemImageCandidatesParams.safeParse(
        req.params,
      );
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      const [item] = await database
        .select({ id: discoveryItemsTable.id })
        .from(discoveryItemsTable)
        .where(eq(discoveryItemsTable.id, params.data.itemId))
        .limit(1);
      if (!item) {
        res.status(404).json({ message: "Discovery item not found." });
        return;
      }
      const candidates = await database
        .select()
        .from(contentImageCandidatesTable)
        .where(
          and(
            eq(contentImageCandidatesTable.discoveryItemId, params.data.itemId),
            isNull(contentImageCandidatesTable.removedAt),
          ),
        )
        .orderBy(desc(contentImageCandidatesTable.discoveredAt));
      const historyRows =
        candidates.length === 0
          ? []
          : await database
              .select()
              .from(contentImageCandidateRightsHistoryTable)
              .where(
                inArray(
                  contentImageCandidateRightsHistoryTable.candidateId,
                  candidates.map((candidate) => candidate.id),
                ),
              )
              .orderBy(
                desc(contentImageCandidateRightsHistoryTable.changedAt),
                desc(contentImageCandidateRightsHistoryTable.id),
              );
      const historyByCandidate = new Map<
        number,
        ContentImageCandidateRightsHistory[]
      >();
      for (const historyRow of historyRows) {
        const current = historyByCandidate.get(historyRow.candidateId) ?? [];
        current.push(historyRow);
        historyByCandidate.set(historyRow.candidateId, current);
      }
      res.json(
        GetEditorDiscoveryItemImageCandidatesResponse.parse({
          candidates: candidates.map((candidate) =>
            serializeImageCandidate(
              candidate,
              historyByCandidate.get(candidate.id),
            ),
          ),
        }),
      );
    },
  );

  router.get("/editor/image-candidates/archive", async (_req, res) => {
    const candidates = await database
      .select()
      .from(contentImageCandidatesTable)
      .where(
        or(
          isNotNull(contentImageCandidatesTable.removedAt),
          isNull(contentImageCandidatesTable.discoveryItemId),
        ),
      )
      .orderBy(
        desc(contentImageCandidatesTable.removedAt),
        desc(contentImageCandidatesTable.updatedAt),
      );
    const historyRows =
      candidates.length === 0
        ? []
        : await database
            .select()
            .from(contentImageCandidateRightsHistoryTable)
            .where(
              inArray(
                contentImageCandidateRightsHistoryTable.candidateId,
                candidates.map((candidate) => candidate.id),
              ),
            )
            .orderBy(
              desc(contentImageCandidateRightsHistoryTable.changedAt),
              desc(contentImageCandidateRightsHistoryTable.id),
            );
    const historyByCandidate = new Map<
      number,
      ContentImageCandidateRightsHistory[]
    >();
    for (const historyRow of historyRows) {
      const current = historyByCandidate.get(historyRow.candidateId) ?? [];
      current.push(historyRow);
      historyByCandidate.set(historyRow.candidateId, current);
    }
    res.json(
      GetEditorImageCandidateArchiveResponse.parse({
        candidates: candidates.map((candidate) =>
          serializeImageCandidate(
            candidate,
            historyByCandidate.get(candidate.id),
          ),
        ),
      }),
    );
  });

  router.post(
    "/editor/discovery-items/:itemId/image-candidates",
    async (req, res): Promise<void> => {
      const params = CreateEditorDiscoveryItemImageCandidateParams.safeParse(
        req.params,
      );
      const parsed = CreateEditorDiscoveryItemImageCandidateBody.safeParse(
        req.body,
      );
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
      }
      const [item] = await database
        .select({ id: discoveryItemsTable.id })
        .from(discoveryItemsTable)
        .where(eq(discoveryItemsTable.id, params.data.itemId))
        .limit(1);
      if (!item) {
        res.status(404).json({ message: "Discovery item not found." });
        return;
      }
      const source = parsed.data.source ?? "Wikimedia Commons";
      if (
        source === "Wikimedia Commons" &&
        !parsed.data.fileTitle.trim().startsWith("File:")
      ) {
        res.status(400).json({ message: "Choose a Wikimedia Commons file." });
        return;
      }
      if (
        source === "Internet Archive" &&
        (!parsed.data.filePageUrl ||
          !parsed.data.imageUrl ||
          !isInternetArchiveImageUrlForItem(
            parsed.data.filePageUrl,
            parsed.data.imageUrl,
          ))
      ) {
        res.status(400).json({
          message:
            "Choose an image file and item page from the Internet Archive.",
        });
        return;
      }
      if (
        source === "Art Institute of Chicago" &&
        (!parsed.data.filePageUrl ||
          !parsed.data.imageUrl ||
          parseArtInstituteArtworkPageUrl(parsed.data.filePageUrl) === null ||
          !isArtInstituteImageUrl(parsed.data.imageUrl))
      ) {
        res.status(400).json({
          message:
            "Choose an artwork page and IIIF image from the Art Institute of Chicago.",
        });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }

      let file: EditorImageCandidateSearchResult | null;
      try {
        file =
          source === "Internet Archive"
            ? await archiveClient.getImageByItemUrl(
                parsed.data.filePageUrl!,
                parsed.data.imageUrl!,
              )
            : source === "Art Institute of Chicago"
              ? await museumClient.getImageByArtworkPageUrl(
                  parsed.data.filePageUrl!,
                  parsed.data.imageUrl!,
                )
            : await commonsClient.getFileByTitle(
                parsed.data.fileTitle.trim(),
              );
      } catch {
        req.log?.warn({ source }, "Image archive file metadata request failed");
        res.status(502).json({
          message: `${source} could not be reached. Try again later.`,
        });
        return;
      }
      if (!file) {
        res.status(404).json({
          message: `That image is no longer available from ${source}.`,
        });
        return;
      }

      const [candidate] = await database
        .insert(contentImageCandidatesTable)
        .values({
          discoveryItemId: params.data.itemId,
          source: file.source,
          fileTitle: file.fileTitle,
          imageUrl: file.imageUrl,
          thumbnailUrl: file.thumbnailUrl,
          filePageUrl: file.filePageUrl,
          license: file.license,
          licenseUrl: file.licenseUrl,
          creator: file.creator,
          credit: file.credit,
          copyright: file.copyright,
          usageRights: file.usageRights,
          catalogReference: file.catalogReference,
          artworkDate: file.artworkDate,
          provenance: file.provenance,
          altText: parsed.data.altText?.trim() ?? "",
          caption: parsed.data.caption?.trim() ?? "",
          rightsStatus: "pending",
          reviewNotes: "",
          createdBy: editorId,
          updatedBy: editorId,
        })
        .onConflictDoNothing({
          target: [
            contentImageCandidatesTable.discoveryItemId,
            contentImageCandidatesTable.fileTitle,
          ],
        })
        .returning();
      if (!candidate) {
        res.status(409).json({
          message: `This ${source} image is already saved for the lead.`,
        });
        return;
      }
      res.status(201).json(
        CreateEditorDiscoveryItemImageCandidateResponse.parse(
          serializeImageCandidate(candidate),
        ),
      );
    },
  );

  router.delete(
    "/editor/image-candidates/:candidateId",
    async (req, res): Promise<void> => {
      const params = RemoveEditorImageCandidateParams.safeParse(req.params);
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }
      const [candidate] = await database
        .update(contentImageCandidatesTable)
        .set({
          removedBy: editorId,
          removedAt: new Date(),
          updatedBy: editorId,
        })
        .where(
          and(
            eq(contentImageCandidatesTable.id, params.data.candidateId),
            isNull(contentImageCandidatesTable.removedAt),
            isNotNull(contentImageCandidatesTable.discoveryItemId),
          ),
        )
        .returning();
      if (!candidate) {
        res.status(404).json({ message: "Active image candidate not found." });
        return;
      }
      const rightsHistory = await getImageCandidateRightsHistory(
        database,
        candidate.id,
      );
      res.json(
        RemoveEditorImageCandidateResponse.parse(
          serializeImageCandidate(candidate, rightsHistory),
        ),
      );
    },
  );

  router.patch(
    "/editor/image-candidates/:candidateId",
    async (req, res): Promise<void> => {
      const params = UpdateEditorImageCandidateParams.safeParse(req.params);
      const parsed = UpdateEditorImageCandidateBody.safeParse(req.body);
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }
      const license = parsed.data.license.trim();
      const licenseUrlInput = parsed.data.licenseUrl?.trim() || null;
      const licenseUrl = licenseUrlInput
        ? parseHttpsUrl(licenseUrlInput)
        : null;
      if (licenseUrlInput && !licenseUrl) {
        res.status(400).json({
          message: "The license URL must use HTTPS and contain no credentials.",
        });
        return;
      }
      const creator = parsed.data.creator.trim();
      const credit = parsed.data.credit.trim();
      const copyright = parsed.data.copyright.trim();
      const usageRights = parsed.data.usageRights.trim();
      const nextMetadata = {
        license,
        licenseUrl: licenseUrl?.toString() ?? null,
        creator,
        credit,
        copyright,
        usageRights,
      };
      const updateResult = await database.transaction(async (tx) => {
        const [existing] = await tx
          .select()
          .from(contentImageCandidatesTable)
          .where(
            and(
              eq(contentImageCandidatesTable.id, params.data.candidateId),
              isNull(contentImageCandidatesTable.removedAt),
              isNotNull(contentImageCandidatesTable.discoveryItemId),
            ),
          )
          .for("update")
          .limit(1);
        if (!existing) return { candidate: undefined };
        const rightsTermsChanged =
          changedImageRightsMetadataFields(
            candidateRightsMetadata(existing),
            nextMetadata,
          ).length > 0;
        const [candidate] = await tx
          .update(contentImageCandidatesTable)
          .set({
            ...nextMetadata,
            altText: parsed.data.altText.trim(),
            caption: parsed.data.caption.trim(),
            rightsStatus: rightsTermsChanged ? "pending" : existing.rightsStatus,
            reviewNotes: rightsTermsChanged ? "" : existing.reviewNotes,
            reviewedBy: rightsTermsChanged ? null : existing.reviewedBy,
            reviewedAt: rightsTermsChanged ? null : existing.reviewedAt,
            updatedBy: editorId,
          })
          .where(
            and(
              eq(contentImageCandidatesTable.id, params.data.candidateId),
              isNull(contentImageCandidatesTable.removedAt),
              isNotNull(contentImageCandidatesTable.discoveryItemId),
            ),
          )
          .returning();
        if (!candidate) return { candidate: undefined };
        if (rightsTermsChanged) {
          await tx.insert(contentImageCandidateRightsHistoryTable).values({
            candidateId: existing.id,
            previousMetadata: candidateRightsMetadata(existing),
            newMetadata: nextMetadata,
            previousRightsStatus: existing.rightsStatus,
            previousReviewNotes: existing.reviewNotes,
            previousReviewedBy: existing.reviewedBy,
            previousReviewedAt: existing.reviewedAt,
            changedBy: editorId,
            changeSource: "editor_edit",
          });
        }
        return { candidate };
      });
      const candidate = updateResult.candidate;
      if (!candidate) {
        res.status(404).json({ message: "Image candidate not found." });
        return;
      }
      const rightsHistory = await getImageCandidateRightsHistory(
        database,
        candidate.id,
      );
      res.json(
        UpdateEditorImageCandidateResponse.parse(
          serializeImageCandidate(candidate, rightsHistory),
        ),
      );
    },
  );

  router.post(
    "/editor/image-candidates/:candidateId/recheck",
    async (req, res): Promise<void> => {
      const params = RecheckEditorImageCandidateSourceParams.safeParse(
        req.params,
      );
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      let [candidate] = await database
        .select()
        .from(contentImageCandidatesTable)
        .where(
          and(
            eq(contentImageCandidatesTable.id, params.data.candidateId),
            isNull(contentImageCandidatesTable.removedAt),
            isNotNull(contentImageCandidatesTable.discoveryItemId),
          ),
        )
        .limit(1);
      if (!candidate) {
        res.status(404).json({ message: "Image candidate not found." });
        return;
      }

      let sourceFile: EditorImageCandidateSearchResult | null;
      try {
        sourceFile = await currentSourceImage(candidate);
      } catch {
        req.log?.warn(
          { source: candidate.source },
          "Image candidate source recheck failed",
        );
        res.status(502).json({
          message:
            `${candidate.source} could not be reached. Saved image terms were not changed.`,
        });
        return;
      }
      if (!sourceFile) {
        await updateSourceAvailability(
          candidate,
          "missing",
          req.editorIdentity?.id,
        );
        res.status(404).json({
          message:
            `The ${candidate.source} image is no longer available. Saved image terms were not changed.`,
        });
        return;
      }
      const availableCandidate = await updateSourceAvailability(
        candidate,
        "available",
        req.editorIdentity?.id,
      );
      if (!availableCandidate) {
        res.status(404).json({ message: "Image candidate not found." });
        return;
      }
      candidate = availableCandidate;

      const currentMetadata = sourceRightsMetadata(sourceFile);
      res.json(
        RecheckEditorImageCandidateSourceResponse.parse({
          candidateId: candidate.id,
          checkedAt: new Date().toISOString(),
          currentMetadata,
          changedFields: changedImageRightsMetadataFields(
            candidateRightsMetadata(candidate),
            currentMetadata,
          ),
        }),
      );
    },
  );

  router.post(
    "/editor/image-candidates/:candidateId/recheck/apply",
    async (req, res): Promise<void> => {
      const params = ApplyEditorImageCandidateSourceRecheckParams.safeParse(
        req.params,
      );
      const parsed = ApplyEditorImageCandidateSourceRecheckBody.safeParse(
        req.body,
      );
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }
      let [candidate] = await database
        .select()
        .from(contentImageCandidatesTable)
        .where(
          and(
            eq(contentImageCandidatesTable.id, params.data.candidateId),
            isNull(contentImageCandidatesTable.removedAt),
            isNotNull(contentImageCandidatesTable.discoveryItemId),
          ),
        )
        .limit(1);
      if (!candidate) {
        res.status(404).json({ message: "Image candidate not found." });
        return;
      }
      let sourceFile: EditorImageCandidateSearchResult | null;
      try {
        sourceFile = await currentSourceImage(candidate);
      } catch {
        req.log?.warn(
          { source: candidate.source },
          "Image candidate source apply check failed",
        );
        res.status(502).json({
          message:
            `${candidate.source} could not be reached. Saved image terms were not changed.`,
        });
        return;
      }
      if (!sourceFile) {
        await updateSourceAvailability(
          candidate,
          "missing",
          req.editorIdentity?.id,
        );
        res.status(404).json({
          message:
            `The ${candidate.source} image is no longer available. Saved image terms were not changed.`,
        });
        return;
      }
      const availableCandidate = await updateSourceAvailability(
        candidate,
        "available",
        req.editorIdentity?.id,
      );
      if (!availableCandidate) {
        res.status(404).json({ message: "Image candidate not found." });
        return;
      }
      candidate = availableCandidate;

      const currentMetadata = sourceRightsMetadata(sourceFile);
      if (
        changedImageRightsMetadataFields(
          parsed.data.expectedMetadata,
          currentMetadata,
        ).length > 0
      ) {
        res.status(409).json({
          message:
            `${candidate.source} terms changed since the comparison. Recheck the image before applying.`,
        });
        return;
      }

      const rightsTermsChanged =
        changedImageRightsMetadataFields(
          candidateRightsMetadata(candidate),
          currentMetadata,
        ).length > 0;
      if (!rightsTermsChanged) {
        res.json(
          ApplyEditorImageCandidateSourceRecheckResponse.parse({
            candidate: serializeImageCandidate(candidate),
            rightsTermsChanged: false,
          }),
        );
        return;
      }

      const applyResult = await database.transaction(async (tx) => {
        const [lockedCandidate] = await tx
          .select()
          .from(contentImageCandidatesTable)
          .where(
            and(
              eq(contentImageCandidatesTable.id, candidate.id),
              isNull(contentImageCandidatesTable.removedAt),
              isNotNull(contentImageCandidatesTable.discoveryItemId),
            ),
          )
          .for("update")
          .limit(1);
        if (!lockedCandidate) return { kind: "missing" as const };
        if (
          changedImageRightsMetadataFields(
            candidateRightsMetadata(candidate),
            candidateRightsMetadata(lockedCandidate),
          ).length > 0 ||
          lockedCandidate.rightsStatus !== candidate.rightsStatus ||
          lockedCandidate.reviewNotes !== candidate.reviewNotes ||
          lockedCandidate.reviewedBy !== candidate.reviewedBy ||
          lockedCandidate.reviewedAt?.getTime() !==
            candidate.reviewedAt?.getTime()
        ) {
          return { kind: "changed" as const };
        }
        const [updatedCandidate] = await tx
          .update(contentImageCandidatesTable)
          .set({
            ...currentMetadata,
            sourceAvailabilityStatus: "available",
            rightsStatus: "pending",
            reviewNotes: "",
            reviewedBy: null,
            reviewedAt: null,
            updatedBy: editorId,
          })
          .where(
            and(
              eq(contentImageCandidatesTable.id, lockedCandidate.id),
              isNull(contentImageCandidatesTable.removedAt),
              isNotNull(contentImageCandidatesTable.discoveryItemId),
            ),
          )
          .returning();
        if (!updatedCandidate) return { kind: "changed" as const };
        await tx.insert(contentImageCandidateRightsHistoryTable).values({
          candidateId: lockedCandidate.id,
          previousMetadata: candidateRightsMetadata(lockedCandidate),
          newMetadata: currentMetadata,
          previousRightsStatus: lockedCandidate.rightsStatus,
          previousReviewNotes: lockedCandidate.reviewNotes,
          previousReviewedBy: lockedCandidate.reviewedBy,
          previousReviewedAt: lockedCandidate.reviewedAt,
          changedBy: editorId,
          changeSource: "source_recheck",
        });
        return { kind: "updated" as const, candidate: updatedCandidate };
      });
      if (applyResult.kind === "missing") {
        res.status(404).json({ message: "Image candidate not found." });
        return;
      }
      if (applyResult.kind !== "updated") {
        res.status(409).json({
          message: "The candidate changed while applying. Recheck it before applying.",
        });
        return;
      }
      const rightsHistory = await getImageCandidateRightsHistory(
        database,
        applyResult.candidate.id,
      );
      res.json(
        ApplyEditorImageCandidateSourceRecheckResponse.parse({
          candidate: serializeImageCandidate(
            applyResult.candidate,
            rightsHistory,
          ),
          rightsTermsChanged: true,
        }),
      );
    },
  );

  router.patch(
    "/editor/image-candidates/:candidateId/rights",
    async (req, res): Promise<void> => {
      const params = ReviewEditorImageCandidateRightsParams.safeParse(
        req.params,
      );
      const parsed = ReviewEditorImageCandidateRightsBody.safeParse(req.body);
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      if (!parsed.success || !parsed.data.reviewNotes.trim()) {
        res.status(400).json({
          message: parsed.success
            ? "Add a review note explaining the rights decision."
            : parsed.error.message,
        });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }
      const reviewNotes = parsed.data.reviewNotes.trim();
      const reviewResult = await database.transaction(async (tx) => {
        const [existing] = await tx
          .select()
          .from(contentImageCandidatesTable)
          .where(
            and(
              eq(contentImageCandidatesTable.id, params.data.candidateId),
              isNull(contentImageCandidatesTable.removedAt),
              isNotNull(contentImageCandidatesTable.discoveryItemId),
            ),
          )
          .for("update")
          .limit(1);
        if (!existing) return { kind: "missing" as const };
        if (
          parsed.data.rightsStatus === "approved" &&
          [
            existing.license,
            existing.creator,
            existing.credit,
            existing.copyright,
            existing.usageRights,
            existing.altText,
            existing.caption,
          ].some((value) => !value.trim())
        ) {
          return { kind: "incomplete" as const };
        }
        const reviewedAt = new Date();
        const [candidate] = await tx
          .update(contentImageCandidatesTable)
          .set({
            rightsStatus: parsed.data.rightsStatus,
            reviewNotes,
            reviewedBy: editorId,
            reviewedAt,
            updatedBy: editorId,
          })
          .where(
            and(
              eq(contentImageCandidatesTable.id, params.data.candidateId),
              isNull(contentImageCandidatesTable.removedAt),
              isNotNull(contentImageCandidatesTable.discoveryItemId),
            ),
          )
          .returning();
        if (!candidate) return { kind: "missing" as const };
        const metadata = candidateRightsMetadata(existing);
        await tx.insert(contentImageCandidateRightsHistoryTable).values({
          candidateId: existing.id,
          previousMetadata: metadata,
          newMetadata: metadata,
          previousRightsStatus: existing.rightsStatus,
          previousReviewNotes: existing.reviewNotes,
          previousReviewedBy: existing.reviewedBy,
          previousReviewedAt: existing.reviewedAt,
          eventType: "decision_recorded",
          newRightsStatus: candidate.rightsStatus,
          newReviewNotes: candidate.reviewNotes,
          newReviewedBy: candidate.reviewedBy,
          newReviewedAt: candidate.reviewedAt,
          changedBy: editorId,
          changeSource: "editor_review",
        });
        return { kind: "updated" as const, candidate };
      });
      if (reviewResult.kind === "missing") {
        res.status(404).json({ message: "Image candidate not found." });
        return;
      }
      if (reviewResult.kind === "incomplete") {
        res.status(400).json({
          message:
            "Complete the license, creator, credit, copyright, usage terms, alt text, and caption before confirming rights.",
        });
        return;
      }
      const { candidate } = reviewResult;
      const rightsHistory = await getImageCandidateRightsHistory(
        database,
        candidate.id,
      );
      res.json(
        ReviewEditorImageCandidateRightsResponse.parse(
          serializeImageCandidate(candidate, rightsHistory),
        ),
      );
    },
  );

  router.patch(
    "/editor/discovery-items/:itemId",
    async (req, res): Promise<void> => {
      const params = UpdateEditorDiscoveryItemParams.safeParse(req.params);
      const parsed = UpdateEditorDiscoveryItemBody.safeParse(req.body);
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
      }
      if (!discoveryStatuses.has(parsed.data.status)) {
        res.status(400).json({ message: "Unsupported discovery status." });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }
      const updateConditions = [
        eq(discoveryItemsTable.id, params.data.itemId),
      ];
      if (parsed.data.status !== "review") {
        updateConditions.push(isNull(discoveryItemsTable.promotedStoryId));
      }
      const [item] = await database
        .update(discoveryItemsTable)
        .set({
          status: parsed.data.status,
          reviewNotes: parsed.data.reviewNotes.trim(),
          reviewedBy: parsed.data.status === "new" ? null : editorId,
          reviewedAt: parsed.data.status === "new" ? null : new Date(),
          updatedBy: editorId,
        })
        .where(and(...updateConditions))
        .returning();
      if (!item) {
        const [existing] = await database
          .select({
            id: discoveryItemsTable.id,
            promotedStoryId: discoveryItemsTable.promotedStoryId,
          })
          .from(discoveryItemsTable)
          .where(eq(discoveryItemsTable.id, params.data.itemId))
          .limit(1);
        if (existing?.promotedStoryId) {
          res.status(409).json({
            message: "A promoted lead must remain in the reviewed state.",
          });
          return;
        }
        res.status(404).json({ message: "Discovery item not found." });
        return;
      }
      const [source] = await database
        .select()
        .from(sourceRegistryTable)
        .where(eq(sourceRegistryTable.id, item.sourceId))
        .limit(1);
      if (!source) {
        res.status(404).json({ message: "Source registry entry not found." });
        return;
      }
      res.json(
        UpdateEditorDiscoveryItemResponse.parse(
          serializeDiscoveryItem(item, source),
        ),
      );
    },
  );

  router.post(
    "/editor/discovery-items/:itemId/promote",
    async (req, res): Promise<void> => {
      const params = PromoteEditorDiscoveryItemParams.safeParse(req.params);
      const parsed = PromoteEditorDiscoveryItemBody.safeParse(req.body);
      if (!params.success) {
        res.status(400).json({ message: params.error.message });
        return;
      }
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error.message });
        return;
      }
      if (
        !parsed.data.title.trim() ||
        !parsed.data.dek.trim() ||
        !parsed.data.body.trim()
      ) {
        res.status(400).json({
          message: "Write an original title, standfirst, and article body.",
        });
        return;
      }
      const editorId = req.editorIdentity?.id;
      if (!editorId) {
        res.status(403).json({ message: "Verified editor identity is required." });
        return;
      }

      const result = await database.transaction(async (tx) => {
        const [record] = await tx
          .select({ item: discoveryItemsTable, source: sourceRegistryTable })
          .from(discoveryItemsTable)
          .innerJoin(
            sourceRegistryTable,
            eq(discoveryItemsTable.sourceId, sourceRegistryTable.id),
          )
          .where(eq(discoveryItemsTable.id, params.data.itemId))
          .for("update")
          .limit(1);
        if (!record) {
          return {
            ok: false as const,
            status: 404,
            message: "Discovery item not found.",
          };
        }
        if (record.item.promotedStoryId) {
          return {
            ok: false as const,
            status: 409,
            message: "This lead has already been promoted.",
          };
        }
        if (record.item.status !== "review") {
          return {
            ok: false as const,
            status: 409,
            message: "Review this lead before promoting it.",
          };
        }

        const [issue] = await tx
          .select({ id: issuesTable.id })
          .from(issuesTable)
          .where(eq(issuesTable.id, parsed.data.issueId))
          .limit(1);
        if (!issue) {
          return {
            ok: false as const,
            status: 404,
            message: "Editorial issue not found.",
          };
        }

        const now = new Date();
        const [story] = await tx
          .insert(storiesTable)
          .values({
            issueId: issue.id,
            topic: parsed.data.topic,
            kind: "Article",
            state: record.item.state,
            source: record.item.publisher?.trim() || record.source.sourceName,
            sourceUrl: record.item.originalUrl,
            publishedOn: null,
            eyebrow: "Editorial draft",
            title: parsed.data.title.trim(),
            dek: parsed.data.dek.trim(),
            body: parsed.data.body.trim(),
            time: "6 min",
            read: 6,
            tone: "Latest",
            number: null,
            sortOrder: 0,
            workflowStatus: "draft",
            verificationStatus: "unverified",
            verificationNotes:
              "Created from a reviewed external lead; verify all reporting and source details before publication.",
            sourcePublishedOn: record.item.sourcePublishedOn,
            sourceRetrievedOn: now.toISOString().slice(0, 10),
            lastVerifiedAt: null,
            reviewedAt: null,
            scheduledFor: null,
            aiDisclosure: null,
            correctionNote: null,
          })
          .returning();

        await tx.insert(storyRevisionsTable).values({
          storyId: story.id,
          revisionNumber: 1,
          changeNote: "Created from a reviewed external lead",
          snapshot: story,
        });

        const [item] = await tx
          .update(discoveryItemsTable)
          .set({
            promotedStoryId: story.id,
            promotedBy: editorId,
            promotedAt: now,
            updatedBy: editorId,
          })
          .where(eq(discoveryItemsTable.id, record.item.id))
          .returning();

        return { ok: true as const, item, source: record.source };
      });

      if (!result.ok) {
        res.status(result.status).json({ message: result.message });
        return;
      }
      res.json(
        PromoteEditorDiscoveryItemResponse.parse(
          serializeDiscoveryItem(result.item, result.source),
        ),
      );
    },
  );

  return router;
}

export default createContentDeskRouter();
