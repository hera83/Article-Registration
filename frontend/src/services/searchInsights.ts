import type { Article, ArticleInput } from '../types/articles';

export interface SearchInsight {
  score: number;
  reasons: string[];
  duplicateSignal: 'exact' | 'strong' | 'possible' | null;
}

export interface SimilarArticleCandidate {
  article: Article;
  score: number;
  reasons: string[];
  duplicateSignal: 'exact' | 'strong' | 'possible' | null;
}

const searchSeparatorPattern = /[\s,./\\|_:-]+/g;

function normalize(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function compact(value: string | null | undefined): string {
  return normalize(value).replace(searchSeparatorPattern, '');
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

export function tokenizeSearch(text: string): string[] {
  const normalized = normalize(text);
  if (!normalized) {
    return [];
  }

  const tokens = normalized
    .split(searchSeparatorPattern)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  return tokens.length > 0 ? unique(tokens) : [normalized];
}

export function getSearchInsight(article: Article, query: string): SearchInsight {
  const normalizedQuery = normalize(query);
  const tokens = tokenizeSearch(query);
  if (!normalizedQuery || tokens.length === 0) {
    return { score: 0, reasons: [], duplicateSignal: null };
  }

  const name = normalize(article.name);
  const compactName = compact(article.name);
  const brand = normalize(article.brand);
  const model = normalize(article.model);
  const note = normalize(article.note);
  const area = normalize(article.area);
  const tags = article.tags.map((tag) => normalize(tag));
  const brandModel = `${brand} ${model}`.trim();
  const compactBrandModel = compact(`${article.brand ?? ''}${article.model ?? ''}`);
  const compactQuery = compact(query);

  let score = 0;
  const reasons = new Set<string>();

  if (name === normalizedQuery || compactName === compactQuery) {
    score += 18;
    reasons.add('Exact name match');
  }

  if (brandModel && (brandModel === normalizedQuery || compactBrandModel === compactQuery)) {
    score += 16;
    reasons.add('Exact brand + model match');
  }

  for (const token of tokens) {
    const compactToken = compact(token);
    let matched = false;

    if (name.includes(token) || compactName.includes(compactToken)) {
      score += 7;
      matched = true;
      reasons.add('Name');
    }

    if (brand.includes(token)) {
      score += 4;
      matched = true;
      reasons.add('Brand');
    }

    if (model.includes(token) || compactBrandModel.includes(compactToken)) {
      score += 5;
      matched = true;
      reasons.add('Model');
    }

    if (tags.some((tag) => tag.includes(token))) {
      score += 5;
      matched = true;
      reasons.add('Tag');
    }

    if (note.includes(token)) {
      score += 2;
      matched = true;
      reasons.add('Note');
    }

    if (area.includes(token)) {
      score += 2;
      matched = true;
      reasons.add('Area');
    }

    if (!matched) {
      score -= 6;
    }
  }

  const duplicateSignal =
    reasons.has('Exact name match') || reasons.has('Exact brand + model match')
      ? 'exact'
      : score >= 16
        ? 'strong'
        : score >= 8
          ? 'possible'
          : null;

  return {
    score,
    reasons: [...reasons],
    duplicateSignal,
  };
}

export function getSimilarArticleCandidates(
  input: Pick<ArticleInput, 'name' | 'brand' | 'model' | 'tags' | 'note'>,
  articles: Article[],
  editingArticleId?: string,
): SimilarArticleCandidate[] {
  const searchBasis = [input.name, input.brand, input.model, ...input.tags].filter(Boolean).join(' ');
  const tokens = tokenizeSearch(searchBasis);
  if (tokens.length === 0) {
    return [];
  }

  return articles
    .filter((article) => article.id !== editingArticleId)
    .map((article) => {
      const insight = getSearchInsight(article, searchBasis);
      const sharedTags = article.tags.filter((tag) => input.tags.some((currentTag) => normalize(currentTag) === normalize(tag)));

      const score = insight.score + sharedTags.length * 3;
      const reasons = sharedTags.length > 0 ? [...insight.reasons, `Shared tags: ${sharedTags.join(', ')}`] : insight.reasons;

      return {
        article,
        score,
        reasons,
        duplicateSignal: insight.duplicateSignal,
      };
    })
    .filter((candidate) => candidate.score >= 8)
    .sort((left, right) => right.score - left.score || left.article.name.localeCompare(right.article.name))
    .slice(0, 4);
}