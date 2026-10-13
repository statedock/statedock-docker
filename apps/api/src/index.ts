import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { StateDockService } from "@statedock/core";
import { createDatabase, migrate } from "@statedock/db";
import { createRepository } from "@statedock/db/service";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { SetupManager } from "./setup.js";
import { initStorageConfig } from "./storage.js";

const storage = initStorageConfig();
process.env.DATABASE_URL = storage.databaseUrl;

const { client, db } = createDatabase(storage.databaseUrl);

// Configure SQLite WAL Pragmas
await client.execute("PRAGMA journal_mode = WAL");
await client.execute("PRAGMA busy_timeout = 5000");
await client.execute("PRAGMA synchronous = NORMAL");

await migrate(client);

const setupManager = new SetupManager(client);
await setupManager.init();

const port = Number(process.env.PORT ?? 3000);
const app = createApp(new StateDockService(createRepository(db)), {
  setupManager,
  client,
  backupsDir: storage.backupsDir,
  publicOrigin: process.env.PUBLIC_BASE_URL,
});

const webRoot = fileURLToPath(new URL("../../web/dist/", import.meta.url));
app.get("/assets/*", serveStatic({ root: webRoot }));
app.get("/icons/*", serveStatic({ root: webRoot }));
app.get("/doc.md", serveStatic({ root: webRoot, path: "doc.md" }));
app.get("/doc.zh.md", serveStatic({ root: webRoot, path: "doc.zh.md" }));
app.get("/favicon.ico", serveStatic({ root: webRoot, path: "favicon.ico" }));
app.get("/manifest.webmanifest", serveStatic({ root: webRoot, path: "manifest.webmanifest" }));
app.get("/sw.js", serveStatic({ root: webRoot, path: "sw.js" }));
app.get("/", serveStatic({ root: webRoot, path: "index.html" }));
// SPA Wildcard fallback
app.get("*", serveStatic({ root: webRoot, path: "index.html" }));

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`StateDock server listening at http://localhost:${info.port}`);
  console.log(`Database storage: ${storage.databaseUrl}`);
  console.log(`Backups directory: ${storage.backupsDir}`);
});
