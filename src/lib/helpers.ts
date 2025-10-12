import type { ActionResult } from "~/types/types";

export const validationError = (
  fields: Record<string, string[]>,
): ActionResult => ({
  ok: false,
  error: {
    name: "ValidationError",
    message: "Validation failed",
    code: 400,
    fields,
  },
});

export const serverError = (
  msg = "An unexpected server error occurred",
): ActionResult => ({
  ok: false,
  error: {
    name: "ServerError",
    message: msg,
    code: 500,
  },
});

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};