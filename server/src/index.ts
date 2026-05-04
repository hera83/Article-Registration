import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool, withTx } from "./db.js";
import { ARTICLE_SELECT } from "./queries.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

// ---------- helpers ----------

function bad(reply: any, code: number, msg: string) {
  return reply.code(code).send({ error: msg });
}

interface ArticleInputBody {
  id?: string;
  name: string;
  article_type: "normal" | "stock";
  area_id: string | null;
  brand: string | null;
  model: string | null;
  note: string | null;
  unit: string | null;
  quantity: number | null;
  typical_location: string | null;
  on_shopping_list: boolean;
  shopping_note: string | null;
  archived: boolean;
  tagNames: string[];
}

// ---------- AREAS ----------

app.get("/api/areas", async () => {
  const { rows } = await pool.query(`SELECT id, name FROM areas ORDER BY name`);
  return rows;
});

app.post<{ Body: { name: string } }>("/api/areas", async (req, reply) => {
  const name = (req.body?.name || "").trim();
  if (!name) return bad(reply, 400, "name is required");
  await pool.query(`INSERT INTO areas (name) VALUES ($1)`, [name]);
  return reply.code(201).send({ ok: true });
});

app.patch<{ Params: { id: string }; Body: { name: string } }>(
  "/api/areas/:id",
  async (req, reply) => {
    const name = (req.body?.name || "").trim();
    if (!name) return bad(reply, 400, "name is required");
    await pool.query(`UPDATE areas SET name = $1 WHERE id = $2`, [name, req.params.id]);
    return reply.code(204).send();
  },
);

app.delete<{ Params: { id: string } }>("/api/areas/:id", async (req, reply) => {
  const { rows } = await pool.query(
    `SELECT 1 FROM articles WHERE area_id = $1 LIMIT 1`,
    [req.params.id],
  );
  if (rows.length) return bad(reply, 409, "Area is in use by articles");
  await pool.query(`DELETE FROM areas WHERE id = $1`, [req.params.id]);
  return reply.code(204).send();
});

// ---------- TAGS ----------

app.get("/api/tags", async () => {
  const { rows } = await pool.query(`SELECT id, name FROM tags ORDER BY name`);
  return rows;
});

app.patch<{ Params: { id: string }; Body: { name: string } }>(
  "/api/tags/:id",
  async (req, reply) => {
    const name = (req.body?.name || "").trim();
    if (!name) return bad(reply, 400, "name is required");
    await pool.query(`UPDATE tags SET name = $1 WHERE id = $2`, [name, req.params.id]);
    return reply.code(204).send();
  },
);

app.delete<{ Params: { id: string } }>("/api/tags/:id", async (req, reply) => {
  await pool.query(`DELETE FROM tags WHERE id = $1`, [req.params.id]);
  return reply.code(204).send();
});

// ---------- ARTICLES ----------

app.get("/api/articles", async () => {
  const { rows } = await pool.query(`${ARTICLE_SELECT} ORDER BY a.name ASC`);
  return rows;
});

app.post<{ Body: ArticleInputBody }>("/api/articles", async (req, reply) => {
  const input = req.body;
  if (!input?.name) return bad(reply, 400, "name is required");

  const quantity =
    input.article_type === "stock" ? (input.quantity ?? 0) : null;

  const saved = await withTx(async (q) => {
    let id = input.id;
    if (id) {
      await q(
        `UPDATE articles SET
           name=$1, article_type=$2, area_id=$3, brand=$4, model=$5, note=$6,
           unit=$7, quantity=$8, typical_location=$9, on_shopping_list=$10,
           shopping_note=$11, archived=$12
         WHERE id=$13`,
        [
          input.name, input.article_type, input.area_id, input.brand, input.model,
          input.note, input.unit, quantity, input.typical_location,
          input.on_shopping_list, input.shopping_note, input.archived, id,
        ],
      );
    } else {
      const { rows } = await q(
        `INSERT INTO articles
           (name, article_type, area_id, brand, model, note, unit, quantity,
            typical_location, on_shopping_list, shopping_note, archived)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id`,
        [
          input.name, input.article_type, input.area_id, input.brand, input.model,
          input.note, input.unit, quantity, input.typical_location,
          input.on_shopping_list, input.shopping_note, input.archived,
        ],
      );
      id = rows[0].id;
    }

    // Resolve / create tags
    const cleaned = Array.from(
      new Set((input.tagNames || []).map((n) => n.trim()).filter(Boolean)),
    );
    let tagIds: string[] = [];
    if (cleaned.length) {
      // Upsert by name
      await q(
        `INSERT INTO tags (name)
         SELECT unnest($1::text[])
         ON CONFLICT (name) DO NOTHING`,
        [cleaned],
      );
      const { rows } = await q(
        `SELECT id, name FROM tags WHERE name = ANY($1::text[])`,
        [cleaned],
      );
      tagIds = rows.map((r: any) => r.id);
    }

    await q(`DELETE FROM article_tags WHERE article_id = $1`, [id]);
    if (tagIds.length) {
      await q(
        `INSERT INTO article_tags (article_id, tag_id)
         SELECT $1, unnest($2::uuid[])`,
        [id, tagIds],
      );
    }

    const { rows } = await q(`${ARTICLE_SELECT} WHERE a.id = $1`, [id]);
    return rows[0];
  });

  return saved;
});

app.patch<{
  Params: { id: string };
  Body: Partial<{
    quantity: number | null;
    on_shopping_list: boolean;
    shopping_note: string | null;
    archived: boolean;
  }>;
}>("/api/articles/:id", async (req, reply) => {
  const allowed = ["quantity", "on_shopping_list", "shopping_note", "archived"] as const;
  const sets: string[] = [];
  const vals: any[] = [];
  for (const key of allowed) {
    if (key in (req.body || {})) {
      sets.push(`${key} = $${vals.length + 1}`);
      vals.push((req.body as any)[key]);
    }
  }
  if (!sets.length) return reply.code(204).send();
  vals.push(req.params.id);
  await pool.query(
    `UPDATE articles SET ${sets.join(", ")} WHERE id = $${vals.length}`,
    vals,
  );
  return reply.code(204).send();
});

app.delete<{ Params: { id: string } }>("/api/articles/:id", async (req, reply) => {
  await pool.query(`DELETE FROM articles WHERE id = $1`, [req.params.id]);
  return reply.code(204).send();
});

// ---------- HEALTH ----------

app.get("/api/health", async () => ({ ok: true, mode: "local" }));

// ---------- STATIC FRONTEND (optional) ----------
//
// In production we bake the built React app into the same image so a single
// container serves both API and UI. If /app/public exists, mount it.

const publicDir = process.env.STATIC_DIR || join(__dirname, "..", "public");
if (existsSync(publicDir)) {
  await app.register(fastifyStatic, { root: publicDir, prefix: "/" });
  // SPA fallback: any non-/api route returns index.html
  app.setNotFoundHandler(async (req, reply) => {
    if (req.url.startsWith("/api")) {
      return reply.code(404).send({ error: "Not found" });
    }
    return reply.sendFile("index.html");
  });
}

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "0.0.0.0";
app.listen({ port, host }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
