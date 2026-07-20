import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// ── Route definitions ──

/** Routes that require authentication */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/client-portal",
  "/settings",
  "/billing",
  "/appointments",
  "/onboarding",
];

/** Auth routes — authenticated users should be redirected away */
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

/** Routes only agency roles (OWNER, ADMIN, MANAGER, AGENT) may access */
const AGENCY_PREFIXES = ["/dashboard"];

/** Routes only CLIENT role may access */
const CLIENT_PREFIXES = ["/client"];

// ── Helpers ──

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

// ── Main ──

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Always refresh the session (this is the existing behavior)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── 1. Protect private routes ──
  if (!user && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Redirect authenticated users away from auth pages ──
  if (user && AUTH_ROUTES.some((route) => pathname === route)) {
    const redirectTo = await getRedirectForUser(supabase, user.id);
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // ── 3. Cross-role guards ──
  if (user) {
    // Agency user trying to access client routes
    if (matchesPrefix(pathname, CLIENT_PREFIXES)) {
      const isClient = await checkIsClient(supabase, user.id);
      if (!isClient) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Client user trying to access agency routes
    if (matchesPrefix(pathname, AGENCY_PREFIXES)) {
      const agencyData = await getAgencyData(supabase, user.id);
      if (!agencyData) {
        return NextResponse.redirect(
          new URL("/client/dashboard", request.url)
        );
      }
      
      // If they are an agency member but haven't completed onboarding
      if (!agencyData.is_onboarding_completed && pathname !== "/dashboard/settings") {
          // They cannot access the main dashboard.
          return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
    
    // Guard the /onboarding route
    if (pathname.startsWith("/onboarding")) {
       const agencyData = await getAgencyData(supabase, user.id);
       if (agencyData?.is_onboarding_completed) {
         return NextResponse.redirect(new URL("/dashboard", request.url));
       }
       // If no agency data at all, they will stay on /onboarding to create it
    }
  }

  return response;
}

// ── Role detection helpers (lightweight queries for middleware) ──

async function getAgencyData(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<{ id: string; is_onboarding_completed: boolean } | null> {
  const { data } = await supabase
    .from("agency_users")
    .select("agency_id, agencies(id, is_onboarding_completed)")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!data || !data.agencies) return null;
  
  const agency = data.agencies as unknown as { id: string; is_onboarding_completed: boolean };
  return { id: data.agency_id, is_onboarding_completed: agency.is_onboarding_completed };
}

async function checkIsClient(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("client_users")
    .select("id")
    .eq("auth_user_id", userId)
    .maybeSingle();

  return data !== null;
}

async function getRedirectForUser(
  supabase: ReturnType<typeof createServerClient>,
  userId: string
): Promise<string> {
  // Check agency_users first
  const agencyData = await getAgencyData(supabase, userId);
  if (agencyData) {
    return agencyData.is_onboarding_completed ? "/dashboard" : "/onboarding";
  }

  // Then check client_users
  if (await checkIsClient(supabase, userId)) {
    return "/client/dashboard";
  }

  // No role found — send to onboarding
  return "/onboarding";
}