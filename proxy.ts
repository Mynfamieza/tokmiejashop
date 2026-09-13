import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Next.js 16 Proxy (formerly middleware).
 *
 * Optimistic protection for the owner dashboard:
 *   - refreshes the Supabase session cookie,
 *   - redirects unauthenticated visitors away from /dashboard to /login.
 *
 * This is a first line of defense only. Every dashboard page and server
 * action also verifies the session + owner allowlist server-side.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (!isSupabaseConfigured) {
    return isDashboard ? redirectToLogin(request) : response;
  }

  try {
    const { url, anonKey } = getSupabaseEnv();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isDashboard) {
      return redirectToLogin(request);
    }
  } catch {
    if (isDashboard) {
      return redirectToLogin(request);
    }
  }

  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
