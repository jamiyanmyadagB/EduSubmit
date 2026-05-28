/**
 * EduSubmit App Router
 * Role-based routing: STUDENT → /student, TEACHER → /teacher, ADMIN → /admin
 * Protected routes with auth guards
 */

import { Routes, Route, Navigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/student/Dashboard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import { Loader2 } from "lucide-react";

/** Redirects to role-appropriate dashboard after login */
function DashboardRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case "STUDENT":
      return <Navigate to="/student" replace />;
    case "TEACHER":
      return <Navigate to="/teacher" replace />;
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
}

/** Auth guard wrapper - redirects unauthenticated users to login */
function AuthGuard({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <AuthGuard allowedRoles={["STUDENT"]}>
            <StudentDashboard />
          </AuthGuard>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={
          <AuthGuard allowedRoles={["TEACHER"]}>
            <TeacherDashboard />
          </AuthGuard>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <AuthGuard allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </AuthGuard>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<DashboardRedirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
