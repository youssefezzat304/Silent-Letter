-- CreateEnum
CREATE TYPE "public"."ProblemType" AS ENUM ('SPELLING', 'PRONUNCIATION', 'BAD_WORD', 'UI_UX', 'SERVER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "public"."ReportPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."Level" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateEnum
CREATE TYPE "public"."WordsLanguage" AS ENUM ('en', 'de');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "password" TEXT,
    "image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WordsPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "levels" "public"."Level"[] DEFAULT ARRAY['A1']::"public"."Level"[],
    "wordsLanguage" "public"."WordsLanguage" NOT NULL DEFAULT 'en',
    "delayTime" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "WordsPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."reports" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "contactEmail" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "problemType" "public"."ProblemType" NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "public"."ReportPriority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "handledAt" TIMESTAMP(3),
    "handledById" UUID,
    "adminNote" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report_attachments" (
    "id" UUID NOT NULL,
    "reportId" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID,

    CONSTRAINT "report_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WordsPreference_userId_key" ON "public"."WordsPreference"("userId");

-- CreateIndex
CREATE INDEX "WordsPreference_userId_idx" ON "public"."WordsPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "public"."accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "public"."reports"("userId");

-- CreateIndex
CREATE INDEX "reports_ip_idx" ON "public"."reports"("ip");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "public"."reports"("status");

-- CreateIndex
CREATE INDEX "reports_problemType_idx" ON "public"."reports"("problemType");

-- CreateIndex
CREATE INDEX "report_attachments_reportId_idx" ON "public"."report_attachments"("reportId");

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reports" ADD CONSTRAINT "reports_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_attachments" ADD CONSTRAINT "report_attachments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report_attachments" ADD CONSTRAINT "report_attachments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
