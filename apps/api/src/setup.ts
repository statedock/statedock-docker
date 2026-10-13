import { type Client } from "@libsql/client";
import { randomBytes, scryptSync } from "node:crypto";

export class SetupManager {
  private client: Client;
  private setupToken: string | null = null;
  private initialized: boolean = false;

  constructor(client: Client) {
    this.client = client;
  }

  async init(): Promise<void> {
    await this.client.execute(`
      CREATE TABLE IF NOT EXISTS instance_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    const result = await this.client.execute({
      sql: "SELECT value FROM instance_meta WHERE key = ?",
      args: ["initialized"],
    });

    if (result.rows.length > 0 && result.rows[0].value === "true") {
      this.initialized = true;
      this.setupToken = null;
    } else {
      this.initialized = false;
      this.setupToken = process.env.STATEDOCK_SETUP_TOKEN || `sd_setup_${randomBytes(16).toString("hex")}`;
      this.logSetupInstructions();
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getSetupToken(): string | null {
    return this.setupToken;
  }

  logSetupInstructions(): void {
    if (this.initialized || !this.setupToken) return;
    const port = process.env.PORT ?? "3000";
    console.log("\n" + "=".repeat(70));
    console.log(" [StateDock Setup Required] 首次启动安全初始化密钥：");
    console.log(` Setup Token: ${this.setupToken}`);
    console.log(` 初始化激活页面: http://localhost:${port}/setup?token=${this.setupToken}`);
    console.log(" 完成初始化后该入口将永久关闭，防止公网抢注管理员。");
    console.log("=".repeat(70) + "\n");
  }

  async completeSetup(token: string, email: string, password?: string): Promise<{ success: boolean; message?: string }> {
    if (this.initialized) {
      return { success: false, message: "Instance is already initialized" };
    }
    if (!this.setupToken || token !== this.setupToken) {
      return { success: false, message: "Invalid setup token" };
    }

    const now = new Date().toISOString();
    let passwordHash = "";
    if (password) {
      const salt = randomBytes(16).toString("hex");
      const hash = scryptSync(password, salt, 64).toString("hex");
      passwordHash = `${salt}:${hash}`;
    }

    await this.client.execute({
      sql: "INSERT OR REPLACE INTO instance_meta (key, value, created_at) VALUES (?, ?, ?)",
      args: ["admin_email", email, now],
    });

    if (passwordHash) {
      await this.client.execute({
        sql: "INSERT OR REPLACE INTO instance_meta (key, value, created_at) VALUES (?, ?, ?)",
        args: ["admin_password_hash", passwordHash, now],
      });
    }

    await this.client.execute({
      sql: "INSERT OR REPLACE INTO instance_meta (key, value, created_at) VALUES (?, ?, ?)",
      args: ["initialized", "true", now],
    });

    this.initialized = true;
    this.setupToken = null;
    return { success: true };
  }
}
