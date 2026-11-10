import app from "./app";
import { logger } from "./lib/logger";
import { ensureSeedData } from "./lib/seed";
import { ensureContentPack } from "./lib/content-pack";

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

ensureSeedData()
  .then(() => ensureContentPack())
  .then(() => {
    logger.info("Publication data initialized");
  })
  .catch((error) => {
    logger.error({ error }, "Unable to initialize publication data");
    process.exit(1);
  });
