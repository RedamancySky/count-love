import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET() {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getSupabaseEnv();
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const diagnostics: Record<string, unknown> = {
      connected: true,
      urlConfigured: Boolean(supabaseUrl),
      anonConfigured: Boolean(supabaseAnonKey),
      serviceRoleConfigured: Boolean(supabaseServiceRoleKey),
    };

    if (supabaseServiceRoleKey) {
      const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      diagnostics.authAdmin = error
        ? { ok: false, error: error.message }
        : { ok: true, usersCountSample: data.users.length };
    } else {
      diagnostics.authAdmin = {
        ok: false,
        error: "SUPABASE_SERVICE_ROLE_KEY is missing. Admin-level connectivity check skipped.",
      };
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown Supabase error",
      },
      { status: 500 },
    );
  }
}
