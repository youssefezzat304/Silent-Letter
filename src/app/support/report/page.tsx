"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { toast } from "sonner";

// UI Components
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import CustomToast from "~/app/_components/ui/CustomToast";
import Loading from "~/app/loading";
import {
  MAX_ATTACHMENTS,
  MAX_FILE_SIZE,
  reportSchema,
  type ReportValues,
} from "~/schema/report.schema";
import { formatBytes } from "~/lib/helpers";
import { LANGUAGE_OPTIONS } from "~/metadata";
import { useGetUser } from "~/hooks/useGetUser";
import { useReportUpload } from "~/hooks/useReportUpload";
import { createReport } from "~/app/api/actions/report";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

function ReportRecommendation() {
  return (
    <Accordion
      type="single"
      collapsible
      className="flex w-full max-w-2xl justify-center px-5"
    >
      <AccordionItem className="cartoonish-card w-full" value="item-1">
        <AccordionTrigger className="w-full px-4 data-[state=closed]:w-full">
          How should I set the priority?
        </AccordionTrigger>
        <AccordionContent className="w-full px-4">
          <div className="space-y-3 text-sm">
            <p>Here&apos;s a general guide for setting the report priority:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-red-400">Critical:</strong> Use this for
                major issues that break website functionality (e.g., login not
                working, pages crashing) or for highly offensive/inappropriate
                content (like bad words or non-family-friendly material).
              </li>
              <li>
                <strong className="text-orange-300">High:</strong> For
                significant problems that don&apos;t crash the site but make
                it difficult to use, like a broken form, incorrect information,
                or major UI/UX flaws.
              </li>
              <li>
                <strong className="text-yellow-300">Medium:</strong> Good for
                noticeable but less severe issues. Examples include spelling
                mistakes, incorrect pronunciation, or minor visual glitches.
              </li>
              <li>
                <strong className="text-blue-300">Low:</strong> For minor
                suggestions, cosmetic tweaks, or personal preferences that don&apos;t
                affect functionality.
              </li>
            </ul>
            <p>
              When in doubt, use your best judgment. Thank you for helping fellow
              oxygen consumer!
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function ReportPage() {
  const { user, loading } = useGetUser();
  const { uploadReportAttachments, uploading: uploadingFiles } =
    useReportUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const form = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      language: "nal",
      subject: "",
      message: "",
      priority: "MEDIUM",
      problemType: "OTHER",
      contactEmail: "",
      attachments: [],
    },
  });

  const isProcessing = uploadingFiles || isSubmitting;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newFiles = [...attachedFiles, ...files];

    if (newFiles.length > MAX_ATTACHMENTS) {
      toast.custom(() => (
        <CustomToast
          text={`You can only upload up to ${MAX_ATTACHMENTS} files.`}
          type="error"
        />
      ));
      return;
    }

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.custom(() => (
          <CustomToast
            text={`File "${file.name}" exceeds the 5MB size limit.`}
            type="error"
          />
        ));
        return;
      }
    }

    setAttachedFiles(newFiles);
    form.setValue("attachments", newFiles, { shouldValidate: true });
  };

  const removeFile = (index: number) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
    form.setValue("attachments", newFiles, { shouldValidate: true });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: ReportValues) => {
    setIsSubmitting(true);

    try {
      const {
        result: uploadResult,
        error: uploadError,
        uploadedFiles,
      } = await uploadReportAttachments(data.attachments ?? []);

      if (!uploadResult || uploadError) {
        toast.custom(() => (
          <CustomToast
            text={uploadError ?? "Failed to upload attachments"}
            type="error"
          />
        ));
        setIsSubmitting(false);
        return;
      }

      const userAgent = navigator.userAgent;

      const { result, error } = await createReport({
        data: {
          subject: data.subject,
          message: data.message,
          language: data.language,
          problemType: data.problemType,
          priority: data.priority,
          contactEmail: data.contactEmail ?? undefined,
        },
        attachmentUrls: uploadedFiles,
        userAgent,
      });

      if (!result || error) {
        toast.custom(() => (
          <CustomToast text={error ?? "Failed to submit report"} type="error" />
        ));
        setIsSubmitting(false);
        return;
      }

      toast.custom(() => (
        <CustomToast
          text="Report submitted successfully! Thank you kind human being. 😊"
          type="success"
        />
      ));

      form.reset({
        language: "nal",
        subject: "",
        message: "",
        priority: "MEDIUM",
        problemType: "OTHER",
        contactEmail: "",
        attachments: [],
      });
      setAttachedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.custom(() => (
        <CustomToast
          text="An unexpected error occurred. Please try again."
          type="error"
        />
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-8">
      <ReportRecommendation />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full items-center justify-center"
        >
          <Card className="cartoonish-card mx-5 w-full max-w-2xl px-4 py-6 md:px-8">
            <h1 className="mb-6 text-center text-3xl font-bold">
              Submit a Report
            </h1>

            {/* Subject Field */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Incorrect spelling on homepage"
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Language Field */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isProcessing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nal">Not a Language</SelectItem>
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Problem Type Field */}
              <FormField
                control={form.control}
                name="problemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isProcessing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SPELLING">Spelling</SelectItem>
                        <SelectItem value="PRONUNCIATION">
                          Pronunciation
                        </SelectItem>
                        <SelectItem value="BAD_WORD">Bad word</SelectItem>
                        <SelectItem value="UI_UX">UI/UX</SelectItem>
                        <SelectItem value="SERVER">Server</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Field */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isProcessing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem className="text-blue-300" value="LOW">
                          Low
                        </SelectItem>
                        <SelectItem className="text-yellow-300" value="MEDIUM">
                          Medium
                        </SelectItem>
                        <SelectItem className="text-orange-300" value="HIGH">
                          High
                        </SelectItem>
                        <SelectItem className="text-red-400" value="CRITICAL">
                          Critical
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Message Field */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue in detail..."
                      className="min-h-[120px] resize-y"
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Email Field (optional) */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={user?.email ?? "your.email@example.com"}
                      {...field}
                      value={field.value ?? ""}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments Field */}
            <div>
              <Label>Attachments (Optional)</Label>
              <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600">
                {attachedFiles.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md bg-gray-100 p-2 dark:bg-gray-800"
                      >
                        <span className="truncate text-sm">
                          {file.name} ({formatBytes(file.size)})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isProcessing}
                        >
                          &#x2715;
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  disabled={
                    isProcessing || attachedFiles.length >= MAX_ATTACHMENTS
                  }
                />
                <Button
                  type="button"
                  className="cartoonish-btn w-full from-gray-500 to-gray-800"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    isProcessing || attachedFiles.length >= MAX_ATTACHMENTS
                  }
                >
                  {attachedFiles.length >= MAX_ATTACHMENTS
                    ? "Maximum files reached"
                    : "Add Attachments"}
                </Button>
                <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                  Max {MAX_ATTACHMENTS} files, up to
                  {MAX_FILE_SIZE / 1024 / 1024}
                  MB each.
                </p>
              </div>
              {form.formState.errors.attachments && (
                <p className="mt-2 text-sm font-medium text-red-500 dark:text-red-900">
                  {form.formState.errors.attachments.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="cartoonish-btn mt-4 w-full from-blue-500 to-blue-800"
              disabled={isProcessing}
            >
              {uploadingFiles
                ? "Uploading files..."
                : isSubmitting
                  ? "Submitting..."
                  : "Submit Report"}
            </Button>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default ReportPage;
