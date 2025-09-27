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
