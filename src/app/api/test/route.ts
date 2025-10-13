// app/api/debug-whoami/route.ts  (server-only; remove after debugging)
import { NextResponse } from "next/server";
import { supabaseAdmin } from "~/lib/supabaseAdmin";

export async function GET() {
  try {
    // quick env checks (no secret printed)
    const hasServiceKey =
      !!process.env.SUPABASE_SERVICE_KEY ||
      !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasUrl =
      !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL;

    // try RPC whoami (if the function exists)
    const whoami = await (async () => {
      try {
        const { data, error } = await supabaseAdmin.rpc("whoami");
        if (error)
          return {
            ok: false,
            error: { code: error.code, message: error.message },
          };
        return { ok: true, data };
      } catch (err: any) {
        return { ok: false, error: { message: String(err?.message ?? err) } };
      }
    })();

    return NextResponse.json({
      ok: true,
      env: { hasServiceKey, hasUrl },
      whoami,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message ?? err) });
  }
}
