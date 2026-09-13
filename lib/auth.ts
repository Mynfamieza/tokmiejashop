import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type OwnerContext = {
  configured: boolean;
  user: User | null;
  isOwner: boolean;
};

/**
 * Server-side owner context.
 * Authenticated is NOT enough: the user must also be on the `owners`
 * allowlist (checked through the `is_owner()` database function).
 */
export async function getOwnerContext(): Promise<OwnerContext> {
  if (!isSupabaseConfigured) {
    return { configured: false, user: null, isOwner: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { configured: true, user: null, isOwner: false };
  }

  const { data, error } = await supabase.rpc("is_owner");

  return {
    configured: true,
    user,
    isOwner: !error && data === true,
  };
}
