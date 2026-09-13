"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, isSupabaseConfigured } from "./config";

/**
 * Browser-side Supabase client (anon key only).
 * Used for owner sign-in from the login page. Never pass a service-role key.
 */
export function createClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

export { isSupabaseConfigured };
