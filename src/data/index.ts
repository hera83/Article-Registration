// Selects the active data adapter based on VITE_DATA_MODE.
//
//   - "supabase" (default): hosted/Lovable mode. Talks to Supabase directly.
//   - "rest":               local self-hosted mode. Talks to the bundled
//                           TypeScript backend in server/ via VITE_API_URL.
//
// Hosted/Lovable workflow is unchanged unless VITE_DATA_MODE is explicitly
// set to "rest".

import type { DataAdapter } from "./types";
import { supabaseAdapter } from "./supabase-adapter";
import { restAdapter } from "./rest-adapter";

const MODE = (import.meta.env.VITE_DATA_MODE || "supabase").toLowerCase();

export const data: DataAdapter = MODE === "rest" ? restAdapter : supabaseAdapter;

export type { DataAdapter } from "./types";
