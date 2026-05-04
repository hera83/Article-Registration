-- Schema for the local self-hosted PostgreSQL database.
-- Mirrors the Supabase schema used in hosted mode.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE article_type AS ENUM ('normal', 'stock');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS articles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  article_type      article_type NOT NULL DEFAULT 'normal',
  area_id           uuid REFERENCES areas(id) ON DELETE SET NULL,
  brand             text,
  model             text,
  note              text,
  unit              text,
  quantity          numeric,
  typical_location  text,
  on_shopping_list  boolean NOT NULL DEFAULT false,
  shopping_note     text,
  archived          boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS article_tags (
  article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX IF NOT EXISTS articles_area_id_idx ON articles(area_id);
CREATE INDEX IF NOT EXISTS articles_archived_idx ON articles(archived);
CREATE INDEX IF NOT EXISTS articles_on_shopping_list_idx ON articles(on_shopping_list);
CREATE INDEX IF NOT EXISTS article_tags_tag_id_idx ON article_tags(tag_id);

CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_touch_updated_at ON articles;
CREATE TRIGGER articles_touch_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
