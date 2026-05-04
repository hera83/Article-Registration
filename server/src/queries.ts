// Article shape returned to the frontend matches src/lib/types.ts Article.

export const ARTICLE_COLUMNS = `
  a.id, a.name, a.article_type, a.area_id, a.brand, a.model, a.note,
  a.unit, a.quantity, a.typical_location, a.on_shopping_list,
  a.shopping_note, a.archived, a.created_at, a.updated_at
`;

export const ARTICLE_SELECT = `
  SELECT
    ${ARTICLE_COLUMNS},
    CASE WHEN ar.id IS NULL THEN NULL
         ELSE json_build_object('id', ar.id, 'name', ar.name)
    END AS area,
    COALESCE(
      (
        SELECT json_agg(json_build_object('id', t.id, 'name', t.name) ORDER BY t.name)
        FROM article_tags at
        JOIN tags t ON t.id = at.tag_id
        WHERE at.article_id = a.id
      ),
      '[]'::json
    ) AS tags
  FROM articles a
  LEFT JOIN areas ar ON ar.id = a.area_id
`;
