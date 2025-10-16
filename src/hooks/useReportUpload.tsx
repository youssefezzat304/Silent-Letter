import { useState } from "react";
import { createClient } from "~/lib/supabase/client";

interface UploadedFile {
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

interface UploadResult {
  result: boolean;
  error: string | null;
  uploadedFiles: UploadedFile[];
}

export function useReportUpload() {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const uploadReportAttachments = async (
    files: File[],
  ): Promise<UploadResult> => {
    if (files.length === 0) {
      return { result: true, error: null, uploadedFiles: [] };
    }

    setUploading(true);
    const uploadedFiles: UploadedFile[] = [];

    try {
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          return {
            result: false,
            error: `File "${file.name}" exceeds the 2MB size limit`,
            uploadedFiles: [],
          };
        }
        const fileExt = file.name.split(".").pop();
        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}.${fileExt}`;
        const filePath = `${timestamp}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("report-attachments")
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("File upload error:", uploadError);

          if (uploadedFiles.length > 0) {
            const pathsToDelete = uploadedFiles.map((f) => {
              const url = new URL(f.url);
              const path = url.pathname.split("/report-attachments/")[1];
              return path;
            });

            await supabase.storage
              .from("report-attachments")
              .remove(pathsToDelete);
          }

          return {
            result: false,
            error: `Failed to upload file: ${file.name}`,
            uploadedFiles: [],
          };
        }

        const { data: urlData } = supabase.storage
          .from("report-attachments")
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          return {
            result: false,
            error: "Failed to get public URL for uploaded file",
            uploadedFiles: [],
          };
        }

        uploadedFiles.push({
          filename: file.name,
          url: urlData.publicUrl,
          mimeType: file.type,
          size: file.size,
        });
      }

      return { result: true, error: null, uploadedFiles };
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(
          "Unexpected error in uploadReportAttachments:",
          err.message,
        );
        return { result: false, error: err.message, uploadedFiles: [] };
      } else {
        console.error("Unexpected non-error thrown:", String(err));
        return {
          result: false,
          error: "Unknown error occurred",
          uploadedFiles: [],
        };
      }
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadReportAttachments,
    uploading,
  };
}
