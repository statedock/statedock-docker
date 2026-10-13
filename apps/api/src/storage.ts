import { type Client } from "@libsql/client";
import { mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export interface StorageConfig {
  dataDir: string;
  databaseUrl: string;
  backupsDir: string;
}

export function initStorageConfig(): StorageConfig {
  const dataDir = process.env.DATA_DIR
    ? resolve(process.env.DATA_DIR)
    : resolve(process.cwd(), "data");

  const backupsDir = join(dataDir, "backups");
  mkdirSync(backupsDir, { recursive: true });

  const databaseUrl = process.env.DATABASE_URL ?? `file:${join(dataDir, "statedock.db")}`;

  return {
    dataDir,
    databaseUrl,
    backupsDir,
  };
}

export async function backupDatabase(
  client: Client,
  backupsDir: string,
): Promise<{ path: string; filename: string; size: number }> {
  mkdirSync(backupsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `statedock-backup-${timestamp}.db`;
  const targetPath = join(backupsDir, filename);

  // SQLite 3.27+ online atomic backup
  await client.execute(`VACUUM INTO '${targetPath.replace(/'/g, "''")}'`);

  const stats = statSync(targetPath);
  return {
    path: targetPath,
    filename,
    size: stats.size,
  };
}
