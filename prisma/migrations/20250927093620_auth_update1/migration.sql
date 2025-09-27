-- AlterTable
ALTER TABLE "public"."UserPreferences" ALTER COLUMN "levels" SET DEFAULT ARRAY['A1']::"public"."Level"[],
ALTER COLUMN "wordsLanguage" SET DEFAULT 'en',
ALTER COLUMN "delayTime" SET DEFAULT 2;
