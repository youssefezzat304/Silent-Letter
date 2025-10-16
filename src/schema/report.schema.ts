import { z } from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_ATTACHMENTS = 3;

export const fileSchema = z
  .custom<File>()
  .refine((file) => file instanceof File, "Invalid file provided.")
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`);

export const reportSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  message: z.string().min(20, "Message must be at least 20 characters long."),
  language: z.enum(["nal", "en-us", "de-de"], {
    required_error: "Please select a language.",
  }),
  problemType: z.enum(
    ["SPELLING", "PRONUNCIATION", "BAD_WORD", "UI_UX", "SERVER", "OTHER"],
    {
      required_error: "Please select a problem type.",
    },
  ),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    required_error: "Please select a priority.",
  }),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  attachments: z
    .array(fileSchema)
    .max(
      MAX_ATTACHMENTS,
      `You can upload a maximum of ${MAX_ATTACHMENTS} files.`,
    )
    .optional(),
});

export type ReportValues = z.infer<typeof reportSchema>;
