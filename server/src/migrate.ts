// One-shot migration runner: applies every .sql file under server/sql/
// in lexical order. Idempotent thanks to IF NOT EXISTS guards.

import { readdir, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_DIR = join(__dirname, "..", "sql");

async function main() {
  const files = (await readdir(SQL_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = await readFile(join(SQL_DIR, f), "utf8");
    process.stdout.write(`-- applying ${f} ... `);
    await pool.query(sql);
    console.log("ok");
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
