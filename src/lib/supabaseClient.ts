import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL in server env");
}
if (!process.env.SUPABASE_CLIENT_KEY) {
  throw new Error("Missing SUPABASE_CLIENT_KEY in server env");
}

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_CLIENT_KEY;

export const supabaseClient = createClient(url, anonKey, {
  auth: { persistSession: true },
});
