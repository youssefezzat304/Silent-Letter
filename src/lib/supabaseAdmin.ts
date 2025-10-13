import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL in server env");
}
if (!process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_KEY in server env");
}

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

