import { StateDockService } from "@statedock/core";
import { createDatabase, migrate } from "@statedock/db";
import { createRepository } from "@statedock/db/service";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createApp } from "./app.js";
import { SetupManager } from "./setup.js";
import { backupDatabase } from "./storage.js";

test("Docker Features: Setup Token security lifecycle", async () => {
  const dir = mkdtempSync(join(tmpdir(), "statedock-setup-test-"));
  const dbUrl = `file:${dir}/test.sqlite`;
  const { client } = createDatabase(dbUrl);

  try {
    const setup = new SetupManager(client);
    await setup.init();

    assert.equal(setup.isInitialized(), false, "Should not be initialized initially");
    const token = setup.getSetupToken();
    assert.ok(token && token.startsWith("sd_setup_"), "Setup token must exist and have sd_setup_ prefix");

    // Invalid token rejected
    const badAttempt = await setup.completeSetup("wrong_token", "admin@example.com", "password123");
    assert.equal(badAttempt.success, false);
    assert.equal(setup.isInitialized(), false);

    // Valid token succeeds
    const goodAttempt = await setup.completeSetup(token, "admin@example.com", "password123");
    assert.equal(goodAttempt.success, true);
    assert.equal(setup.isInitialized(), true);
    assert.equal(setup.getSetupToken(), null, "Token must be wiped after completion");

    // Second setup attempt rejected
    const secondAttempt = await setup.completeSetup(token, "hacker@example.com", "hack");
    assert.equal(secondAttempt.success, false);
  } finally {
    client.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("Docker Features: SQLite online atomic backup", async () => {
  const dir = mkdtempSync(join(tmpdir(), "statedock-backup-test-"));
  const dbUrl = `file:${dir}/test.sqlite`;
  const backupsDir = join(dir, "backups");
  const { client, db } = createDatabase(dbUrl);

  try {
    await migrate(client);
    const service = new StateDockService(createRepository(db));
    await service.createProject({ slug: "test", name: "Test Project" }, { id: "human", type: "human" });

    // Execute online backup
    const backupResult = await backupDatabase(client, backupsDir);
    assert.ok(existsSync(backupResult.path), "Backup file must be written to disk");
    assert.ok(backupResult.size > 0, "Backup file must not be empty");
    assert.ok(backupResult.filename.startsWith("statedock-backup-"), "Filename format matched");
  } finally {
    client.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("Docker Features: HTTP streamable /mcp endpoint responds to Coding Agents", async () => {
  const dir = mkdtempSync(join(tmpdir(), "statedock-mcp-http-test-"));
  const dbUrl = `file:${dir}/test.sqlite`;
  const { client, db } = createDatabase(dbUrl);

  try {
    await migrate(client);
    const service = new StateDockService(createRepository(db));
    await service.createProject({ slug: "mcp-demo", name: "MCP Demo" }, { id: "human", type: "human" });

    const app = createApp(service);

    // Call MCP Initialize via HTTP POST
    const initRequest = new Request("http://localhost:3000/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: { name: "test-agent", version: "1.0.0" },
        },
      }),
    });

    const initResponse = await app.fetch(initRequest);
    assert.equal(initResponse.status, 200, "MCP initialize must return 200");
    const initBody = (await initResponse.json()) as any;
    assert.equal(initBody.jsonrpc, "2.0");
    assert.equal(initBody.id, 1);
    assert.ok(initBody.result?.serverInfo?.name.includes("statedock"));

    // Call list_projects via HTTP POST
    const listProjectsRequest = new Request("http://localhost:3000/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "list_projects",
          arguments: {},
        },
      }),
    });

    const listResponse = await app.fetch(listProjectsRequest);
    assert.equal(listResponse.status, 200, "Tool call must return 200");
    const listBody = (await listResponse.json()) as any;
    assert.equal(listBody.jsonrpc, "2.0");
    assert.equal(listBody.id, 2);
    assert.equal(listBody.result?.isError, undefined);
    assert.ok(listBody.result?.content?.[0]?.text?.includes("mcp-demo"));
  } finally {
    client.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
