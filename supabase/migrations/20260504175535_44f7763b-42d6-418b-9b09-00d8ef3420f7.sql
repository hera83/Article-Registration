-- Enum for article type
CREATE TYPE public.article_type AS ENUM ('normal', 'stock');

-- Areas
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Articles
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  article_type public.article_type NOT NULL DEFAULT 'normal',
  area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
  brand TEXT,
  model TEXT,
  note TEXT,
  unit TEXT,
  quantity NUMERIC,
  typical_location TEXT,
  on_shopping_list BOOLEAN NOT NULL DEFAULT false,
  shopping_note TEXT,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX articles_name_idx ON public.articles (lower(name));
CREATE INDEX articles_area_idx ON public.articles (area_id);
CREATE INDEX articles_type_idx ON public.articles (article_type);
CREATE INDEX articles_shopping_idx ON public.articles (on_shopping_list);

-- Article <-> tag join
CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER articles_touch_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS: enable, then permissive policies (single shared workspace, no auth)
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read areas" ON public.areas FOR SELECT USING (true);
CREATE POLICY "Public write areas" ON public.areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update areas" ON public.areas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete areas" ON public.areas FOR DELETE USING (true);

CREATE POLICY "Public read tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public write tags" ON public.tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update tags" ON public.tags FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete tags" ON public.tags FOR DELETE USING (true);

CREATE POLICY "Public read articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Public write articles" ON public.articles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update articles" ON public.articles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete articles" ON public.articles FOR DELETE USING (true);

CREATE POLICY "Public read article_tags" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "Public write article_tags" ON public.article_tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete article_tags" ON public.article_tags FOR DELETE USING (true);

-- Seed areas
INSERT INTO public.areas (name) VALUES
  ('IT'), ('Garage'), ('Workshop'), ('Auto'), ('Electrical'),
  ('Plumbing'), ('Homelab'), ('Tools'), ('Other');

-- Seed tags
INSERT INTO public.tags (name) VALUES
  ('network'), ('cable'), ('server'), ('homelab'), ('rack'),
  ('oil'), ('filter'), ('spare-part'), ('consumable'), ('tool'),
  ('car'), ('230v'), ('plumbing'), ('electrical'), ('connector');

-- Seed articles
WITH a AS (SELECT id, name FROM public.areas),
     t AS (SELECT id, name FROM public.tags),
     ins AS (
       INSERT INTO public.articles
         (name, article_type, area_id, brand, model, note, unit, quantity, typical_location, on_shopping_list, shopping_note)
       VALUES
         ('RJ45 CAT6 connectors', 'stock', (SELECT id FROM a WHERE name='IT'), 'Generic', 'CAT6 8P8C', 'For terminating CAT6 cables.', 'pcs', 0, 'Network drawer', true, 'Buy a bag of 100'),
         ('CAT6 cable roll', 'stock', (SELECT id FROM a WHERE name='IT'), 'Digitus', '305m box', 'Solid copper, blue.', 'm', 230, 'Homelab shelf', false, NULL),
         ('Motor oil 5W-30', 'stock', (SELECT id FROM a WHERE name='Auto'), 'Castrol', 'Edge 5W-30', 'Full synthetic.', 'L', 1, 'Garage shelf', true, 'Need 5L for next service'),
         ('Oil filter for Renault Kajar', 'stock', (SELECT id FROM a WHERE name='Auto'), 'Mann', 'W 75/3', 'OEM equivalent.', 'pcs', 2, 'Garage parts box', false, NULL),
         ('Renault Kajar alloy wheels', 'normal', (SELECT id FROM a WHERE name='Garage'), 'Renault', '17" OEM', 'Set of 4, summer tires.', NULL, NULL, 'Garage corner', false, NULL),
         ('HP enterprise server', 'normal', (SELECT id FROM a WHERE name='Homelab'), 'HP', 'ProLiant DL380 Gen10', 'Main homelab compute node.', NULL, NULL, 'Rack U10-U12', false, NULL),
         ('Ubiquiti switch', 'normal', (SELECT id FROM a WHERE name='Homelab'), 'Ubiquiti', 'USW-Pro-24-PoE', '24-port PoE switch.', NULL, NULL, 'Rack U2', false, NULL),
         ('Multimeter', 'normal', (SELECT id FROM a WHERE name='Tools'), 'Fluke', '117', 'True RMS.', NULL, NULL, 'Toolbox top tray', false, NULL),
         ('Electrical tape', 'stock', (SELECT id FROM a WHERE name='Electrical'), '3M', 'Super 33+', 'Black, 19mm.', 'rolls', 4, 'Electrical drawer', false, NULL),
         ('VVS fitting 15mm', 'stock', (SELECT id FROM a WHERE name='Plumbing'), 'Generic', 'Compression 15mm', 'Brass compression coupling.', 'pcs', 0, 'Plumbing box', true, 'Need at least 5'),
         ('Cable clips', 'stock', (SELECT id FROM a WHERE name='Electrical'), 'Generic', '7mm white', 'For round cable.', 'pcs', 80, 'Electrical drawer', false, NULL),
         ('Network tester', 'normal', (SELECT id FROM a WHERE name='IT'), 'Klein Tools', 'VDV501-852', 'Cable verifier with remotes.', NULL, NULL, 'IT toolbox', false, NULL)
       RETURNING id, name
     )
INSERT INTO public.article_tags (article_id, tag_id)
SELECT ins.id, t.id FROM ins JOIN t ON t.name = ANY (
  CASE ins.name
    WHEN 'RJ45 CAT6 connectors' THEN ARRAY['network','connector','consumable']
    WHEN 'CAT6 cable roll' THEN ARRAY['network','cable','consumable']
    WHEN 'Motor oil 5W-30' THEN ARRAY['oil','car','consumable']
    WHEN 'Oil filter for Renault Kajar' THEN ARRAY['filter','car','spare-part']
    WHEN 'Renault Kajar alloy wheels' THEN ARRAY['car','spare-part']
    WHEN 'HP enterprise server' THEN ARRAY['server','homelab','rack']
    WHEN 'Ubiquiti switch' THEN ARRAY['network','homelab','rack']
    WHEN 'Multimeter' THEN ARRAY['tool','electrical']
    WHEN 'Electrical tape' THEN ARRAY['electrical','consumable','230v']
    WHEN 'VVS fitting 15mm' THEN ARRAY['plumbing','spare-part']
    WHEN 'Cable clips' THEN ARRAY['electrical','cable','consumable']
    WHEN 'Network tester' THEN ARRAY['network','tool']
  END
);