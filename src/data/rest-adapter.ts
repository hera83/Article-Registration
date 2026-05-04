// Local self-hosted mode adapter. Talks to the TypeScript backend in
// `server/` via plain REST. The base URL is configured with VITE_API_URL.

import type { Article, ArticleInput } from "@/lib/types";
import type { DataAdapter } from "./types";

const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error || JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new Error(`${res.status} ${res.statusText}: ${detail}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const restAdapter: DataAdapter = {
  mode: "rest",
  articles: {
    list: () => request<Article[]>("/articles"),
    save: (input: ArticleInput) =>
      request<Article>("/articles", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    updateFields: (id, patch) =>
      request<void>(`/articles/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    remove: (id) => request<void>(`/articles/${id}`, { method: "DELETE" }),
  },
  areas: {
    list: () => request("/areas"),
    create: (name) =>
      request<void>("/areas", { method: "POST", body: JSON.stringify({ name }) }),
    rename: (id, name) =>
      request<void>(`/areas/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    remove: (id) => request<void>(`/areas/${id}`, { method: "DELETE" }),
  },
  tags: {
    list: () => request("/tags"),
    rename: (id, name) =>
      request<void>(`/tags/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    remove: (id) => request<void>(`/tags/${id}`, { method: "DELETE" }),
  },
};
