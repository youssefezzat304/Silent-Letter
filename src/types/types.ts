import type { Tables } from "./supabase";

export interface WordEntryInterface {
  id: string;
  lang: string;
  level: string;
  index: number;
  word: string;
  slug: string;
  file: string;
}

export type WordLanguagesCodes = "en-us" | "de-de";

export type ActionError = {
  name: string;
  message: string;
  code?: 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500;
  fields?: Record<string, string[]>;
};

export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: ActionError };

export type SupabaseUser = Tables<"users">;
