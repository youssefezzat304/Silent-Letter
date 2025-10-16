"use server";

import { createClient } from "~/lib/supabase/server";
import { db } from "~/server/db";
import { Resend } from "resend";
import type { ReportValues } from "~/schema/report.schema";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CreateReportParams {
  data: Omit<ReportValues, "attachments">;
  attachmentUrls: Array<{
    filename: string;
    url: string;
    mimeType: string;
    size: number;
  }>;
  ip?: string;
  userAgent?: string;
}

export async function createReport({
  data,
  attachmentUrls,
  ip = "unknown",
  userAgent = "unknown",
}: CreateReportParams): Promise<{
  result: boolean;
  error: string | null;
  reportId?: string;
}> {
  const supabase = await createClient();

  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id ?? null;
    const userEmail = userData?.user?.email ?? null;

    const finalContactEmail = userEmail ?? data.contactEmail ?? null;

    if (!process.env.REPORTS_TO_EMAIL) {
      return { result: false, error: "Reports to email not set" };
    }

    const report = await db.report.create({
      data: {
        userId,
        subject: data.subject,
        message: data.message,
        contactEmail: finalContactEmail,
        ip,
        userAgent,
        problemType: data.problemType,
        priority: data.priority,
        status: "OPEN",
        emailSent: false,
      },
    });

    if (attachmentUrls.length > 0) {
      await db.reportAttachment.createMany({
        data: attachmentUrls.map((att) => ({
          reportId: report.id,
          filename: att.filename,
          url: att.url,
          mimeType: att.mimeType,
          size: att.size,
          userId,
        })),
      });
    }

    try {
      await sendReportEmail(
        report,
        attachmentUrls,
        userId,
        userEmail,
        userAgent,
      );

      await db.report.update({
        where: { id: report.id },
        data: { emailSent: true },
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    return { result: true, error: null, reportId: report.id };
  } catch (err: unknown) {
    console.error("Failed to create report:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { result: false, error: `Failed to create report: ${message}` };
  }
}

async function sendReportEmail(
  report: {
    id: string;
    subject: string;
    message: string;
    contactEmail: string | null;
    problemType: string;
    priority: string;
  },
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
  }>,
  userId: string | null,
  userEmail: string | null,
  userAgent: string,
) {
  const userInfo = userEmail
    ? `Authenticated User (${userEmail})`
    : report.contactEmail
      ? `Anonymous (${report.contactEmail})`
      : "Anonymous (No contact email)";

  const emailContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .priority-low { color: #3b82f6; }
          .priority-medium { color: #f59e0b; }
          .priority-high { color: #fb923c; }
          .priority-critical { color: #ef4444; font-weight: bold; }
          .message-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
          .attachments { background: white; padding: 15px; margin: 15px 0; }
          .attachment-item { padding: 8px; margin: 5px 0; background: #f3f4f6; border-radius: 4px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .user-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .badge-authenticated { background: #10b981; color: white; }
          .badge-anonymous { background: #6b7280; color: white; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🚨 New Report Submitted</h2>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">Report ID:</span> ${report.id}
            </div>
            <div class="info-row">
              <span class="label">Status:</span> 
              <span class="user-badge ${userId ? "badge-authenticated" : "badge-anonymous"}">
                ${userId ? "✓ Authenticated User" : "👤 Anonymous Report"}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Subject:</span> ${report.subject}
            </div>
            <div class="info-row">
              <span class="label">Problem Type:</span> ${report.problemType}
            </div>
            <div class="info-row">
              <span class="label">Priority:</span> 
              <span class="priority-${report.priority.toLowerCase()}">${report.priority}</span>
            </div>
            <div class="info-row">
              <span class="label">Submitted by:</span> ${userInfo}
            </div>
            ${
              report.contactEmail
                ? `
              <div class="info-row">
                <span class="label">Contact Email:</span> ${report.contactEmail}
              </div>
            `
                : ""
            }
            <div class="info-row">
              <span class="label">Submitted at:</span> ${new Date().toLocaleString()}
            </div>
            
            <div class="message-box">
              <div class="label">Message:</div>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${report.message}</p>
            </div>
            
            ${
              attachments.length > 0
                ? `
              <div class="attachments">
                <div class="label">Attachments (${attachments.length}):</div>
                ${attachments
                  .map(
                    (att) => `
                  <div class="attachment-item">
                    📎 <a href="${att.url}" style="color: #667eea; text-decoration: none;">${att.filename}</a>
                    <span style="color: #999; font-size: 12px;">(${(att.size / 1024).toFixed(2)} KB)</span>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            
            <div class="footer">
              <p>This is an automated notification from your report system.</p>
              <p>User Agent: ${userAgent}</p>
              ${!userId ? "<p><strong>Note:</strong> This is an anonymous report. User was not logged in.</p>" : ""}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!process.env.REPORTS_TO_EMAIL) {
    return { result: false, error: "Reports to email not set" };
  }

  await resend.emails.send({
    from: "Reports <onboarding@resend.dev>",
    to: process.env.REPORTS_TO_EMAIL,
    subject: `[${report.priority}] ${report.problemType}: ${report.subject}`,
    html: emailContent,
  });
}
