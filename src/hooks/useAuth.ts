/**
 * EduSubmit useAuth Hook
 * Manages local JWT authentication state
 * Handles: login, logout, me, auto-redirect on 401
 */

import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  status?: string;
  avatar?: string | null;
  lastLogin?: Date | null;
  createdAt?: Date;
};

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: !!localStorage.getItem("edusubmit_token"),
  });

  const logoutMutation = trpc.localAuth.logout.useMutation({
    onSuccess: async () => {
      localStorage.removeItem("edusubmit_token");
      await utils.invalidate();
      window.location.href = "/login";
    },
    onError: () => {
      // Still clear token and redirect on error
      localStorage.removeItem("edusubmit_token");
      window.location.href = "/login";
    },
  });

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  // Parse user data from the API response
  const user: AuthUser | null = useMemo(() => {
    if (!userData || typeof userData !== "object") return null;
    // The API returns the user directly from the authedQuery
    const u = userData as AuthUser;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      avatar: u.avatar,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt,
    };
  }, [userData]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      isTeacher: user?.role === "TEACHER",
      isStudent: user?.role === "STUDENT",
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, refetch]
  );
}
