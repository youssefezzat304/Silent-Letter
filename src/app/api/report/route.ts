import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "~/lib/supabaseClient";
import { reportSchema, MAX_FILE_SIZE } from "~/schema/report.schema";
import { serverError, validationError } from "~/lib/helpers";
import { auth } from "~/server/auth";
import type { Database } from "~/types/supabase";

type ReportsRow = Database["public"]["Tables"]["reports"]["Row"];
type ReportsInsert = Database["public"]["Tables"]["reports"]["Insert"];
type ReportAttachmentsRow =
  Database["public"]["Tables"]["report_attachments"]["Row"];
type ReportAttachmentsInsert =
  Database["public"]["Tables"]["report_attachments"]["Insert"];

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const formData = await request.formData();

    const reportData = {
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      language: formData.get("language") as string,
      problemType: formData.get("problemType") as string,
      priority: formData.get("priority") as string,
      contactEmail: formData.get("contactEmail") as string | null,
    };

    const files = formData.getAll("attachments") as File[];
    const validFiles = files.filter((f) => f && f.size > 0);

    const dataToValidate = {
      ...reportData,
      attachments: validFiles,
    };

    const validation = reportSchema.safeParse(dataToValidate);

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path]?.push(err.message);
      });

      return NextResponse.json(validationError(fieldErrors), { status: 400 });
    }

    const validatedData = validation.data;

    const uploadedAttachments: Array<ReportAttachmentsInsert> = [];

    for (const file of validFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          serverError(`File "${file.name}" exceeds the 5MB size limit.`),
          { status: 400 },
        );
      }

      const fileExt = file.name.split(".").pop();
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("report-attachments")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("File upload error:", uploadError);
        const errorMessage =
          uploadError instanceof Error
            ? uploadError.message
            : `Failed to upload file: ${file.name}`;
        return NextResponse.json(serverError(errorMessage), { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from("report-attachments")
        .getPublicUrl(filePath);

      uploadedAttachments.push({
        report_id: report.id,
        filename: att.filename,
        url: att.url,
        mime_type: att.mimeType,
        size: att.size,
        user_id: session?.user?.id ?? null,
      });
    }

    const finalContactEmail =
      session?.user?.email ?? reportData.contactEmail ?? null;

    // Create report in database using Supabase
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: session?.user?.id ?? null,
        subject: validatedData.subject,
        message: validatedData.message,
        contact_email: finalContactEmail,
        ip,
        user_agent: userAgent,
        problem_type: validatedData.problemType,
        priority: validatedData.priority,
        status: "OPEN",
      })
      .select()
      .single();

    if (reportError || !report) {
      console.error("Report creation error:", reportError);
      return NextResponse.json(
        serverError("Failed to create report in database"),
        { status: 500 },
      );
    }

    // Insert attachments if any
    if (uploadedAttachments.length > 0) {
      const { error: attachmentsError } = await supabase
        .from("report_attachments")
        .insert<ReportAttachmentsInsert>(uploadedAttachments);

      if (attachmentsError) {
        console.error("Attachments creation error:", attachmentsError);
        // Continue anyway - report is created
      }
    }

    // Send email notification
    try {
      const userInfo = session?.user?.email
        ? `${session.user.name ?? "User"} (${session.user.email})`
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
                  <span class="user-badge ${session?.user ? "badge-authenticated" : "badge-anonymous"}">
                    ${session?.user ? "✓ Authenticated User" : "👤 Anonymous Report"}
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
                  <span class="label">Language:</span> ${validatedData.language.toUpperCase()}
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
                  <span class="label">IP Address:</span> ${ip}
                </div>
                <div class="info-row">
                  <span class="label">Submitted at:</span> ${new Date().toLocaleString()}
                </div>
                
                <div class="message-box">
                  <div class="label">Message:</div>
                  <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${report.message}</p>
                </div>
                
                ${
                  uploadedAttachments.length > 0
                    ? `
                  <div class="attachments">
                    <div class="label">Attachments (${uploadedAttachments.length}):</div>
                    ${uploadedAttachments
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
                  ${!session?.user ? "<p><strong>Note:</strong> This is an anonymous report. User was not logged in.</p>" : ""}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      await resend.emails.send({
        from: "Reports <onboarding@resend.dev>",
        to: "youssefezzatw@gmail.com",
        subject: `[${report.priority}] ${report.problemType}: ${report.subject}`,
        html: emailContent,
      });

      // Mark email as sent
      const { error: updateError } = await supabase
        .from("reports")
        .update({ email_sent: true })
        .eq("id", report.id);

      if (updateError) {
        console.error("Failed to mark email as sent:", updateError);
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      const errorMessage =
        emailError instanceof Error
          ? emailError.message
          : "Unknown email error";
      console.error("Email error details:", errorMessage);
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Report submitted successfully",
        reportId: report.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Report submission error:", error);

    return NextResponse.json(
      serverError(
        error instanceof Error
          ? error.message
          : "Failed to submit report. Please try again.",
      ),
      { status: 500 },
    );
  }
}
