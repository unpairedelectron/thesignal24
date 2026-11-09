import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const suite = process.argv[2] ?? "all";
const suitePatterns = {
  adapters: "Provider adapter:",
  routes: "Editor route:",
};
if (suite !== "all" && !Object.hasOwn(suitePatterns, suite)) {
  console.error(
    `Unknown content-desk suite "${suite}". Choose adapters, routes, or all.`,
  );
  process.exit(1);
}

const testDir = await mkdtemp(path.join(artifactDir, ".content-desk-test-"));
const testFile = path.join(testDir, "content-desk.test.mjs");

try {
  await build({
    entryPoints: [path.join(artifactDir, "src/routes/content-desk.test.ts")],
    outfile: testFile,
    bundle: true,
    platform: "node",
    format: "esm",
    sourcemap: "inline",
    banner: {
      js: `import { createRequire } from "node:module";
globalThis.require = createRequire(import.meta.url);`,
    },
  });

  const args = ["--enable-source-maps", "--test"];
  if (suite !== "all") {
    args.push(`--test-name-pattern=${suitePatterns[suite]}`);
  }
  args.push(testFile);
  const result = spawnSync(process.execPath, args, {
    env: process.env,
    stdio: "inherit",
  });
  process.exitCode = result.status ?? 1;
} finally {
  await rm(testDir, { recursive: true, force: true });
}