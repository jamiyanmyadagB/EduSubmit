import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import EnhancedStudentDashboard from './pages/EnhancedStudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitAssignment from './pages/SubmitAssignment';
import StudentProgress from './pages/StudentProgress';
import CreateAssignment from './pages/CreateAssignment';
import { NotificationProvider } from './components/ui/NotificationSystem';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user } = useAuthStore();

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'STUDENT' && <EnhancedStudentDashboard />}
              {user?.role === 'TEACHER' && <TeacherDashboard />}
              {user?.role === 'ADMIN' && <AdminDashboard />}
            </ProtectedRoute>
          } />
          
          <Route path="/submit" element={
            <ProtectedRoute allowedRole="STUDENT">
              <SubmitAssignment />
            </ProtectedRoute>
          } />
          
          <Route path="/progress" element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentProgress />
            </ProtectedRoute>
          } />
          
          <Route path="/create-assignment" element={
            <ProtectedRoute allowedRole="TEACHER">
              <CreateAssignment />
            </ProtectedRoute>
          } />
          
          <Route path="/teacher-dashboard" element={
            <ProtectedRoute allowedRole="TEACHER">
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin-dashboard" element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
