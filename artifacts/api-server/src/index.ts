import app from "./app";
import { logger } from "./lib/logger";
import { ensureSeedData } from "./lib/seed";
import { ensureContentPack } from "./lib/content-pack";
import { ensureEvidencePack } from "./lib/evidence-pack";
import { ensureCommunitySchema } from "./lib/community-schema";
import { ensureIndexNowSchema, submitChangedUrls } from "./lib/indexnow";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

server.on("error", (error) => {
  logger.error({ err: error }, "Error listening on port");
  process.exit(1);
});

ensureCommunitySchema()
  .then(() => ensureIndexNowSchema())
  .then(() => ensureSeedData())
  .then(() => ensureContentPack())
  .then(() => ensureEvidencePack())
  .then(() => {
    logger.info("Publication data initialized");
    // Announce new and changed pages to search engines. Never blocks or fails startup.
    submitChangedUrls().catch((error) => {
      logger.warn({ err: error }, "IndexNow: submission failed; will retry on next start");
    });
  })
  .catch((error) => {
    logger.error({ error }, "Unable to initialize publication data");
    process.exit(1);
  });
