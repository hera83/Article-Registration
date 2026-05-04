import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

export const pool = new Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX || 10),
});

export async function withTx<T>(fn: (q: Pool["query"]) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Bind the client.query so callers can use it identically to pool.query.
    const q = client.query.bind(client) as unknown as Pool["query"];
    const result = await fn(q);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
