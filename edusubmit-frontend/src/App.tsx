import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AnimatePresence } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import StudentLogin from './pages/StudentLogin';
import FacultyLogin from './pages/FacultyLogin';
import AdminLogin from './pages/AdminLogin';
import LoginPage from './pages/LoginPage';
import StudentLayout from './components/student/StudentLayout';
import DashboardHome from './pages/student/DashboardHome';
import Assignments from './pages/student/Assignments';
import Submissions from './pages/student/Submissions';
import ExamTimetable from './pages/student/ExamTimetable';
import AIAssistant from './pages/student/AIAssistant';
import Notifications from './pages/student/Notifications';
import Profile from './pages/student/Profile';
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherDashboardHome from './pages/teacher/DashboardHome';
import TeacherAssignments from './pages/teacher/Assignments';
import TeacherSubmissions from './pages/teacher/Submissions';
import TeacherExamTimetable from './pages/teacher/ExamTimetable';
import TeacherAIReviewAssistant from './pages/teacher/AIReviewAssistant';
import TeacherStudents from './pages/teacher/Students';
import TeacherNotifications from './pages/teacher/Notifications';
import TeacherProfile from './pages/teacher/Profile';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardHome from './pages/admin/DashboardHome';
import AdminUsers from './pages/admin/Users';
import AdminSections from './pages/admin/Sections';
import AdminTeacherAssignments from './pages/admin/TeacherAssignments';
import AdminTimetableManagement from './pages/admin/TimetableManagement';
import AdminSystemMonitoring from './pages/admin/SystemMonitoring';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import { NotificationProvider } from './components/ui/NotificationSystem';
import { PageTransition } from './components/ui/AnimatedComponents';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  return (
    <NotificationProvider>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/select-role" element={<PageTransition><RoleSelection /></PageTransition>} />
          <Route path="/login/student" element={<PageTransition><StudentLogin /></PageTransition>} />
          <Route path="/login/faculty" element={<PageTransition><FacultyLogin /></PageTransition>} />
          <Route path="/login/admin" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="submissions" element={<Submissions />} />
            <Route path="exam-timetable" element={<ExamTimetable />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/teacher" element={
            <ProtectedRoute allowedRole="TEACHER">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboardHome />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="submissions" element={<TeacherSubmissions />} />
            <Route path="exam-timetable" element={<TeacherExamTimetable />} />
            <Route path="ai-review" element={<TeacherAIReviewAssistant />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="notifications" element={<TeacherNotifications />} />
            <Route path="profile" element={<TeacherProfile />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="sections" element={<AdminSections />} />
            <Route path="teacher-assignments" element={<AdminTeacherAssignments />} />
            <Route path="timetable" element={<AdminTimetableManagement />} />
            <Route path="monitoring" element={<AdminSystemMonitoring />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          <Route
            path="*"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
            }
          />
        </Routes>
      </AnimatePresence>
    </NotificationProvider>
  );
}

export default App;
