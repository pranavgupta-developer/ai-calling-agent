"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

type AuthUser = {
  id: string;
  email: string | undefined;
  user_metadata: Record<string, unknown>;
};

type Agency = {
  id: string;
  name: string;
  slug: string;
  email: string;
  logo_url: string | null;
  is_onboarding_completed: boolean;
};

type AuthContextValue = {
  /** The currently authenticated user, or null */
  user: AuthUser | null;
  /** The user's resolved role (OWNER, ADMIN, MANAGER, AGENT, CLIENT, or null) */
  role: UserRole;
  /** The user's agency (only for agency roles, null for clients) */
  agency: Agency | null;
  /** True while the initial session/role is being resolved */
  loading: boolean;
  /** Convenience boolean */
  isAuthenticated: boolean;
  /** Sign in with email & password. Returns the redirect path on success. */
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ redirectTo: string; role: UserRole }>;
  /** Sign out and redirect to /login */
  logout: () => Promise<void>;
  /** Force-refresh the current session and re-fetch role/agency */
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ──────────────────────────────────────────────
// Provider
// ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabaseRef = useRef(createClient());

  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch profile + role from server ──

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
      });

      if (!response.ok) {
        setUser(null);
        setRole(null);
        setAgency(null);
        return;
      }

      const data = await response.json();

      setUser(data.user ?? null);
      setRole(data.role ?? null);
      setAgency(data.agency ?? null);
    } catch {
      setUser(null);
      setRole(null);
      setAgency(null);
    }
  }, []);

  // ── Initialize on mount ──

  useEffect(() => {
    const supabase = supabaseRef.current;
    let isMounted = true;

    async function initialize() {
      // Restore session (triggers token refresh if needed)
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (authUser) {
        await fetchProfile();
      } else {
        setUser(null);
        setRole(null);
        setAgency(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    initialize();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (!isMounted) return;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await fetchProfile();
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setRole(null);
        setAgency(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // ── Login ──

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false
    ): Promise<{ redirectTo: string; role: UserRole }> => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "Login failed");
      }

      // Re-fetch profile after successful login
      await fetchProfile();

      return {
        redirectTo: payload.redirectTo ?? "/dashboard",
        role: payload.role ?? null,
      };
    },
    [fetchProfile]
  );

  // ── Logout ──

  const logout = useCallback(async () => {
    const supabase = supabaseRef.current;

    await supabase.auth.signOut();

    setUser(null);
    setRole(null);
    setAgency(null);

    // Replace the current history entry so browser back button
    // doesn't show the dashboard
    router.replace("/login");
    router.refresh();
  }, [router]);

  // ── Refresh ──

  const refreshSession = useCallback(async () => {
    const supabase = supabaseRef.current;
    await supabase.auth.refreshSession();
    await fetchProfile();
  }, [fetchProfile]);

  // ── Context value ──

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      agency,
      loading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshSession,
    }),
    [user, role, agency, loading, login, logout, refreshSession]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
