import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(webDirectory, "../..");
const publicDirectory = resolve(webDirectory, "public");
await mkdir(publicDirectory, { recursive: true });
for (const name of ["doc.md", "doc.zh.md"]) {
  await copyFile(resolve(repositoryRoot, "docs", name), resolve(publicDirectory, name));
}
