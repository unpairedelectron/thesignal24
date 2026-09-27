import { asc, desc, eq } from "drizzle-orm";
import { Router, type IRouter, type RequestHandler } from "express";
import {
  CreateEditorContentSourceBody,
  CreateEditorContentSourceResponse,
  CreateEditorDiscoveryItemBody,
  CreateEditorDiscoveryItemResponse,
  GetEditorContentSourcesResponse,
  GetEditorDiscoveryItemsResponse,
  UpdateEditorContentSourceBody,
  UpdateEditorContentSourceParams,
  UpdateEditorContentSourceResponse,
  UpdateEditorDiscoveryItemBody,
  UpdateEditorDiscoveryItemParams,
  UpdateEditorDiscoveryItemResponse,
} from "@workspace/api-zod";
import type { ContentSourceInput } from "@workspace/api-zod";
import {
  db,
  discoveryItemsTable,
  sourceRegistryTable,
} from "@workspace/db";
import { requireEditor } from "../middlewares/editorAuth";

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
    createdBy: item.createdBy,
    createdAt: item.createdAt.toISOString(),
    updatedBy: item.updatedBy,
    updatedAt: item.updatedAt.toISOString(),
  };
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
): IRouter {
  const router: IRouter = Router();
  router.use(editorGuard);

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
      const [item] = await database
        .update(discoveryItemsTable)
        .set({
          status: parsed.data.status,
          reviewNotes: parsed.data.reviewNotes.trim(),
          reviewedBy: parsed.data.status === "new" ? null : editorId,
          reviewedAt: parsed.data.status === "new" ? null : new Date(),
          updatedBy: editorId,
        })
        .where(eq(discoveryItemsTable.id, params.data.itemId))
        .returning();
      if (!item) {
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

  return router;
}

export default createContentDeskRouter();